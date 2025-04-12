// modules/scope/ScopeOverlay.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js";

/**
 * Class that manages the scope overlay:
 * - Pointer/touch events
 * - Updating starfield uniforms for blur
 * - Checking for asteroid lock-on
 */
export class ScopeOverlay {
    /**
     * @param {HTMLElement} scopeElement - The DOM element for the circular scope overlay
     * @param {THREE.Camera} camera
     * @param {THREE.OrbitControls} controls
     * @param {(target3D: THREE.Vector3, delta: number) => void} telescopeAimFn - function to point telescope
     * @param {(error: any) => void} [onError] - optional error callback
     * @param {() => void} [onStartLock] - optional callback to force lock-on from outside
     */
    constructor(scopeElement, camera, controls, telescopeAimFn, onError, onStartLock) {
        this.scopeElement = scopeElement;
        this.camera = camera;
        this.controls = controls;
        this.telescopeAimFn = telescopeAimFn;
        this.onError = onError || console.error;
        this.onStartLock = onStartLock || function(){};

        // Tracking variables
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.holdTime = 0;
        this.holdThreshold = 0.5;
        this._isPointerDown = false;
        this.target3D = new THREE.Vector3();

        this._bindPointerEvents();
    }

    /**
     * Force a lock-on from external code (i.e. auto-find button).
     */
    forceLockOn() {
        this.onStartLock();
    }

    /**
     * Binds mouse/touch events to show/hide the scope and track pointer.
     */
    _bindPointerEvents() {
        document.addEventListener('mousedown',  (e) => this.onPointerDown(e));
        document.addEventListener('pointermove',(e) => this.onPointerMove(e));
        document.addEventListener('mouseup',    () => this.onPointerUp());

        document.addEventListener('touchstart', (e) => this.onPointerDown(e));
        document.addEventListener('touchmove',  (e) => this.onPointerMove(e));
        document.addEventListener('touchend',   () => this.onPointerUp());
    }

    /**
     * Main update function called each frame from the animation loop.
     * @param {number} delta - Time in seconds since last frame
     * @param {THREE.Object3D} asteroid - The main asteroid
     * @param {boolean} isLockOn - Whether we have already locked on
     */
    update(delta, asteroid, isLockOn) {
        // Always aim the telescope at the pointer's 3D position (unless you have a better approach)
        this._updateTarget3D(asteroid?.position?.z || 0);
        this.telescopeAimFn(this.target3D, delta);

        // If locked on or if scope hidden, do nothing
        if (isLockOn || this.scopeElement.style.display !== 'block' || !asteroid) {
            return;
        }

        // Check if asteroid is in scope
        this._checkAsteroidInScope(delta, asteroid);
    }

    // ------------------ Pointer Down / Move / Up ------------------ //

    onPointerDown(event) {
        if (window.scopeDisabled) return;
        this.scopeElement.style.display = 'block';
        // Also update starMaterial's uniform if needed:
        const starMaterial = this._getStarMaterial();
        if (starMaterial) starMaterial.uniforms.uBlurCircle.value = true;

        this._moveScope(event);
    }

    onPointerMove(event) {
        if (window.scopeDisabled) return;
        if (this.scopeElement.style.display === 'block') {
            this._moveScope(event);
        }
    }

    onPointerUp() {
        if (window.scopeDisabled) return;
        this.scopeElement.style.display = 'none';
        const starMaterial = this._getStarMaterial();
        if (starMaterial) starMaterial.uniforms.uBlurCircle.value = false;
    }

    /**
     * Positions the scope overlay at the pointer and updates mouse vector.
     */
    _moveScope(event) {
        let clientX, clientY;
        if (event.touches && event.touches.length > 0) {
            const touch = event.touches[event.touches.length - 1];
            clientX = touch.clientX;
            clientY = touch.clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        this.scopeElement.style.left = (clientX - this.scopeElement.offsetWidth / 2) + 'px';
        this.scopeElement.style.top = (clientY - this.scopeElement.offsetHeight / 2) + 'px';

        // Convert to normalized device coords
        this.mouse.x = (clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(clientY / window.innerHeight) * 2 + 1;

        // Update starMaterial's uniform
        const starMaterial = this._getStarMaterial();
        if (starMaterial) {
        const normX = clientX / window.innerWidth;
        const normY = 1 - (clientY / window.innerHeight);
        starMaterial.uniforms.uCirclePos.value.set(normX, normY);
        }
    }

    /**
     * Updates target3D by intersecting a plane at z=asteroidZ.
     */
    _updateTarget3D(asteroidZ) {
        const plane = new THREE.Plane(new THREE.Vector3(0,0,1), -asteroidZ);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersectPoint);
        this.target3D.copy(intersectPoint);
    }

    /**
     * Checks if the asteroid is within the scope reticle.
     * If it remains in the reticle for holdThreshold seconds, triggers lock-on.
     */
    _checkAsteroidInScope(delta, asteroid) {
        // Project asteroid to screen coords
        const asteroidScreenPos = asteroid.position.clone();
        asteroidScreenPos.project(this.camera);
        asteroidScreenPos.x = (asteroidScreenPos.x + 1) * window.innerWidth / 2;
        asteroidScreenPos.y = (-asteroidScreenPos.y + 1) * window.innerHeight / 2;

        // Get scope center & radius
        const scopeRect = this.scopeElement.getBoundingClientRect();
        const scopeX = scopeRect.left + scopeRect.width / 2;
        const scopeY = scopeRect.top + scopeRect.height / 2;
        const scopeRadius = scopeRect.width / 2;

        // Distance between asteroid center & scope center
        const dx = asteroidScreenPos.x - scopeX;
        const dy = asteroidScreenPos.y - scopeY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= scopeRadius) {
        asteroid.visible = true;
        asteroid.rotation.x += 0.002;
        asteroid.rotation.y += 0.002;
        this.holdTime += delta;
        if (this.holdTime >= this.holdThreshold) {
            this.onStartLock();
        }
        } else {
        asteroid.visible = false;
        this.holdTime = 0;
        }
    }

    /**
     * Optional utility to find the starMaterial in the scene if you need it.
     * Or you can pass the starMaterial in the constructor if you prefer.
     */
    _getStarMaterial() {
        // For brevity, just do a global search. Or store a reference in the constructor.
        // This depends on how you structure your code. 
        return window.starMaterial || null; 
    }
}
