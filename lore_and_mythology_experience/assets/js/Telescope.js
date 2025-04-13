/**
 * Three.js - 3D library
 */
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

// Load telescope models (lower and upper parts)
export async function loadTelescopeParts(loader, scene) {
    // Load lower telescope
    const lower = await new Promise((resolve, reject) => {
        loader.load('../assets/models/telescope_lower.glb', (gltf) => {
            const lowerPart = gltf.scene;
            lowerPart.position.set(0, -1.4, 0);
            lowerPart.scale.set(0.2, 0.2, 0.2);
            lowerPart.rotation.x = THREE.MathUtils.degToRad(-55);
            lowerPart.rotation.y = THREE.MathUtils.degToRad(90);
            scene.add(lowerPart);
            resolve(lowerPart);
            console.log("Loaded telescope lower!", gltf);
        }, undefined, reject);
    });
  
    // Load upper telescope
    const upper = await new Promise((resolve, reject) => {
        loader.load('../assets/models/telescope_upper.glb', (gltf) => {
            const upperPart = gltf.scene;
            upperPart.position.set(0, 0, 0);
            lower.add(upperPart);
            resolve(upperPart);
            console.log("Loaded telescope upper!", gltf);
        }, undefined, reject);
    });

    return { lower, upper };
}
  