import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
import SettingsModal from './SettingsModal.js';
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
import { startPhases } from "./phases.js";
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";
import incrementProgressBar from './progressBar.js';

incrementProgressBar(1);

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
function fractalNoise2(x, y, octaves = 4, lacunarity = 2, persistence = 0.5) {
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
            const r = 0.0 + 0.12 * v;
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

let starMaterial;

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
    uniform vec2 uCirclePos; 
    uniform float uCircleRadius;
    uniform bool uBlurEnabled;
    uniform bool uBlurCircle;
    uniform vec2 uResolution;

    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        float dist = length(coord);

        if (dist > 0.5) {
            discard;
        }

        // Star core and glow
        float core = 1.0 - smoothstep(0.0, 0.08, dist);
        float glow = 1.0 - smoothstep(0.08, 0.5, dist);
        glow *= 0.5;
        float alpha = core + glow;

        // Convert fragment position to normalized coordinates (0 to 1)
        vec2 fragPos = gl_FragCoord.xy / uResolution;

        // Calculate the aspect ratio of the screen (x / y)
        float aspectRatio = uResolution.x / uResolution.y;

        // Adjust the radius based on aspect ratio
        // Using the smaller dimension (height or width) for the radius
        float adjustedRadius = uCircleRadius * (uResolution.y / uResolution.x);

        // Calculate distance from draggable circle (center and radius)
        float screenDistX = abs(fragPos.x - uCirclePos.x) / adjustedRadius;
        float screenDistY = abs(fragPos.y - uCirclePos.y) / uCircleRadius;
        float screenDist = sqrt(screenDistX * screenDistX + screenDistY * screenDistY);

        // Default star color
        vec4 starColor = vec4(vColor, alpha);

        // Apply blur effect outside the circle (simulated by reducing brightness)
        if (uBlurCircle && uBlurEnabled && screenDist > 1.0) {
            starColor.rgb *= 0.3; 
        }

        if (!uBlurCircle && uBlurEnabled) {
            starColor.rgb *= 0.3; 
        }

        gl_FragColor = starColor;
    }
`;

    // calculate scope radius
    document.getElementById('scope').style.display = 'block';
    const aspect = window.innerWidth / window.innerHeight;
    const scopeRadius = document.getElementById('scope').offsetWidth / 2 / window.innerWidth * aspect;

    // Material
    starMaterial = new THREE.ShaderMaterial({
        vertexColors: true,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexShader,
        fragmentShader,
        uniforms: {
            uCirclePos: { value: new THREE.Vector2(0.5, 0.5) },
            uCircleRadius: { value: scopeRadius },
            uBlurEnabled: { value: true },
            uBlurCircle: { value: false },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
        }
    });

    document.getElementById('scope').style.display = 'none';
    return new THREE.Points(geometry, starMaterial);
}

// Add star field
const stars = createStarField();
scene.add(stars);


// Asteroid distance from edges of screen
const MIN_X = getMaxX();
const MAX_X = window.innerWidth - 50;
const MIN_Y = 100;
const MAX_Y = window.innerHeight - 500;

let asteroidX;
let asteroidY;
let asteroidZ;

function getMaxX() {
    const camfov = camera.fov * (Math.PI / 180);
    const aspect = window.innerWidth / window.innerHeight;
    const zPos = camera.position.z;

    const frustumHeight = 2 * zPos * Math.tan(camfov / 2);
    const frustumWidth = frustumHeight * aspect;

    return frustumWidth / 2;
}

function generateAsteroidTexture() {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Fill with a base color
    ctx.fillStyle = "#444";
    ctx.fillRect(0, 0, size, size);

    // Create craters 
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const r = Math.random() * (size / 8) + (size / 10);

        // Outer glow
        const gradient = ctx.createRadialGradient(x, y, r * 0.3, x, y, r);
        gradient.addColorStop(0, "rgba(20, 20, 20, 1)");
        gradient.addColorStop(0.7, "rgba(50, 50, 50, 1)");
        gradient.addColorStop(1, "rgba(90, 90, 90, 0.6)");

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
}

// create and add asteroid belt
function createAsteroidBelt(scene) {
    const numAsteroids = 500;
    const beltRadius = 50;
    const beltThickness = 10;
    // const asteroidGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const asteroidGeometry = new THREE.SphereGeometry(0.5, 256, 256);
    const asteroidMaterial = new THREE.MeshStandardMaterial({
        map: generateAsteroidTexture(),
        roughness: 1,
        metalness: 0,
        emissive: new THREE.Color(0x111111)
    });

    asteroidGeometry.computeBoundingBox();
    asteroidGeometry.computeVertexNormals();

    while (true) {
        const asteroidAngle = Math.random() * Math.PI * 2;
        const asteroidDistance = beltRadius + (Math.random() - 0.5) * beltThickness;

        asteroidX = Math.cos(asteroidAngle) * asteroidDistance;
        asteroidY = (Math.random() - 0.5) * 5;
        asteroidZ = Math.sin(asteroidAngle) * asteroidDistance;
        if (asteroidX < MAX_X && asteroidX > MIN_X) { break; }
    }

    for (let i = 0; i < numAsteroids; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = beltRadius + (Math.random() - 0.5) * beltThickness;

        const x = Math.cos(angle) * distance;
        const y = (Math.random() - 0.5) * 5;
        const z = Math.sin(angle) * distance;

        const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
        asteroid.position.set(x, y, z);
        const scale = Math.random() * 1.5 + 0.5;
        asteroid.scale.set(scale, scale, scale);

        asteroid.rotation.set(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
        );

        scene.add(asteroid);
    }
}

// add asteroid belt
createAsteroidBelt(scene);

// Add space clouds
const spaceCloudSphere = createSpaceClouds();
scene.add(spaceCloudSphere);

// Define the camera's vertical and horizontal bounds
const cameraHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
const cameraWidth = cameraHeight * camera.aspect;

// Unproject from normalized coordinates to camera
const asteroidVector = new THREE.Vector3(asteroidX, asteroidY, asteroidZ);
asteroidVector.unproject(camera);

// The ray from camera
const cameraRay = asteroidVector.sub(camera.position).normalize();

// Distance from camera to z plane
const distanceFromCamera = (0 - camera.position.z) / cameraRay.z * 2;

// Final position at z plane
const asteroidPosition = camera.position.clone().add(cameraRay.multiplyScalar(distanceFromCamera));

// Load asteroid
const loader = new GLTFLoader();
let asteroid;
loader.load('../assets/models/asteroid.glb', (gltf) => {
    asteroid = gltf.scene;
    asteroid.scale.set(0.2, 0.2, 0.2);
    asteroid.position.copy(asteroidPosition);
    asteroid.visible = false;
    scene.add(asteroid);
});

// Load telescope parts
let telescopeLower, telescopeUpper;
loader.load('../assets/models/telescope_lower.glb', (gltf) => {
    telescopeLower = gltf.scene;
    telescopeLower.position.set(0, -1.4, 0);
    telescopeLower.scale.set(0.2, 0.2, 0.2);
    telescopeLower.rotation.x = THREE.MathUtils.degToRad(-55); // Base rotation away from camera
    telescopeLower.rotation.y = THREE.MathUtils.degToRad(90); // Base rotation away from camera
    scene.add(telescopeLower);

    // Once loaded, load the upper
    loader.load('../assets/models/telescope_upper.glb', (gltf2) => {
        telescopeUpper = gltf2.scene;
        telescopeUpper.position.set(0, 0, 0); // x y z (y and z will reposition to align with scope)
        telescopeLower.add(telescopeUpper);
    });
});

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

// lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5);
scene.add(light);

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
const holdThreshold = 0.5; // Time to trigger zoom
let isLockOn = false; // Scope is locked on
let isZoom = false; // Camera zoom starts

window.scopeDisabled = false;

let target3D = new THREE.Vector3();

function moveScope(event) {
    let clientX, clientY;
    if (event.touches) {
        const touch = event.touches[event.touches.length - 1];
        clientX = touch.clientX;
        clientY = touch.clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    scope.style.left = `${clientX - scope.offsetWidth / 2}px`;
    scope.style.top = `${clientY - scope.offsetHeight / 2}px`;

    mouse.x = (clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(clientY / window.innerHeight) * 2 + 1;

    const normX = clientX / window.innerWidth;
    const normY = 1 - (clientY / window.innerHeight);
    starMaterial.uniforms.uCirclePos.value.set(normX, normY);
}

let currentYaw = 0;
let currentPitch = 0;
function pointTelescopeAt(target3D, delta) {
    // TEMPORARY SOLUTION
    if (!telescopeUpper) return;

    // Rotate the telescope upper to follow the target position
    const dx = target3D.x - telescopeUpper.position.x;
    const dz = target3D.z - telescopeUpper.position.z;
    const targetYaw = Math.atan2(dz, dx);
    const rotationSpeed = 4.0;
    telescopeUpper.rotation.x = THREE.MathUtils.lerp(
        telescopeUpper.rotation.x,
        targetYaw + THREE.MathUtils.degToRad(90),
        rotationSpeed * delta
    );

    // if (!telescopeLower || !telescopeUpper) return;
    // const rotationSpeed = 4.0;

    // // Lower telescope yaw
    // const lowerWorldPos = new THREE.Vector3();
    // telescopeLower.getWorldPosition(lowerWorldPos);
    // const dir = new THREE.Vector3().subVectors(target3D, lowerWorldPos);
    // const flatDir = new THREE.Vector3(dir.x, 0, dir.z);
    // if (flatDir.lengthSq() < 1e-8) return;
    // flatDir.normalize();
    // const rawYaw = -Math.atan2(flatDir.x, flatDir.z);
    // currentYaw = THREE.MathUtils.lerp(currentYaw, rawYaw, rotationSpeed * delta);
    // telescopeLower.rotation.y = currentYaw;

    // // Upper telescope pitch
    // const targetLocal = telescopeLower.worldToLocal(target3D.clone());
    // const deltaVec = new THREE.Vector3().subVectors(targetLocal, telescopeUpper.position);
    // const distXZ = Math.sqrt(deltaVec.x * deltaVec.x + deltaVec.z * deltaVec.z);
    // const desiredPitch = -Math.atan2(deltaVec.y, distXZ);

    // currentPitch = THREE.MathUtils.lerp(currentPitch, desiredPitch, rotationSpeed * delta);
    // telescopeUpper.rotation.x = currentPitch;
}

// Star transition
const starTransistionGeometry = new THREE.BufferGeometry();
let isStarTransition = false;
let phaseBool = false;
function starFieldTransistion() {
    isStarTransition = true;

    setTimeout(() => {
        camera.position.z = 0;
        isStarTransition = false;
        asteroid.visible = false;
        console.log('Transitioning to phases');
        // startPhases();
        const mainTitle = document.querySelector(".main-title");
        if (mainTitle) {
            mainTitle.style.visibility = "hidden";
            mainTitle.style.opacity = "0";
        }
        phaseBool = true;
        startPhases();
    }, 2000);
}

// Pointer events
function onPointerDown(event) {
    if (window.scopeDisabled) return;
    scope.style.display = 'block';
    starMaterial.uniforms.uBlurCircle.value = true;
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

    starMaterial.uniforms.uBlurCircle.value = false;
    scope.style.display = 'none';
}

document.addEventListener('touchstart', (event) => {
    if (window.scopeDisabled) return;
    starMaterial.uniforms.uBlurCircle.value = true;
    scope.style.display = 'block';
    moveScope(event);
});

document.addEventListener('touchend', () => {
    if (window.scopeDisabled) return;
    starMaterial.uniforms.uBlurCircle.value = false;
    scope.style.display = 'none';
});
// Attach pointer events
document.addEventListener('mousedown', onPointerDown);
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('mouseup', onPointerUp);

document.addEventListener('touchstart', onPointerDown);
document.addEventListener('touchmove', onPointerMove);
document.addEventListener('touchend', onPointerUp);

// Create a button to auto find Psyche Asteroid
const autoFindBtn = document.createElement('button');
autoFindBtn.innerText = "Auto Find Psyche Asteroid";
autoFindBtn.style.position = "fixed";
autoFindBtn.style.bottom = "20px";
autoFindBtn.style.left = "20px";
autoFindBtn.style.padding = "10px 20px";
autoFindBtn.style.backgroundColor = "transparent";
autoFindBtn.style.color = "white";
autoFindBtn.style.border = "2px solid white";
autoFindBtn.style.borderRadius = "5px";
autoFindBtn.style.cursor = "pointer";
autoFindBtn.style.zIndex = "1000";
autoFindBtn.style.fontSize = "16px";

// Click autoFindBtn to auto find the Psyche Asteroid
autoFindBtn.addEventListener('click', () => {
    asteroid.visible = true;
    lockOn();
});

// Add hover effect to autoFindBtn
autoFindBtn.addEventListener('mouseenter', () => {
    autoFindBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)"; // Light white tint on hover
});
autoFindBtn.addEventListener('mouseleave', () => {
    autoFindBtn.style.backgroundColor = "transparent"; // Revert on mouse out
});

// Append the button to the body
document.body.appendChild(autoFindBtn);

// Animate the scene
let lastTime = performance.now();
function animate() {
    requestAnimationFrame(animate);

    const now = performance.now();
    const delta = (now - lastTime) / 1000.0;
    lastTime = now;

    updateTarget3D();

    // Aim telescope
    pointTelescopeAt(target3D, delta);

    // Star transition
    if (isStarTransition) {
        warpStars();
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

function updateTarget3D() {
    if (!asteroid) return;
    const asteroidZ = asteroid.position.z;
    const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -asteroidZ);
    raycaster.setFromCamera(mouse, camera);
    const intersectPoint = new THREE.Vector3();
    raycaster.ray.intersectPlane(plane, intersectPoint);
    target3D.copy(intersectPoint);
}

function checkAsteroidInScope(delta) {
    if (!asteroid) return;

    // Get asteroid position 2D
    const asteroidScreenPos = asteroid.position.clone();
    asteroidScreenPos.project(camera);
    asteroidScreenPos.x = (asteroidScreenPos.x + 1) * window.innerWidth / 2;
    asteroidScreenPos.y = (-asteroidScreenPos.y + 1) * window.innerHeight / 2;

    // Get scope center
    const scopeRect = scope.getBoundingClientRect();
    const scopeX = scopeRect.left + scopeRect.width / 2;
    const scopeY = scopeRect.top + scopeRect.height / 2;
    const scopeRadius = scopeRect.width / 2;

    // Calculate distance between asteroid and scope
    const dx = asteroidScreenPos.x - scopeX;
    const dy = asteroidScreenPos.y - scopeY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // If asteroid is in scope
    if (distance <= scopeRadius) {
        asteroid.visible = true;
        asteroid.rotation.x += 0.002;
        asteroid.rotation.y += 0.002;
        holdTime += delta;

        if (holdTime >= holdThreshold) {
            lockOn();
        }
    } else {
        asteroid.visible = false;
        holdTime = 0;
    }
}

function lockOn() {
    isLockOn = true;
    window.scopeDisabled = true;

    // Get scope position
    const scopeRectangle = scope.getBoundingClientRect();
    const startLeft = parseFloat(scope.style.left);
    const startTop = parseFloat(scope.style.top);

    // Get asteroid position in 2D
    const asteroidScreenPos = asteroid.position.clone();
    asteroidScreenPos.project(camera);
    asteroidScreenPos.x = (asteroidScreenPos.x + 1) * window.innerWidth / 2;
    asteroidScreenPos.y = (-asteroidScreenPos.y + 1) * window.innerHeight / 2;

    // Target position for scope
    const endLeft = asteroidScreenPos.x - scopeRectangle.width / 2;
    const endTop = asteroidScreenPos.y - scopeRectangle.height / 2;

    const duration = 1000;
    const startTime = performance.now();

    function animateScopeToAsteroid(tNow) {
        const elapsed = tNow - startTime;
        const t = Math.min(elapsed / duration, 1);

        // LERP scope to asteroid
        const newLeft = startLeft + (endLeft - startLeft) * t;
        const newTop = startTop + (endTop - startTop) * t;
        scope.style.left = newLeft + 'px';
        scope.style.top = newTop + 'px';

        // Rotate asteroid to make noticable
        asteroid.rotation.x += 0.002;
        asteroid.rotation.y += 0.002;

        if (t < 1) {
            requestAnimationFrame(animateScopeToAsteroid);
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
            incrementProgressBar(2);
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

    autoFindBtn.remove();

    stars.geometry.attributes.position.needsUpdate = true;
}

function initializeAutoHelp() {
    ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(event => {
        window.addEventListener(event, resetAutoHelp);
    });
}
function triggerAutoHelp() {
    if (!phaseBool) {
        document.getElementById("help-icon-button").click();
    }
}
function resetAutoHelp() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(triggerAutoHelp, 15000);
}
let inactivityTimer = setTimeout(triggerAutoHelp, 15000);
initializeAutoHelp();

// Handle window resizing
window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    starMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    camera.updateProjectionMatrix();
});
