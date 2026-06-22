import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// СЦЕНА
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcefff);

// КАМЕРА
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 6);

// РЕНДЕР
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.style.margin = '0';
document.body.appendChild(renderer.domElement);

// СВЕТ
const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);

// ЗАГРУЗКА ЮРТЫ
const loader = new GLTFLoader();

loader.load(
    '/yurta.glb',
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);
        console.log('Юрта загружена');
    },
    undefined,
    (error) => {
        console.error(error);
    }
);

// УПРАВЛЕНИЕ
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// МЫШЬ
let yaw = 0;
let pitch = 0;

document.body.addEventListener('click', () => {
    document.body.requestPointerLock();
});

document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === document.body) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;

        pitch = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, pitch)
        );

        camera.rotation.order = 'YXZ';
        camera.rotation.y = yaw;
        camera.rotation.x = pitch;
    }
});

// ДВИЖЕНИЕ
const speed = 0.08;

function updateMovement() {

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    // W или Ц
    if (keys['w'] || keys['ц']) {
        camera.position.add(forward.clone().multiplyScalar(speed));
    }

    // S или Ы
    if (keys['s'] || keys['ы']) {
        camera.position.add(forward.clone().multiplyScalar(-speed));
    }

    // A или Ф
    if (keys['d'] || keys['в']) {
        camera.position.add(right.clone().multiplyScalar(speed));
    }

    // D или В
    if (keys['a'] || keys['ф']) {
        camera.position.add(right.clone().multiplyScalar(-speed));
    }

    // Пробел — вверх
    if (keys[' ']) {
        camera.position.y += speed;
    }

    // Shift — вниз
    if (keys['shift']) {
        camera.position.y -= speed;
    }
}

// АНИМАЦИЯ
function animate() {
    requestAnimationFrame(animate);

    updateMovement();

    renderer.render(scene, camera);
}

animate();

// RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});