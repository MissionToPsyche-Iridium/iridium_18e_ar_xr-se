/*
* skybox module
 */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/GLTFLoader.js';

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
        document.body.appendChild(this._threejs.domElement);

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
        this._camera.position.set(0, 5, 15); // Set initial camera position for better view of the satellite
    }

    // private method for setting up the scene
    _Scene() {
        this._scene = new THREE.Scene();
    }

    // private method for lighting
    _Lighting() {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.0); // Increase intensity
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
        controls.target.set(0, 5, 0); // Center the controls on the satellite
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
            const model = gltf.scene;
            model.scale.set(0.25, 0.25, 0.25); // Set model scale
            model.position.set(0, 4, 0); // center model
            this._scene.add(model); // Add model to scene

            // Basic rotation animation
            const animate = () => {
                requestAnimationFrame(animate);
                model.rotation.y += 0.01; // Rotate the model
                this._threejs.render(this._scene, this._camera);
            };
            animate();
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
    }

    _RAF() {
        requestAnimationFrame(() => {
            this._threejs.render(this._scene, this._camera);
            this._RAF();
        });
    }
}

let _APP = null;

window.addEventListener('DOMContentLoaded', () => {
    _APP = new SpaceSkybox();
});

// Ensure DOM content has loaded
document.addEventListener("DOMContentLoaded", function() {
    // Help modal elements
    var helpModal = document.getElementById("help-modal");
    var helpModalContent = document.getElementById("help-modal-content");

    // Settings modal elements
    var settingsModal = document.getElementById("settings-modal");
    var settingsModalContent = document.getElementById("settings-modal-content");

    // Inject the help modal content
    function openHelpModal() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "help_page.html", true);
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
        openHelpModal();
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
                openHelpModal();
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

    // Inject the settings modal content
    function openSettingsModal() {
        var xhr = new XMLHttpRequest();
        xhr.open("GET", "settings_page.html", true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState == 4 && xhr.status == 200) {
                settingsModalContent.innerHTML = xhr.responseText;
                settingsModal.style.display = "flex";
            }
        };
        xhr.send();
    }

    // Settings icon button
    var settingsIconButton = document.getElementById("settings-icon-button");
    settingsIconButton.addEventListener("click", function() {
        openSettingsModal();
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

    // Setup Three.js canvas
    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas').appendChild(renderer.domElement);

    // Basic black background
    renderer.setClearColor(0x000000);

    // Basic light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Basic directional light
    var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Model loader
    var loader = new THREE.GLTFLoader();

    // Load satellite model
    loader.load('../assets/models/satellite_light.glb', function (gltf) {
        var model = gltf.scene;
        //model.position.set(0, 0, 0);
        // model.position.x = -15;
        model.scale.set(0.25, 0.25, 0.25); // Set model scale
        scene.add(model); // Add model to scene

        // Offset camera from model
        camera.position.z = 5;

        // Basic rotation animation
        function animate() {
            requestAnimationFrame(animate);
            model.rotation.x += 0.002;
            renderer.render(scene, camera);
        }
        animate();

        // Log error to console
    }, undefined, function(error) {
        console.error(error);
    });

    // Loading screen
    let loading = document.getElementById("loading-container");

    setTimeout(function() {
        loading.style.opacity = 0;
        setTimeout(function() {
            loading.style.display = "none";
        }, 3000);
    }, 2000);

    // initial distance for zooming in and out
    let initialDistance = null;

    // swipe/mouse movement variables
    let radius = camera.position.length();
    let azimuth = 0;
    let elevation = 0;
    camera.lookAt(0, 0, 0);
    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };
    const dragSpeed = 0.005;

    // Calculate distance for zooming in and out
    function getDistance(touches) {
        const dx = touches[0].pageX - touches[1].pageX;
        const dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Start of Zooming in and out with phone
    window.addEventListener('touchstart', (event) => {
        if (event.touches.length === 2) {
            initialDistance = getDistance(event.touches);
        } else {
            isDragging = true;
            previousTouch.x = event.touches[0].clientX;  // Store the initial touch position
            previousTouch.y = event.touches[0].clientY;
        }
    });

    // Coninuously update zooming in and out when on phone
    window.addEventListener('touchmove', (event) => {
        if (event.touches.length === 2 && initialDistance !== null) {
            const currDistance = getDistance(event.touches);
            const speed = 0.01;
            if (currDistance > initialDistance) {
                camera.zoom += speed;
            } else {
                camera.zoom -= speed;
            }
            camera.zoom = THREE.MathUtils.clamp(camera.zoom, 0.5, 5);
            camera.updateProjectionMatrix();
            initialDistance = currDistance;
        } else {
            if (!isDragging) return;

            const deltaX = event.touches[0].clientX - previousTouch.x;
            const deltaY = event.touches[0].clientY - previousTouch.y;

            azimuth += deltaX * 0.005;
            elevation -= deltaY * 0.005;
            elevation = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, elevation));
            updateCameraPosition();

            // Update the previous touch position for the next move event
            previousTouch.x = event.touches[0].clientX;
            previousTouch.y = event.touches[0].clientY;
        }
    });

    // After zooming in and out reset initial distance
    window.addEventListener('touchend', () => {
        if (event.touches.length === 2 && initialDistance !== null) {
            initialDistance = null;
        } else {
            isDragging = false;
        }
    });

    // Zooming in and out with a mouse
    window.addEventListener('wheel', (event) => {
        const speed = 0.1;
        camera.zoom += event.deltaY * speed * -0.01;
        camera.zoom = THREE.MathUtils.clamp(camera.zoom, 0.5, 5);
        camera.updateProjectionMatrix();
    });

    // Update the camera position based on azimuth and elevation
    function updateCameraPosition() {
        radius = camera.position.length();
        camera.position.x = radius * Math.cos(elevation) * Math.sin(azimuth);
        camera.position.y = radius * Math.sin(elevation);
        camera.position.z = radius * Math.cos(elevation) * Math.cos(azimuth);
        camera.lookAt(0, 0, 0);
    }

    // when mouse clicks
    function onMouseDown(event) {
        isDragging = true;
    }

    // when mouse stops clicks
    function onMouseUp(event) {
        isDragging = false;
    }

    // during mouse click
    function onMouseMove(event) {
        if (!isDragging) return;
        let deltaMove = {
            x: event.movementX || event.mozMovementX || event.webkitMovementX || 0,
            y: event.movementY || event.mozMovementY || event.webkitMovementY || 0
        };

        // Adjust the left/right/up/down movement
        azimuth -= deltaMove.x * dragSpeed;
        elevation -= deltaMove.y * dragSpeed;

        // Clamp elevation so the camera doesn't flip upside down
        const maxElevation = Math.PI / 2 - 0.1;
        const minElevation = -Math.PI / 2 + 0.1;
        elevation = Math.max(minElevation, Math.min(maxElevation, elevation));

        updateCameraPosition();
    }

    document.addEventListener('mousedown', onMouseDown, false);
    document.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('mousemove', onMouseMove, false);

    // Update canvas when window resizes
    window.addEventListener('resize', function() {
        // Set new renderer dimensions
        var width = window.innerWidth;
        var height = window.innerHeight;
        renderer.setSize(width, height);

        // Update camera
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });
});
