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

camera.position.set(0, 5, 15);

// =======================
// РЕНДЕР
// =======================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(window.devicePixelRatio);

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

document.body.appendChild(renderer.domElement);

// =======================
// СВЕТ
// =======================

scene.add(
    new THREE.AmbientLight(
        0xffffff,
        2
    )
);

const light =
new THREE.DirectionalLight(
    0xffffff,
    3
);

light.position.set(
    5,
    10,
    5
);

scene.add(light);

// =======================
// ЗАГРУЗКА ЮРТЫ
// =======================

const loader =
new GLTFLoader();

let yurta = null;

loader.load(

    "/yurta.glb",

    (gltf)=>{

        yurta = gltf.scene;

        const box =
        new THREE.Box3()
        .setFromObject(yurta);

        const center =
        box.getCenter(
            new THREE.Vector3()
        );

        yurta.position.sub(center);

        scene.add(yurta);

        console.log("Юрта загружена");

    },

    undefined,

    (error)=>{

        console.error(error);

    }

);
// =======================
// КЛАВИАТУРА
// =======================

const keys = {};

document.addEventListener("keydown", (e) => {
    keys[e.key.toLowerCase()] = true;
});

document.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
});

// =======================
// КООРДИНАТЫ КАМЕРЫ (P)
// =======================

document.addEventListener("keydown", (e) => {

    const key = e.key.toLowerCase();

    // Английская P или русская З
    if (key === "p" || key === "з") {

        console.clear();

        console.log("========== КАМЕРА ==========");

        camera.position.set(
            18.759733925127577,
            -1.5000148620521192,
            10.62070175717956
            );

        console.log(
            "Поворот:",
            `x: ${camera.rotation.x}`,
            `y: ${camera.rotation.y}`,
            `z: ${camera.rotation.z}`
        );

    }

});

// =======================
// ПОВОРОТ КАМЕРЫ МЫШЬЮ
// =======================

let yaw = 1.0199999999999967;
let pitch = -0.03679632679489596;

camera.rotation.order = "YXZ";
camera.rotation.y = yaw;
camera.rotation.x = pitch;

renderer.domElement.addEventListener("click", () => {

    renderer.domElement.requestPointerLock();

});

document.addEventListener("mousemove", (e) => {

    if (document.pointerLockElement !== renderer.domElement)
        return;

    yaw -= e.movementX * 0.002;
    pitch -= e.movementY * 0.002;

    pitch = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, pitch)
    );

    camera.rotation.order = "YXZ";
    camera.rotation.y = yaw;
    camera.rotation.x = pitch;

});
// =======================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

// Джойстик и кнопки будут только на телефоне
const isMobile =
/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

let joystickX = 0;
let joystickY = 0;

let verticalMove = 0;

// Для поворота камеры пальцем
let cameraTouchId = null;

let lastTouchX = 0;
let lastTouchY = 0;

// =======================
// СОЗДАНИЕ ДЖОЙСТИКА
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
        background: "rgba(255,255,255,0.30)",
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

    function createButton(text, bottom) {

        const btn = document.createElement("button");

        btn.className = "mobileControl";
        btn.textContent = text;

        Object.assign(btn.style, {
            position: "fixed",
            right: "40px",
            bottom: bottom,
            width: "75px",
            height: "75px",
            borderRadius: "50%",
            border: "none",
            background: "rgba(255,255,255,0.35)",
            color: "#000",
            fontSize: "34px",
            zIndex: "99999",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none"
        });

        document.body.appendChild(btn);

        return btn;
    }

    const upButton = createButton("⬆️", "140px");
    const downButton = createButton("⬇️", "50px");

    function stopVertical() {
        verticalMove = 0;
    }

    upButton.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        verticalMove = 1;
    }, { passive: false });

    upButton.addEventListener("touchend", stopVertical);
    upButton.addEventListener("touchcancel", stopVertical);

    downButton.addEventListener("touchstart", (e) => {
        e.preventDefault();
        e.stopPropagation();
        verticalMove = -1;
    }, { passive: false });

    downButton.addEventListener("touchend", stopVertical);
    downButton.addEventListener("touchcancel", stopVertical);

}
// =======================
// СВОБОДНЫЙ ПОЛЁТ
// =======================

const speed = 0.15;

function updateMovement() {

    const forward = new THREE.Vector3();

    camera.getWorldDirection(forward);

    forward.normalize();

    const right = new THREE.Vector3();

    right.crossVectors(
        forward,
        new THREE.Vector3(0, 1, 0)
    );

    right.normalize();

    // =======================
    // ПК
    // =======================

    if (keys["w"] || keys["ц"]) {

        camera.position.add(
            forward.clone().multiplyScalar(speed)
        );

    }

    if (keys["s"] || keys["ы"]) {

        camera.position.add(
            forward.clone().multiplyScalar(-speed)
        );

    }

    if (keys["a"] || keys["ф"]) {

        camera.position.add(
            right.clone().multiplyScalar(-speed)
        );

    }

    if (keys["d"] || keys["в"]) {

        camera.position.add(
            right.clone().multiplyScalar(speed)
        );

    }

    if (keys[" "]) {

        camera.position.y += speed;

    }

    if (
        keys["shift"] ||
        keys["shiftleft"] ||
        keys["shiftright"]
    ) {

        camera.position.y -= speed;

    }

    // =======================
    // ТЕЛЕФОН
    // =======================

    if (isMobile) {

        if (Math.abs(joystickY) > 0.02) {

            camera.position.add(
                forward.clone().multiplyScalar(
                    -joystickY * speed
                )
            );

        }

        if (Math.abs(joystickX) > 0.02) {

            camera.position.add(
                right.clone().multiplyScalar(
                    joystickX * speed
                )
            );

        }

        camera.position.y +=
            verticalMove * speed;

    }

}
// =======================
// ИГРОВОЙ ЦИКЛ
// =======================

function animate() {

    requestAnimationFrame(animate);

    updateMovement();

    renderer.render(
        scene,
        camera
    );

}

animate();

// =======================
// RESIZE
// =======================

window.addEventListener(
    "resize",
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            window.devicePixelRatio
        );

    }
);

// =======================
// НАСТРОЙКИ
// =======================

camera.rotation.order = "YXZ";

document.body.style.userSelect = "none";
document.body.style.webkitUserSelect = "none";

if (isMobile) {

    document.body.style.touchAction = "none";

}

console.log("main.js загружен");
// =======================
// ПРИЦЕЛ
// =======================

const crosshair = document.createElement("div");

Object.assign(crosshair.style, {
    position: "fixed",
    left: "50%",
    top: "50%",
    width: "6px",
    height: "6px",
    background: "#ffffff",
    border: "2px solid #000000",
    borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: "999999",
    pointerEvents: "none"
});

document.body.appendChild(crosshair);

// =======================
// ПОДСКАЗКА ПО УПРАВЛЕНИЮ
// =======================

console.log("=== Управление ===");
console.log("WASD - движение");
console.log("Пробел - вверх");
console.log("Shift - вниз");
console.log("Мышь - осмотр");
console.log("P - координаты камеры");
