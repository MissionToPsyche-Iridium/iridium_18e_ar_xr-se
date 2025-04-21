/**
 * Three.js - 3D library
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

/**
 * Creates an asteroid belt with many small asteroids. Also determines a random position
 * for the main asteroid (to ensure it remains on-screen).
 *
 * @function createAsteroidBelt
 * @param {THREE.Scene} scene - The Three.js scene to which the asteroids will be added.
 * @returns {void}
 */
export function createAsteroidBelt(scene) {
    const MIN_X = -1;
    const MAX_X = 1;
    const MIN_Y = -0.1;
    const MAX_Y = 0.1;

    // Randomly choose the X and Y for the main asteroid, ensuring it's within boundaries
    let asteroidX, asteroidY;
    while (true) {
        asteroidX = THREE.MathUtils.lerp(MIN_X, MAX_X, Math.random());
        asteroidY = THREE.MathUtils.lerp(MIN_Y, MAX_Y, Math.random());
        if (asteroidX < MAX_X && asteroidX > MIN_X) break;
    }

    const numAsteroids = window.innerWidth * 0.3;
    const beltRadius = 50;
    const beltThickness = 10;
    const geometry = new THREE.SphereGeometry(0.5, 256, 256);
    const material = new THREE.MeshStandardMaterial({
        map: generateAsteroidTexture(),
        roughness: 1,
        metalness: 0,
        emissive: new THREE.Color(0x111111),
    });

    geometry.computeBoundingBox();
    geometry.computeVertexNormals();

    // Populate the belt
    for (let i = 0; i < numAsteroids; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = beltRadius + (Math.random() - 0.5) * beltThickness;
        const x = Math.cos(angle) * distance;
        const y = (Math.random() - 0.5) * 5;
        const z = Math.sin(angle) * distance;

        const asteroid = new THREE.Mesh(geometry, material);
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

    return { asteroidX, asteroidY };
}

/**
 * Places the main asteroid in front of the camera at the chosen (X, Y) range.
 * 
 * @param {THREE.Camera} camera
 * @param {THREE.Object3D} asteroid
 * @param {number} asteroidX
 * @param {number} asteroidY
 */
export function positionMainAsteroid(camera, asteroid, asteroidX, asteroidY) {
  // Convert (asteroidX, asteroidY, 0) to 3D
  const asteroidVector = new THREE.Vector3(asteroidX, asteroidY, 0);
  asteroidVector.unproject(camera);

  // Ray from camera
  const cameraRay = asteroidVector.sub(camera.position).normalize();
  // Distance to place it at Z=0 plane in front of camera
  const distanceFromCamera = (0 - camera.position.z) / cameraRay.z * 2;
  const asteroidPosition = camera.position.clone().add(cameraRay.multiplyScalar(distanceFromCamera));
  asteroid.position.copy(asteroidPosition);
}

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
