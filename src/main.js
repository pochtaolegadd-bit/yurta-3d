import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// =======================
// СЦЕНА
// =======================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcefff);

// =======================
// КАМЕРА
// =======================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 6);

// =======================
// RENDERER
// =======================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

document.body.appendChild(renderer.domElement);

// =======================
// СВЕТ
// =======================

const ambientLight = new THREE.AmbientLight(0xffffff, 2);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 2);
dirLight.position.set(10, 20, 10);
scene.add(dirLight);

// =======================
// ПОЛ
// =======================

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({
        color: 0x66aa55
    })
);

ground.rotation.x = -Math.PI / 2;
ground.position.y = 0;

scene.add(ground);

// =======================
// ЮРТА
// =======================

const loader = new GLTFLoader();

let yurta = null;

loader.load(
    "/yurta.glb",

    (gltf) => {

        yurta = gltf.scene;

        yurta.position.set(0, 0, 0);

        scene.add(yurta);

        console.log("Юрта загружена");

    },

    undefined,

    (err) => {

        console.error(err);

    }

);
// =======================
// УПРАВЛЕНИЕ
// =======================

const keys = {};

let yaw = 0;
let pitch = 0;

const moveSpeed = 0.08;
const mouseSensitivity = 0.002;

// =======================
// КЛАВИАТУРА
// =======================

document.addEventListener("keydown", (e) => {
    keys[e.code] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.code] = false;
});

// =======================
// POINTER LOCK
// =======================

renderer.domElement.addEventListener("click", () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {

    if (document.pointerLockElement === renderer.domElement) {

        document.addEventListener("mousemove", onMouseMove);

    } else {

        document.removeEventListener("mousemove", onMouseMove);

    }

});

// =======================
// МЫШЬ
// =======================

function onMouseMove(event) {

    yaw -= event.movementX * mouseSensitivity;

    pitch -= event.movementY * mouseSensitivity;

    pitch = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, pitch)
    );

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

}
// =======================
// ДВИЖЕНИЕ
// =======================

function moveForward(speed) {
    camera.position.x -= Math.sin(yaw) * speed;
    camera.position.z -= Math.cos(yaw) * speed;
}

function moveBackward(speed) {
    camera.position.x += Math.sin(yaw) * speed;
    camera.position.z += Math.cos(yaw) * speed;
}

function moveLeft(speed) {
    camera.position.x -= Math.cos(yaw) * speed;
    camera.position.z += Math.sin(yaw) * speed;
}

function moveRight(speed) {
    camera.position.x += Math.cos(yaw) * speed;
    camera.position.z -= Math.sin(yaw) * speed;
}

// =======================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

const isMobile =
    /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

let joystickX = 0;
let joystickY = 0;

let verticalMove = 0;

// Поворот камеры пальцем
let cameraTouchId = null;

let lastTouchX = 0;
let lastTouchY = 0;

// =======================
// ДАЛЬШЕ БУДЕТ СОЗДАНИЕ ДЖОЙСТИКА
// =======================
// =======================
// ДЖОЙСТИК
// =======================

if (isMobile) {

    const joystick = document.createElement("div");

    joystick.className = "mobileControl";

    Object.assign(joystick.style, {
        position: "fixed",
        left: "40px",
        bottom: "40px",
        width: "130px",
        height: "130px",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.25)",
        border: "2px solid rgba(255,255,255,0.5)",
        zIndex: "99999",
        touchAction: "none"
    });

    document.body.appendChild(joystick);

    const stick = document.createElement("div");

    stick.className = "mobileControl";

    Object.assign(stick.style, {
        position: "absolute",
        left: "40px",
        top: "40px",
        width: "50px",
        height: "50px",
        borderRadius: "50%",
        background: "#ffffff"
    });

    joystick.appendChild(stick);

    joystick.addEventListener("touchmove", (e) => {

        e.preventDefault();
        e.stopPropagation();

        const touch = e.touches[0];

        const rect = joystick.getBoundingClientRect();

        let x = touch.clientX - (rect.left + 65);
        let y = touch.clientY - (rect.top + 65);

        x = Math.max(-45, Math.min(45, x));
        y = Math.max(-45, Math.min(45, y));

        stick.style.left = (40 + x) + "px";
        stick.style.top = (40 + y) + "px";

        joystickX = x / 45;
        joystickY = y / 45;

    }, {
        passive: false
    });

    joystick.addEventListener("touchend", () => {

        joystickX = 0;
        joystickY = 0;

        stick.style.left = "40px";
        stick.style.top = "40px";

    });

}
// =======================
// ПОВОРОТ КАМЕРЫ ПАЛЬЦЕМ
// =======================

if (isMobile) {

    document.addEventListener("touchstart", (e) => {

        for (const touch of e.changedTouches) {

            // Если палец нажал на джойстик или кнопку —
            // не используем его для камеры.
            if (
                touch.target.classList &&
                touch.target.classList.contains("mobileControl")
            ) {
                continue;
            }

            if (cameraTouchId === null) {

                cameraTouchId = touch.identifier;

                lastTouchX = touch.clientX;
                lastTouchY = touch.clientY;

            }

        }

    });

    document.addEventListener("touchmove", (e) => {

        for (const touch of e.changedTouches) {

            if (touch.identifier !== cameraTouchId)
                continue;

            const dx = touch.clientX - lastTouchX;
            const dy = touch.clientY - lastTouchY;

            yaw -= dx * 0.005;
            pitch -= dy * 0.005;

            pitch = Math.max(
                -Math.PI / 2,
                Math.min(Math.PI / 2, pitch)
            );

            camera.rotation.order = "YXZ";
            camera.rotation.y = yaw;
            camera.rotation.x = pitch;

            lastTouchX = touch.clientX;
            lastTouchY = touch.clientY;

        }

    }, {
        passive: true
    });

    document.addEventListener("touchend", (e) => {

        for (const touch of e.changedTouches) {

            if (touch.identifier === cameraTouchId) {

                cameraTouchId = null;

            }

        }

    });

}
// =======================
// КНОПКИ ВВЕРХ / ВНИЗ
// =======================

if (isMobile) {

    function createButton(symbol, right, bottom) {

        const button = document.createElement("div");

        button.className = "mobileControl";

        Object.assign(button.style, {
            position: "fixed",
            right: right + "px",
            bottom: bottom + "px",
            width: "70px",
            height: "70px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.25)",
            border: "2px solid rgba(255,255,255,0.5)",
            color: "#ffffff",
            fontSize: "34px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            userSelect: "none",
            touchAction: "none",
            zIndex: "99999"
        });

        button.textContent = symbol;

        document.body.appendChild(button);

        return button;
    }

    const upButton = createButton("⬆", 40, 150);
    const downButton = createButton("⬇", 40, 60);

    upButton.addEventListener("touchstart", (e) => {
        e.preventDefault();
        verticalMove = 1;
    }, { passive: false });

    upButton.addEventListener("touchend", () => {
        verticalMove = 0;
    });

    upButton.addEventListener("touchcancel", () => {
        verticalMove = 0;
    });

    downButton.addEventListener("touchstart", (e) => {
        e.preventDefault();
        verticalMove = -1;
    }, { passive: false });

    downButton.addEventListener("touchend", () => {
        verticalMove = 0;
    });

    downButton.addEventListener("touchcancel", () => {
        verticalMove = 0;
    });

}
// =======================
// ANIMATE
// =======================

function animate() {

    requestAnimationFrame(animate);

    // ===== ПК =====

    if (keys["KeyW"]) {
        moveForward(moveSpeed);
    }

    if (keys["KeyS"]) {
        moveBackward(moveSpeed);
    }

    if (keys["KeyA"]) {
        moveLeft(moveSpeed);
    }

    if (keys["KeyD"]) {
        moveRight(moveSpeed);
    }

    // ===== Телефон =====

    if (isMobile) {

        // Вперёд / назад
        if (Math.abs(joystickY) > 0.05) {
            moveForward(joystickY * moveSpeed);
        }

        // Влево / вправо
        if (Math.abs(joystickX) > 0.05) {
            moveRight(joystickX * moveSpeed);
        }

        // Полёт вверх / вниз
        if (verticalMove !== 0) {
            camera.position.y += verticalMove * moveSpeed;
        }

    }

    renderer.render(scene, camera);

}

animate();
// =======================
// RESIZE
// =======================

window.addEventListener("resize", () => {

    camera.aspect = window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        window.devicePixelRatio
    );

});

// =======================
// НАЧАЛЬНЫЙ ПОВОРОТ КАМЕРЫ
// =======================

camera.rotation.order = "YXZ";
camera.rotation.y = yaw;
camera.rotation.x = pitch;

// =======================
// ДОПОЛНИТЕЛЬНО
// =======================

// Чтобы на телефоне страница не прокручивалась
document.body.style.touchAction = "none";

// Чтобы нельзя было выделять элементы управления
document.body.style.userSelect = "none";
document.body.style.webkitUserSelect = "none";

console.log("Игра успешно запущена!");
