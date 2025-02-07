import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";
// import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js";
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

// Add a glowing metorite
const planetGeometry = new THREE.SphereGeometry(1, 32, 32);
const planetMaterial = new THREE.MeshStandardMaterial({
    color: 0x0088ff,
    emissive: 0x002244,
});
const planet = new THREE.Mesh(planetGeometry, planetMaterial);
planet.position.set(2, 0, -3);
scene.add(planet);

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

// Circle behavior
const scope = document.getElementById('scope');

const raycaster = new THREE.Raycaster();
function moveScope(event) {
    scope.style.left = `${event.clientX - scope.offsetWidth / 2}px`;
    scope.style.top = `${event.clientY - scope.offsetHeight / 2}px`;

    raycaster.setFromCamera(new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1), camera);
    const intersects = raycaster.intersectObject(planet);

    if (intersects.length > 0) {
        showAnnibale();
    }
    else {
        document.getElementById("annibale_modal").setAttribute("style", "display: 'none';");
        document.getElementById("annibale").setAttribute("style", "display: 'none';");
        document.getElementById("papyrus_double_sided").setAttribute("style", "display: 'none';");
        document.getElementById("scroll_text_box").setAttribute("style", "display: 'none';");
    }
}

let annibool = false;
function showAnnibale() {
    if (!annibool) {
        const annibale_div = document.createElement("div");
        annibale_div.setAttribute("id", "annibale_modal");
        annibale_div.setAttribute("style", "display: 'block'; position: fixed; z-index: 20; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 1);");

        let annibale_innerHTML = "";
        annibale_innerHTML += `<img src="../assets/images/annibale.jpg" id="annibale"/>
                               <img src="../assets/images/papyrus_scroll_double_sided.png" id="papyrus_double_sided"/>
                               <div id="scroll_text_box">
                                 <span class="info">On March 17, 1852, the Italian astronomer</span>
                                 <span class="info">Annibale de Gasparis discovered the 16th</span>
                                 <span class="info">asteroid in the main asteroid belt</span>
                                 <span class="info">between Mars and Jupiter.</span>
                                 <span class="info">De Gasparis named this asteroid Psyche.</span>
                               </div>`;
        annibale_div.innerHTML = annibale_innerHTML;
        document.body.appendChild(annibale_div);

        document.getElementById("annibale").setAttribute("style", "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh; border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh); left: calc(50vw - ((0.8 * 40vh + 10vh) / 2));");
        document.getElementById("papyrus_double_sided").setAttribute("style", "background-color: transparent; width: 40vh; height: 40vh; border-radius: 12px; position: absolute; top: 50vh; left: calc(50vw - (40vh / 2));");
        document.getElementById("scroll_text_box").setAttribute("style", "display: flex; flex-direction: column; position: absolute; width: 40vh; height: calc(40vh / 2); top: calc(50vh + ((40vh / 1.69) / 1.69)); left: calc(50vw - (40vh / 2));");
        var infos = document.getElementsByClassName("info");
        for (var i = 0; i < infos.length; i++) {
            infos[i].setAttribute("style", "text-align: center; font-size: calc(0.045 * 40vh); z-index: 21;");
        }
        annibool = true;
    }
    else {
        document.getElementById("annibale_modal").setAttribute("style", "display: 'block'; position: fixed; z-index: 20; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 1);");
        document.getElementById("annibale").setAttribute("style", "background-color: transparent; width: calc(0.8 * 40vh); height: 40vh; border-radius: 12px; padding: 5vh; position: absolute; top: calc(0.25 * 40vh); left: calc(50vw - ((0.8 * 40vh + 10vh) / 2));");
        document.getElementById("papyrus_double_sided").setAttribute("style", "background-color: transparent; width: 40vh; height: 40vh; border-radius: 12px; position: absolute; top: 50vh; left: calc(50vw - (40vh / 2));");
        document.getElementById("scroll_text_box").setAttribute("style", "display: flex; flex-direction: column; position: absolute; width: 40vh; height: calc(40vh / 2); top: calc(50vh + ((40vh / 1.69) / 1.69)); left: calc(50vw - (40vh / 2));");
    }
}

document.addEventListener('mousedown', (event) => {
    scope.style.display = 'block';
    moveScope(event);
});

document.addEventListener('mousemove', (event) => {
    if (scope.style.display === 'block') {
        moveScope(event);
    }
});

document.addEventListener('mouseup', () => {
    scope.style.display = 'none';
});

document.addEventListener('touchstart', (event) => {
    scope.style.display = 'block';
    moveScope(event);
});

document.addEventListener('touchend', () => {
    scope.style.display = 'none';
});

// Animate the scene
function animate() {
    requestAnimationFrame(animate);

    stars.rotation.x += 0.0005;
    stars.rotation.y += 0.0005;

    planet.rotation.y += 0.01;

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
