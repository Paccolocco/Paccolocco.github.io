/*
import {
    Object3D,
    GridHelper,
    BoxGeometry,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh, !!!
    MeshStandardMaterial,
    MeshPhysicalMaterial,
    TextureLoader,
    Vector3,
    Box3,
    AudioLoader,
    AudioListener,
    Audio, 
    PositionalAudio,
    LoopOnce,
    LOD,
    NearestFilter
} from 'three';*/

import { FBXLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/FBXLoader.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
//import { map } from '../../../Meshroom/Meshroom-2019.2.0/lib/shiboken2/docs/shiboken2/_static/underscore-1.3.1.js';

import * as CanvasSign from './CanvasSign.js';
import {Boid} from './boid.js';
import * as Physics from "./physics.js";
import * as Input from './input.js';

const environment = buildEnvironment();
var mixers_environment = [];
var boids_environment = [];
var boid_models = [];
var trail_environment = [];
var planet_environment = [];

function buildEnvironment() {
    const environment = new THREE.Object3D();

    return environment;
}

const loadEnvironment = function (scene, camera) {

    loadGrid(scene);
    loadObjects(camera);
    loadSigns();

    scene.add(environment);
}

const updateEnvironment = function (delta, controls) {
    //update animation
    for (let i = 0; i < mixers_environment.length; i++) {
        mixers_environment[i].update(delta);
    }

    //update boids
    updateBoid(delta);

    //update physics
    Physics.updatePhysics();
    Physics.updateControls(controls);

    //scan input for destructible reset
    updateControls(controls);
}

function loadGrid(scene) {

    // grid helper
    const grid = new THREE.GridHelper(10000, 200, 0xaaaaaa, 0xdddddd);
    scene.add(grid);

}

function loadObjects(camera) {
    //FBX loader
    const loader = new FBXLoader();
    //tex loader
    const texLoader = new THREE.TextureLoader().setPath('/walkabout/textures/');

    //#region Museum
    var museumPos = new THREE.Vector3(0, 0, 0);
    var museumScale = new THREE.Vector3(2, 2, 2);

    var museum = new THREE.Object3D();
    museum.name = 'museum';
    museum.position.set(museumPos.x, museumPos.y, museumPos.z);
    museum.scale.set(museumScale.x, museumScale.y, museumScale.z);

    loader.load('/walkabout/models/Museum/main.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = museumMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        museum.add(object);
    });

    environment.add(museum);

    //Texture
    let museumMaterial = new THREE.MeshBasicMaterial( { color: 0x999999});

    var museumGlass = new THREE.Object3D();
    museumGlass.name = 'museumGlass';
    museumGlass.position.set(museumPos.x, museumPos.y, museumPos.z);
    museumGlass.scale.set(museumScale.x, museumScale.y, museumScale.z);

    loader.load('/walkabout/models/Museum/glass.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = museumGlassMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        museumGlass.add(object);
    });

    environment.add(museumGlass);

    //Texture
    let museumGlassMaterial = new THREE.MeshPhysicalMaterial( { 
        roughness: 0,  
        transmission: 1,  
        thickness: 1} );

    var tree = new THREE.Object3D();
    tree.name = 'tree';
    tree.position.set(museumPos.x, museumPos.y, museumPos.z);
    tree.scale.set(museumScale.x, museumScale.y, museumScale.z);

    loader.load('/walkabout/models/Museum/tree.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = treeMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        tree.add(object);
    });

    environment.add(tree);

    //Texture
    let treeMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('Tree_Diffuse.png'),
    })

    var podests = new THREE.Object3D();
    podests.name = 'podests';
    podests.position.set(museumPos.x, museumPos.y, museumPos.z);
    podests.scale.set(museumScale.x, museumScale.y, museumScale.z);

    loader.load('/walkabout/models/Museum/podests_new.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = podestsMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        podests.add(object);
    });

    environment.add(podests);

    //Texture
    let podestsMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('Podest_Diffuse.png'),
    })
    //#endregion

    //#region Car
    var carPos = new THREE.Vector3(50, 185, 2550);
    var carRot = new THREE.Vector3(0, -870.0 / 360.0, 0);

    var car = new THREE.Object3D();
    car.name = 'car';
    car.position.set(carPos.x, carPos.y, carPos.z);
    car.rotation.set(carRot.x, carRot.y, carRot.z);
    car.scale.set(1, 1, 1);

    loader.load('/walkabout/models/Car/car.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = carMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        car.add(object);
    });

    environment.add(car);

    //Texture
    let carMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('Car_Diffuse_Decal.png'),
        roughnessMap: texLoader.load('Car_Specular_Decal.png'),
        emissiveMap : texLoader.load('Car_Emissive_Decal.png')
    })
    


    var carGlass = new THREE.Object3D();
    carGlass.name = 'carGlass';
    carGlass.position.set(carPos.x, carPos.y, carPos.z);
    carGlass.rotation.set(carRot.x, carRot.y, carRot.z);
    carGlass.scale.set(1, 1, 1);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/Car/glass.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = carGlassMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        carGlass.add(object);
    });

    environment.add(carGlass);

    //Texture
    let carGlassMaterial = new THREE.MeshPhysicalMaterial( { 
        roughness: 0,  
        transmission: 1,  
        thickness: 0.5} );
    //#endregion

    //#region Computer
    var computer = new THREE.Object3D();
    computer.name = 'computer';
    computer.position.set(1750, 90, 1750);
    computer.rotation.set(0, 90 , 0);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/computer.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = computerMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        computer.add(object);
    });

    environment.add(computer);

    //Texture
    var computerMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('Computer_Diffuse_Decal.png')
    });
    //#endregion

    //#region Brain
    var jarPos = new THREE.Vector3(1820, 65, 1890);
    var jarScale = 0.3;
    var jarRotation = new THREE.Vector3(0, 90, 0);

    var jar = new THREE.Object3D();
    jar.name = 'jar';
    jar.position.set(jarPos.x, jarPos.y, jarPos.z);
    jar.scale.set(jarScale, jarScale, jarScale);
    jar.rotation.set(jarRotation.x, jarRotation.y, jarRotation.z);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/jar.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = jarMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        jar.add(object);
    });

    environment.add(jar);

    //Texture
    var jarMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('jar_diffuse.png')
    });
    

    var jarLiquid = new THREE.Object3D();
    jarLiquid.name = 'jarLiquid';
    jarLiquid.position.set(jarPos.x, jarPos.y, jarPos.z);
    jarLiquid.scale.set(jarScale, jarScale, jarScale);
    jarLiquid.rotation.set(jarRotation.x, jarRotation.y, jarRotation.z);

    loader.load('/walkabout/models/jarLiquid.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = jarLiquidMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        jarLiquid.add(object);
    });

    environment.add(jarLiquid);

    //Texture
    let jarLiquidMaterial = new THREE.MeshPhysicalMaterial( { 
        color: 0x00ff00, 
        opacity: 0.1, 
        transparent: true, 
        roughness: 0,  
        transmission: 1,  
        thickness: 0.5} );
    



    //#endregion

    //#region Lab
    var labScale = 0.5

    var lab = new THREE.Object3D();
    lab.name = 'lab';
    lab.position.set(1800, 440, -1800);
    lab.scale.set(labScale, labScale, labScale);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/Lab2.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = labMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        lab.add(object);
    });

    environment.add(lab);

    //Texture
    var labMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('photo-1542732056-648731297c97.jpg')
    });

    var liquid = new THREE.Object3D();
    liquid.name = 'liquid';
    liquid.position.set(1800, 440, -1800);
    liquid.scale.set(labScale, labScale, labScale);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/Liquid2.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = liquidMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        liquid.add(object);
    });

    environment.add(liquid);

    //Texture
    let liquidMaterial = new THREE.MeshBasicMaterial( { emissive : 0xAA2320, color: 0xAA2320, emissiveIntensity: 5} );
    //#endregion

    //#region Rocket
    var myObject = new THREE.Object3D();
    myObject.name = 'name';
    myObject.position.set(2550, 200, 0);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/rocket.fbx', function( object ) {

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = basicMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        myObject.add(object);
    });

    environment.add(myObject);

    //Texture
    var basicMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('old-rusted-metal-texture-background-112588245.jpg')

    });
    //#endregion

    //  Create and add your Objects here
    let cube = new THREE.Object3D();
    cube.position.set(0, 0, 0); 

    let geometry = new THREE.BoxGeometry(100, 100, 100);
    let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    let mesh = new THREE.Mesh( geometry, basicMaterial);

    cube.add(mesh);
    
    environment.add(cube);

    loadModelingGoal4and7(loader, texLoader);

    loadModelingGoal5();

    loadModelingGoal6(loader, texLoader);

    loadModelingGoal8(loader, texLoader);

    loadModelingGoal9(camera, loader, texLoader);

    loadModelingGoal10(loader, texLoader);
}

//#region Modeling Goal 4 and 7
function loadModelingGoal4and7(loader, texLoader){
    var bodyScan = new THREE.Object3D();
    bodyScan.name = 'LennyAvatar';
    bodyScan.position.set(300, 0, -1200);
    bodyScan.rotateY(-Math.PI / 4);
    bodyScan.scale.set(1.2, 1.2, 1.2);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/Scan/bodyScan.fbx', function ( object ) {

        
        let scanMixer = new THREE.AnimationMixer(object);
        mixers_environment.push(scanMixer); 
        scanMixer.clipAction(object.animations[0]).play();
        scanMixer.timeScale = 3

        console.log(object.animations);
        console.log(mixers_environment.length);


        object.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material = scanMaterial;
                child.material.skinning = true;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });

        bodyScan.add(object);
    }); 

    //Texture
    var scanMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('scanTexture.jpg')
    }); 


    environment.add(bodyScan);
}
//#endregion

//#region Modeling Goal 5
function loadModelingGoal5(){
    var bigSphere = new THREE.SphereGeometry(500,16,16);
    let material = new THREE.MeshBasicMaterial( 
        { color: 0x00ff00,
        wireframe: true, } );
    let m = new THREE.Mesh( bigSphere, material);
    m.position.set(0, 500, -2550);
    environment.add(m)
    m.geometry.computeBoundingBox();

    var box = new THREE.Box3(new THREE.Vector3(200,200,200), new THREE.Vector3(500 , 500, 500));
    //var box = new Box3();
    box.copy( m.geometry.boundingBox ).applyMatrix4( m.matrixWorld );
            box.translate(0, 500, -2550);

    for(let i = 0; i < 50; i++){
        var boid = new Boid(0 + i * 100, 0 + i * 100, 0 + i * 100, 0, 0, 0, 100, 150, box, -2050, -3050, 500, -500, 750, -250, new THREE.Vector3(0, 500, -2550));
        console.log(boid); 
        boids_environment.push(boid);
        boid_models.push(new THREE.Object3D());
    }

    for(let i = 0; i < 50; i++){       
        let geometry = new THREE.BoxGeometry(5, 5, 12);
        let material = new THREE.MeshBasicMaterial( { color: 0xf01e2c} );
        let mesh = new THREE.Mesh( geometry, material);

        boid_models[i].add(mesh);
    
        environment.add(boid_models[i]);
    }

    for(let i = 0; i < 200; i++){
        trail_environment.push(new THREE.Object3D());
    }
    for(let i = 0; i < 200; i++){
    
        let geometry = new THREE.BoxGeometry(3, 3, 3);
        let material = new THREE.MeshBasicMaterial( { color: 0xbfe6ff } );
        let mesh = new THREE.Mesh(geometry, material);

        trail_environment[i].add(mesh);
        trail_environment[i].position.set(0, 0, 0);
    
        environment.add(trail_environment[i]);
    }
    trailcounter = 0;
    trailUpdate = 0;

    
    var planetsphere = new THREE.SphereGeometry(25,16,16);
    let planetMaterial = new THREE.MeshBasicMaterial( 
        { color: 0x371F76 } );

    let displace = Math.random();
    if(Math.random() < 0.5){
        displace *= -1;
    }
    displace *= 100;

    let planet = new THREE.Mesh( planetsphere, planetMaterial);
    planet.position.set(0 + displace, 500 + displace, -2550 + displace);

    planet_environment.push(planet);
    environment.add(planet)


    let planet2 = new THREE.Mesh( planetsphere, planetMaterial);
    planet2.position.set(200 + displace, 250 + displace, -2350 + displace);

    planet_environment.push(planet2);
    environment.add(planet2);


    let planet3 = new THREE.Mesh( planetsphere, planetMaterial);
    planet3.position.set(-200 + displace, 600 + displace, -2750 + displace);

    planet_environment.push(planet3);
    environment.add(planet3);

    let planet4 = new THREE.Mesh( planetsphere, planetMaterial);
    planet4.position.set(200 + displace, 800 + displace, -2650 + displace);

    planet_environment.push(planet4);
    environment.add(planet4)
}

var trailUpdate;
const updateBoid = function (delta) {
    for (let i = 0; i < boids_environment.length; i++) {
        if(trailUpdate == 30){
            updateTrail(boids_environment[i].getPosX, boids_environment[i].getPosY, boids_environment[i].getPosZ);
        }
        boids_environment[i].move(delta, 100, boids_environment, i, planet_environment);
        boid_models[i].position.set(boids_environment[i].getPosX, boids_environment[i].getPosY, boids_environment[i].getPosZ);
        boid_models[i].lookAt(new THREE.Vector3(boids_environment[i].getPosX + boids_environment[i].getDirX, boids_environment[i].getPosY + boids_environment[i].getDirY, boids_environment[i].getPosZ + boids_environment[i].getDirZ));
    }
    trailUpdate++;
    if(trailUpdate > 30){
        trailUpdate = 0;
    }
}

var trailcounter;
function updateTrail(x, y, z){
    trail_environment[trailcounter].position.set(x, y, z);
    trailcounter++;
    if(trailcounter >= trail_environment.length){
        trailcounter = 0;
    }
}
//#endregion

//#region Modeling Goal 6
var robotClip;
function loadModelingGoal6(loader, texLoader){
    let robot = new THREE.Object3D();
    robot.name = 'robot';
    robot.position.set(-2550, 64, 0);
    robot.scale.set(0.25, 0.25, 0.25);

    //loading mesh data and assigning material
    loader.load('/walkabout/models/Robot/robot.fbx', function( object ) {
        object.mixer = new THREE.AnimationMixer( object );
        mixers_environment.push(object.mixer);
        robotClip = object.mixer.clipAction(object.animations[0]).play();

        console.log(object.animations);
        console.log(mixers_environment.length);


        //setting animation actions 
        //destructionClip = object.mixer.clipAction(object.animations[0]);
        //destructionClip.setLoop(THREE.LoopOnce);

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh){
                child.material = robotMaterial;
                child.material.skinning = true;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        
        robot.add(object);
    });

    //Texture
    var robotMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('robot.png'),
    }); 
    robotMaterial.map.minFilter = THREE.NearestFilter;
    robotMaterial.map.magFilter = THREE.NearestFilter;

    environment.add(robot);
}
//#endregion

//#region Modeling Goal 8
function loadModelingGoal8(loader, texLoader){
    Physics.init();
    Physics.example(environment, loader, texLoader);
}
//#endregion

//#region Modeling Goal 9
var destructionClip;
function loadModelingGoal9(camera, loader, texLoader){
    var destruction = new THREE.Object3D();
    destruction.name = 'asteriod';
    destruction.position.set(-1800, 64, 1800);
    destruction.scale.set(0.5, 0.5, 0.5);
      
    loader.load('/walkabout/models/Destructible/asteriod.fbx', function (object) {

        object.traverse(function (child) {
 
        object.mixer = new THREE.AnimationMixer(object);
        mixers_environment.push(object.mixer);
  
        //setting animation actions 
        destructionClip = object.mixer.clipAction(object.animations[0]);
        destructionClip.setLoop(THREE.LoopOnce);

        object.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = asteroidMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
   
        destruction.add(object);
        })
    })

    //Texture
    var asteroidMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('robot.png')
    }); 


    //Load audio
    loadAudio();
    loadPositionalAudio(camera);

    destruction.add(soundOfDestruction);
    environment.add(destruction);
}

//Controls
function updateControls(controls)
{ 
    //if letter k/K is pressed
    if (Input.keyState[107] || Input.keyState[75]){ 
    
        destructionClip.reset();
        destructionClip.play();
        soundOfDestruction.play();
    }

    controls.update();
}

//Audio
const audioLoader = new THREE.AudioLoader().setPath('/walkabout/sounds/');
const audioListener = new THREE.AudioListener();
const backgroundMusic = new THREE.Audio(audioListener);
const soundOfDestruction = new THREE.PositionalAudio(audioListener);      

function loadAudio() {
    audioLoader.load( "SpaceDiscoveries.wav", function( buffer ) {
        backgroundMusic.setBuffer( buffer );
        backgroundMusic.setVolume(0.1);
        backgroundMusic.setLoop(true);
        backgroundMusic.play();
    });
}

function loadPositionalAudio(camera) {
    camera.add(audioListener);
    audioLoader.load( "ArmorBreak.wav", function( buffer ) {
      soundOfDestruction.setBuffer( buffer );
      soundOfDestruction.setRefDistance(20);
      soundOfDestruction.setVolume(5.0);
      
    });
  }
//#endregion

//#region Modeling Goal 10
function loadModelingGoal10(loader, texLoader){
    var lod = new THREE.LOD();

    let brainMaterial = new THREE.MeshStandardMaterial({
        map: texLoader.load('Brain_Diffuse.png'),
        normalMap: texLoader.load('Brain_Normal_Map.png')
    })

    var brain_LOD0 = new THREE.Object3D();
        brain_LOD0.name = 'brain_LOD0';

    loader.load('/walkabout/models/Brain/brain_high.fbx', function(obj)
    {
        obj.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = brainMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });

        brain_LOD0.add(obj);
    });

    lod.addLevel(brain_LOD0, 50);


    var brain_LOD1 = new THREE.Object3D();
        brain_LOD1.name = 'brain_LOD1';
        //brain_LOD1.scale.set(1.2, 1.2, 1.2)

    loader.load('/walkabout/models/Brain/brain_low2.fbx', function(obj)
    {
        obj.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = brainMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });
        
        brain_LOD1.add(obj);
    });

    lod.addLevel(brain_LOD1, 500);


    var brain_LOD2 = new THREE.Object3D();
    brain_LOD2.name = 'brain_LOD2';

    loader.load('/walkabout/models/Brain/brain_low3.fbx', function(obj)
    {
        obj.traverse(function (child) {
            if( child instanceof THREE.Mesh ){
                child.material = brainMaterial;
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });

        brain_LOD2.add(obj);
    });

    lod.addLevel(brain_LOD2, 1000);

    lod.position.x = 1820;
    lod.position.y = 65;
    lod.position.z = 1900;
    lod.scale.set(0.3, 0.3, 0.3);

    environment.add(lod);
}
//#endregion

function loadSigns(){
    
    // Create and your signs here
    let firstSign = new CanvasSign.create(environment, "Walkabout", "Retrofuturism 2022 \nThe World In 50 Years");
    firstSign.loadSign(new THREE.Vector3(1000, 0, 0), new THREE.Vector3(0,1.5708,0), new THREE.Vector3(1,1,1));

    //Modeling Goal 1
    let goal1 = new CanvasSign.create(environment, "Goal 1", "Rocket \nBasic 3D Modeling");
    goal1.loadSign(new THREE.Vector3(2000, 0, 0), new THREE.Vector3(0,-1.5708,0), new THREE.Vector3(1,1,1));

    //Modeling Goal 2
    let goal2 = new CanvasSign.create(environment, "Goal 2", "Car \n3D Modeling Techniques");
    goal2.loadSign(new THREE.Vector3(0, 0, 2000), new THREE.Vector3(0,3.14159,0), new THREE.Vector3(1,1,1));

    //Modeling Goal 3 & 10
    let goal310 = new CanvasSign.create(environment, "Goal 3 & 10", "Computer & Brain \nTexturing & LODs");
    goal310.loadSign(new THREE.Vector3(1400, 0, 1400), new THREE.Vector3(0,-2.35619,0), new THREE.Vector3(1,1,1));

     //Modeling Goal 4 & 7
     let goal47 = new CanvasSign.create(environment, "Goal 4 & 7", "3D Scanning \n& \nMotion Capture");
     goal47.loadSign(new THREE.Vector3(300, 0, -1100), new THREE.Vector3(0,-0.785398,0), new THREE.Vector3(1,1,1));

     //Modeling Goal 5
     let goal5 = new CanvasSign.create(environment, "Goal 5", "Boid Agents \nPCG");
     goal5.loadSign(new THREE.Vector3(0, 0, -2000), new THREE.Vector3(0,-0,0), new THREE.Vector3(1,1,1));

     //Modeling Goal 6
     let goal6 = new CanvasSign.create(environment, "Goal 6", "Robot \nAnimation");
     goal6.loadSign(new THREE.Vector3(-2000, 0, 0), new THREE.Vector3(0,1.5708,0), new THREE.Vector3(1,1,1));

     //Modeling Goal 9
     let goal9 = new CanvasSign.create(environment, "Goal 9", "Destructible \nPress K To Play");
     goal9.loadSign(new THREE.Vector3(-1400, 0, 1400), new THREE.Vector3(0,2.35619,0), new THREE.Vector3(1,1,1));

     //Modeling Goal 9
     let goal8 = new CanvasSign.create(environment, "Goal 8", "Physics \nPress L To Fly \nPress O To Reset");
     goal8.loadSign(new THREE.Vector3(-1400, 0, -1400), new THREE.Vector3(0,0.785398,0), new THREE.Vector3(1,1,1));
}

export { loadEnvironment, updateEnvironment, updateBoid }
