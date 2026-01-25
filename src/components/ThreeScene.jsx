import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GUI } from 'lil-gui';
//import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
//import { color } from "three/tsl";
//import SkeletonUtils from 'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/jsm/utils/SkeletonUtils.js';

export default function ThreeScene({bgColor = "DBE9F4", ambientLightColor = "0xffffff", modelName = ""}) {
  const mountRef = useRef(null);
  const guiRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const sphereRef = useRef(null);
  const clock = new THREE.Clock();
  const gltfref = useRef(null);
  const pausedRef = useRef(false);

  //Add the boids to this
  var boids = [];
  var boid_models = [];
  var max_boids = 250;
  var planets = [];

  useEffect(() => {
    const container = mountRef.current;
    const guiContainer = document.createElement('div');
    const scene = sceneRef.current;
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 10000);
    camera.position.set(0, 0, 800);
    camera.rotateY(90.0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    scene.add(new THREE.AmbientLight(new THREE.Color().setHex(ambientLightColor), 0.8));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Add gui
    guiContainer.id = 'gui-container';
    guiContainer.style.position = 'absolute';
    guiContainer.style.bottom = '0px';
    guiContainer.style.right = '0px';
    guiContainer.style.zIndex = '1000'; // Increase z-index
    guiContainer.style.pointerEvents = 'auto'; // Ensure it receives mouse events 
    container.appendChild(guiContainer);

    const gui = new GUI({ autoPlace: false });
    gui.domElement.style.position = 'relative'
    guiContainer.appendChild(gui.domElement);

    gui.close();

    const params = {
      speed: 2.0,
      separation: 0.8,
      cohesion: 1.0,
      alignment: 0.8,
      randomness: 0.4,
      color: '#00ff00',
      planet_color: '#00ff00'
    };
    gui.add(params, 'speed', 0, 5, 0.1).name('Speed').onChange(update_boid_params);
    gui.add(params, 'separation', 0, 10, 0.1).name('Separation').onChange(update_boid_params);
    gui.add(params, 'cohesion', 0, 10, 0.1).name('Cohesion').onChange(update_boid_params);
    gui.add(params, 'alignment', 0, 10, 0.1).name('Alignment').onChange(update_boid_params);
    gui.add(params, 'randomness', 0, 10, 0.1).name('Randomness').onChange(update_boid_params);
    gui.addColor(params, 'color').name('Boid Color').onChange(update_boid_params);
    gui.addColor(params, 'planet_color').name('Planet Color').onChange(update_boid_params);

    const paramsRef = { current: params };
    guiRef.current = { gui, params: paramsRef };

    // Pause
    const handleVisibilityChange = () => {
      pausedRef.current = document.hidden;

      // Optional: reset clock so delta doesn't spike
      if (!document.hidden) {
        clock.getDelta(); // flush accumulated time
      }
    };

    // Dynamically import GLTFLoader and OrbitControls
    Promise.all([
      import('three/examples/jsm/loaders/GLTFLoader.js'),
      import('three/examples/jsm/controls/OrbitControls.js'),

    ]).then(([{ GLTFLoader }, { OrbitControls }]) => {
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;

      /*const loader = new GLTFLoader();
      loader.load(
        'fish.glb',
        (gltf) => {
          gltfref.current = gltf.scene;
          //scene.add(gltf.scene);

          print(gltf.modelName)

          for(let i = 0; i < max_boids; i++){
            var x = THREE.MathUtils.randFloat(-100, 100);
            var y = THREE.MathUtils.randFloat(-100, 100);
            var z = THREE.MathUtils.randFloat(-100, 100);

            var boid = new BBoid(i, x, y, z, x, y, z, 100, 150);
            boids.push(boid);
            //boid_models.push(new THREE.Object3D());

            //model
            //const model = SkeletonUtils.clone(gltfref.current);
            /*const container = new THREE.Object3D();
            const model = SkeletonUtils.clone(gltf.scene);
            var rand_size = THREE.MathUtils.randFloat(0.5, 1.2);
            model.scale.setScalar(5.0 * rand_size); // optional //2.5
            container.add(model);
            boid_models[i].add(container)*/

            /*let geometry = new THREE.BoxGeometry(5, 5, 12);
            let material = new THREE.MeshBasicMaterial( { color: 0xFFFAFA} );
            let mesh = new THREE.Mesh( gltfref.current, material);

            boid_models[i].add(mesh);
        
            scene.add(boid_models[i]);
          }

        },
        undefined,
        (error) => console.error("Error loading model:", error)
      );*/
    });

    // Scene Background
    //scene.background = new THREE.Color().setHex(`0x${bgColor}`);
    //scene.background = new THREE.Texture.
    //scene.background = new THREE.TextureLoader().load('/vecteezy_clear-shallow-water-over-sandy-ocean-floor-sunlight_55306888.jpeg');

    const resizeObserver = new ResizeObserver(() => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    resizeObserver.observe(container);

    add_sphere(scene);
    init_boids(scene);

    const animate = () => {
      requestAnimationFrame(animate);

      if (pausedRef.current) return;

      if (window.OrbitControls) {
        controls.update();
      }
      tick();

      renderer.render(scene, camera);

      if(pausedRef.current == true){
        print("Puase");
      }
    };
    animate();

    /*
    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
      if (renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };*/
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      gui.destroy();
      renderer.dispose();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      if (guiContainer && guiContainer.parentNode) {
        guiContainer.parentNode.removeChild(guiContainer);
      }
    };
  }, []);

  const add_sphere = function(scene){
    var bigSphere = new THREE.SphereGeometry(200,8,8);
    let material = new THREE.MeshBasicMaterial( 
        { color: 0x00ff00,
        wireframe: true, } );
    let m = new THREE.Mesh( bigSphere, material);
    m.position.set(0, 0, 0);
    sphereRef.current = m;
    //environment.add(m)
    m.geometry.computeBoundingBox();
    planets.push(sphereRef.current);
    planets[0].userData.mesh = m;
    scene.add(m);
  };

  const init_boids = function(scene){
    for(let i = 0; i < max_boids; i++){
        var x = THREE.MathUtils.randFloat(-100, 100);
        var y = THREE.MathUtils.randFloat(-100, 100);
        var z = THREE.MathUtils.randFloat(-100, 100);

        var boid = new BBoid(i, x, y, z, x, y, z, 100, 150);
        boids.push(boid);
        boid_models.push(new THREE.Object3D());

        //model
        //let geometry = new THREE.BoxGeometry(5, 5, 12);
        let geometry = new THREE.ConeGeometry( 4, 12, 6 );
        geometry.rotateX(90);
        let material = new THREE.MeshBasicMaterial( { color: 0x39FF14} ); //39FF14 //FFFAFA
        let mesh = new THREE.Mesh(geometry, material);

        boid_models[i].add(mesh);
        boid_models[i].userData.mesh = mesh;
    
        scene.add(boid_models[i]);
    }
  }

  const tick = () => {
      //const elapsedTime = clock.getElapsedTime()
      if (pausedRef.current) return;
      
      var delta = clock.getDelta();
      sphereRef.current.rotateZ(0.003);

      //update boids
      for (let i = 0; i < boids.length; i++) {
          boids[i].move(delta, 100, boids, i, planets);
          boid_models[i].position.set(boids[i].getPosX, boids[i].getPosY, boids[i].getPosZ);
          boid_models[i].lookAt(new THREE.Vector3(boids[i].getPosX + boids[i].getDirX, boids[i].getPosY + boids[i].getDirY, boids[i].getPosZ + boids[i].getDirZ));
      }
      //renderer.render(sceneRef.current, cameraRef.current)
      //window.requestAnimationFrame(tick)
  };
  
  /*
  const update_boid_params = (speed = 2.0, separation = 0.8, cohesion = 1.0, alignment = 0.8) =>{
    for (let i = 0; i < boids.length; i++) {
      boids[i].speed_mult = speed;
      boids[i].sep_mult = separation;
      boids[i].coh_mult = cohesion;
      boids[i].ali_mult = alignment;
      //boids[i].color = color;
    }
  }*/
  function update_boid_params(){
    const params = guiRef.current.params.current;
    for (let i = 0; i < boids.length; i++) {
      boids[i].speed_mult = params.speed;
      boids[i].sep_mult = params.separation;
      boids[i].coh_mult = params.cohesion;
      boids[i].ali_mult = params.alignment;
      boids[i].rnd_mult = params.randomness;
      boid_models[i].userData.mesh.material.color.set(params.color);
    }
    planets[0].userData.mesh.material.color.set(params.planet_color);
  }
  return <div ref={mountRef} style={{ width: "100%", height: "400px", position: 'relative', borderRadius: '10px', overflow: 'hidden' }} />;
  //return <div ref={mountRef} style={{ width: "100%", height: "400px", borderRadius: '10px', overflow: 'hidden'}} />;
}

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
      var cohesion = this.alignment(newBoids);

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