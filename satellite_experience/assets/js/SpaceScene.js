/*
 * Space Scene class
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/renderers/CSS2DRenderer.js';
import HelpModal from './HelpModal.js';
import { TextureLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

export default class SpaceScene {
    /*
     * Public Methods
     */

    // Constructor
    constructor(options = {}, helpModal) {
        this._bubbles = [];
        this._phases = [];
        this._currentPhaseIndex = 0;
        this._updateInstrumentContent = options.updateInstrumentContent;
        this._helpModal = helpModal;
        this._Initialize();
        this._mainState = 'main';
    }

    // Make bubbles visible/invisible based on state
    updateState(newMainState) {
        this._mainState = newMainState;

        console.log('Updating Scene State to:', newMainState);
        // Instrument State
        if (newMainState === 'instrument') {
            this._showBubbles();
            this._showInstructions();
        } else {
            this.deselectBubbles();
            this._hideBubbles();
            this._hideInstructions();
        }

        // Mission State
        if (newMainState === 'mission') {
            this._showTimeline();
        } else {
            this._currentPhaseIndex = 0;
            this._updatePhaseSelection();
            this._hideTimeline();
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

    // Go to next phase
    prevPhase() {
        this._currentPhaseIndex--;
        if (this._currentPhaseIndex < 0) {
            this._currentPhaseIndex = this._phases.length - 1;
        }
        this._updatePhaseSelection();
    }

    // Go to previous phase
    nextPhase() {
        this._currentPhaseIndex++;
        if (this._currentPhaseIndex >= this._phases.length) {
            this._currentPhaseIndex = 0;
        }
        this._updatePhaseSelection();
    }

    // Get current phase id
    getCurrentPhase() {
        return this._phases[this._currentPhaseIndex].phaseId;
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

        setTimeout(() => {
            loading.style.opacity = 0;
            setTimeout(() => {
                loading.style.display = "none";
                this._AfterLoadingScreen();
            }, 500);
        }, 2000);
    }

    _AfterLoadingScreen() {
        this._helpModal._loadHelpModalContent();
    }

    // Setup camera, camera limits, and camera position
    _Camera() {
        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1.0;
        const far = 15000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 0, 10); // Set initial camera position for better view of the satellite
    }

    // Setup scene
    _Scene() {
        this._scene = new THREE.Scene();
        this._scene.add(this._camera);
    }

    // Setup lighting for scene
    _Lighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this._scene.add(ambientLight);
    
        // Load the sun texture
        const textureLoader = new THREE.TextureLoader();
        const sunTexture = textureLoader.load('../assets/images/sun.png');
    
        // Create Sun Sprite
        const sunMaterial = new THREE.SpriteMaterial({
            map: sunTexture,
            color: 0xFFDF30,
            transparent: true,
            blending: THREE.AdditiveBlending,
        });
    
        const sunSprite = new THREE.Sprite(sunMaterial);
        sunSprite.scale.set(500, 500, 1);
        sunSprite.position.set(-5000, 3000, 5000); // Sun distance from origin
        sunSprite.frustumCulled = false;
        this._scene.add(sunSprite);
    
        // Add Directional Light at the sun's position
        const sunLight = new THREE.DirectionalLight(0xFFFFFF, 3);
        sunLight.position.copy(sunSprite.position);
        sunLight.castShadow = true;
    
        // Configure shadow properties
        sunLight.shadow.bias = -0.0001;
        sunLight.shadow.mapSize.width = 2048;
        sunLight.shadow.mapSize.height = 2048;
    
        // Adjust the shadow camera to encompass the satellite
        const d = 100;
        sunLight.shadow.camera.left = -d;
        sunLight.shadow.camera.right = d;
        sunLight.shadow.camera.top = d;
        sunLight.shadow.camera.bottom = -d;
        sunLight.shadow.camera.near = 1;
        sunLight.shadow.camera.far = 10000;
    
        // Set the target of the light to the origin
        sunLight.target.position.set(0, 0, 0);
        this._scene.add(sunLight.target);
    
        this._scene.add(sunLight);
    }

    // Setup orbit controls around center
    _Controls() {
        this._controls = new OrbitControls(this._camera, this._threejs.domElement);
        this._controls.target.set(0, 0, 0); // Center the controls on the satellite

        this._controls.enableZoom = true;
        this._controls.minDistance = 3;
        this._controls.maxDistance = 1000;
        this._controls.enablePan = false;
        this._controls.screenSpacePanning = false;

        // Rotate the camera
        this._controls.autoRotate = true;
        this._controls.autoRotateSpeed = 0.2;

        this._controls.update();
    }

    // Load skybox textures and create skybox cube
    _Skybox() {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
            '../assets/images/skybox/right.png',
            '../assets/images/skybox/left.png',
            '../assets/images/skybox/top.png',
            '../assets/images/skybox/bottom.png',
            '../assets/images/skybox/front.png',
            '../assets/images/skybox/back.png',
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

    _createTimeline(phases) {
        // Create timeline group
        const timelineGroup = new THREE.Group();
        timelineGroup.visible = false;
        this._timelineGroup = timelineGroup;
        this._camera.add(timelineGroup);
        timelineGroup.position.set(0, 3, -5.75);

        // Create main line
        const lineCanvas = document.createElement('canvas');
        lineCanvas.width = 512;
        lineCanvas.height = 2;
        const lineContext = lineCanvas.getContext('2d');
        lineContext.fillStyle = '#ffffff' // White
        lineContext.fillRect(0, 0, lineCanvas.width, lineCanvas.height);

        const lineTexture = new THREE.CanvasTexture(lineCanvas);
        const lineMaterial = new THREE.SpriteMaterial({
            map: lineTexture,
            transparent: true,
            opacity: 0.5,
        });

        const mainLine = new THREE.Sprite(lineMaterial);
        mainLine.scale.set(3.1, 0.01, 1);
        mainLine.position.set(0, 0, 0);
        timelineGroup.add(mainLine);

        // Year to x position ratio
        const startYear = 2023;
        const endYear = 2032;
        const timelineStartX = -1.5;
        const timelineEndX = 1.5;

        // Function to map year to x position
        const yearToX = (year, month) => {
            const totalMonths = (year - startYear) * 12 + month;
            const totalDurationMonths = (endYear - startYear) * 12;
            const fraction = totalMonths / totalDurationMonths;
            return timelineStartX + fraction * (timelineEndX - timelineStartX);
        };

        // Create line and label for each phase
        phases.forEach((phase, index) => {
            const phaseLinePosition = yearToX(phase.phaseYear, phase.phaseMonth);
            const phaseLineHeight = phase.phaseLineHeight === 'long' ? 0.45 : 0.3;

            // Create line for phase
            const phaseLineCanvas = document.createElement('canvas');
            phaseLineCanvas.width = 4;
            phaseLineCanvas.height = 256;
            const phaseLineContext = phaseLineCanvas.getContext('2d');
            phaseLineContext.fillStyle = '#ffffff' // White
            phaseLineContext.fillRect(0, 0, phaseLineCanvas.width, phaseLineCanvas.height);

            const phaseLineTexture = new THREE.CanvasTexture(phaseLineCanvas);
            const phaseLineMaterial = new THREE.SpriteMaterial({
                map: phaseLineTexture,
                transparent: true,
                opacity: index === 0 ? 1.0 : 0.5,
            });

            const phaseLine = new THREE.Sprite(phaseLineMaterial);
            phaseLine.scale.set(0.01, phaseLineHeight, 1);
            phaseLine.position.set(phaseLinePosition, -0.05 - (phaseLineHeight / 2), 0);
            timelineGroup.add(phaseLine);

            // Create label for phase
            const phaseLabelDiv = document.createElement('div');
            phaseLabelDiv.className = 'label';
            phaseLabelDiv.textContent = phase.phaseLabel;
            phaseLabelDiv.style.color = 'white';
            phaseLabelDiv.style.opacity = index === 0 ? '1.0' : '0.5'
            phaseLabelDiv.style.fontSize = '14px';
            phaseLabelDiv.style.pointerEvents = 'none';

            const phaseLabel = new CSS2DObject(phaseLabelDiv);
            phaseLabel.position.set(phaseLinePosition, phaseLine.position.y - (phaseLineHeight / 2) + -0.075, 0);
            phaseLabel.visible = false;
            timelineGroup.add(phaseLabel);

            // Store checkpoint references
            this._phases.push({
                phaseLabel: phaseLabel,
                phaseLine: phaseLine,
                phaseId: phase.phaseId,
            });
        });

        // Create label for orbit section of timeline
        const orbitsLabelDiv = document.createElement('div');
        orbitsLabelDiv.className = 'label';
        orbitsLabelDiv.textContent = 'O R B I T S';
        orbitsLabelDiv.style.color = 'white';
        orbitsLabelDiv.style.opacity = '0.5';
        orbitsLabelDiv.style.fontSize = '12px';
        orbitsLabelDiv.style.pointerEvents = 'none';

        const orbitsLabel = new CSS2DObject(orbitsLabelDiv);
        orbitsLabel.position.set(1.05, -0.8, 0);
        orbitsLabel.visible = false;
        timelineGroup.add(orbitsLabel);

        // Create labels for years
        const numberOfYears = endYear - startYear + 1;
        const years = [];
        for (let i = 0; i < numberOfYears; i++) {
            const year = startYear + i;
            const x = yearToX(year, 0);
            years.push({
                year: year.toString(),
                x: x,
            });
        }

        years.forEach((yearData) => {
            const yearLabelDiv = document.createElement('div');
            yearLabelDiv.className = 'label';
            yearLabelDiv.textContent = yearData.year;
            yearLabelDiv.style.color = 'white';
            yearLabelDiv.style.opacity = '0.5';
            yearLabelDiv.style.fontSize = '11px';
            yearLabelDiv.style.pointerEvents = 'none';

            const yearLabel = new CSS2DObject(yearLabelDiv);
            yearLabel.position.set(yearData.x, 0.1, 0);
            yearLabel.visible = false;
            timelineGroup.add(yearLabel);
        });

        // Current position marker based on current date
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();
        const xPosition = yearToX(currentYear, currentMonth);

        const triangleShape = new THREE.Shape();
        triangleShape.moveTo(0, 0);
        triangleShape.lineTo(-0.05, -0.15);
        triangleShape.lineTo(0.05, -0.15);
        triangleShape.closePath();

        const geometry = new THREE.ShapeGeometry(triangleShape);
        const material = new THREE.MeshBasicMaterial({
            color: 'white',
            transparent: true,
            opacity: 1.0
        });
        const triangle = new THREE.Mesh(geometry, material);
        triangle.position.set(xPosition, -0.02, 0);

        timelineGroup.add(triangle);
    }

    _createInstructions() {
        // Create instructions group
        const instructionsGroup = new THREE.Group();
        instructionsGroup.visible = false;
        this._instructionsGroup = instructionsGroup;
        this._camera.add(instructionsGroup);
        instructionsGroup.position.set(-1.1, 22, -40);

        // Create instructions label
        const instructionsLabelDiv = document.createElement('div');
        instructionsLabelDiv.className = 'label';
        instructionsLabelDiv.textContent = 'Click on a circle to interact with that instrument.';
        instructionsLabelDiv.style.color = 'white';
        instructionsLabelDiv.style.opacity = '0.5';
        //instructionsLabelDiv.style.fontSize = '12px';
        instructionsLabelDiv.style.fontSize = '14px';
        instructionsLabelDiv.style.pointerEvents = 'none';

        const instructionsLabel = new CSS2DObject(instructionsLabelDiv);
        instructionsLabel.position.set(1.05, -0.8, 0);
        instructionsLabel.visible = false;
        instructionsGroup.add(instructionsLabel);
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

            // Enable shadow casting
            model.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = false;
                }
            });

            // Define phases for the timeline
            const phases = [
                { phaseLabel: 'Launch', phaseId: 'launch0', phaseYear: 2023, phaseMonth: 9, phaseLineHeight: 'long' },
                { phaseLabel: 'Launch', phaseId: 'launch1', phaseYear: 2023, phaseMonth: 9, phaseLineHeight: 'long' },
                { phaseLabel: 'Gravity Assist', phaseId: 'assist0', phaseYear: 2026, phaseMonth: 3, phaseLineHeight: 'short' },
                { phaseLabel: 'Gravity Assist', phaseId: 'assist1', phaseYear: 2026, phaseMonth: 3, phaseLineHeight: 'short' },
                { phaseLabel: 'A', phaseId: 'a0', phaseYear: 2029, phaseMonth: 7, phaseLineHeight: 'short' },
                { phaseLabel: 'A', phaseId: 'a1', phaseYear: 2029, phaseMonth: 7, phaseLineHeight: 'short' },
                { phaseLabel: 'B1', phaseId: 'b10', phaseYear: 2029, phaseMonth: 9, phaseLineHeight: 'long' },
                { phaseLabel: 'B1', phaseId: 'b11', phaseYear: 2029, phaseMonth: 9, phaseLineHeight: 'long' },
                { phaseLabel: 'D', phaseId: 'd0', phaseYear: 2030, phaseMonth: 4, phaseLineHeight: 'short' },
                { phaseLabel: 'D', phaseId: 'd1', phaseYear: 2030, phaseMonth: 4, phaseLineHeight: 'short' },
                { phaseLabel: 'C', phaseId: 'c0', phaseYear: 2031, phaseMonth: 0, phaseLineHeight: 'short' },
                { phaseLabel: 'C', phaseId: 'c1', phaseYear: 2031, phaseMonth: 0, phaseLineHeight: 'short' },
                { phaseLabel: 'B2', phaseId: 'b20', phaseYear: 2031, phaseMonth: 4, phaseLineHeight: 'long' },
                { phaseLabel: 'B2', phaseId: 'b21', phaseYear: 2031, phaseMonth: 4, phaseLineHeight: 'long' },
                { phaseLabel: 'End', phaseId: 'end0', phaseYear: 2031, phaseMonth: 10, phaseLineHeight: 'short' },
                { phaseLabel: 'End', phaseId: 'end1', phaseYear: 2031, phaseMonth: 10, phaseLineHeight: 'short' },
            ];

            // Create timeline with phases
            this._createTimeline(phases);
            this._createInstructions();

            // Create bubble and push to bubble list
            this._bubbles.push(this._createBubble(model, 'Gamma Ray and Neutron Spectrometer', 'spectrometer', -2, -3, 3.5));
            this._bubbles.push(this._createBubble(model, 'X-Band High Gain Antenna', 'antenna', -3.75, 0, 2.75));
            this._bubbles.push(this._createBubble(model, 'Multispectral Imager', 'imager', -0.5, -2.5, -0.6));
            this._bubbles.push(this._createBubble(model, 'Deep Space Optical Communication', 'communication', -0.5, 3.5, -0.6));
            this._bubbles.push(this._createBubble(model, 'Magnetometer', 'detection', -4.75, -3, 1));

            // Store clickable objects
            this._clickableObjects = this._bubbles.slice();
            this._threejs.domElement.addEventListener('click', this._onClick.bind(this), false);
            this._threejs.domElement.addEventListener('touchstart', this._onTouchStart.bind(this), false);

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
            this._RAF();

            // // Simple model rotation
            // if (this._model) {
            //     this._model.rotation.y += 0.0002;
            // }

            // Update controls rotation
            this._controls.update();

            // Render the scene and the labels
            this._threejs.render(this._scene, this._camera);
            this._labelRenderer.render(this._scene, this._camera);
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

    _showTimeline() {
        if (this._timelineGroup) {
            this._timelineGroup.visible = true;
            this._timelineGroup.traverse((child) => {
                if (child instanceof CSS2DObject) {
                    child.visible = true;
                }
            });
        }
    }

    _hideTimeline() {
        if (this._timelineGroup) {
            this._timelineGroup.visible = false;
            this._timelineGroup.traverse((child) => {
                if (child instanceof CSS2DObject) {
                    child.visible = false;
                }
            });
        }
    }

    _showInstructions() {
        if (this._instructionsGroup) {
            this._instructionsGroup.visible = true;
            this._instructionsGroup.traverse((child) => {
                if (child instanceof CSS2DObject) {
                    child.visible = true;
                }
            });
        }
    }

    _hideInstructions() {
        if (this._instructionsGroup) {
            this._instructionsGroup.visible = false;
            this._instructionsGroup.traverse((child) => {
                if (child instanceof CSS2DObject) {
                    child.visible = false;
                }
            });
        }
    }

    _updatePhaseSelection() {
        this._phases.forEach((phase, index) => {
            const isSelected = index === this._currentPhaseIndex;
            const opacity = isSelected ? 1.0 : 0.5;
            phase.phaseLine.material.opacity = opacity;
            phase.phaseLabel.element.style.opacity = opacity.toString();
        });
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
                parent.playOpenSound();
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
        if (this._mainState === 'instrument') {
            event.preventDefault();

            const rect = this._threejs.domElement.getBoundingClientRect();
            const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            const mouseVector = new THREE.Vector2(mouseX, mouseY);

            this._performRaycast(mouseVector);
        }
    }

    // Handle taps then do raycast
    _onTouchStart(event) {
        if (this._mainState === 'instrument') {
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
}
