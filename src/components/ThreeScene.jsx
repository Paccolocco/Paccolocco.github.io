import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function ThreeScene({bgColor = "000000", ambientLightColor = "0xffffff", modelName = ""}) {
  const mountRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(new THREE.Scene());

  useEffect(() => {
    const container = mountRef.current;

    const scene = sceneRef.current;
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    camera.position.set(0, 1, 5);
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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // Scene Background
    console.log("0x")
    scene.background = new THREE.Color().setHex("0x" + bgColor);

    // Load model
    const loader = new GLTFLoader();
    loader.load(
      modelName,
      (gltf) => {
        scene.add(gltf.scene);
      },
      undefined,
      (error) => console.error("Error loading model:", error)
    );

    const resizeObserver = new ResizeObserver(() => {
      const width = container.offsetWidth;
      const height = container.offsetHeight;

      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });

    resizeObserver.observe(container);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      resizeObserver.disconnect();
      renderer.dispose();
      if (renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "400px", borderRadius: '10px', overflow: 'hidden'}} />; //relative py-4 sm:px-6 rounded-lg flex-
}
