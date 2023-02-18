import {OrbitControls} from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import {Boid} from "./walkabout/src/boid.js";
const canvas = document.getElementById("threeCanvas")
import * as Input from './input.js';

var boids_environment = [];
var trail_environment = [];
var planet_environment = [];
var boid_models = [];

var speed = 1;
var x_pos = 0;
var direction = new THREE.Vector3(0, 0, -1);
Input.addEvents();

// Scene
const scene = new THREE.Scene()

const textureLoader = new THREE.TextureLoader()
const myTexture = textureLoader.load('coolTex.jpg')

//Environment
const environment = buildEnvironment();

function buildEnvironment() {
    const environment = new THREE.Object3D();
    return environment;
}

const loadEnvironment = function (scene, camera) {

    //loadGrid(scene);
    loadObjects(camera);
    //loadSigns();
    scene.add(environment);
}

const updateEnvironment = function (delta, controls) {
    /*
    //update animation
    for (let i = 0; i < mixers_environment.length; i++) {
        mixers_environment[i].update(delta);
    }*/

    //update boids
    updateBoid(delta);

    /*
    //update physics
    Physics.updatePhysics();
    Physics.updateControls(controls);
    */

    //scan input for destructible reset
    updateControls(controls);
}

function loadGrid(scene) {

    // grid helper
    const grid = new THREE.GridHelper(10000, 200, 0xaaaaaa, 0xdddddd);
    scene.add(grid);

}

function loadObjects(camera) {
    var skybox = new THREE.BoxGeometry(10000, 10000, 10000);
    var front = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("images/Skybox/front.jpg"), side: THREE.DoubleSide});
    var back = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("images/Skybox/back.jpg"), side: THREE.DoubleSide});
    var left = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("images/Skybox/left.jpg"), side: THREE.DoubleSide});
    var right = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("images/Skybox/right.jpg"), side: THREE.DoubleSide});
    var up = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("images/Skybox/top.jpg"), side: THREE.DoubleSide});
    var down = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load("images/Skybox/bottom.jpg"), side: THREE.DoubleSide});
    var cubeMaterials = 
    [
        right,
        left,
        up,
        down,
        front,
        back
    ];
    var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials);
    var cube = new THREE.Mesh(skybox, cubeMaterial);
    environment.add(cube);

    loadModelingGoal5()
}


// Object
const geometry = new THREE.BoxGeometry(1,1,1)
const geometry2 = new THREE.DodecahedronGeometry(0.5,3)
const material = new THREE.MeshBasicMaterial({
    map: myTexture
})
const boxMesh = new THREE.Mesh(geometry,material)
const sphereMesh = new THREE.Mesh(geometry2,material)
scene.add(boxMesh)
// scene.add(sphereMesh)
boxMesh.position.x = 0
boxMesh.position.y = 0.8
sphereMesh.position.x = -1.6
sphereMesh.position.y = 0.5
geometry.center()
// Sizes
const sizes = {
    width:window.innerWidth * (2 / 3),
    height:window.innerHeight * (2 / 3)
}

// Renderer gets updated each time window is resized
window.addEventListener('resize',()=>{
    sizes.width = window.innerWidth * (2 / 3)
    sizes.height = window.innerHeight * (2 / 3)

    camera.aspect = sizes.width/sizes.height
    camera.updateProjectionMatrix()

    renderer.setSize(sizes.width,sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
    
})

// Camera
const camera = buildCamera();
camera.position.z = 3
scene.add(camera)

function buildCamera() {
    let fov = 75;
    //creating camera
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 420, -550);
    scene.add(camera);

    camera.getWorldDirection(direction);
    direction.normalize();

    return camera;
}

// Controls
const controls = new OrbitControls(camera, canvas)

controls.enableZoom = false;
controls.enableDamping = true

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,
})
renderer.setSize(sizes.width,sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))

const clock = new THREE.Clock()

loadEnvironment(scene, camera);

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

const tick = () => {
    //const elapsedTime = clock.getElapsedTime()
    boxMesh.rotateX(30*0.0003)
    boxMesh.rotateY(30*0.0003)
    sphereMesh.rotateY(30*0.0003)
    // mesh.position.y = Math.sin(elapsedTime) *0.1
    //boxMesh.position.z = Math.sin(elapsedTime) * 1

    //updateBoid(elapsedTime);
    var delta = clock.getDelta();
    updateEnvironment(delta, controls);


    controls.update()
    controls.enableDamping = true
    renderer.render(scene,camera)
    window.requestAnimationFrame(tick)
};

tick()

var trailcounter = 0;
var trailUpdate = 0;
//#region Modeling Goal 5
function loadModelingGoal5(){
    var bigSphere = new THREE.SphereGeometry(2000,16,16);
    let material = new THREE.MeshBasicMaterial( 
        { color: 0x00ff00,
        wireframe: true, } );
    let m = new THREE.Mesh( bigSphere, material);
    m.position.set(0, 0, 0);
    //environment.add(m)
    m.geometry.computeBoundingBox();

    var box = new THREE.Box3(new THREE.Vector3(200,200,200), new THREE.Vector3(500 , 500, 500));
    //var box = new Box3();
    box.copy( m.geometry.boundingBox ).applyMatrix4( m.matrixWorld );
            box.translate(0, 0, 0);

    for(let i = 0; i < 50; i++){
        var boid = new Boid(500 + i * 100, 500 + i * 100, 500 + i * 100, 0, 0, 0, 100, 150, box, -2050, -3050, 500, -500, 750, -250, new THREE.Vector3(-1, 1, -10));
        console.log(boid); 
        boids_environment.push(boid);
        boid_models.push(new THREE.Object3D());
    }

    for(let i = 0; i < 50; i++){       
        let geometry = new THREE.BoxGeometry(5, 5, 12);
        let material = new THREE.MeshBasicMaterial( { color: 0xFFFAFA} );
        let mesh = new THREE.Mesh( geometry, material);

        boid_models[i].add(mesh);
    
        environment.add(boid_models[i]);
    }

    for(let i = 0; i < 200; i++){
        trail_environment.push(new THREE.Object3D());
    }
    for(let i = 0; i < 200; i++){
    
        let geometry = new THREE.BoxGeometry(3, 3, 3);
        let material = new THREE.MeshBasicMaterial( { color: 0x808080 } );
        let mesh = new THREE.Mesh(geometry, material);

        trail_environment[i].add(mesh);
        trail_environment[i].position.set(0, 0, 0);
    
        environment.add(trail_environment[i]);
    }
    trailcounter = 0;
    trailUpdate = 0;

    
    var planetsphere = new THREE.SphereGeometry(25,16,16);
    let planetMaterial = new THREE.MeshBasicMaterial( 
        { color: 0xff8800 } );

    for(let i = 0; i < 30; i++){
        placePlanet(1000, planetsphere, planetMaterial)
    }
}

function placePlanet(displaceMultiplier, planetsphere, planetMaterial){
    var displace_x = Math.random();
    if(Math.random() < 0.5){
        displace_x *= -1;
    }
    displace_x *= displaceMultiplier;

    var displace_y = Math.random();
    if(Math.random() < 0.5){
        displace_y *= -1;
    }
    displace_y *= displaceMultiplier;

    var displace_z = Math.random();
    if(Math.random() < 0.5){
        displace_z *= -1;
    }
    displace_z *= displaceMultiplier;

    let planet = new THREE.Mesh( planetsphere, planetMaterial);
    planet.position.set(0 + displace_x, 0 + displace_y, 0 + displace_z);

    planet_environment.push(planet);
    environment.add(planet);
}

function updateTrail(x, y, z){
    trail_environment[trailcounter].position.set(x, y, z);
    trailcounter++;
    if(trailcounter >= trail_environment.length){
        trailcounter = 0;
    }
}

//#region implement game here...
//Controls
function updateControls(controls)
{ 
    if (Input.keyState[82]){ 
    
        //camera.position.set(0, 0, 0);
    }

    //if letter k/K is pressed
    if (Input.keyState[87]){ 
    
        moveup();
    }
    if (Input.keyState[83]){ 
    
        movedown();
    }
    if (Input.keyState[65] || Input.keyState[97]){ 
    
        moveleft();
    }
    if (Input.keyState[68]){ 
    
        moveright();
    }

    if (Input.keyState[16]){ 
    
        accelerate();
    }
    if (Input.keyState[17]){ 
    
        deccelerate();
    }

    //if(camera == undefined) return
    //camera.position.add(direction.x, direction.y, direction.z);
    /*
    camera.getWorldDirection(direction);
    direction.normalize();
    camera.position.add( direction );
    //camera.position.addScaledVector(direction, speed);
    //camera.position.set(direction);
    //camera.position.set(0, 420, -550);
    console.log(direction);
    */
    //camera.rotation.set(direction);

    controls.update();
}


function moveup(){

}

function movedown(){

}

function moveleft(){
    camera.rotation.x += speed;
}

function moveright(){

}

function accelerate(){

}

function deccelerate(){

}
//#endregion