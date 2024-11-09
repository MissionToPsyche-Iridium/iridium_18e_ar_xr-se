/*
 * Space Scene class
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/renderers/CSS2DRenderer.js';

export default class SpaceScene {
    /*
     * Public Methods
     */

    // Constructor
    constructor(options = {}) {
        this._bubbles = [];
        this._updateInstrumentContent = options.updateInstrumentContent;
        this._Initialize();
    }

    // Make bubbles visible/invisible based on state
    updateBubbles(newMainState) {
        console.log('Updating Bubble State to:', newMainState);
        if (newMainState === 'instrument') {
            this._showBubbles();
        } else {
            this._hideBubbles();
        }
    }

    // Unhighlight bubbles
    deselectBubbles() {
        if (this._bubbles) {
            this._bubbles.forEach(bubble => {
                const bubbleMaterial = bubble.material;
                const bubbleLabelDiv = bubble.bubbleLabel.element;
                const bubbleProgressLabelDiv = bubble.bubbleProgressLabel.element;

                bubbleMaterial.opacity = 0.5;
                bubbleLabelDiv.style.opacity = '0.5';
                bubbleProgressLabelDiv.style.opacity = '0.5';
            });
        }
    }

    /*
     * Private Methods
     */

    // Initialize renderers and parts of the scene
    _Initialize() {
        // Renderer for 3D environment
        this._threejs = new THREE.WebGLRenderer({ antialias: true });
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        document.getElementById("scene").appendChild(this._threejs.domElement);

        // Renderer for 2D CSS
        this._labelRenderer = new CSS2DRenderer();
        this._labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this._labelRenderer.domElement.style.position = 'absolute';
        this._labelRenderer.domElement.style.top = '0px';
        this._labelRenderer.domElement.style.pointerEvents = 'none';
        document.getElementById("scene").appendChild(this._labelRenderer.domElement);

        // Handle resizes for scene
        window.addEventListener('resize', () => this._OnWindowResize(), false);

        // Initialize parts of the scene
        this._LoadingScreen(); // Start loading screen
        this._Camera(); // Initialize camera
        this._Scene(); // Initialize scene
        this._Lighting(); // Initialize lighting
        this._Controls(); // Initialize controls
        this._Skybox(); // Initialize skybox
        this._Satellite(); // Initialize models
        this._RAF(); // Start rendering
    }

    // Handler for window resizing to update relevant parts
    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        this._labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    // Start loading screen using timeout function
    _LoadingScreen() {
        let loading = document.getElementById("loading-container");

        setTimeout(function() {
            loading.style.opacity = 0;
            setTimeout(function() {
                loading.style.display = "none";
            }, 500);
        }, 2000);
    }

    // Setup camera, camera limits, and camera position
    _Camera() {
        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 0, 10); // Set initial camera position for better view of the satellite
    }

    // Setup scene
    _Scene() {
        this._scene = new THREE.Scene();
    }

    // Setup lighting for scene
    _Lighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increase intensity
        this._scene.add(ambientLight);

        // Directional Light
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        directionalLight.position.set(75, 100, 30);
        directionalLight.castShadow = true;
        directionalLight.shadow.bias = -0.001;
        directionalLight.shadow.mapSize.set(2048, 2048);
        this._scene.add(directionalLight);

        // Point Light
        const pointLight = new THREE.PointLight(0xffffff, 1.5, 100); // Bright point light
        pointLight.position.set(0, 10, 10); // Position it above the scene
        this._scene.add(pointLight);
    }

    // Setup orbit controls around center
    _Controls() {
        const controls = new OrbitControls(this._camera, this._threejs.domElement);
        controls.target.set(0, 0, 0); // Center the controls on the satellite

        controls.enableZoom = true;
        controls.minDistance = 3;
        controls.maxDistance = 1000;
        controls.enablePan = false;
        controls.screenSpacePanning = false;

        controls.update();
    }

    // Load skybox textures and create skybox cube
    _Skybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '../assets/images/skybox/space_ft.png',
            '../assets/images/skybox/space_bk.png',
            '../assets/images/skybox/space_up.png',
            '../assets/images/skybox/space_dn.png',
            '../assets/images/skybox/space_lf.png',
            '../assets/images/skybox/space_rt.png',
        ], undefined, undefined, (error) => {
            console.error('Error loading skybox texture:', error);
        });
        this._scene.background = texture;
    }

    // Cube test
    _BuildCube() {
        const box = new THREE.Mesh(
            new THREE.BoxGeometry(10, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0xFFFFFF })
        );
        box.position.set(0, 3, 0);
        box.castShadow = true;
        box.receiveShadow = true;
        this._scene.add(box);
    }

    // Create a bubble, bubble label, and bubble progress label
    _createBubble(model, labelText, bubbleId, x, y, z) {
        // Create bubble
        const bubbleCanvas = document.createElement('canvas');
        bubbleCanvas.width = 256;
        bubbleCanvas.height = 256;
        // bubbleCanvas.height = 320;
        const bubbleContext = bubbleCanvas.getContext('2d');
        bubbleContext.beginPath();
        bubbleContext.arc(128, 128, 128, 0, 2 * Math.PI);
        bubbleContext.fillStyle = '#ffffff' // White
        bubbleContext.fill();
        // Draw line
        // bubbleContext.beginPath();
        // bubbleContext.moveTo(128, 128);
        // bubbleContext.lineTo(128, 128 + 128 + 64);
        // bubbleContext.lineWidth = 5;
        // bubbleContext.strokeStyle = '#ffffff'; // White
        // bubbleContext.stroke();
        const bubbleTexture = new THREE.CanvasTexture(bubbleCanvas);
        const bubbleMaterial = new THREE.SpriteMaterial({
            map: bubbleTexture,
            transparent: true,
            opacity: 0.5,
        });
        const bubble = new THREE.Sprite(bubbleMaterial);
        bubble.scale.set(2, 2, 2); // Set bubble scale
        // bubble.scale.set(2, 2.25, 2); // Set bubble scale
        bubble.position.set(x, y, z); // Set bubble position
        bubble.visible = false;
        model.add(bubble);

        // Create bubble label
        const bubbleLabelDiv = document.createElement('div');
        bubbleLabelDiv.className = 'label';
        bubbleLabelDiv.textContent = labelText;
        bubbleLabelDiv.style.color = 'white';
        bubbleLabelDiv.style.opacity = '0.5';
        bubbleLabelDiv.style.fontSize = '14px';
        bubbleLabelDiv.style.maxWidth = '200px';
        bubbleLabelDiv.style.textAlign = 'center';
        const bubbleLabel = new CSS2DObject(bubbleLabelDiv);
        bubbleLabel.position.set(0, -1, 0);
        bubbleLabel.visible = false;
        bubble.add(bubbleLabel)
        bubble.bubbleLabel = bubbleLabel;

        // Create bubble progress label
        const bubbleProgressLabelDiv = document.createElement('div');
        bubbleProgressLabelDiv.className = 'label';
        bubbleProgressLabelDiv.textContent = ''; // Initially empty
        bubbleProgressLabelDiv.style.color = 'white';
        bubbleProgressLabelDiv.style.opacity = '0.5';
        bubbleProgressLabelDiv.style.fontSize = '12px';
        bubbleProgressLabelDiv.style.maxWidth = '200px';
        bubbleProgressLabelDiv.style.textAlign = 'center';
        const bubbleProgressLabel = new CSS2DObject(bubbleProgressLabelDiv);
        bubbleProgressLabel.position.set(0, -1.3, 0); // Position it slightly below the bubbleLabel
        bubbleProgressLabel.visible = false;
        bubble.add(bubbleProgressLabel);
        bubble.bubbleProgressLabel = bubbleProgressLabel;

        // Assign id
        bubble.bubbleId = bubbleId;

        return bubble;
    }

    // Load satellite model, setup bubbles, and start animation
    _Satellite() {
        const loader = new GLTFLoader();
        loader.load('../assets/models/satellite_light.glb', (gltf) => {
            // Configure model
            const model = gltf.scene;
            model.scale.set(0.25, 0.25, 0.25); // Set model scale
            model.position.set(0, 0, 0); // Set model position
            this._scene.add(model); // Add model to scene
            this._model = model;

            // Create bubble and push to bubble list
            this._bubbles.push(this._createBubble(model, 'Gamma Ray and Neutron Spectrometer', 'spectrometer', -2, -2, 4.5));
            this._bubbles.push(this._createBubble(model, 'X-Band High Gain Antenna', 'antenna', 1, 0, 4));
            this._bubbles.push(this._createBubble(model, 'Multispectral Imager', 'imager', -3, 0, 0));
            this._bubbles.push(this._createBubble(model, 'Deep Space Optical Communication', 'communication', 3, 0, -2));
            this._bubbles.push(this._createBubble(model, 'Magnetometer', 'detection', -2, 2, 4.5));

            // Store clickable objects
            this._clickableObjects = this._bubbles.slice();
            this._threejs.domElement.addEventListener('click', this._onClick.bind(this), false);
            this._threejs.domElement.addEventListener('touchstart', this._onTouchStart.bind(this), false);

            // Basic rotation animation
            const animate = () => {
                requestAnimationFrame(animate);
                model.rotation.y += 0.001; // Rotate the model
                this._threejs.render(this._scene, this._camera);
            };
            animate();

            // Log loading
        }, function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');

            // Log error to console
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    // Render
    _RAF() {
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            this._labelRenderer.render(this._scene, this._camera);
            this._RAF();
        });
    }

    // Make bubbles, bubble label, and bubble progress label visible
    _showBubbles() {
        if (this._bubbles) {
            this._bubbles.forEach(bubble => {
                bubble.visible = true;
                bubble.bubbleLabel.visible = true;
                bubble.bubbleProgressLabel.visible = true;
            });
        }
    }

    // Make bubbles, bubble label, and bubble progress label invisible
    _hideBubbles() {
        if (this._bubbles) {
            this._bubbles.forEach(bubble => {
                bubble.visible = false;
                bubble.bubbleLabel.visible = false;
                bubble.bubbleProgressLabel.visible = false;
            });
        }
    }

    // Check for intersection with clickable objects at position
    _performRaycast(normalizedPosition) {
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(normalizedPosition, this._camera);

        // Check if click/touch intersects
        const intersects = raycaster.intersectObjects(this._clickableObjects, true);
        if (intersects.length > 0) {
            // Find the selected bubble
            let selectedBubble = intersects[0].object;
            while (selectedBubble && !this._bubbles.includes(selectedBubble)) {
                selectedBubble = selectedBubble.parent;
            }

            // If a bubble was selected
            if (selectedBubble) {
                // Mark the selected bubble as viewed
                selectedBubble.bubbleProgressLabel.element.textContent = '(viewed)';

                // Deselect other bubbles
                this._bubbles.forEach(bubble => {
                    const bubbleMaterial = bubble.material;
                    const bubbleLabelDiv = bubble.bubbleLabel.element;
                    const bubbleProgressLabelDiv = bubble.bubbleProgressLabel.element;

                    // Selected bubble
                    if (bubble === selectedBubble) {
                        bubbleMaterial.opacity = 0.9;
                        bubbleLabelDiv.style.opacity = '0.9';
                        bubbleProgressLabelDiv.style.opacity = '0.9';

                        // Unselected bubbles
                    } else {
                        bubbleMaterial.opacity = 0.5;
                        bubbleLabelDiv.style.opacity = '0.5';
                        bubbleProgressLabelDiv.style.opacity = '0.5';
                    }
                });

                // Update instrument content based on selected bubble
                this._updateInstrumentContent(selectedBubble.bubbleId);
            }
        }
    }

    // Handle clicks then do raycast
    _onClick(event) {
        event.preventDefault();

        const rect = this._threejs.domElement.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const mouseVector = new THREE.Vector2(mouseX, mouseY);

        this._performRaycast(mouseVector);
    }

    // Handle taps then do raycast
    _onTouchStart(event) {
        event.preventDefault();

        // Only consider the first touch point
        if (event.touches.length === 1) {
            const touch = event.touches[0];

            const rect = this._threejs.domElement.getBoundingClientRect();
            const touchX = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
            const touchY = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
            const touchVector = new THREE.Vector2(touchX, touchY);

            this._performRaycast(touchVector);
        }
    }
}
