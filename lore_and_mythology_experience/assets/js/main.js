
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
// import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
// import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
// import {
//     CSS2DRenderer,
//     CSS2DObject,
// } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/renderers/CSS2DRenderer.js";
// import HelpModal from "./HelpModal.js";
// import { TextureLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
// import TWEEN from "https://cdn.jsdelivr.net/npm/@tweenjs/tween.js@18.6.4/dist/tween.esm.js";
// Create the scene
const scene = new THREE.Scene();

// Create a camera
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create stars
function createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.05,
    });

    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 1000;
        const y = (Math.random() - 0.5) * 1000;
        const z = (Math.random() - 0.5) * 1000;
        starVertices.push(x, y, z);
    }

    starGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(starVertices, 3),
    );

    return new THREE.Points(starGeometry, starMaterial);
}

const stars = createStarField();
scene.add(stars);

// Add a glowing metorite
const metoriteGeometry = new THREE.SphereGeometry(1, 32, 32);
const metoriteMaterial = new THREE.MeshStandardMaterial({
    color: 0x0088ff,
    emissive: 0x002244,
});
const metorite = new THREE.Mesh(metoriteGeometry, metoriteMaterial);
metorite.position.set(2, 0, -3);
scene.add(metorite);
metorite.visible = false;

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.5);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Create a telescope
const telescopeBaseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 1, 32);
const telescopeBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
const telescopeBase = new THREE.Mesh(telescopeBaseGeometry, telescopeBaseMaterial);
telescopeBase.position.set(0, -2.5, 0);
scene.add(telescopeBase);

const telescopeTubeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3, 32);
const telescopeTubeMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
const telescopeTube = new THREE.Mesh(telescopeTubeGeometry, telescopeTubeMaterial);
telescopeTube.rotation.x = Math.PI / 2;
telescopeTube.position.set(0, -2, 1.5);
scene.add(telescopeTube);

const telescopeEyepieceGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5, 32);
const telescopeEyepieceMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 });
const telescopeEyepiece = new THREE.Mesh(telescopeEyepieceGeometry, telescopeEyepieceMaterial);
telescopeEyepiece.rotation.x = Math.PI / 2;
telescopeEyepiece.position.set(0, -2, -0.8);
scene.add(telescopeEyepiece);

const telescopeLensGeometry = new THREE.SphereGeometry(0.15, 32, 32);
const telescopeLensMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, emissive: 0x000066 });
const telescopeLens = new THREE.Mesh(telescopeLensGeometry, telescopeLensMaterial);
telescopeLens.position.set(0, -2, 3.1);
scene.add(telescopeLens);

// Scope behavior
const scope = document.getElementById('scope');

// Raycaster setup
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2()

function moveScope(event) {
    scope.style.left = `${event.clientX - scope.offsetWidth / 2}px`;
    scope.style.top = `${event.clientY - scope.offsetHeight / 2}px`;

    // Convert to world position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Perform raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(metorite);

    // hide/show metorite
    if (intersects.length > 0) {
        metorite.visible = true;
    } else {
        metorite.visible = false;
    }
}

document.addEventListener('mousedown', (event) => {
    scope.style.display = 'block';
    moveScope(event);
});

document.addEventListener('mousemove', (event) => {
    if (scope.style.display === 'block') {
        moveScope(event);
    }
});

document.addEventListener('mouseup', () => {
    scope.style.display = 'none';
    // hide metorite
    metorite.visible = false;
});

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    stars.rotation.x += 0.0005;
    stars.rotation.y += 0.0005;

    metorite.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
