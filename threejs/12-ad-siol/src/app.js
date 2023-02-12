console.log("Welcome to the Asset Development Modeling and Animation Exercise")

/*
import {
    Clock,
    WebGLRenderer,
    Scene,
    PerspectiveCamera,
    HemisphereLight,
    HemisphereLightHelper,
    Color,
    Fog,
    AxesHelper
} from 'https://unpkg.com/three@0.127.0/build/three.module.js';
*/

import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import * as Environment from './environment.js';
import * as Player from './player.js';

const clock = new THREE.Clock();
const renderer = buildRenderer();
const scene = buildScene();
const camera = buildCamera();
const light = buildLight();
const controls = buildControls();

Player.loadPlayer( scene );
Environment.loadEnvironment(scene, camera);
renderer.xr.enabled = true;


animate();

function buildRenderer() {
    let container = document.createElement('div');
    document.body.appendChild(container);

    //creating renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    return renderer;
}

function buildScene() {
    //creating scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);
    const axesHelper = new THREE.AxesHelper( 750 );
    scene.add( axesHelper );

    return scene;
}

function buildCamera() {
    let fov = 75;
    //creating camera
    const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 1, 4000);
    camera.position.set(0, 420, -550);
    scene.add(camera);

    return camera;
}

function buildLight()
{
    //adding sky light to scene
    const light = new THREE.HemisphereLight( 0xffffff, 0xffffff );
    light.position.set( 0, 750, -750 );
    scene.add( light );

    return light;
}


function buildControls() {
    //creating camera controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);

    return controls;
}



function animate() {

    var delta = clock.getDelta();

    Player.updatePlayer( delta );
    Player.updateControls( camera, controls, delta );
    Environment.updateEnvironment(delta, controls);

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}
