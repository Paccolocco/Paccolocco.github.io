import * as THREE from "three";

export class BBoid{
  id;
  color;
  position = new THREE.Vector3(0, 0, 0);
  direction = new THREE.Vector3(0, 0, 0);
  minDistance;
  detectionRange;

  target_height = 0.0;
  height_tolerance = 5.0;
  up_align = 0.0;
  max_x = 800.0;
  min_x = -800.0;
  max_y = 250.0;
  min_y = -250.0;
  lateral_tolerance = 10.0;
  zmult = 1.0;

  speed_mult = 2.0;

  sep_mult = 0.8;
  coh_mult = 1.0;
  ali_mult = 0.8;
  pln_mult = 100.0;
  bounding_box_mult = 10.0;
  rnd_mult = 0.4;

  constructor(id, x, y, z, xd, yd, zd, minDistance, detectionRange){
    
    this.id = id;
    
    this.position = new THREE.Vector3(x, y, z);
    this.direction = new THREE.Vector3(xd, yd, zd);
    this.minDistance = minDistance;
    this.detectionRange = detectionRange;

    this.speed_mult = THREE.MathUtils.randFloat(0.75, 1.25)
  }

  move(delta, speed, boids, ownIndex, planets) {
      speed *= this.speed_mult;

      var newBoids = this.detectNearbyBoids(boids, ownIndex);

      var separation = this.separation(newBoids);
      var alignment = this.alignment(newBoids);
      var cohesion = this.cohesion(newBoids);

      var planetAvoidance = this.avoidPlanets(planets);

      var boundingBox = this.checkBoundingBox();

      var _coh_mult = this.coh_mult;// * boids.length;

      var rand_x = THREE.MathUtils.randFloat(-1.0, 1.0) * this.rnd_mult;
      var rand_y = THREE.MathUtils.randFloat(-1.0, 1.0) * this.rnd_mult;
      var rand_z = THREE.MathUtils.randFloat(-1.0, 1.0) * this.rnd_mult;

      var new_dir = new THREE.Vector3(
          this.direction.x + (separation.x * this.sep_mult) + (alignment.x * this.ali_mult) + (cohesion.x * _coh_mult) +  (boundingBox.x * this.bounding_box_mult) + (planetAvoidance.x * this.pln_mult) + rand_x,
          this.direction.y + (separation.y * this.sep_mult) + (alignment.y * this.ali_mult) + (cohesion.y * _coh_mult) +  (boundingBox.y * this.bounding_box_mult) + (planetAvoidance.y * this.pln_mult) + rand_y,
          this.direction.z + (separation.z * this.sep_mult) + (alignment.z * this.ali_mult) + (cohesion.z * _coh_mult) +  (boundingBox.z * this.bounding_box_mult) + (planetAvoidance.z * this.pln_mult) + rand_z);
      
      
      if(this.position.z < this.target_height - this.height_tolerance){
        new_dir.z += this.up_align;
      }else if(this.position.z > this.target_height + this.height_tolerance){
        new_dir.z -= this.up_align;
      }
      
      var turn_speed = 0.05;

      new_dir = this.normalize(new_dir);
      this.direction = new THREE.Vector3(this.direction.x + (new_dir.x * turn_speed),
      this.direction.y + (new_dir.y * turn_speed),
      (this.direction.z + (new_dir.z * turn_speed))* this.zmult);
      this.direction = this.normalize(this.direction);

      this.position = new THREE.Vector3(this.position.x + this.direction.x * speed * delta, this.position.y + this.direction.y * speed * delta, (this.position.z + this.direction.z * speed * delta) * this.zmult);

      //teleport
      /*if(this.position.x > this.max_x + this.lateral_tolerance){
        this.position = new THREE.Vector3(this.min_x, this.position.y, this.position.z);
      }
      if (this.position.x < this.min_x - this.lateral_tolerance){
        this.position = new THREE.Vector3(this.min_x, this.position.y, this.position.z);
      }
      if (this.position.y > this.max_y + this.lateral_tolerance){
        this.position = new THREE.Vector3(this.position.x, this.min_y, this.position.z);
      }
      if (this.position.y < this.min_y - this.lateral_tolerance){
        this.position = new THREE.Vector3(this.position.x, this.max_y, this.position.z);
      }*/
  }

  detectNearbyBoids(boids, ownIndex){
    var newBoids = new Array();

    for(let i = 0; i < boids.length; i++){
        if(i == ownIndex){
            continue;
        }
        if(this.distance(this.position, boids[i].position) < this.detectionRange){
            var vecToOtherBoid = new THREE.Vector3(boids[i].position.x - this.position.x,  boids[i].position.y - this.position.y, boids[i].position.z - this.position.z);
            vecToOtherBoid = this.normalize(vecToOtherBoid);
            if(this.direction.dot(vecToOtherBoid) > 0.0){
                newBoids.push(boids[i]);
            }
        }
    }
    return newBoids;
  }
  
  //keep distance
  separation(boids){
      var newDir = new THREE.Vector3(0, 0, 0);

      if(boids.length == 0){
          return newDir;
      }	

      for (let i = 0; i < boids.length; i++) {
          if(this.distance(this.position, boids[i].position) < this.minDistance){
              newDir = new THREE.Vector3(newDir.x - boids[i].position.x - this.position.x, newDir.y - boids[i].position.y - this.position.y, newDir.z - boids[i].position.z - this.position.z);
          }
      }
      newDir = this.normalize(newDir);
      return newDir;
  }
  
  //go in mean direction of neighbours
  alignment(boids){
      var newDir = new THREE.Vector3(0, 0, 0);

      if(boids.length == 0){
          return newDir;
      }

      for (let i = 0; i < boids.length; i++) {
          newDir = new THREE.Vector3(newDir.x + boids[i].direction.x, newDir.y + boids[i].direction.y, newDir.z + boids[i].direction.z);
      }
      newDir = this.normalize(newDir);
      return newDir;
  }
  
  //steer to center
  cohesion(boids){
      var newDir = new THREE.Vector3(0, 0, 0);

      if(boids.length == 0){
          return newDir;
      }

      for (let i = 0; i < boids.length; i++) {
          newDir = new THREE.Vector3(newDir.x + boids[i].position.x, newDir.y + boids[i].position.y, newDir.z + boids[i].position.z);
      }
      newDir = this.normalize(newDir);
      return newDir;
  }

  checkBoundingBox(){
    var newDir = new THREE.Vector3(0, 0, 0);

    if(this.distance(this.position, newDir) < 1300.0){
      return newDir;
    }
      newDir = new THREE.Vector3(newDir.x - this.position.x, newDir.y - this.position.y, newDir.z - this.position.z);
      newDir = this.normalize(newDir);
      return newDir;
  }
  
  avoidPlanets(planets){
    var newDir = new THREE.Vector3(0, 0, 0);
    for(let i = 0; i < planets.length; i++){
        if(this.distance(this.position, planets[i].position) < 300){ //planet size
            var vecToPlanet = new THREE.Vector3(planets[i].position.x - this.position.x,  planets[i].position.y - this.position.y, planets[i].position.z - this.position.z);
            vecToPlanet = this.normalize(vecToPlanet);
            if(this.direction.dot(vecToPlanet) > 0.0){
                newDir = new THREE.Vector3(-vecToPlanet.x, -vecToPlanet.y, -vecToPlanet.z);
                newDir = this.normalize(newDir);
            }
        }
    }

    return newDir;
  }

  normalize(vec3){
      let length = Math.sqrt((vec3.x * vec3.x ) + (vec3.y * vec3.y) + (vec3.z * vec3.z));
      if(length == 0){
          return new THREE.Vector3(0,0,0);
      }
      return new THREE.Vector3(vec3.x / length, vec3.y / length, vec3.z / length);
  }
  
  distance(a, b){
      return Math.sqrt((a.x - b.x)*(a.x - b.x)  + (a.y - b.y)*(a.y - b.y) + (a.z - b.z)*(a.z - b.z));
  }

  get getPosX(){
      return this.position.x;
  }

  get getPosY(){
      return this.position.y;
  }

  get getPosZ(){
      return this.position.z;
  }

  get getDirX(){
      return this.direction.x;
  }

  get getDirY(){
      return this.direction.y;
  }

  get getDirZ(){
      return this.direction.z;
  }
};