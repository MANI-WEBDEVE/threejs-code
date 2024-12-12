const lenis = new Lenis();
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

//create a threejs scene
const scene = new THREE.Scene();
//provide a color of scene
scene.background = new THREE.Color(0xcccccc); 

// provide a camera to see the scene
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
});

renderer.setClearColor(0xffffff, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.tonMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;
document.querySelector(".model").appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xfffaaf, 1);
mainLight.position.set(11, 10, -2.5);
scene.add(mainLight);

// const fillLight = new THREE.DirectionalLight(0xffffff, 3);
// fillLight.position.set(-5, -2, 5);
// scene.add(fillLight);

// const hemLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 2);
// hemLight.position.set(70, 65, 10);
// scene.add(hemLight);

// const pointLight = new THREE.PointLight(0xA8ABA8, 100,100);
// pointLight.position.set( 20, 20, 10 );
// scene.add(pointLight);

// const spotLight = new THREE.SpotLight(0xA8ABA8, 10);
// spotLight.position.set( 50, 10, 600 );
// spotLight.castShadow = true;
// scene.add(spotLight);

const width = 100;
const height = 10;
const intensity = 10;
const rectLight = new THREE.RectAreaLight( 0x2f83de, intensity,  width, height );
rectLight.position.set( 5, 5, 0 );
rectLight.lookAt( 0, 0, 0 );
scene.add( rectLight )

let model;
const loader = new THREE.GLTFLoader();
loader.load("./assets/can3.glb", function (gltf) {
  model = gltf.scene;
  model.traverse((node) => {
    if (node.isMesh) {
      if (node.material) {
        node.material.metalness = 0.3;
        node.material.roughness = 0.5;
        node.material.envMapIntensity = 1.5;
      }
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });
  function basicAnimation() {
    // render the scene
    renderer.render(scene, camera);
    requestAnimationFrame(basicAnimation);
    // model.rotation.x +=0.002
    
    model.rotation.y += 0.002
    // model.position.z +=0.0001 
  }
  basicAnimation();
  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);
  model.rotation.y = Math.PI; // Rotate 180 degrees to face front
  scene.add(model);
  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);
  camera.position.z = maxDim * 1.5;

  //   model.scale.set(0,0,0);
  playInitialAnimation();

  cancelAnimationFrame(basicAnimation);
  animate();
});

const floatAmplitude = 0.2;
const floatSpeed = 2;
const rotationSpeed = 0.3;
let floating = true;
let currentScroll = 0;

const stickyHeight = window.innerHeight;
const scannerSection = document.querySelector(".scanner");
const scannerPosition = scannerSection.offsetTop;
const scanContainer = document.querySelector(".scan-container");
const soundEffect = new Audio("./assets/scan.mp3")
gsap.set(scanContainer, { scale: 0 });

function playInitialAnimation() {
  if (model) {
    gsap.to(model.scale, {
      x: 1,
      y: 1,
      z: 1,
      duration: 4,
      ease: "elastic.inOut(1, 1)",
    });
    
  }
  gsap.to(scanContainer, {
    scale: 1,
    duration: 1,
    ease: "elastic.inOut(1, 1)",
  });
}

ScrollTrigger.create({
  trigger: "body",
  start: "top top",
  end: "top -50",
  onEnterBack: () => {
    if (model) {
      gsap.to(model.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        ease: "elastic.inOut(1, 1)",
      });
      gsap.to(model.rotation, {
        x: Math.PI * 2,
        duration: 1,
        ease: "elastic.inOut(1, 1)",
      })
      // gsap.to(model.position, {
      //   x: -0.1,
      //   duration: 4,
      //   ease: "elastic.inOut(1, 1)",
      // });
      floating = true;
    }
    gsap.to(scanContainer, {
      scale: 1,
      duration: 1,
      ease: "elastic.inOut(1, 1)",
    });
  },
});
ScrollTrigger.create({
  trigger: ".scanner",
  start: "top top",
  end: `${stickyHeight}px`,
  pin: true,
  onEnter: () => {
    floating = false;
    model.position.y = 0;

    setTimeout(() => {
      soundEffect.currentTime = 0;  
      soundEffect.play();
    }, 500);
    gsap.to(model.position, {
      x: 0,
      duration: 2,
      ease: "elastic.inOut(1, 1)",
    });
    gsap.to(model.rotation, {
    z:0,
    x:0,
      y: model.rotation.y + Math.PI * 2,
      duration: 4,
      ease: "elastic.inOut(1, 1)",
      onComplete: () => {
        gsap.to(model.scale, {
            x:0,
            y:0,
            z:0,
            duration: 4,
            ease: "elastic.inOut(1, 1)",
            onComplete: () => {
                gsap.to(scanContainer, {
                    scale: 0,
                    duration: 1,
                    ease: "elastic.inOut(1, 1)",
                })
            }
        })
      },
    });
  },
});


playInitialAnimation();
