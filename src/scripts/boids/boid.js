/*
import {
    Vector3,
    Box3,
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
} from 'three'; 
*/

import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

export class Boid{
    position = new THREE.Vector3(0, 0, 0);
    direction = new THREE.Vector3(0, 0, 0);
    minDistance;
    detectionRange;
    boundingBox = new THREE.Box3();
    front;
    back;
    left;
    right;
    top;
    bottom;
    center;
    inbounds;
    randomCounter;
    
    constructor(x, y, z, xd, yd, zd, minDistance, detectionRange, boundingBox, front, back, left, right, top, bottom, center){
        this.position = new THREE.Vector3(x, y, z);
        this.direction = new THREE.Vector3(xd, yd, zd);
        this.minDistance = minDistance;
        this.detectionRange = detectionRange;

        this.boundingBox = boundingBox;

        this.front = front;
        this.back = back;
        this.left = left;
        this.right = right;
        this.top = top;
        this.bottom = bottom;
        this.center = center;

        this.inbounds = false;
        this.randomCounter = 0;
    }

    move(delta, speed, boids, ownIndex, planets) {
        var newBoids = this.detectNearbyBoids(boids, ownIndex);

        var separation = this.separation(newBoids);
        var alignment = this.alignment(newBoids);
        var cohesion = this.alignment(newBoids);
        var planetAvoidance = this.avoidPlanets(planets);
        var boundingBox = this.checkBoundingBox();

        this.direction = new THREE.Vector3(
            this.direction.x + separation.x + alignment.x + cohesion.x + planetAvoidance.x + boundingBox.x * 2,
            this.direction.y + separation.y + alignment.y + cohesion.y + planetAvoidance.y + boundingBox.y * 2,
            this.direction.z + separation.z + alignment.z + cohesion.z + planetAvoidance.z + boundingBox.z * 2);
        this.direction = this.normalize(this.direction);

        
        /*if(this.direction.x == 0 && this.direction.y == 0 && this.direction.z == 0 && this.inbounds){        
            if(this.randomCounter > 500){
                this.direction.random();
                if(Math.random() < 0.5){
                    this.direction.x *= -1;
                }
                if(Math.random() < 0.5){
                    this.direction.y *= -1;
                }
                if(Math.random() < 0.5){
                    this.direction.z *= -1;
                }
                this.randomCounter = 0;
            }
            this.randomCounter++;
        }*/

        this.position = new THREE.Vector3(this.position.x + this.direction.x * speed * delta, this.position.y + this.direction.y * speed * delta, this.position.z + this.direction.z * speed * delta);
    }

    checkBoundingBox(){
        //if(this.boundingBox.containsPoint(this.position)){
            //console.log("inside bounding box");
            //return;
        //}
        /*
        if(this.position.y > this.bottom && this.position.y < this.top &&   
            this.position.z < this.front && this.position.z > this.back &&
             this.position.x < this.left && this.position.x > this.right){
                this.inbounds = true;
                console.log("in box")
                return;
              }*/
        var newDir = new THREE.Vector3(0, 0, 0);

        if(this.distance(this.position, this.center) < 500.0){
            /*if(this.inbounds == false){
                this.direction.random();
                if(Math.random() < 0.5){
                    this.direction.x *= -1;
                }
                if(Math.random() < 0.5){
                    this.direction.y *= -1;
                }
                if(Math.random() < 0.5){
                    this.direction.z *= -1;
                }
            }
            this.inbounds = true;*/
            return newDir;
        }

        //this.inbounds = false;
        newDir = new THREE.Vector3(this.center.x - this.position.x, this.center.y - this.position.y, this.center.z - this.position.z);
        //var newDir = new Vector3(this.position.x - this.boundingBox.getCenter.x, this.position.y - this.boundingBox.getCenter.y, this.position.z - this.boundingBox.getCenter.z);
        newDir = this.normalize(newDir);
        return newDir;
    }

    avoidPlanets(planets){
        var newDir = new THREE.Vector3(0, 0, 0);
        for(let i = 0; i < planets.length; i++){
            if(this.distance(this.position, planets[i].position) < 30){
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
    
}