import * as Three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

const canvas = document.querySelector(".canvas");
let composer;

//* creating a Scene
const scene = new Three.Scene();

//* camera settings
const camera = new Three.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 5; // Ensure the camera is positioned properly to see the model

//* Renderer settings
const renderer = new Three.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

//* OrbitControls settings
const control = new OrbitControls(camera, renderer.domElement);
control.enableDamping = true;

// lighting add
const directionalLight = new Three.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
directionalLight.castShadow = true; // Enable shadow casting
scene.add(directionalLight);
renderer.shadowMap.enabled = true; // Enable shadow maps

//* HDR environment map loading
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/rosendal_plains_2_4k.hdr",
  (texture) => {
    texture.mapping = Three.EquirectangularReflectionMapping;
    scene.environment = texture;
    scene.background = texture;
  },
  undefined,
  (err) => console.error("HDR texture load failed: ", err)
);

//* GLTF model loading
const loader = new GLTFLoader();
loader.load(
  "../input.glb",
  (gltf) => {
      addTextBehindModel("This World is 3D");
    scene.add(gltf.scene); // Add the loaded GLB model to the scene
    gltf.scene.position.y = -0.5;
    
    // Add text behind the model
    
    applyPostProcessing(); // Call post-processing after model loads
    animate(); // Start animation loop after model loads
  },
  undefined,
  (err) => console.error("Model load failed: ", err)
);

//* Post-processing setup
function applyPostProcessing() {
  const renderPass = new RenderPass(scene, camera);
  const bloomPass = new UnrealBloomPass(
    new Three.Vector2(window.innerWidth, window.innerHeight),
    1.5, // strength
    0.4, // radius
    0.85 // threshold
  );

  composer = new EffectComposer(renderer);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
}

//* Function to add text behind the model
function addTextBehindModel(text) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  context.font = "30px Arial"; // Set font size and family
  context.fontWeight = "bold";
  context.fillStyle = "cyan"; // Text color
  context.fillText(text, 0, 50); // Draw text on canvas

  const texture = new Three.Texture(canvas);
  texture.needsUpdate = true;

  const spriteMaterial = new Three.SpriteMaterial({ map: texture });
  const sprite = new Three.Sprite(spriteMaterial);
  sprite.scale.set(3, 1.5, 1); // Scale the sprite (adjust as necessary)

  // Position the sprite behind the model
  sprite.position.set(0, -1, -2); // Adjust position based on model size and camera
  scene.add(sprite);
}

//* Animation loop
const animate = () => {
  window.requestAnimationFrame(animate);
  composer.render(); // Use composer to render the scene with post-processing
  control.update();
};
  