import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import * as CANNON from "https://unpkg.com/cannon-es@0.18.0/dist/cannon-es.js";
//import * as CANNON from 'https://unpkg.com/cannon@0.6.2/build/cannon.js'
import * as Input from './input.js';
//import { map } from '../../../Meshroom/Meshroom-2019.2.0/lib/shiboken2/docs/shiboken2/_static/underscore-1.3.1.js';

var world;
var body, shape;
var zepplin;

function init() {

    console.dir(CANNON.NaiveBroadphase);
    world = new CANNON.World();
    world.gravity.set(0, -200, 0);
    world.broadphase = new CANNON.NaiveBroadphase();
    world.solver.iterations = 10;
}

function example(environment, loader, texLoader){
    //Add falling box
    const halfExtents = new CANNON.Vec3(20, 20, 20);

    shape = new CANNON.Box(new CANNON.Vec3(halfExtents.x, halfExtents.y, halfExtents.z));
    body = new CANNON.Body({
        mass: 1
    });
    body.addShape(shape);

    body.angularVelocity.set(0, 10, 0);
    body.position.set(-1750,500,-1750);
    world.addBody(body);

    zepplin = new THREE.Object3D();
    zepplin.name = 'name';
    zepplin.position.set(2550, 200, 0);

    //loading mesh data and assigning material
    loader.load('../public/assets/models/Zepplin/zepplin.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = zepplinMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        zepplin.add(object);
    });

    
    environment.add(zepplin);

    var zepplinMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('robot.png'),
        minFilter : THREE.NearestFilter
    });
    zepplinMaterial.map.minFilter = THREE.NearestFilter;
    zepplinMaterial.map.magFilter = THREE.NearestFilter;

    //Add ground
    var groundShape = new CANNON.Plane();
    var groundBody = new CANNON.Body({ mass: 0 });
    groundBody.position.set(0, 0, 0);
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    world.addBody(groundBody);
}

function updatePhysics() {

    // Step the physics world
    world.step(1/60);

    zepplin.position.copy(body.position);
    zepplin.quaternion.copy(body.quaternion);
}

function updateControls(controls){
    //if letter L is pressed
    if (Input.keyState[76]){      
        body.applyLocalForce(new CANNON.Vec3(0, 300, 0), new CANNON.Vec3(0,0,0)); 
        body.angularVelocity.set(0, 0.1, 0);
    }
     //if letter O is pressed
    if (Input.keyState[79]){      
        body.position.set(-1750,500,-1750);
    }

    controls.update();
}

export{init, example, updatePhysics, updateControls}