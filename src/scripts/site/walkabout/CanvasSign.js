/*
    Create a new Sign:
    var sign = new CanvasSign();
    sign.title = "title";
    sign.text = "description";
    sign.loadSign(new Vector3(0, 0, 0), new Vector3(0, 0, 0), new Vector3(1, 1, 1));

*/

//sign model path is Assets/models/signs/
//sign texture path is Assets/textures/signs/

/*
import { TextureLoader,
    Vector3,
    Vector2,
    CanvasTexture,
    Object3D,
    MeshStandardMaterial } from 'three';*/

import * as THREE from 'https://unpkg.com/three@0.127.0/build/three.module.js';
import { FBXLoader } from 'https://unpkg.com/three@0.127.0/examples/jsm/loaders/FBXLoader.js'
import * as CanvasSign from './CanvasSign.js';

const loader = new FBXLoader();
const titleFontSize = 60;
const textFontSize = 40;
const signTexLoader = new THREE.TextureLoader().setPath('/walkabout/textures/signs/');


function create(environment = null, title = "Exhibit Title", text = "Description of usage.", modelname = 'defaultSign', font = "Arial"){
this.title = title;
this.text = text;
this.modelname = modelname;
this.titlefont = titleFontSize+"px " + font;
this.textfont = textFontSize+"px " + font;
this.environment = environment;

this.loadSign = function(position = new THREE.Vector3(0,0,0), rotation = new THREE.Vector3(0,0,0), scale = new THREE.Vector3(1,1,1)){
   //Create text texture 
   var drawingCanvas = document.createElement('canvas');
   drawingCanvas.id     = "CursorLayer";
   drawingCanvas.width  = 512;
   drawingCanvas.height = 512;
   drawingCanvas.style.zIndex   = -1;
   drawingCanvas.style.position = "absolute";
   drawingCanvas.style.top = "-512px";
   drawingCanvas.style.right = "-512px";
   drawingCanvas.style.backgroundcolor = "#000000";

   document.body.appendChild(drawingCanvas);

   // get  context
   var drawingContext = drawingCanvas.getContext('2d');

   //drawing black frame
   drawingContext.fillStyle = "#000000";
   drawingContext.fillRect(0, 0, 512, 384);
   drawingContext.fillStyle = "#FFFFFF";
   drawingContext.fillRect(4, 4, 504, 376);

   //drawing text
   drawingContext.fillStyle = "#000000";
   drawingContext.font = this.titlefont;
   drawingContext.textAlign = "center";
   drawingContext.fillText(this.title, 256, 100);

   var substrings = this.text.split("\n");

   for (let i = 0; i < substrings.length; i++) {
       const element = substrings[i];
       drawingContext.font = this.textfont;
       drawingContext.textAlign = "center";
       drawingContext.fillText(element, 256, i * textFontSize + 180);
   }

   //applying texture
   var textTexture = new THREE.CanvasTexture(drawingCanvas);

   //create
   var sign = new THREE.Object3D();
   sign.name = 'Sign'+this.title;
   sign.position.set(position.x, position.y, position.z);
   sign.rotation.set(rotation.x, rotation.y, rotation.z);
   sign.scale.set(scale.x, scale.y, scale.z);

   //creating sign materials and loading textures
   var signMaterial = new THREE.MeshStandardMaterial({
       map: textTexture,
       metalness: 0,
       roughness: 1
       //envMap: reflectionCube 
   });

 
   var signBorderMaterial = new THREE.MeshStandardMaterial({
       map: signTexLoader.load(this.modelname+'_BaseColor.jpg'),
       normalMap: signTexLoader.load( this.modelname+'_Normal.jpg'),
       normalScale: new THREE.Vector2( 1, 1 ),
       metalness: 1,
       metalnessMap: signTexLoader.load( this.modelname+'_Metallic.jpg'),
       roughness: 1,
       roughnessMap: signTexLoader.load( this.modelname+'_Roughness.jpg')
       //envMap: reflectionCube 
   });

   //loading mesh data and assigning material
   loader.load( '/walkabout/models/signs/'+this.modelname+'.fbx', function ( object ) {

       object.traverse( function ( child ) {
       if ( child.isMesh ) {
           child.material[0] = signMaterial;
           child.material[1] = signBorderMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
           }
       } );
      
           sign.add(object);
       
       }    
   );
   
   signMaterial.map.needsUpdate = true;
   this.environment.add(sign);
};
}

export {create}
