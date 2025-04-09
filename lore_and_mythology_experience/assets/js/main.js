/**
 * Three.js - 3D library
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

/**
 * Custom SettingsModal for handling user adjustments like graphics quality.
 */
import SettingsModal from './SettingsModal.js';

/**
 * OrbitControls - Allows orbiting, panning, and zooming a camera in a 3D scene.
 */
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";

/**
 * startPhases - Custom function that handles the phases portion.
 */
import { startPhases } from "./asteroidPhases/asteroidPhases.js";

/**
 * GLTFLoader - Loader for glTF models (3D models in .glb or .gltf format).
 */
import { GLTFLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js";

/**
 * AudioManager - Custom module handling background music, sfx, volume, etc.
 */
import { AudioManager } from './AudioManager.js';

/**
 * Increment a progress bar UI element as steps in the scene are loaded.
 */
import incrementProgressBar from './progressBar.js';

incrementProgressBar(1);

/**
 * Global AudioManager instance used for playing context music and ambient sounds.
 */
let audioManager = new AudioManager();

window.onload = async () => {
    // Wait for the user to click on the telescope background in the context modal.
    showContext().then(launch);
    // After the modal is dismissed, start the fade in (and subsequent animations).
};

//================ CONTEXT FUNCTIONS ========================

/**
 * Audio manager plays "context" sound immediately.
 */
audioManager.play("context");
audioManager.setVolume(0.5);

/**
 * Stores a reference to the telescope background element in the context modal.
 * @type {HTMLElement|null}
 */
let telescopeBackground;

/**
 * Asynchronously loads the "context" modal
 * and waits for the user to dismiss it.
 *
 * @async
 * @function showContext
 * @returns {Promise<void>} A promise that resolves once the user clicks on the telescope background.
 */
async function showContext() {
    const phase_div = document.createElement("div");
    phase_div.setAttribute("id", "context_modal");
    phase_div.setAttribute(
        "style",
        "display: block; position: fixed; z-index: 20; left: 0; top: 0; width: 100%; height: 100%; " +
        "background-color: rgba(0, 0, 0, 0.2); overflow: hidden; transition: 1.5s;"
    );

    try {
        // Fetch an external HTML snippet that describes the "context" overlay
        const response = await fetch("../pages/amp_context.html");
        const data = await response.text();
        phase_div.innerHTML = data;
        document.body.appendChild(phase_div);
    } catch (error) {
        console.error("Error fetching the HTML:", error);
    }
    telescopeBackground = document.getElementById("telescopeBg");

    startAnimations();
    await waitForTelescopeClick();
    hideContext();
}

/**
 * Returns a promise that resolves when the user clicks on the telescope background.
 *
 * @function waitForTelescopeClick
 * @returns {Promise<Event>} Resolves with the click event once it occurs.
 */
function waitForTelescopeClick() {
    return new Promise((resolve) => {
        telescopeBackground.addEventListener(
            "click",
            (event) => {
                resolve(event);
            },
            { once: true }
        );
    });
}

/**
 * Removes the context modal from the DOM.
 *
 * @function hideContext
 * @returns {void}
 */
function hideContext() {
    const modal = document.getElementById("context_modal");
    if (modal) {
        modal.remove();
    }
}

/**
 * Starts some basic UI animations in the context modal.
 *
 * @function startAnimations
 * @returns {void}
 */
function startAnimations() {
    let opacity = 0;
    let intervalID = 0;
    const scroll = document.getElementById("scroll");
    const clickDialog = document.getElementById("scrollClick");
    scroll.style.opacity = 0;
    let blinkIn = 0;
    fadeIn();

    /**
     * Fades in the scroll prompt over time.
     * @inner
     */
    function fadeIn() {
        clearInterval(intervalID);
        intervalID = setInterval(showScroll, 10);
    }

    /**
     * Fades out the scroll prompt over time.
     * @inner
     */
    function fadeOut() {
        clearInterval(intervalID);
        intervalID = setInterval(hideScroll, 10);
    }

    /**
     * Increases scroll prompt opacity until fully visible,
     * then schedules fadeOut after a short delay.
     * @inner
     */
    function showScroll() {
        opacity = Number(window.getComputedStyle(scroll).getPropertyValue("opacity"));
        if (opacity < 1) {
            opacity += 0.005;
            scroll.style.opacity = opacity;
        } else {
            clearInterval(intervalID);
            setTimeout(fadeOut, 3000);
        }
    }

    /**
     * Decreases scroll prompt opacity until fully invisible,
     * then starts blinking the telescope background.
     * @inner
     */
    function hideScroll() {
        opacity = Number(window.getComputedStyle(scroll).getPropertyValue("opacity"));
        if (opacity > 0) {
            opacity -= 0.005;
            scroll.style.opacity = opacity;
        } else {
            clearInterval(intervalID);
            // Start the blink animation for the telescope background.
            intervalID = setInterval(blinkTelescope, 10);
            clickDialog.style.opacity = 1;
        }
    }

    /**
     * Blinks the telescope background in/out by manipulating its opacity.
     * @inner
     */
    function blinkTelescope() {
        const currentColor = window.getComputedStyle(telescopeBackground).getPropertyValue("background-color");
        // Updated the regex to allow optional spaces after commas.
        const rgba = currentColor.match(/rgba?\((\d+), ?(\d+), ?(\d+), ?([\d.]+)\)/);
        let opacityValue;

        if (rgba) {
            opacityValue = parseFloat(rgba[4]);
        } else {
            // Fallback if no proper color value is detected.
            opacityValue = 0.99;
            blinkIn = 1;
        }

        if (opacityValue < .4 && blinkIn === 0) {
            opacityValue += 0.005;
            if (opacityValue >= .4) {
                blinkIn = 1;
                opacityValue = .4;
            }
            telescopeBackground.style.backgroundColor = `rgba(255, 255, 255, ${opacityValue})`;
        } else {
            opacityValue -= 0.005;
            if (opacityValue <= 0) {
                blinkIn = 0;
                opacityValue = 0;
            }
            telescopeBackground.style.backgroundColor = `rgba(255, 255, 255, ${opacityValue})`;
        }
    }
}

/**
 * Stops the "context" audio, starts new audio, and initializes the main 3D scene.
 * Called once the user dismisses the context modal.
 *
 * @function launch
 * @returns {void}
 */
function launch() {
    audioManager.stopPlaying();
    audioManager.play("amp");
    document.getElementById('main-title').style.visibility = 'visible';

    // Create the scene
    const scene = new THREE.Scene();

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
     * Current graphics quality (defaulting to MEDIUM if not stored).
     * @type {string}
     */
    let currentGraphicsQuality = localStorage.getItem('graphicsQuality') || GraphicsQuality.MEDIUM;

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
     * Shader material for the starfield (kept in an outer variable to update uniforms later).
     * @type {THREE.ShaderMaterial}
     */
    let starMaterial;

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

        return new THREE.Points(geometry, starMaterial);
    }

    // Add star field
    let stars = createStarField();
    scene.add(stars);

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
        stars = createStarField();
        scene.add(stars);

        console.log(`Graphics quality set to ${newQuality}`);
    }

    camera.lookAt(0, 0, 0);

    // Boundaries for placing the asteroid on the screen
    const MIN_X = -1;
    const MAX_X = 1;
    const MIN_Y = -0.1;
    const MAX_Y = 0.1;

    let asteroidX;
    let asteroidY;
    let asteroidZ;

    /**
     * Dynamically generates a texture for an asteroid using an HTML canvas.
     * Simulates craters by drawing radial gradients.
     *
     * @function generateAsteroidTexture
     * @returns {THREE.CanvasTexture} The generated texture for the asteroid surface.
     */
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

    /**
     * Creates an asteroid belt with many small asteroids. Also determines a random position
     * for the main asteroid (to ensure it remains on-screen).
     *
     * @function createAsteroidBelt
     * @param {THREE.Scene} scene - The Three.js scene to which the asteroids will be added.
     * @returns {void}
     */
    function createAsteroidBelt(scene) {
        const numAsteroids = window.innerWidth * .3;
        const beltRadius = 50;
        const beltThickness = 10;
        const asteroidGeometry = new THREE.SphereGeometry(0.5, 256, 256);
        const asteroidMaterial = new THREE.MeshStandardMaterial({
            map: generateAsteroidTexture(),
            roughness: 1,
            metalness: 0,
            emissive: new THREE.Color(0x111111)
        });

        asteroidGeometry.computeBoundingBox();
        asteroidGeometry.computeVertexNormals();

        // Randomly choose the X and Y for the main asteroid, ensuring it's within boundaries
        while (true) {
            asteroidX = THREE.MathUtils.lerp(MIN_X, MAX_X, Math.random());
            asteroidY = THREE.MathUtils.lerp(MIN_Y, MAX_Y, Math.random());
            asteroidZ = 0;
            if (asteroidX < MAX_X && asteroidX > MIN_X) { break; }
        }

        // Populate the belt
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

    // Add the asteroid belt to the scene
    createAsteroidBelt(scene);

    // Add space clouds
    const spaceCloudSphere = createSpaceClouds();
    scene.add(spaceCloudSphere);

    // Calculate the camera's "viewplane" dimensions
    const cameraHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const cameraWidth = cameraHeight * camera.aspect;

    // Convert normalized screen coordinates to 3D coordinates in front of the camera
    const asteroidVector = new THREE.Vector3(asteroidX, asteroidY, 0);
    asteroidVector.unproject(camera);

    // Ray from the camera to the unprojected point
    const cameraRay = asteroidVector.sub(camera.position).normalize();

    // We assume the main asteroid will be placed at Z=0 plane in front of camera
    const distanceFromCamera = (0 - camera.position.z) / cameraRay.z * 2;

    // Final position for the main asteroid
    const asteroidPosition = camera.position.clone().add(cameraRay.multiplyScalar(distanceFromCamera));

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
        asteroid.position.copy(asteroidPosition);
        asteroid.visible = false;

        // Make asteroid model lighter
        asteroid.traverse((child) => {
            if (child.isMesh) {
                child.material.emissive = new THREE.Color(0x222222);
                child.material.emissiveIntensity = 1;
            }
        });

        scene.add(asteroid);
    });

    // Load telescope models (lower and upper parts)
    let telescopeLower, telescopeUpper;
    loader.load('../assets/models/telescope_lower.glb', (gltf) => {
        telescopeLower = gltf.scene;
        telescopeLower.position.set(0, -1.4, 0);
        telescopeLower.scale.set(0.2, 0.2, 0.2);
        telescopeLower.rotation.x = THREE.MathUtils.degToRad(-55); // Base rotation away from camera
        telescopeLower.rotation.y = THREE.MathUtils.degToRad(90); // Base rotation away from camera
        scene.add(telescopeLower);

        // Once the lower is loaded, load the upper part
        loader.load('../assets/models/telescope_upper.glb', (gltf2) => {
            telescopeUpper = gltf2.scene;
            telescopeUpper.position.set(0, 0, 0); // x y z (y and z will reposition to align with scope)
            telescopeLower.add(telescopeUpper);
        });
    });

    // Add global lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1.5);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    // DOM element for the "scope" overlay
    const scope = document.getElementById('scope');

    // Raycaster to handle 3D picking or alignment
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2()

    // Basic orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = false;
    controls.enableRotate = false;
    controls.enablePan = false;
    controls.enableZoom = false;

    // Settings modal instance that allows changing graphics quality
    const settingsModal = new SettingsModal(updateGraphicsQuality);

    // State variables for the scope-based lock-on logic
    let holdTime = 0.0; // Time the scope has hovered over the asteroid
    const holdThreshold = 0.5; // Time to lock onto the asteroid
    let isLockOn = false; // Indicates if we've locked onto the asteroid
    let isZoom = false; // Indicates if camera zoom is in progress

    // Public global flag indicating if the scope overlay is disabled
    window.scopeDisabled = false;

    // Target coordinate in 3D space to point the telescope at
    let target3D = new THREE.Vector3();

    /**
     * Moves the "scope" DOM element to follow the pointer.
     * Updates mouse coordinates for Raycaster usage.
     *
     * @function moveScope
     * @param {MouseEvent|TouchEvent} event - The pointer event.
     * @returns {void}
     */
    function moveScope(event) {
        let clientX, clientY;
        if (event.touches) {
            // For touch devices, use the last touch point
            const touch = event.touches[event.touches.length - 1];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        // Center scope on pointer
        scope.style.left = `${clientX - scope.offsetWidth / 2}px`;
        scope.style.top = `${clientY - scope.offsetHeight / 2}px`;

        // Convert to normalized device coords for raycasting
        mouse.x = (clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        // Update star shader uniform to track the scope's position
        const normX = clientX / window.innerWidth;
        const normY = 1 - (clientY / window.innerHeight);
        starMaterial.uniforms.uCirclePos.value.set(normX, normY);
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

    // Used for star transition effect
    const starTransistionGeometry = new THREE.BufferGeometry();
    let isStarTransition = false;
    let phaseBool = false;

    /**
     * Trigger a warp-like animation on the stars, 
     * then remove the telescope and start the next "phases."
     *
     * @function starFieldTransistion
     * @returns {void}
     */
    function starFieldTransistion() {
        isStarTransition = true;

        // Remove telescope from scene
        scene.remove(telescopeLower);

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
     * Pointer down event - shows the scope overlay and dims the stars outside it.
     * 
     * @function onPointerDown
     * @param {MouseEvent|TouchEvent} event - The pointer down event.
     * @returns {void}
     */
    function onPointerDown(event) {
        if (window.scopeDisabled) return;
        scope.style.display = 'block';
        starMaterial.uniforms.uBlurCircle.value = true;
        moveScope(event);
    }

    /**
     * Pointer move event - if scope is visible, move it and update star uniforms.
     *
     * @function onPointerMove
     * @param {MouseEvent|TouchEvent} event - The pointer move event.
     * @returns {void}
     */
    function onPointerMove(event) {
        if (window.scopeDisabled) return;

        if (scope.style.display === 'block') {
            moveScope(event);
        }
    }

    /**
     * Pointer up event - hides the scope and disables star dimming.
     *
     * @function onPointerUp
     * @returns {void}
     */
    function onPointerUp() {
        if (window.scopeDisabled) return;

        starMaterial.uniforms.uBlurCircle.value = false;
        scope.style.display = 'none';
    }

    // Touch event listeners
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

    // Attach pointer events for mouse
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('mouseup', onPointerUp);

    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('touchmove', onPointerMove);
    document.addEventListener('touchend', onPointerUp);

    /**
     * A simple button to automatically locate and lock onto the main asteroid.
     * @type {HTMLButtonElement}
     */
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

        updateTarget3D();

        // Aim telescope
        pointTelescopeAt(target3D, delta);

        // If we are in a star transition, warp star positions
        if (isStarTransition) {
            warpStars();
        } else {
            // Slight rotation to create a star drift effect
            stars.rotation.x += 0.00002;
            stars.rotation.y += 0.00002;
        }

        // Check if asteroid is in scope
        if (!isLockOn && asteroid && scope.style.display === 'block') {
            checkAsteroidInScope(delta);
        }

        // Render the scene
        renderer.render(scene, camera);
    }
    animate();

    /**
     * Updates the global target3D vector by projecting from mouse coords
     * onto a plane at the asteroid's Z position.
     *
     * @function updateTarget3D
     * @returns {void}
     */
    function updateTarget3D() {
        if (!asteroid) return;
        const asteroidZ = asteroid.position.z;
        const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -asteroidZ);
        raycaster.setFromCamera(mouse, camera);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersectPoint);
        target3D.copy(intersectPoint);
    }

    /**
     * Checks if the asteroid is within the scope circle.
     * If it remains in the circle for holdThreshold seconds, we lock on.
     *
     * @function checkAsteroidInScope
     * @param {number} delta - Time elapsed since last frame (seconds).
     * @returns {void}
     */
    function checkAsteroidInScope(delta) {
        if (!asteroid) return;

        // Get asteroid position in 2D screen coords
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
     * Once complete, triggers the starFieldTransistion.
     *
     * @function startCameraZoom
     * @returns {void}
     */
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
                starFieldTransistion();
            }
        }

        requestAnimationFrame(animateZoom);
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
        inactivityTimer = setTimeout(triggerAutoHelp, 15000);
    }
    let inactivityTimer = setTimeout(triggerAutoHelp, 15000);
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
    });
}
