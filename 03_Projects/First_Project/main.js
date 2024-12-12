import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

import gsap from "gsap";
import LocomotiveScroll from "locomotive-scroll";
// import ScrollTrigger from "gsap/src/ScrollTrigger";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

let tl = gsap.timeline();

const locomotiveScroll = new LocomotiveScroll();

const canvas = document.querySelector(".canvas");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);
// Load HDRI environment map
const rgbeLoader = new RGBELoader();
rgbeLoader.load(
  "https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/4k/snowy_forest_path_01_4k.hdr",
  function (texture) {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    // scene.background = texture;
    scene.environment = texture;
  }
);
let model;
// GLTFLoader is used to load 3D models in glTF/glb format
// glTF (GL Transmission Format) is a standard file format for 3D scenes and models
// The loader takes 3 callback functions:
// 1. onLoad - Called when model loads successfully
// 2. onProgress - Called while model is loading to show progress
// 3. onError - Called if there's an error loading the model
const loader = new GLTFLoader();
loader.load(
  "./gla.glb",
  function (gltf) {
    model = gltf.scene;
    // model.scale.set(0.5, 0.5, 0.5); // Scale model to fit the scene
    scene.add(model);
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.error("An error occurred:", error);
  }
);

camera.position.z = 0.6;

const renderer = new THREE.WebGLRenderer({ canvas });
// Enable HDRI tone mapping
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);

// Setup post processing
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Add bloom effect
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.5, // strength
  0.4, // radius
  0.85 // threshold
);
composer.addPass(bloomPass);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

window.addEventListener("resize", () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// window.addEventListener("mousemove", (event) => {
//   if (model) {
//     const x = (event.clientX / window.innerWidth - 0.2) * (Math.PI * 0.22);
//     const y = (event.clientY / window.innerHeight - 0.2) * (Math.PI * 0.22);
//     gsap.to(model.rotation, {
//       duration: 1,
//       x: y * 10,
//       y: x * 10,
//       ease: "power2.out"
//     });  }
// })

function navAnimation() {
  const icon = document.querySelector(".nav-icon");
  const closeIcon = document.querySelector(".close");
  icon.addEventListener("click", () => {
    tl.to(".nav-div", {
      height: "100vh",
      duration: 0.5,
    });
    tl.to(".items-list", {
      duration:1,
      translateY: 0,
      opacity:1,
      stagger:0.7,
      ease: "expo.inOut"
    })
  });
  closeIcon.addEventListener("click", () => {
    tl.to(".items-list", {
      duration:0.3,
      translateY: "1.5rem",
      opacity:0,
      stagger:0.7,
      ease: "expo.inOut"
    })
    tl.to(".nav-div", {
      height: "0vh",
      duration: 2,
    });
   

  });
  
    gsap.to(closeIcon, {
      rotate: "360deg",
      duration: 6,
      ease: "elastic.inOut",
      repeat:-1
    });
}

navAnimation();

function footerAnimaiton() {
  gsap.to(".footer ", {
    scrollTrigger: {
      trigger: ".main-footer",
      start: "top 20%",
      end: "bottom 80%",
      scrub: 1,
      toggleActions: "play pause reverse reset",
    },
    height: "264px",
    translateY: 0,
    duration: 1,
    opacity: 1,
    ease: "power2.out",
  });
  gsap.from(".developed span", {
    scrollTrigger: {
      trigger: ".main-footer",
      start: "top top",
      end: "bottom bottom",
      scrub: 5,
      toggleActions: "play pause reverse reset",
    },
    duration: 1,
    y: 500,
    opacity: 0,
    stagger: 2,
    ease: "power2.out",
  });
  gsap.to(" .bluurr", {
    scrollTrigger: {
      trigger: ".main-footer",
      start: "top top",
      end: "bottom bottom",
      scrub: 5,
      toggleActions: "play pause reverse reset",
    },
    duration: 2,
    height: "200px",
    width: "200px",
    ease: "power2.out",
  });
}

footerAnimaiton();

function animate() {
  window.requestAnimationFrame(animate);
  composer.render();
  model.rotation.y -= 0.01; // console.log(model.rotation.z += 0.001)
  //  console.log( model.rotation.y += 0.002)  // console.log(model.rotation.z += 0.001)
  controls.update();
}
animate();
