/*
* @author simondevyoutube / https://github.com/simondevyoutube
* @author nswanso6
* @author cmill26
*/
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';

import {OrbitControls} from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';


class SpaceSkybox {
  constructor() {
    this._Initialize();
  }

  _Initialize() {
    this._threejs = new THREE.WebGLRenderer({
      antialias: true,
    });
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this._threejs.domElement);

    window.addEventListener('resize', () => {
      this._OnWindowResize();
    }, false);

    const fov = 60;
    const aspect = 1920 / 1080;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(75, 20, 0);

    this._scene = new THREE.Scene();

    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
    // TODOL use lighting concepts for US75 Task 78
    light.position.set(75, 100, 30);
    // light.target.position.set(0, 0, 0);
    // light.castShadow = true;
    // light.shadow.bias = -0.001;
    // light.shadow.mapSize.width = 2048;
    // light.shadow.mapSize.height = 2048;
    // light.shadow.camera.near = 0.1;
    // light.shadow.camera.far = 500.0;
    // light.shadow.camera.near = 0.5;
    // light.shadow.camera.far = 500.0;
    // light.shadow.camera.left = 100;
    // light.shadow.camera.right = -100;
    // light.shadow.camera.top = 100;
    // light.shadow.camera.bottom = -100;
    this._scene.add(light);

    light = new THREE.AmbientLight(0x101010);
    this._scene.add(light);

    const controls = new OrbitControls(
      this._camera, this._threejs.domElement);
    controls.target.set(0, 20, 0);
    controls.update();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        '../assets/images/skybox/space_ft.png',
        '../assets/images/skybox/space_bk.png',
        '../assets/images/skybox/space_up.png',
        '../assets/images/skybox/space_dn.png',
        '../assets/images/skybox/space_lf.png',
        '../assets/images/skybox/space_rt.png',
    ]);
    this._scene.background = texture;

    // Setup Three.js canvas
    //var scene = new THREE.Scene();
    //var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    //var renderer = new THREE.WebGLRenderer({ antialias: true });
    //renderer.setSize(window.innerWidth, window.innerHeight);
    //document.getElementById('canvas').appendChild(renderer.domElement);

  // Basic light
    // var ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    // this._scene.add(ambientLight);

    // // Model loader
    // var loader = new THREE.GLTFLoader();

    // // Load satellite model
    // loader.load('../assets/models/satellite.glb', function (gltf) {
    //     var model = gltf.scene;
    //     model.scale.set(0.25, 0.25, 0.25); // Set model scale
    //     this._scene.add(model); // Add model to scene

    //     // Offset camera from model
    //     camera.position.z = 5;

    //     // Skybox
        

    //     // Basic rotation animation
    //     function animate() {
    //         requestAnimationFrame(animate);
    //         model.rotation.x += 0.002;
    //         renderer.render(scene, camera);
    //     }
    //     animate();
    
    // // Log error to console
    // }, undefined, function (error) {
    //     console.error(error);
    // });

    // TODO: remove box and add 3D satellite model
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(10, 10, 10),
      new THREE.MeshStandardMaterial({
          color: 0xFFFFFF,
      }));
    box.position.set(0, 3, 0);
    box.castShadow = true;
    box.receiveShadow = true;
    box.rotation.x = -Math.PI / 2;
    this._scene.add(box);

    this._RAF();
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