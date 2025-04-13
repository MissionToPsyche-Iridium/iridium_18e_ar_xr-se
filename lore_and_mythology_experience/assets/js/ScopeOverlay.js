/**
 * Three.js - 3D library
 */
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

    /**
     * Pointer down event - shows the scope overlay and dims the stars outside it.
     * 
     * @function onPointerDown
     * @param {MouseEvent|TouchEvent} event - The pointer down event.
     * @returns {void}
     */
    onPointerDown(event) {
        if (window.scopeDisabled) return;
        this.scopeElement.style.display = 'block';
        // Also update starMaterial's uniform if needed:
        const starMaterial = this._getStarMaterial();
        if (starMaterial) starMaterial.uniforms.uBlurCircle.value = true;

        this._moveScope(event);
    }

    /**
     * Pointer move event - if scope is visible, move it and update star uniforms.
     *
     * @function onPointerMove
     * @param {MouseEvent|TouchEvent} event - The pointer move event.
     * @returns {void}
     */
    onPointerMove(event) {
        if (window.scopeDisabled) return;
        if (this.scopeElement.style.display === 'block') {
            this._moveScope(event);
        }
    }

    /**
     * Pointer up event - hides the scope and disables star dimming.
     *
     * @function onPointerUp
     * @returns {void}
     */
    onPointerUp() {
        if (window.scopeDisabled) return;
        this.scopeElement.style.display = 'none';
        const starMaterial = this._getStarMaterial();
        if (starMaterial) starMaterial.uniforms.uBlurCircle.value = false;
    }

    /**
     * Moves the "scope" DOM element to follow the pointer.
     * Updates mouse coordinates for Raycaster usage.
     *
     * @function moveScope
     * @param {MouseEvent|TouchEvent} event - The pointer event.
     * @returns {void}
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
     * Updates the global target3D vector by projecting from mouse coords
     * onto a plane at the asteroid's Z position.
     *
     * @function updateTarget3D
     * @param {number} asteroidZ - The location of the asteroid on the Z plane.
     * @returns {void}
     */
    _updateTarget3D(asteroidZ) {
        const plane = new THREE.Plane(new THREE.Vector3(0,0,1), -asteroidZ);
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectPoint = new THREE.Vector3();
        this.raycaster.ray.intersectPlane(plane, intersectPoint);
        this.target3D.copy(intersectPoint);
    }

    /**
     * Checks if the asteroid is within the scope circle.
     * If it remains in the circle for holdThreshold seconds, we lock on.
     *
     * @function checkAsteroidInScope
     * @param {number} delta - Time elapsed since last frame (seconds).
     * @param {THREE.Object3D} asteroid - The asteroid model.
     * @returns {void}
     */
    _checkAsteroidInScope(delta, asteroid) {
        if (!asteroid) return;

        // Get asteroid position in 2D screen coords
        const asteroidScreenPos = asteroid.position.clone();
        asteroidScreenPos.project(this.camera);
        asteroidScreenPos.x = (asteroidScreenPos.x + 1) * window.innerWidth / 2;
        asteroidScreenPos.y = (-asteroidScreenPos.y + 1) * window.innerHeight / 2;

        // Get scope center
        const scopeRect = this.scopeElement.getBoundingClientRect();
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
