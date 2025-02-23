import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import SettingsModal from './SettingsModal.js';
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { startPhases } from "./phases.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
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

// Common Fractal Noise algorithm implementation using perlin
function fractalNoise2(x, y, octaves=4, lacunarity=2, persistence=0.5) {
    let frequency = 1.0;
    let amplitude = 1.0;
    let sum = 0.0;
    let maxValue = 0.0;
  
    for (let i = 0; i < octaves; i++) {
        const val = noise.perlin2(x * frequency, y * frequency);
        sum += val * amplitude;
    
        maxValue += amplitude;
        amplitude *= persistence;
        frequency *= lacunarity;
    }

    return sum / maxValue;
}

function generateSpaceCloudTexture(width, height, scale = 2.0) {
    const size = width * height;
    const data = new Uint8Array(4 * size);
    
    // Generate texture image
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Use fractal noise to get background texture value
            const nx = x / width - 0.5;
            const ny = y / height - 0.5;
            const val = fractalNoise2(
                nx * scale,
                ny * scale,
                5,
                2.0,
                0.5
            );
            const v = (val + 1) / 2.0;
    
            // Map values to color
            const r = 0.0 + 0.12* v;
            const g = 0.0 + 0.07 * v;
            const b = 0.0 + 0.2 * v;
            
            // Assign pixels
            const i = (y * width + x) * 4;
            data[i + 0] = Math.floor(r * 255);
            data[i + 1] = Math.floor(g * 255);
            data[i + 2] = Math.floor(b * 255);
            data[i + 3] = 255;
        }
    }
  
    // Convert to a texture
    const texture = new THREE.DataTexture(data, width, height, THREE.RGBAFormat);
    texture.wrapS = THREE.MirroredRepeatWrapping;
    texture.wrapT = THREE.MirroredRepeatWrapping;
    texture.needsUpdate = true;
  
    return texture;
}

function createSpaceClouds() {
    // Generate cloud texture using fractal noise
    const cloudTexture = generateSpaceCloudTexture(1024, 1024, 25.0);
  
    // Turn into a mesh
    const cloudMaterial = new THREE.MeshBasicMaterial({
        map: cloudTexture,
        side: THREE.BackSide,
    });
  
    // Create space cloud sphere
    const sphereGeometry = new THREE.SphereGeometry(800, 64, 64);
    const spaceCloudSphere = new THREE.Mesh(sphereGeometry, cloudMaterial);
  
    return spaceCloudSphere;
}

function createStarField() {
    const starCount = 10000; // Number of stars
    const minDistance = 50; // Minimum distance from origin (camera)

    // Initialize star field data
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    // For each star
    for (let i = 0; i < starCount; i++) {
        // Calculate star position
        let x, y, z;
        do {
            x = (Math.random() - 0.5) * 1000;
            y = (Math.random() - 0.5) * 1000;
            z = (Math.random() - 0.5) * 1000;
        } while (Math.sqrt(x * x + y * y + z * z) < minDistance);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Calculate star size
        sizes[i] = 2.0 + Math.random() * 1.5; 

        // Calculate star tint
        const tint = Math.random();
        let r, g, b;
        // White-Yellow
        if (tint > 0.7) {
            r = 1.0;
            g = 0.85 + Math.random() * 0.15;
            b = 0.7 + Math.random() * 0.1;
        // Yellow-Orange
        } else if (tint > 0.1) {
            r = 1.0;
            g = 0.7 + Math.random() * 0.3;
            b = 0.4 + Math.random() * 0.2;
        // White-Blue
        } else {
            r = 0.9;
            g = 0.9;
            b = 0.95 + Math.random() * 0.05;
        }

        colors[i * 3] = r;
        colors[i * 3 + 1] = g;
        colors[i * 3 + 2] = b;
    }

    // Assign attributes to geometry
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

    // Vertex shader
    const vertexShader = `
        precision highp float;
        attribute float size;
        varying vec3 vColor;

        void main() {
            vColor = color;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (600.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `;

    // Fragment shader
    const fragmentShader = `
        precision highp float;
        varying vec3 vColor;

        void main() {
            // Calculate star limits
            vec2 coord = gl_PointCoord - vec2(0.5);
            float dist = length(coord);
            if (dist > 0.5) {
                discard;
            }

            // Star core
            float core = 1.0 - smoothstep(0.0, 0.08, dist);

            // Star glow
            float glow = 1.0 - smoothstep(0.08, 0.5, dist);
            glow *= 0.5;

            // Combine alphas
            float alpha = core + glow;

            // Set fragment (pixel)
            gl_FragColor = vec4(vColor, alpha);
        }
    `;

    // Material
    const starMaterial = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader,
        fragmentShader
    });

    return new THREE.Points(geometry, starMaterial);
}

// Add star field
const stars = createStarField();
scene.add(stars);

// Add space clouds
const spaceCloudSphere = createSpaceClouds();
scene.add(spaceCloudSphere);

// Get the camera's aspect ratio, FOV, and near/far planes
// const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);

// Define the camera's vertical and horizontal bounds
const cameraHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
const cameraWidth = cameraHeight * camera.aspect;

// Asteroid distance from edges of screen
const MIN_X = 50;
const MAX_X = window.innerWidth - 50;
const MIN_Y = 100;
const MAX_Y = window.innerHeight - 500;

// Get random point within boundaries
const asteroidX = Math.random() * (MAX_X - MIN_X) + MIN_X;
const asteroidY = Math.random() * (MAX_Y - MIN_Y) + MIN_Y;

// Convert to normalized coordinates
const normalizedAsteroidX = ( asteroidX / window.innerWidth ) * 2 - 1;
const normalizedAsteroidY = - ( asteroidY / window.innerHeight ) * 2 + 1;

// Unproject from normalized coordinates to camera
const asteroidVector = new THREE.Vector3(normalizedAsteroidX, normalizedAsteroidY, 1);
asteroidVector.unproject(camera);

// The ray from camera
const cameraRay = asteroidVector.sub(camera.position).normalize();

// Distance from camera to z plane
const distanceFromCamera = (0 - camera.position.z) / cameraRay.z; 

// Final position at z plane
const asteroidPosition = camera.position.clone().add(cameraRay.multiplyScalar(distanceFromCamera));

// Load asteroid
const loader = new GLTFLoader();
let asteroid;
loader.load('../assets/models/asteroid.glb', (gltf) => {
  asteroid = gltf.scene;
  asteroid.scale.set(0.06, 0.06, 0.06);
  asteroid.position.copy(asteroidPosition);
  asteroid.visible = false;
  scene.add(asteroid);
});

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

let holdTime = 0.0; // Time on asteroid
const holdThreshold = 3.0; // Time to trigger zoom
let isLockOn = false; // Scope is locked on
let isZoom = false; // Camera zoom starts

window.scopeDisabled = false;

// Star transition
const starTransistionGeometry = new THREE.BufferGeometry();
let isStarTransition = false;
function starFieldTransistion() {
    isStarTransition = true;

    setTimeout(() => {
        camera.position.z = 0;
        pointLight.position.z = 0;
        isStarTransition = false;
        asteroid.visible = false;
        console.log('Transitioning to phases');
        startPhases();
    }, 2000);
}

// Move scope event
function moveScope(event) {
    if (!scope || window.scopeDisabled) return;
    
    if (event.touches) {
        scope.style.left = `${event.touches[0].clientX - scope.offsetWidth / 2}px`;
        scope.style.top = `${event.touches[0].clientY - scope.offsetHeight / 2}px`;
    } else {
        scope.style.left = `${event.clientX - scope.offsetWidth / 2}px`;
        scope.style.top = `${event.clientY - scope.offsetHeight / 2}px`;
    }
}

// Pointer events
function onPointerDown(event) {
    if (window.scopeDisabled) return;

    scope.style.display = 'block';
    moveScope(event);
}

function onPointerMove(event) {
    if (window.scopeDisabled) return;

    if (scope.style.display === 'block') {
        moveScope(event);
    }
}
  
function onPointerUp() {
    if (window.scopeDisabled) return;

    scope.style.display = 'none';
}

// Attach pointer events
document.addEventListener('mousedown', onPointerDown);
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('mouseup', onPointerUp);

document.addEventListener('touchstart', onPointerDown);
document.addEventListener('touchmove', onPointerMove);
document.addEventListener('touchend', onPointerUp);

// Animate the scene
let lastTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000.0;
    lastTime = now;

    // Star transition
    if (isStarTransition) {
        warpStars();

    // Normal stars
    } else {
        stars.rotation.x += 0.00002;
        stars.rotation.y += 0.00002;
    }

    // Check if in scope
    if (!isLockOn && asteroid && scope.style.display === 'block') {
        checkAsteroidInScope(delta);
    }

    // Render
    renderer.render(scene, camera);
}
animate();

function checkAsteroidInScope(delta) {
    // Get scope position
    const scopeRectangle = scope.getBoundingClientRect();
    const scopeX = scopeRectangle.left + scopeRectangle.width / 2;
    const scopeY = scopeRectangle.top + scopeRectangle.height / 2;
    const scopeRadius = scopeRectangle.width / 2;
  
    // Distance from scope to asteroid
    const deltaX = asteroidX - scopeX;
    const deltaY = asteroidY - scopeY;
    const distance = Math.sqrt(deltaX*deltaX + deltaY*deltaY);
  
    // If within scope, increase hold time
    if (distance <= scopeRadius) {
        // Make visible
        asteroid.visible = true;

        // Asteroid rotation
        asteroid.rotation.x += 0.002;
        asteroid.rotation.y += 0.002;

        // Increase hold time
        holdTime += delta;
    
        // If in scope long enough, lock on
        if (holdTime >= holdThreshold) {
            lockOn();
        }

    // Reset if asteroid leaves scope
    } else {
      asteroid.visible = false;
      holdTime = 0;
    }
}

function lockOn() {
    isLockOn = true;
    window.scopeDisabled = true;
  
    // Get current scope and asteroid positions
    const scopeRectangle = scope.getBoundingClientRect();
    const startLeft = parseFloat(scope.style.left);
    const startTop = parseFloat(scope.style.top);
    const endLeft = asteroidX - scopeRectangle.width / 2;
    const endTop = asteroidY - scopeRectangle.height / 2;
  
    const duration = 1000; // ms for scope to move
    const startTime = performance.now();
  
    function animateScopeToAsteroid(tNow) {
        const elapsed = tNow - startTime;
        const t = Math.min(elapsed / duration, 1);
    
        // Move scope to asteroid
        const newLeft = startLeft + (endLeft - startLeft) * t;
        const newTop = startTop + (endTop - startTop) * t;
        scope.style.left = newLeft + 'px';
        scope.style.top = newTop + 'px';

        // Asteroid rotation
        asteroid.rotation.x += 0.002;
        asteroid.rotation.y += 0.002;
    
        // Animate movement
        if (t < 1) {
            requestAnimationFrame(animateScopeToAsteroid);
        
        // Start camera zoom
        } else {
            startCameraZoom();
        }
    }

    requestAnimationFrame(animateScopeToAsteroid);
}

function startCameraZoom() {
    isZoom = true;
    scope.style.display = 'none';
  
    const duration = 2000;
    const startTime = performance.now();
  
    // Start camera/controls position
    const startCameraPos = camera.position.clone();
    const startTarget = controls.target.clone();
  
    // End camera/controls positions
    const endCameraPos = asteroid.position.clone().add(new THREE.Vector3(0, 0, 1.5));
    const endTarget = asteroid.position.clone();
  
    // Start/End asteroid scale
    const startScale = asteroid.scale.clone();
    const endScale = new THREE.Vector3(0.25, 0.25, 0.25);
  
    function animateZoom(time) {
        const elapsed = time - startTime;
        const t = Math.min(elapsed / duration, 1);
    
        // Move camera/controls
        camera.position.lerpVectors(startCameraPos, endCameraPos, t);
        controls.target.lerpVectors(startTarget, endTarget, t);
    
        // Asteroid rotation
        asteroid.rotation.x += 0.002;
        asteroid.rotation.y += 0.002;

        // Increase asteroid scale
        const currentScale = new THREE.Vector3().lerpVectors(startScale, endScale, t);
        asteroid.scale.copy(currentScale);
    
        controls.update();
    
        // Animate zoom
        if (t < 1) {
            requestAnimationFrame(animateZoom);
        
        // Start star field transition
        } else {
            settingsModal.applyAMPIModalStyles();
            starFieldTransistion();
        }
    }
    
    requestAnimationFrame(animateZoom);
}

function warpStars() {
    const starPos = stars.geometry.attributes.position.array;
    for (let i = 0; i < starPos.length; i += 3) {
        starPos[i + 2] -= 0.5;
    }

    stars.geometry.attributes.position.needsUpdate = true;
}

function initializeAutoHelp() {
    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(event => {
        window.addEventListener(event, resetAutoHelp);
    });
}
function triggerAutoHelp() {
    document.getElementById("help-icon-button").click();
}
function resetAutoHelp() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(triggerAutoHelp, 60000);
}
let inactivityTimer = setTimeout(triggerAutoHelp, 60000);
initializeAutoHelp();


// Handle window resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// load papyrus scroll introduction
document.addEventListener("DOMContentLoaded", function() {
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
