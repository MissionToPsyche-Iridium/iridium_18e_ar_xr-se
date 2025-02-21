import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import SettingsModal from './SettingsModal.js';
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { startPhases } from "./phases.js";
import { startPhasesSMP } from "./phasesSMP.js";
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

// Get the camera's aspect ratio, FOV, and near/far planes
// const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

// Define the camera's vertical and horizontal bounds
const cameraHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
const cameraWidth = cameraHeight * camera.aspect;

// Add a glowing metorite
const metoriteX = Math.random() * cameraWidth - cameraWidth / 2;
const metoriteY = Math.random() * cameraHeight - cameraHeight / 2;
const metoriteGeometry = new THREE.SphereGeometry(1, 32, 32);
const metoriteMaterial = new THREE.MeshStandardMaterial({
    color: 0x0088ff,
    emissive: 0x002244,
});
const metorite = new THREE.Mesh(metoriteGeometry, metoriteMaterial);
metorite.position.set(metoriteX, metoriteY, -3);
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

// OrbitControls 
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false;
controls.enableRotate = false;
controls.enablePan = false;
controls.enableZoom = false;

const settingsModal = new SettingsModal();

let isZoom = false;
let count = 0;

window.scopeDisabled = false;

function moveScope(event) {
    if (event.touches) {
        scope.style.left = `${event.touches[event.touches.length - 1].clientX - scope.offsetWidth / 2}px`;
        scope.style.top = `${event.touches[event.touches.length - 1].clientY - scope.offsetHeight / 2}px`;

        // Convert to world position
        mouse.x = (event.touches[event.touches.length - 1].clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.touches[event.touches.length - 1].clientY / window.innerHeight) * 2 + 1;

    } else {
        scope.style.left = `${event.clientX - scope.offsetWidth / 2}px`;
        scope.style.top = `${event.clientY - scope.offsetHeight / 2}px`;
        // Convert to world position
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    // Perform raycast
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(metorite);

    // hide/show metorite
    if (intersects.length > 0) {
        // pause zoom
        if (isZoom) return;
        isZoom = true;
        scope.style.display = 'none';

        metorite.visible = true;
        const targetPoint = intersects[0].point;

        // Move the camera closer instead of directly to the point
        const zoomFactor = 0.5;
        const newCameraPosition = camera.position.clone().lerp(targetPoint, zoomFactor);

        // Animate the zoom effect
        const duration = 1000;
        const startTime = performance.now();
        const startPos = camera.position.clone();
        const startTarget = controls.target.clone();

        function animateZoom(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);

            // Interpolate camera position and focus target
            camera.position.lerpVectors(startPos, newCameraPosition, t);
            controls.target.lerpVectors(startTarget, targetPoint, t);
            controls.update();

            if (t < 1) {
                requestAnimationFrame(animateZoom);
            } else {
                settingsModal.applyAMPIModalStyles();
                starFieldTransistion();
            }
        }
        requestAnimationFrame(animateZoom);
    }
    count = 100;
}

const starTransistionGeometry = new THREE.BufferGeometry();
let isStarTransition = false;

function starFieldTransistion() {
    scene.remove(stars);

    // Starfield parameters
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
        let x = (Math.random() - 0.5) * 2000;
        let y = (Math.random() - 0.5) * 2000;
        let z = Math.random() * 2000;
        starPositions[i * 3] = x;
        starPositions[i * 3 + 1] = y;
        starPositions[i * 3 + 2] = z;
    }

    starTransistionGeometry.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 2,
        transparent: true,
        opacity: 0.8
    });

    const starTransistion = new THREE.Points(starTransistionGeometry, starMaterial);
    scene.add(starTransistion);
    isStarTransition = true;

    // Camera position adjustment
    camera.position.z += 1000;
    metorite.position.z += 1000;
    pointLight.position.z += 1000;

    setTimeout(() => {
        camera.position.z = 0;
        pointLight.position.z = 0;
        isStarTransition = false;
        metorite.visible = false;
        console.log('Transitioning to phases');
        // startPhases();
        const mainTitle = document.querySelector(".main-title");
        if (mainTitle) {
            mainTitle.style.visibility = "hidden";
            mainTitle.style.opacity = "0";
        }
        startPhasesSMP();
    }, 2000);
}

document.addEventListener('mousedown', (event) => {
    if (window.scopeDisabled) return;

    scope.style.display = 'block';
    moveScope(event);
});


document.addEventListener('pointermove', (event) => {
    if (window.scopeDisabled) return;

    if (scope.style.display === 'block') {
        moveScope(event);
    }
});

document.addEventListener('mouseup', () => {
    if (window.scopeDisabled) return;

    scope.style.display = 'none';
});

document.addEventListener('touchstart', (event) => {
    if (window.scopeDisabled) return;

    scope.style.display = 'block';
    moveScope(event);
});

document.addEventListener('touchend', () => {
    if (window.scopeDisabled) return;

    scope.style.display = 'none';
});

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    if (isStarTransition) {
        // Move stars toward the camera (warp effect)
        const positions = starTransistionGeometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            // move forward
            positions[i + 2] -= 10;

            // Reset stars when they pass the camera
            if (positions[i + 2] < 0) {
                positions[i] = (Math.random() - 0.5) * 2000;
                positions[i + 1] = (Math.random() - 0.5) * 2000;
                positions[i + 2] = 2000;
            }
        }
        starTransistionGeometry.attributes.position.needsUpdate = true;
    } else {
        stars.rotation.x += 0.0005;
        stars.rotation.y += 0.0005;
        metorite.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
}

animate();

// Handle window resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// load papyrus scroll introduction
document.addEventListener("DOMContentLoaded", function () {
    fetch('intro.html')
        .then(response => response.text())
        .then(data => {
            document.body.insertAdjacentHTML('beforeend', data);

            import('./intro.js')
                .then(module => {
                    module.openPopup();
                })
                .catch(error => console.error("Failed to load intro.js:", error));
        });
});
