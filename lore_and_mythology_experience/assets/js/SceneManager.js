/**
 * Three.js - 3D library
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

/**
 * GLTFLoader - Loader for glTF models (3D models in .glb or .gltf format).
 */
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";

/**
 * OrbitControls - Allows orbiting, panning, and zooming a camera in a 3D scene.
 */
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";

/**
 * AudioManager - Custom module handling background music, sfx, volume, etc.
 */
import { AudioManager } from './AudioManager.js';

/**
 * Custom SettingsModal for handling user adjustments like graphics quality.
 */
import SettingsModal from './SettingsModal.js';

/**
 * Increment a progress bar UI element as steps in the scene are loaded.
 */
import incrementProgressBar from './progressBar.js';

/**
 * startPhases - Custom function that handles the phases portion.
 */
import { startPhases } from "./asteroidPhases/asteroidPhases.js";

/**
 * createAsteroidBelt
 * positionMainAsteroid
 */
import { createAsteroidBelt, positionMainAsteroid } from './AsteroidBelt.js';

/**
 * loadTelescopeParts
 */
import { loadTelescopeParts } from './Telescope.js';

/**
 * ScopeOverlay
 */
import { ScopeOverlay } from './ScopeOverlay.js';

/**
 * interactivityTest
 */
import interactivityTest from './interactivityTest.js';

/**
 * Enum-like object to represent graphics quality levels.
 * @readonly
 * @enum {string}
 */
const GraphicsQuality = Object.freeze({
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
});

/**
 * Starts new audio, and initializes the main 3D scene.
 * Called once the user dismisses the context modal.
 *
 * @function launch
 * @returns {void}
 */
export default function launchScene() {
    const audioManager = new AudioManager();
    audioManager.play("amp");
    incrementProgressBar(1);
    document.getElementById('main-title').style.visibility = 'visible';
    document.getElementById('main-title').style.opacity = '1';
    setTimeout(() => {
        document.getElementById('main-title').style.opacity = '1';
    }, 50);

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

    /**
     * Current graphics quality (defaulting to MEDIUM if not stored).
     * @type {string}
     */
    let currentGraphicsQuality = localStorage.getItem('graphicsQuality') || GraphicsQuality.MEDIUM;

    /**
     * Updates the current graphics quality setting, rebuilds the star field, and saves it locally.
     *
     * @function updateGraphicsQuality
     * @param {string} newQuality - The new graphics quality level.
     * @returns {void}
     */
    function updateGraphicsQuality(newQuality) {
        currentGraphicsQuality = newQuality;
        localStorage.setItem('graphicsQuality', newQuality);

        if (stars) {
            scene.remove(stars);
        }
        stars = createStarField(currentGraphicsQuality);
        scene.add(stars);

        console.log(`Graphics quality set to ${newQuality}`);
    }

    // Basic orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;

    // Add global lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    /**
     * Shader material for the starfield (kept in an outer variable to update uniforms later).
     * @type {THREE.ShaderMaterial}
     */
    let starMaterial;

    // Add star field
    let stars = createStarField(currentGraphicsQuality);
    scene.add(stars);

    // Add space clouds
    const spaceCloudSphere = createSpaceClouds();
    scene.add(spaceCloudSphere);

    // Create the “Auto Find Psyche Asteroid” button
    let autoFindBtn;

    // Add the asteroid belt to the scene
    const { asteroidX, asteroidY } = createAsteroidBelt(scene);

    /**
     * The main asteroid GLTF model once loaded.
     * @type {THREE.Object3D|null}
     */
    let asteroid;

    // Load the main asteroid model
    const loader = new GLTFLoader();
    loader.load('../assets/models/asteroid.glb', (gltf) => {
        asteroid = gltf.scene;
        asteroid.scale.set(0.2, 0.2, 0.2);
        asteroid.visible = false;

        // Place the main asteroid in front of the camera
        positionMainAsteroid(camera, asteroid, asteroidX, asteroidY);

        // Make asteroid model lighter
        asteroid.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive = new THREE.Color(0x222222);
                child.material.emissiveIntensity = 1;
            }
        });

        scene.add(asteroid);
        console.log("asteroid loaded successfully!");

        autoFindBtn = createAutoFindButton(asteroid, scopeOverlay);
    });

    // Load telescope models (lower and upper parts)
    let telescopeLower, telescopeUpper;
    loadTelescopeParts(loader, scene).then(({ lower, upper }) => {
        telescopeLower = lower;
        telescopeUpper = upper;
    })

    // Settings modal instance that allows changing graphics quality
    const settingsModal = new SettingsModal(updateGraphicsQuality);

    // DOM element for the "scope" overlay
    const scope = document.getElementById('scope');
    const scopeOverlay = new ScopeOverlay(
        scope,
        camera,
        controls,
        (target3D, delta) => pointTelescopeAt(target3D, delta),
        (err) => console.error(err),
        () => lockOn(asteroid),
    );

    // State variables
    let isStarTransition = false;
    let phaseBool = false;
    let isLockOn = false;

    /**
     * Main animation loop for rendering the scene and updating logic.
     * @function animate
     * @returns {void}
     */
    let lastTime = performance.now();
    function animate() {
        requestAnimationFrame(animate);

        const now = performance.now();
        const delta = (now - lastTime) / 1000.0;
        lastTime = now;

        // If we are in a star transition, warp star positions
        if (isStarTransition) {
            warpStars();
        } else {
            // Slight rotation to create a star drift effect
            stars.rotation.x += 0.00002;
            stars.rotation.y += 0.00002;
        }

        // Update the scope logic
        scopeOverlay.update(delta, asteroid, isLockOn);

        // Render the scene
        renderer.render(scene, camera);
    }
    animate();

    /**
     * Creates a starfield with random star positions, colors, and sizes, using a custom shader.
     * The star density scales with currentGraphicsQuality.
     *
     * @function createStarField
     * @returns {THREE.Points} A Points object representing the starfield.
     */
    function createStarField() {
        // Adjust star count using quality setting
        let starCount;
        if (currentGraphicsQuality === GraphicsQuality.HIGH) {
            starCount = 10000;
        } else if (currentGraphicsQuality === GraphicsQuality.MEDIUM) {
            starCount = 3000;
        } else { // LOW
            starCount = 1000;
        }

        const minDistance = 50; // Minimum distance from camera

        // Initialize star field data
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);

        // Generate star data
        for (let i = 0; i < starCount; i++) {
            // Random star position, ensuring it's outside the minDistance bubble around camera
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

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        // Choose shader precision based on quality.
        const shaderPrecision = (currentGraphicsQuality === GraphicsQuality.LOW) ? 'mediump' : 'highp';

        /**
         * Vertex shader for the starfield.
         * It calculates the final size of each point based on the perspective distance.
         */
        const vertexShader = `
            precision ${shaderPrecision} float;
            attribute float size;
            varying vec3 vColor;
        
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (600.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `;

        /**
         * Fragment shader for the starfield.
         * It creates a circular point with a glow/falloff effect.
         * Has logic to dim stars outside a scope area if blur is enabled.
         */
        const fragmentShader = `
            precision ${shaderPrecision} float;
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
        
                float core = 1.0 - smoothstep(0.0, 0.08, dist);
                float glow = 1.0 - smoothstep(0.08, 0.5, dist);
                glow *= 0.5;
                float alpha = core + glow;
        
                vec2 fragPos = gl_FragCoord.xy / uResolution;
                float minDim = min(uResolution.x, uResolution.y);
                float adjustedRadius = uCircleRadius * (minDim / uResolution.x); 
                float screenDistX = abs(fragPos.x - uCirclePos.x) / adjustedRadius;
                float screenDistY = abs(fragPos.y - uCirclePos.y) / uCircleRadius;
                float screenDist = sqrt(screenDistX * screenDistX + screenDistY * screenDistY);
                vec4 starColor = vec4(vColor, alpha);
        
                if (uBlurCircle && uBlurEnabled && screenDist > 1.0) {
                    starColor.rgb *= 0.3; 
                }
                if (!uBlurCircle && uBlurEnabled) {
                    starColor.rgb *= 0.3; 
                }
                gl_FragColor = starColor;
            }
        `;

        // Calculate scope radius from an on-screen DOM element
        document.getElementById('scope').style.display = 'block';
        const aspect = window.innerWidth / window.innerHeight;
        const scopeRadius = document.getElementById('scope').offsetWidth / 2 / window.innerWidth * aspect;

        // Create the shader material
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

    /**
     * Creates a large sphere (inverted) that serves as a space-cloud background.
     *
     * @function createSpaceClouds
     * @returns {THREE.Mesh} A sphere mesh with fractal cloud material, facing inward.
     */
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

    /**
     * Generates a data texture for a "space cloud" effect using fractal noise.
     *
     * @function generateSpaceCloudTexture
     * @param {number} width - The width of the texture.
     * @param {number} height - The height of the texture.
     * @param {number} [scale=2.0] - Scales how large features in the texture appear.
     * @returns {THREE.DataTexture} A DataTexture containing RGBA data that looks like space clouds.
     */
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

    /**
     * Generates fractal noise using Perlin noise as the base function.
     * 
     * @function fractalNoise2
     * @param {number} x - X coordinate.
     * @param {number} y - Y coordinate.
     * @param {number} [octaves=4] - Number of noise layers.
     * @param {number} [lacunarity=2] - Frequency multiplier per octave.
     * @param {number} [persistence=0.5] - Amplitude multiplier per octave.
     * @returns {number} A fractal noise value in the range (-1, 1).
     */
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

    /**
     * Angles the telescope upper part to aim at the target3D position over time.
     * The current code only partially controls X rotation.
     * 
     * @function pointTelescopeAt
     * @param {THREE.Vector3} target3D - The 3D point we aim at.
     * @param {number} delta - Time elapsed since last frame (seconds).
     * @returns {void}
     */
    function pointTelescopeAt(target3D, delta) {
        // TEMPORARY SOLUTION
        if (!telescopeUpper) return;

        // Rotate the telescope upper to follow the target position
        const dx = target3D.x - telescopeUpper.position.x;
        const dz = target3D.z - telescopeUpper.position.z;
        const targetYaw = Math.atan2(dz, dx);
        const rotationSpeed = 4.0;

        // Rotate the telescope upper assembly
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

    /**
     * Simulates warp-like motion for the starfield by shifting their Z positions.
     * Once warp starts, the button to auto-find the asteroid is removed.
     *
     * @function warpStars
     * @returns {void}
     */
    function warpStars() {
        const starPos = stars.geometry.attributes.position.array;
        for (let i = 0; i < starPos.length; i += 3) {
            // Move each star along Z
            starPos[i + 2] -= 0.5;
        }

        // Remove the autoFindBtn from the DOM once we warp
        autoFindBtn.remove();

        stars.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * 
     * @param {*} asteroid 
     * @param {*} scopeOverlay 
     */
    function createAutoFindButton(asteroid, scopeOverlay) {
        autoFindBtn = document.createElement('button');
        autoFindBtn.innerText = "Auto Find Psyche Asteroid";
        Object.assign(autoFindBtn.style, {
            position: "fixed",
            bottom: "20px",
            left: "20px",
            padding: "10px 20px",
            backgroundColor: "transparent",
            color: "white",
            border: "2px solid white",
            borderRadius: "5px",
            cursor: "pointer",
            zIndex: "1000",
            fontSize: "16px",
        });

        autoFindBtn.addEventListener('mouseenter', () => {
            autoFindBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        });
        autoFindBtn.addEventListener('mouseleave', () => {
            autoFindBtn.style.backgroundColor = "transparent";
        });

        autoFindBtn.addEventListener('click', () => {
            if (asteroid) {
                asteroid.visible = true;
                console.log("Forcing lock on...");
                scopeOverlay.forceLockOn();
            }
        });

        // Auto find pcyhe button resize
        if (window.innerWidth <= 900) {
            autoFindBtn.style.padding = "7px 10px";
            autoFindBtn.style.fontSize = "7px";
        } else {
            autoFindBtn.style.padding = "10px 20px";
            autoFindBtn.style.fontSize = "16px";
        }

        document.body.appendChild(autoFindBtn);

        return autoFindBtn
    }

    /**
     * Animates the scope to snap onto the asteroid, then initiates camera zoom.
     *
     * @function lockOn
     * @returns {void}
     */
    function lockOn() {
        isLockOn = true;
        window.scopeDisabled = true;

        // Get scope position
        const scopeRectangle = scope.getBoundingClientRect();
        const startLeft = parseFloat(scope.style.left);
        const startTop = parseFloat(scope.style.top);

        // Convert asteroid position to screen space
        const asteroidScreenPos = asteroid.position.clone();
        asteroidScreenPos.project(camera);
        asteroidScreenPos.x = (asteroidScreenPos.x + 1) * window.innerWidth / 2;
        asteroidScreenPos.y = (-asteroidScreenPos.y + 1) * window.innerHeight / 2;

        // Target position for scope
        const endLeft = asteroidScreenPos.x - scopeRectangle.width / 2;
        const endTop = asteroidScreenPos.y - scopeRectangle.height / 2;

        const duration = 1000;
        const startTime = performance.now();

        /**
         * Internal function to animate the scope overlay from current position to asteroid position.
         * @inner
         * @param {DOMHighResTimeStamp} tNow - Current time in ms (high-res).
         */
        function animateScopeToAsteroid(tNow) {
            const elapsed = tNow - startTime;
            const t = Math.min(elapsed / duration, 1);

            // LERP scope to asteroid
            const newLeft = startLeft + (endLeft - startLeft) * t;
            const newTop = startTop + (endTop - startTop) * t;
            scope.style.left = newLeft + 'px';
            scope.style.top = newTop + 'px';

            // Rotate asteroid slightly for visual effect
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

    /**
     * Zooms the camera in toward the asteroid.
     * Once complete, triggers the starFieldTransition.
     *
     * @function startCameraZoom
     * @returns {void}
     */
    function startCameraZoom() {
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

        /**
         * Animates the camera moving in toward the asteroid over a fixed duration.
         * 
         * @inner
         * @param {DOMHighResTimeStamp} time - Current time in ms (high-res).
         */
        function animateZoom(time) {
            const elapsed = time - startTime;
            const t = Math.min(elapsed / duration, 1);

            // LERP camera and controls
            camera.position.lerpVectors(startCameraPos, endCameraPos, t);
            controls.target.lerpVectors(startTarget, endTarget, t);

            // Slight asteroid rotation
            asteroid.rotation.x += 0.002;
            asteroid.rotation.y += 0.002;

            // Scale the asteroid
            const currentScale = new THREE.Vector3().lerpVectors(startScale, endScale, t);
            asteroid.scale.copy(currentScale);

            controls.update();

            if (t < 1) {
                requestAnimationFrame(animateZoom);
            } else {
                // When done zooming, style the modal, increment progress, and start star transition
                settingsModal.applyAMPIModalStyles();
                incrementProgressBar(2);
                triggered("lock-on");
                starFieldTransition();
            }
        }

        requestAnimationFrame(animateZoom);
    }

    /**
     * Trigger a warp-like animation on the stars, 
     * then remove the telescope and start the next "phases."
     *
     * @function starFieldTransition
     * @returns {void}
     */
    function starFieldTransition() {
        isStarTransition = true;

        // Remove telescope from scene
        scene.remove(telescopeLower);
        scope.remove();

        setTimeout(() => {
            camera.position.z = 0;
            isStarTransition = false;
            asteroid.visible = false;
            console.log('Transitioning to phases');
            const mainTitle = document.querySelector(".main-title");
            if (mainTitle) {
                mainTitle.style.visibility = "hidden";
                mainTitle.style.opacity = "0";
            }
            phaseBool = true;
            startPhases(audioManager);
        }, 2000);
    }

    /**
     * Registers event listeners to detect user activity (mouse/touch/scroll).
     * If user is inactive, automatically opens a "help" modal.
     *
     * @function initializeAutoHelp
     * @returns {void}
     */
    function initializeAutoHelp() {
        ['mousemove', 'keydown', 'click', 'touchstart', 'scroll'].forEach(event => {
            window.addEventListener(event, resetAutoHelp);
        });
    }

    /**
     * Automatically opens a "help" modal if user remains inactive.
     *
     * @function triggerAutoHelp
     * @returns {void}
     */
    function triggerAutoHelp() {
        if (!phaseBool) {
            document.getElementById("help-icon-button").click();
        }
    }

    /**
     * Resets a timer that triggers help if user is inactive for 15 seconds.
     *
     * @function resetAutoHelp
     * @returns {void}
     */
    function resetAutoHelp() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(triggerAutoHelp, 40000);
    }
    let inactivityTimer = setTimeout(triggerAutoHelp, 40000);
    initializeAutoHelp();

    /**
     * Listen to window resize events so that the scene and uniforms
     * adjust to the new resolution.
     */
    window.addEventListener("resize", () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        starMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
        camera.updateProjectionMatrix();

        // Auto find pcyhe button resize
        if (window.innerWidth <= 900) {
            autoFindBtn.style.padding = "7px 10px";
            autoFindBtn.style.fontSize = "7px";
        } else {
            autoFindBtn.style.padding = "10px 20px";
            autoFindBtn.style.fontSize = "16px";
        }
    });

    // let intervalID = setInterval(function() {
    //     interactivityTest(intervalID);
    // }, 3000);
}
