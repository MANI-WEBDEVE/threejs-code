import * as THREE from "three";
import Lenis from "lenis";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
window.addEventListener("click", (event) => {
    const mouse = new THREE.Vector2();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(galleryGroup.children, true);

    if (intersects.length > 0) {
        const clickedBlock = intersects[0].object;
        if (clickedBlock.callback) {
            clickedBlock.callback();
        }
    }
});


renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 0);
document.body.appendChild(renderer.domElement);
camera.position.z = 12;
camera.position.y = 0;

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const galleryGroup = new THREE.Group();
scene.add(galleryGroup);

const radius = 6;
const height = 30;
const segment = 30;

const cylinderGeometry = new THREE.CylinderGeometry(
    radius,
    radius,
    height,
    segment,
    1,
    true
);

const cylinderMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0,
    side: THREE.DoubleSide
});

const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
galleryGroup.add(cylinder);

const textureLoader = new THREE.TextureLoader();

function getRandomImages() {
    return Math.floor(Math.random() * 13) + 1;
}

function loadImageTexture(imageNumber) {
    return new Promise((resolve, reject) => {
        textureLoader.load(
            `public/images/${imageNumber}.jpg`,
            (texture) => {
                texture.minFilter = THREE.LinearMipMapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.generateMipmaps = true;
                texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
                resolve(texture);
            },
            undefined,
            (error) => {
                console.error('Error loading texture:', error);
                reject(error);
            }
        );
    });
}

function createCurvedPlane(width, height, radius, segments) {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    const indices = [];
    const uvs = [];

    const segmentsX = segments * 10;
    const segmentsY = Math.floor(height * 100);
    const theta = width / radius;

    for (let y = 0; y <= segmentsY; y++) {
        const yPos = (y / segmentsY - 0.2) * height;
        for (let x = 0; x <= segmentsX; x++) {
            const xAngle = (x / segmentsX - 1) * theta;
            const xPos = Math.sin(xAngle) * radius;
            const zPos = Math.cos(xAngle) * radius;
            vertices.push(xPos, yPos, zPos);
            uvs.push((x / segmentsX), y / segmentsY);
        }
    }

    for (let y = 0; y < segmentsY; y++) {
        for (let x = 0; x < segmentsX; x++) {
            const a = y * (segmentsX + 1) + x;
            const b = (y + 1) * (segmentsX + 1) + x;
            const c = (y + 1) * (segmentsX + 1) + (x + 1);
            const d = y * (segmentsX + 1) + (x + 1);
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(vertices, 3)
    );
    geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    return geometry;
}

const numVerticalSections = 8;
const blocksPerSection = 11;
const verticalSpacing = 4;
const blocks = [];

const totalBlockHeight = numVerticalSections * verticalSpacing;
const heightBuffer = (height - totalBlockHeight) / 3;
const startY = -height / 2 + heightBuffer + verticalSpacing;

const sectionAngle = (Math.PI * 2) / blocksPerSection;
const maxRandomAngle = sectionAngle * 0.15;

async function createBlocks(baseY, yOffset, sectionIndex, blockIndex) {
    const blockGeometry = createCurvedPlane(2, 2, radius, 10);

    const imageNumber = getRandomImages();
    const texture = await loadImageTexture(imageNumber);

    const blockMaterial = new THREE.MeshPhongMaterial({
        map: texture,
        side: THREE.DoubleSide,
        toneMapped: false,
        opacity: 1
    });

    const block = new THREE.Mesh(blockGeometry, blockMaterial);
    block.position.y = baseY + yOffset;

    const blockContainer = new THREE.Group();
    const baseAngle = sectionAngle * blockIndex;
    const randomAngleOffset = (Math.random() - 0.5) * maxRandomAngle;
    const finalAngle = baseAngle + randomAngleOffset;

    blockContainer.rotation.y = finalAngle;
    blockContainer.add(block);
    block.userData.imageNumber = imageNumber; // Store the image number for reference
    block.callback = () => {
        showDialog(`public/images/${imageNumber}.jpg`);
    };
    return blockContainer;
}

async function initializingBlocks() {
    for (let section = 0; section < numVerticalSections; section++) {
        const baseY = startY + section * verticalSpacing;
        for (let i = 0; i < blocksPerSection; i++) {
            const yOffset = (Math.random() - 0.5) * 0.2;
            const blockContainer = await createBlocks(baseY, yOffset, section, i);
            blocks.push(blockContainer);
            galleryGroup.add(blockContainer);
        }
    }
    animate();
}

const lenis = new Lenis({
    autoRaf: true
});

let currentScroll = 0;
const totalScroll = document.documentElement.scrollHeight - window.innerHeight;

let rotationSpeed = 0;
const baseRotationSpeed = 0.0025;
const maxRotationSpeed = 0.05;

lenis.on("scroll", (e) => {
    currentScroll = window.pageYOffset;
    rotationSpeed = e.velocity * 0.005;
});

function animate() {
    requestAnimationFrame(animate);

    const scrollFraction = currentScroll / totalScroll;

    const targetY = scrollFraction * height - height / 2;
    camera.position.y = -targetY;

    galleryGroup.rotation.y += baseRotationSpeed + rotationSpeed;
    rotationSpeed *= 0.95;

    renderer.render(scene, camera);
}

initializingBlocks();

function showDialog(imageSrc) {
    const dialogContainer = document.getElementById("dialog-container");
    const dialogImage = document.getElementById("dialog-image");
    const overlay = document.getElementById("overlay");

    dialogImage.src = imageSrc;
    dialogContainer.style.display = "block";

    document.getElementById("close-dialog").onclick = () => {
        dialogContainer.style.display = "none";
    };

    overlay.onclick = () => {
        dialogContainer.style.display = "none";
    };
}
