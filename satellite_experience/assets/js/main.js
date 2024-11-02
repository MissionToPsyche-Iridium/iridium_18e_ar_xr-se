/*
 * skybox module
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DRenderer, CSS2DObject } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/renderers/CSS2DRenderer.js';

class SpaceSkybox {
    constructor() {
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
        controls.minDistance = 1;
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
                opacity: 0.7,
            });
            const bubble = new THREE.Sprite(bubbleMaterial);
            bubble.scale.set(2, 2, 2); // Set bubble scale
            // bubble.scale.set(2, 2.25, 2); // Set bubble scale
            bubble.position.set(-2, -2, 4.5); // Set bubble position
            model.add(bubble); // Attach bubble to model

            // Create bubble label
            const bubbleLabelDiv = document.createElement('div');
            bubbleLabelDiv.className = 'label';
            bubbleLabelDiv.textContent = 'Gamma Ray and Neutron Spectrometer';
            bubbleLabelDiv.style.color = 'white';
            bubbleLabelDiv.style.opacity = '0.7';
            bubbleLabelDiv.style.fontSize = '14px';
            bubbleLabelDiv.style.maxWidth = '200px';
            bubbleLabelDiv.style.textAlign = 'center';
            const bubbleLabel = new CSS2DObject(bubbleLabelDiv);
            bubbleLabel.position.set(0, -1, 0);
            bubble.add(bubbleLabel)

            // Store references for model
            this._model = model;
            this._sprite = bubble;

            // Store clickable objects
            this._clickableObjects = [];
            this._clickableObjects.push(bubble);
            this._threejs.domElement.addEventListener('click', this._onClick.bind(this), false);

            // Basic rotation animation
            const animate = () => {
                requestAnimationFrame(animate);
                model.rotation.y += 0.001; // Rotate the model
                this._threejs.render(this._scene, this._camera);
            };
            animate();
        }, function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            // Log error to console
        }, undefined, (error) => {
            console.error('Error loading model:', error);
        });
    }

    // private method for loading screen
    _LoadingScreen() {
        let loading = document.getElementById("loading-container");

        setTimeout(function() {
            loading.style.opacity = 0;
            setTimeout(function() {
                loading.style.display = "none";
            }, 3000);
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

    _onClick(event) {
        event.preventDefault();
    
        const rect = this._threejs.domElement.getBoundingClientRect();
        const mouse = new THREE.Vector2(
            ((event.clientX - rect.left) / rect.width) * 2 - 1,
            -((event.clientY - rect.top) / rect.height) * 2 + 1
        );
    
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, this._camera);
    
        const intersects = raycaster.intersectObjects(this._clickableObjects, true);
    
        if (intersects.length > 0) {
            console.log('Bubble clicked!');
        }
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new SpaceSkybox();
});

// Ensure DOM content has loaded
document.addEventListener("DOMContentLoaded", function() {
    // Handle main state
    let currentMainState = 'main';
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
    function updateCurrentMainState(nextMainState) {
        currentMainState = nextMainState;

        // Load main page content
        if (currentMainState === 'main') {
            loadMainContent('main_content.html');
            upperButton.textContent = 'Explore Mission';
            lowerButton.textContent = 'Explore Instruments';
        // Load mission page content
        } else if (currentMainState === 'mission') {
            loadMainContent('mission_content.html');
            upperButton.textContent = 'Back to Main';
            lowerButton.textContent = 'Explore Instruments';
        // Load instrument page content
        } else if (currentMainState === 'instrument') {
            loadMainContent('instrument_content.html');
            upperButton.textContent = 'Back to Main';
            lowerButton.textContent = 'Explore Mission';
        }
    }

    // Navigation button event listeners
    upperButton.addEventListener('click', () => {
        // Main -> Mission
        if (currentMainState === 'main') {
            updateCurrentMainState('mission');
        // Mission -> Main
        } else if (currentMainState === 'mission') {
            updateCurrentMainState('main');
        // Instrument -> Main
        } else if (currentMainState === 'instrument') {
            updateCurrentMainState('main');
        }
    });

    lowerButton.addEventListener('click', () => {
        // Main -> Instrument
        if (currentMainState === 'main') {
            updateCurrentMainState('instrument');
        // Mission -> Instrument
        } else if (currentMainState === 'mission') {
            updateCurrentMainState('instrument');
        // Instrument -> Mission
        } else if (currentMainState === 'instrument') {
            updateCurrentMainState('mission');
        }
    });

    // Initialize to main state
    updateCurrentMainState('main');

    // Help modal elements
    var helpModal = document.getElementById("help-modal");
    var helpModalContent = document.getElementById("help-modal-content");

    // Settings modal elements
    var settingsModal = document.getElementById("settings-modal");
    var settingsModalContent = document.getElementById("settings-modal-content");

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

    // Close the help modal if clicking out
    window.onclick = function(event) {
        if (event.target == helpModal) {
            helpModal.style.display = "none";
        }
    };

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

    // Close the settings modal if clicking out
    window.onclick = function(event) {
        if (event.target == settingsModal) {
            settingsModal.style.display = "none";
        }
    };

    // // Setup Three.js canvas
    // var scene = new THREE.Scene();
    // var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    // var renderer = new THREE.WebGLRenderer({ antialias: true });
    // renderer.setSize(window.innerWidth, window.innerHeight);
    // // document.getElementById('canvas').appendChild(renderer.domElement);

    // // Basic black background
    // renderer.setClearColor(0x000000);

    // // Basic light
    // var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    // scene.add(ambientLight);

    // // Model loader
    // var loader = new GLTFLoader();

    // // Load satellite model
    // loader.load('../assets/models/satellite.glb', function(gltf) {
    //     var model = gltf.scene;
    //     model.scale.set(0.25, 0.25, 0.25); // Set model scale
    //     scene.add(model); // Add model to scene

    //     // Offset camera from model
    //     camera.position.z = 5;

    //     // Basic rotation animation
    //     function animate() {
    //         requestAnimationFrame(animate);
    //         model.rotation.x += 0.002;
    //         renderer.render(scene, camera);
    //     }
    //     animate();

    //     // Log error to console
    // }, undefined, function(error) {
    //     console.error(error);
    // });

    // // Loading screen
    // let loading = document.getElementById("loading-container");

    // setTimeout(function() {
    //     loading.style.opacity = 0;
    //     setTimeout(function() {
    //         loading.style.display = "none";
    //     }, 3000);
    // }, 2000);

    // // Update canvas when window resizes
    // window.addEventListener('resize', function() {
    //     // Set new renderer dimensions
    //     var width = window.innerWidth;
    //     var height = window.innerHeight;
    //     renderer.setSize(width, height);

    //     // Update camera
    //     camera.aspect = width / height;
    //     camera.updateProjectionMatrix();
    // });
});
