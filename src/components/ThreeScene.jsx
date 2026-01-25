// @refresh reset
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GUI } from 'lil-gui';
import { BBoid } from './BBoid';

export default function ThreeScene({bgColor = "DBE9F4", ambientLightColor = "0xffffff", modelName = ""}) {
  const mountRef = useRef(null);
  const guiRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());
  const sphereRef = useRef(null);
  const clock = new THREE.Clock();
  const pausedRef = useRef(false);
  const animationIdRef = useRef(null);
  const controlsRef = useRef(null);
  const guiContainerRef = useRef(null);
  const paramsRef = useRef(null);

  //Add the boids to this
  const boidsRef = useRef([]);
  const boidModelsRef = useRef([]);
  const planetsRef = useRef([]);
  var max_boids = 250;

  useEffect(() => {
    sceneRef.current.clear();
    boidsRef.current = [];
    boidModelsRef.current = [];
    planetsRef.current = [];
    pausedRef.current = false;
    guiRef.current = null;
    paramsRef.current = null;
    clock.stop();
    clock.start();

    const container = mountRef.current;

    //const guiContainer = document.createElement('div');
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
    //const guiContainer = document.createElement('div');
    const guiContainer = guiContainerRef.current;
    
    //guiContainer.id = 'gui-container';
    //guiContainer.style.position = 'absolute';
    //guiContainer.style.bottom = '0px';
    //guiContainer.style.right = '0px';
    //guiContainer.style.zIndex = '1000';
    //guiContainer.style.pointerEvents = 'auto';

    const gui = new GUI({ autoPlace: false });
    gui.domElement.style.position = 'relative';
    gui.domElement.style.width = '245px';
    //guiContainer.appendChild(gui.domElement);
    gui.close();


    if (guiContainer) {
      guiContainer.innerHTML = ''; // Clear any previous content
      guiContainer.appendChild(gui.domElement);
    }
    //guiContainerRef.current = guiContainer;

    //guiContainerRef.current = guiContainer;
    //container.appendChild(guiContainerRef.current);

    // Store refs
    //guiRef.current = gui;


    //container.appendChild(guiContainerRef.current);

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

    paramsRef.current = params;
    guiRef.current = gui;


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
      controlsRef.current = new OrbitControls(camera, renderer.domElement);
      controlsRef.current.enableDamping = true;
    });

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
      animationIdRef.current = requestAnimationFrame(animate);

      if (pausedRef.current) return;

      controlsRef.current?.update();
      tick();
      renderer.render(scene, camera);
    };
    animate();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      // Cancel animation frame
      cancelAnimationFrame(animationIdRef.current);

      // Cleanup GUI
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
      if(paramsRef.current){
        paramsRef.current = null;
      }
      
      /*
      // Remove GUI container from DOM
      if (guiContainerRef.current && guiContainerRef.current.parentNode) {
        guiContainerRef.current.parentNode.removeChild(guiContainerRef.current);
        guiContainerRef.current = null;
      }*/
/*
      while (mountRef.current && mountRef.current.firstChild) {
        mountRef.current.removeChild(mountRef.current.firstChild);
      }*/
     // Remove ONLY the WebGL canvas
      if (rendererRef.current?.domElement?.parentNode) {
        rendererRef.current.domElement.parentNode.removeChild(
          rendererRef.current.domElement
        );
      }


      // Cleanup renderer, controls, etc.
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      // Remove event listeners
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      resizeObserver.disconnect();
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
    planetsRef.current.push(sphereRef.current);
    planetsRef.current[0].userData.mesh = m;
    scene.add(m);
  };

  const init_boids = function(scene){
    for(let i = 0; i < max_boids; i++){
        var x = THREE.MathUtils.randFloat(-100, 100);
        var y = THREE.MathUtils.randFloat(-100, 100);
        var z = THREE.MathUtils.randFloat(-100, 100);

        var boid = new BBoid(i, x, y, z, x, y, z, 100, 150);
        boidsRef.current.push(boid);
        boidModelsRef.current.push(new THREE.Object3D());

        //model
        //let geometry = new THREE.BoxGeometry(5, 5, 12);
        let geometry = new THREE.ConeGeometry( 4, 12, 6 );
        geometry.rotateX(90);
        let material = new THREE.MeshBasicMaterial( { color: 0x39FF14} ); //39FF14 //FFFAFA
        let mesh = new THREE.Mesh(geometry, material);

        boidModelsRef.current[i].add(mesh);
        boidModelsRef.current[i].userData.mesh = mesh;
    
        scene.add(boidModelsRef.current[i]);
    }
  }

  const tick = () => {
      //const elapsedTime = clock.getElapsedTime()
      if (pausedRef.current) return;

      var delta = clock.getDelta();
      sphereRef.current.rotateZ(0.003);
      //sphereRef.current.rotateX(0.004);
      //sphereRef.current.rotateY(-0.0025);

      //update boids
      for (let i = 0; i < boidsRef.current.length; i++) {
          boidsRef.current[i].move(delta, 100, boidsRef.current, i, planetsRef.current);
          boidModelsRef.current[i].position.set(boidsRef.current[i].getPosX, boidsRef.current[i].getPosY, boidsRef.current[i].getPosZ);
          boidModelsRef.current[i].lookAt(new THREE.Vector3(boidsRef.current[i].getPosX + boidsRef.current[i].getDirX, boidsRef.current[i].getPosY + boidsRef.current[i].getDirY, boidsRef.current[i].getPosZ + boidsRef.current[i].getDirZ));
      }
  };
  
  function update_boid_params(){
    const params = paramsRef.current;
    for (let i = 0; i < boidsRef.current.length; i++) {
      boidsRef.current[i].speed_mult = params.speed;
      boidsRef.current[i].sep_mult = params.separation;
      boidsRef.current[i].coh_mult = params.cohesion;
      boidsRef.current[i].ali_mult = params.alignment;
      boidsRef.current[i].rnd_mult = params.randomness;
      boidModelsRef.current[i].userData.mesh.material.color.set(params.color);
    }
    planetsRef.current[0].userData.mesh.material.color.set(params.planet_color);
  }
  //return <div ref={mountRef} style={{ width: "100%", height: "400px", position: 'relative', borderRadius: '10px', overflow: 'hidden' }} />;
  return (
  <div
    ref={mountRef}
    style={{ width: "100%", height: "400px", position: 'relative', borderRadius: '10px', overflow: 'hidden' }}
  >
    <div
      ref={guiContainerRef}
      style={{
        position: 'absolute',
        bottom: '0px',
        right: '0px',
        zIndex: 1000,
        pointerEvents: 'auto',
        width: '245px',
      }}
    />
  </div>
);

}