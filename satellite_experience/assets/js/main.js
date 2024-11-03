/*
 * skybox module
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/renderers/CSS2DRenderer.js';

class SpaceSkybox {
    constructor(options = {}) {
        this._bubbles = [];
        this._updateInstrumentContent = options.updateInstrumentContent;
        this._Initialize();
    }

    // private method for initialization of skybox scene and model
    _Initialize() {
        this._threejs = new THREE.WebGLRenderer({ antialias: true });
        this._threejs.shadowMap.enabled = true;
        this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
        this._threejs.setPixelRatio(window.devicePixelRatio);
        this._threejs.setSize(window.innerWidth, window.innerHeight);

        this._labelRenderer = new CSS2DRenderer();
        this._labelRenderer.setSize(window.innerWidth, window.innerHeight);
        this._labelRenderer.domElement.style.position = 'absolute';
        this._labelRenderer.domElement.style.top = '0px';
        this._labelRenderer.domElement.style.pointerEvents = 'none'; // Allows clicks to pass through
        document.body.appendChild(this._labelRenderer.domElement);

        // document.body.appendChild(this._threejs.domElement);
        document.getElementById("scene").appendChild(this._threejs.domElement);

        window.addEventListener('resize', () => this._OnWindowResize(), false);

        this._LoadingScreen();
        this._Camera();
        this._Scene();
        this._Lighting();
        this._Controls();
        this._Skybox();
        this._Satellite();

        this._RAF();
    }

    // private method for setting up the camera
    _Camera() {
        const fov = 60;
        const aspect = window.innerWidth / window.innerHeight;
        const near = 1.0;
        const far = 1000.0;
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        this._camera.position.set(0, 0, 10); // Set initial camera position for better view of the satellite
    }

    // private method for setting up the scene
    _Scene() {
        this._scene = new THREE.Scene();
    }

    // private method for lighting
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

    // private method
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

    // private method
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

    // private method to create a cube on the skybox
    // for testing purposes
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

    // private method to load satellite model into skybox
    _Satellite() {
        const loader = new GLTFLoader();
        loader.load('../assets/models/satellite_light.glb', (gltf) => {
            // Configure model
            const model = gltf.scene;
            model.scale.set(0.25, 0.25, 0.25); // Set model scale
            model.position.set(0, 0, 0); // Set model position
            this._scene.add(model); // Add model to scene
            this._model = model;
    
            // Create bubble
            this._bubbles.push(this._createBubble(model, 'Gamma Ray and Neutron Spectrometer', 'spectrometer', -2, -2, 4.5));
            this._bubbles.push(this._createBubble(model, 'X-Band High Gain Antenna', 'antenna', 1, 0, 4));
            this._bubbles.push(this._createBubble(model, 'Multispectral Imager', 'imager', -3, 0, 0));
            this._bubbles.push(this._createBubble(model, 'Deepspace Optical Communication', 'communication', 3, 0, -2));
            this._bubbles.push(this._createBubble(model, '2', 'test', -2, 2, 4.5));

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

    // private method for loading screen
    _LoadingScreen() {
        let loading = document.getElementById("loading-container");

        setTimeout(function() {
            loading.style.opacity = 0;
            setTimeout(function() {
                loading.style.display = "none";
            }, 500);
        }, 2000);
    }

    _OnWindowResize() {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._threejs.setSize(window.innerWidth, window.innerHeight);
        this._labelRenderer.setSize(window.innerWidth, window.innerHeight);
    }

    _RAF() {
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            this._labelRenderer.render(this._scene, this._camera);
            this._RAF();
        });
    }

    // Public method to change scene based on main state
    updateBubbles(newMainState) {
        console.log('Updating Bubble State to:', newMainState);
        if (newMainState === 'instrument') {
            this._showBubbles();
        } else {
            this._hideBubbles();
        }
    }

    // Private method to make bubbles visible
    _showBubbles() {
        if (this._bubbles) {
            this._bubbles.forEach(bubble => {
                bubble.visible = true;
                bubble.bubbleLabel.visible = true;
                bubble.bubbleProgressLabel.visible = true;
            });
        }
    }

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

    // Private method to make bubbles invisible
    _hideBubbles() {
        if (this._bubbles) {
            this._bubbles.forEach(bubble => {
                bubble.visible = false;
                bubble.bubbleLabel.visible = false;
                bubble.bubbleProgressLabel.visible = false;
            });
        }
    }

    // Private function to check for intersections at position
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
                    } else {
                        // Unselected bubbles
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

    // Private method to handle clicks
    _onClick(event) {
        event.preventDefault();
    
        const rect = this._threejs.domElement.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        const mouseVector = new THREE.Vector2(mouseX, mouseY);
    
        this._performRaycast(mouseVector);
    }

    // Private method to handle touches
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

let _APP = null;
let mainState = 'main';

// Ensure DOM content has loaded
window.addEventListener("DOMContentLoaded", function() {
    // Initialize _APP here
    _APP = new SpaceSkybox({
        updateInstrumentContent: updateInstrumentContent
    });

    ///////////////////////////////////////////////////////////////
    // MAIN STATE
    ///////////////////////////////////////////////////////////////

    // Handle main state
    const mainContent = document.getElementById('main-content');
    const upperButton = document.getElementById('upper-button');
    const lowerButton = document.getElementById('lower-button');

    // Function to load content from a page to main
    function loadMainContent(page) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', page, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                mainContent.innerHTML = xhr.responseText;
            }
        };
        xhr.send();
    }

    // Function to update the UI based on the current state
    function updateMainState(newMainState) {
        mainState = newMainState; // Update state

        // Hide main content when first entering instrument page
        if (mainState === 'instrument') {
            mainContent.style.display = 'none';
        }

        // Load main page content
        if (mainState === 'main') {
            loadMainContent('main_content.html');
            upperButton.textContent = 'Explore Mission';
            lowerButton.textContent = 'Explore Instruments';
        // Load mission page content
        } else if (mainState === 'mission') {
            loadMainContent('mission_content.html');
            upperButton.textContent = 'Back to Main';
            lowerButton.textContent = 'Explore Instruments';
        // Load instrument page content
        } else if (mainState === 'instrument') {
            loadMainContent('instrument_content.html');
            upperButton.textContent = 'Back to Main';
            lowerButton.textContent = 'Explore Mission';
        }

        // Show main content when in a non instrument page
        if (mainState !== 'instrument') {
            _APP.deselectBubbles();
            mainContent.style.display = 'block';
        }

        // Update bubble visibility based on state
        if (_APP) {
            _APP.updateBubbles(mainState);
        }
    }

    // Navigation button event listeners
    upperButton.addEventListener('click', () => {
        // Main -> Mission
        if (mainState === 'main') {
            updateMainState('mission');
        // Mission -> Main
        } else if (mainState === 'mission') {
            updateMainState('main');
        // Instrument -> Main
        } else if (mainState === 'instrument') {
            updateMainState('main');
        }
    });

    lowerButton.addEventListener('click', () => {
        // Main -> Instrument
        if (mainState === 'main') {
            updateMainState('instrument');
        // Mission -> Instrument
        } else if (mainState === 'mission') {
            updateMainState('instrument');
        // Instrument -> Mission
        } else if (mainState === 'instrument') {
            updateMainState('mission');
        }
    });

    function updateInstrumentContent(id) {
        const instrumentTitleMap = {
            'spectrometer': 'Gamma Ray and Neutron Spectrometer',
            'antenna': 'X-Band High Gain Antenna',
            'imager': 'Multispectral Imager',
            'communication': 'Deepspace Optical Communication',
            'test': 'Test',
        };

        const instrumentDescriptionMap = {
            'spectrometer': 'Detects gamma rays and neutrons that are emitted when cosmic rays interact with atoms. Measuring these emissions will identify the composition of the asteroid without direct sampling.',
            'antenna': 'Enables high-speed communication with Earth. The dish shaped antenna is aimed precisely at earth and transmits images and telemetry using X-Band frequency across the vastness of space.',
            'imager': 'Provides high-resolution images using filters to discriminate between Psyche’s metallic and silicate constituents. The instrument consists of a pair of identical cameras designed to acquire geologic, compositional, and topographic data.',
            'communication': 'A sophisticated new laser communication technology that encodes data in photons (rather than radio waves) to communicate between a probe in deep space and Earth. Using light instead of radio allows the spacecraft to communicate more data in a given amount of time.',
            'test': 'Description here.',
        }

        const instrumentImageMap = {
            'spectrometer': '../assets/images/spectrometers.png',
            'antenna': '../assets/images/antenna.png',
            'imager': '../assets/images/instruments/multispectral_imager.jpg',
            'communication': '../assets/images/instruments/psyche-dsoc.jpg',
            'test': '',
        };
    
        const instrumentTitle = instrumentTitleMap[id] || 'No Title';
        const instrumentDescription = instrumentDescriptionMap[id] || 'No description.';
        const instrumentImage = instrumentImageMap[id] || '';
    
        const instrumentTitleContent = document.getElementById('instrument-title');
        const instrumentDescriptionContent = document.getElementById('instrument-description');
        const instrumentImageContent = document.getElementById('instrument-image');
        if (instrumentTitleContent && instrumentDescriptionContent && instrumentImageContent) {
            instrumentTitleContent.textContent = instrumentTitle;
            instrumentDescriptionContent.textContent = instrumentDescription;
    
            if (instrumentImage) {
                instrumentImageContent.src = instrumentImage;
                instrumentImageContent.alt = instrumentTitle;
                instrumentImageContent.style.display = 'block'; // Show the image
            } else {
                instrumentImageContent.src = '';
                instrumentImageContent.alt = '';
                instrumentImageContent.style.display = 'none'; // Hide the image if none
            }

            mainContent.style.display = 'block';
        } else {
            console.error('Instrument content elements not found.');
        }
    }

    document.addEventListener('click', function(event) {
        if (mainState === 'instrument') {
            const instrumentContentCloseButton = document.getElementById('instrument-modal-close');
            if (event.target === instrumentContentCloseButton) {
                mainContent.style.display = 'none';
                _APP.deselectBubbles();
            }
        }
    });

    // Initialize to main state
    updateMainState('main');

    ///////////////////////////////////////////////////////////////
    // HELP
    ///////////////////////////////////////////////////////////////

    // Help modal elements
    var helpModal = document.getElementById("help-modal");
    var helpModalContent = document.getElementById("help-modal-content");

    // Inject the help modal content
    function loadHelpModalContent() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "help_modal.html", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                helpModalContent.innerHTML = xhr.responseText;
                helpModal.style.display = "flex";
            }
        };
        xhr.send();
    }

    // Help icon button
    var helpIconButton = document.getElementById("help-icon-button");
    helpIconButton.addEventListener("click", function() {
        loadHelpModalContent();
    });

    // Close the help modal
    var helpModalCloseButton = document.getElementById("help-modal-close");
    helpModalCloseButton.addEventListener("click", function() {
        helpModal.style.display = "none";
    });

    // Track user activity
    var inactivityTime = 60000; // 60 second timer
    var inactivityTimer;

    // Open help modal if timer reaches inactivity time
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function() {
            // Check that settings page isn't open
            if (settingsModal.style.display !== "flex") {
                loadHelpModalContent();
            }
        }, inactivityTime)
    }

    // Events to reset the inactivity time i.e. user interaction
    window.addEventListener('mousemove', resetInactivityTimer);
    window.addEventListener('keydown', resetInactivityTimer);
    window.addEventListener('click', resetInactivityTimer);
    window.addEventListener('touchstart', resetInactivityTimer);
    window.addEventListener('scroll', resetInactivityTimer);

    // Initialize inactivity timer
    resetInactivityTimer();

    // for keeping the theme setting persistent
    var themeLink = "../assets/css/styles.css";

    ///////////////////////////////////////////////////////////////
    // SETTINGS
    ///////////////////////////////////////////////////////////////

    // Settings modal elements
    var settingsModal = document.getElementById("settings-modal");
    var settingsModalContent = document.getElementById("settings-modal-content");

    // Inject the settings modal content
    function loadSettingsModalContent() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "settings_modal.html", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                settingsModalContent.innerHTML = xhr.responseText;
                settingsModal.style.display = "flex";

                const settingThemeLink = document.getElementById("setting-theme");
                const radioSetting = document.querySelectorAll('input[name="setting"]');
                settingThemeLink.href = themeLink;

                /*  TODO - make it so it saves state of radio button
                if (radioSetting) {
                    if (themeLink == "../assets/css/styles.css") {
                        document.getElementById('input[name="setting"][value="default-mode"]').checked = true;
                    } else if (themeLink == "../assets/css/light_mode.css") {
                        document.getElementById('input[name="setting"][value="light-mode"]').checked = true;
                    } else if (themeLink == "../assets/styles.css") {
                        // TODO
                    } else if (themeLink == "../assets/styles.css") {
                        // TODO
                    }
                } */

                if (radioSetting.length === 0) {
                    console.log("No radio buttons found with the name 'theme'.");
                }
                radioSetting.forEach(radio => {
                    radio.addEventListener("change", function() {
                        if (document.getElementById('default-mode').checked) {
                            settingThemeLink.href = "../assets/css/styles.css"
                            themeLink = "../assets/css/styles.css"
                        } else if (document.getElementById('high-contrast-mode').checked) {
                            // high contrast mode selected
                            settingThemeLink.href = "../assets/css/high_contrast_mode.css"
                            themeLink = "../assets/css/high_contrast_mode.css"
                        } else if (document.getElementById('light-mode').checked) {
                            settingThemeLink.href = "../assets/css/light_mode.css"
                            themeLink = "../assets/css/light_mode.css"
                        } else if (document.getElementById('color-blind-mode').checked) {
                            // color-blind mode selected
                            console.log("Color-blind Mode selected");
                        }
                    });
                });
            }
        };
        xhr.send();
    }

    // Settings icon button
    var settingsIconButton = document.getElementById("settings-icon-button");
    settingsIconButton.addEventListener("click", function() {
        loadSettingsModalContent();
    });

    // Close the settings modal
    var settingsModalCloseButton = document.getElementById("settings-modal-close");
    settingsModalCloseButton.addEventListener("click", function() {
        resetInactivityTimer(); // Reset activity timer so it doesn't pop up as soon as settings is closed
        settingsModal.style.display = "none";
    });

    // // General function to close when clicking out
    // window.onclick = function(event) {
    //     // Close Help Modal
    //     if (event.target == helpModal) {
    //         helpModal.style.display = "none";
    //     }
    
    //     // Close Settings Modal
    //     if (event.target == settingsModal) {
    //         settingsModal.style.display = "none";
    //     }
    
    //     // Close Instrument Content
    //     if (mainState === 'instrument') {
    //         if (event.target == mainContent) {
    //             mainContent.style.display = 'none';
    //             _APP.deselectBubbles();
    //         }
    //     }
    // };
});
