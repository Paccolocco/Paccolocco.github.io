/*
import { CubeTextureLoader,
    CubeRefractionMapping,
    RGBFormat,
    Object3D, 
    DirectionalLight,
    AnimationMixer } from 'three';
*/

import { OrbitControls } from 'https://unpkg.com/three@0.127.0/examples/jsm/controls/OrbitControls.js'
import { FBXLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/FBXLoader.js'
import * as Input from './input.js';
import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';

const loader = new FBXLoader();
var miwer_player;
var player;
var playerLight;

//Player Settings, you can change these
var transitionDuration = 0.1; //transition duration between animations in seconds
var walkSpeed = 190; //walk speed in cm per second
var runSpeed = 400; //run speed in cm per second
var turnSpeed = 5; //turn speed in radians per second

//Don't touch those
var idle, walking, running;
var moveSpeed, direction, lastDirection;

Input.addEvents();

const loadPlayer = function ( scene )
{    
player = new THREE.Object3D();
player.name = 'player';
player.position.set(0,0,0);
scene.add( player );

playerLight = new THREE.DirectionalLight( 0xffffff );
playerLight.position.set( 0, 200, 0 );
playerLight.castShadow = true;
playerLight.shadow.camera.top = 75;
playerLight.shadow.camera.bottom = -75;
playerLight.shadow.camera.left = -75;
playerLight.shadow.camera.right = 75;
playerLight.target = player;
player.add( playerLight );

loader.load( '/walkabout/assets/models/Player.fbx' , function ( object ) {

   miwer_player = new THREE.AnimationMixer( object );
   
   idle = miwer_player.clipAction( object.animations[ 0 ] );
   walking = miwer_player.clipAction( object.animations[ 1 ] );
   running = miwer_player.clipAction( object.animations[ 2 ] );    
                       
   idle.play();
   walking.play();
   running.play();
  
   idle.weight = 1;
   walking.weight = 0;
   running.weight = 0;
   
   object.traverse( function ( child ) {
       if ( child.isMesh ) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.transparent = false;
       }
   } );

   //setting initial rotation
   object.rotation.y = Math.PI;
   player.add( object );
   
});

}

const updatePlayer = function( delta ) {

if ( miwer_player !== undefined ) {
   switch(direction){
       case 0: //idle
           if(lastDirection != direction) idle.reset();
           //fading weights
           idle.weight += delta / transitionDuration;
           if(idle.weight > 1) idle.weight = 1;
           walking.weight -= delta / transitionDuration;
           if(walking.weight < 0) walking.weight = 0;
           running.weight -= delta / transitionDuration;
           if(running.weight < 0) running.weight = 0;
           miwer_player.update( delta );
       break;
       case 1: //walking forward
           if(lastDirection != direction) walking.reset();
           //setting the animation to the correct time frame
           if(lastDirection == -1) walking.time = (running.time/running.getClip().duration)*walking.getClip().duration;
           //fading weights
           idle.weight -= delta / transitionDuration;
           if(idle.weight < 0) idle.weight = 0;
           walking.weight += delta / transitionDuration;
           if(walking.weight > 1) walking.weight = 1;
           running.weight -= delta / transitionDuration;
           if(running.weight < 0) running.weight = 0;
           miwer_player.update( delta );
       break;
       case -1: //walking backward
           if(lastDirection != direction) walking.reset();
           //setting the animation to the correct time frame
           if(lastDirection == -2) walking.time = (running.time/running.getClip().duration)*walking.getClip().duration;
           //fading weights
           idle.weight -= delta / transitionDuration;
           if(idle.weight < 0) idle.weight = 0;
           walking.weight += delta / transitionDuration;
           if(walking.weight > 1) walking.weight = 1;
           running.weight -= delta / transitionDuration;
           if(running.weight < 0) running.weight = 0;
           miwer_player.update( -delta );
       break;
       case 2: //running forward
           if(lastDirection != direction) running.reset();
           //setting the animation to the correct time frame
           if(lastDirection == 1) running.time = (walking.time/walking.getClip().duration)*running.getClip().duration;
           //fading weights
           idle.weight -= delta / transitionDuration;
           if(idle.weight < 0) idle.weight = 0;
           walking.weight -= delta / transitionDuration;
           if(walking.weight < 0) walking.weight = 0;
           running.weight += delta / transitionDuration;
           if(running.weight > 1) running.weight = 1;
           miwer_player.update( delta );
       break;
       case -2: //running backward
           if(lastDirection != direction) running.reset();
           //setting the animation to the correct time frame
           if(lastDirection == -1) running.time = (walking.time/walking.getClip().duration)*running.getClip().duration;
           //fading weights
           idle.weight -= delta / transitionDuration;
           if(idle.weight < 0) idle.weight = 0;
           walking.weight -= delta / transitionDuration;
           if(walking.weight < 0) walking.weight = 0;
           running.weight += delta / transitionDuration;
           if(running.weight > 1) running.weight = 1;
           miwer_player.update( -delta );
       break;
   }
}
}

const updateControls = function( camera, controls, delta ) {

//saving direction for next update
lastDirection = direction;
direction = 0;

if (Input.keyState[16]){ //if shift is pressed
   moveSpeed = runSpeed;
} else {
   moveSpeed = walkSpeed;
}
if (Input.keyState[87]) { //if w is pressed
   direction = 1;
   player.position.x -= moveSpeed * Math.sin( player.rotation.y ) * delta;
   player.position.z -= moveSpeed * Math.cos( player.rotation.y ) * delta;
   camera.position.x -= moveSpeed * Math.sin( player.rotation.y ) * delta;
   camera.position.z -= moveSpeed * Math.cos( player.rotation.y ) * delta;
   controls.target.set( player.position.x, 100, player.position.z );            
}
if (Input.keyState[83]) { //if s is pressed
   direction = -1;            
   player.position.x += moveSpeed * Math.sin( player.rotation.y ) * delta;
   player.position.z += moveSpeed * Math.cos( player.rotation.y ) * delta;
   camera.position.x += moveSpeed * Math.sin( player.rotation.y ) * delta;
   camera.position.z += moveSpeed * Math.cos( player.rotation.y ) * delta;                    
   controls.target.set( player.position.x, 100, player.position.z );                   
}
if (Input.keyState[65]) { //if a is pressed
   player.rotation.y += turnSpeed * delta;
}
if (Input.keyState[68]) { //if d is pressed
   player.rotation.y -= turnSpeed * delta;
}                
if (Input.keyState[16]) //if shift is pressed
   direction *= 2;

controls.update();
}

export {loadPlayer, updatePlayer, updateControls};
