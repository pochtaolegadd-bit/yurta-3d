import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// =====================
// СЦЕНА
// =====================

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xdcefff);

// =====================
// КАМЕРА
// =====================

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 2, 6);
camera.rotation.order = "YXZ";

// =====================
// РЕНДЕР
// =====================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    window.devicePixelRatio
);

renderer.shadowMap.enabled = true;

document.body.style.margin = "0";
document.body.style.overflow = "hidden";
document.body.appendChild(renderer.domElement);

// =====================
// СВЕТ
// =====================

const ambient = new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambient);

const sun = new THREE.DirectionalLight(
    0xffffff,
    3
);

sun.position.set(5, 10, 5);
sun.castShadow = true;

scene.add(sun);

// =====================
// ЗАГРУЗКА ЮРТЫ
// =====================

const loader = new GLTFLoader();

let yurta = null;

loader.load(

    "/yurta.glb",

    (gltf) => {

        yurta = gltf.scene;

        yurta.traverse((obj)=>{

            if(obj.isMesh){

                obj.castShadow = true;
                obj.receiveShadow = true;

            }

        });

        scene.add(yurta);

        console.log("Юрта загружена");

    },

    undefined,

    (err)=>{

        console.error(err);

    }

);

// =====================
// ПЕРЕМЕННЫЕ
// =====================

const keys = {};

let yaw = 0;
let pitch = 0;

const speed = 0.08;

const isMobile =
/Android|iPhone|iPad|iPod|Mobile/i
.test(navigator.userAgent);

// телефон

let moveTouch = null;
let lookTouch = null;

let joystickX = 0;
let joystickY = 0;

// =====================
// КЛАВИАТУРА
// =====================

document.addEventListener("keydown",(e)=>{

    keys[e.key.toLowerCase()] = true;

});

document.addEventListener("keyup",(e)=>{

    keys[e.key.toLowerCase()] = false;

});
// =====================
// МЫШЬ (ПК)
// =====================

if (!isMobile) {

    document.body.addEventListener("click", () => {

        if (document.pointerLockElement !== document.body) {
            document.body.requestPointerLock();
        }

    });

    document.addEventListener("mousemove", (e) => {

        if (document.pointerLockElement !== document.body) return;

        yaw -= e.movementX * 0.0025;
        pitch -= e.movementY * 0.0025;

        pitch = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, pitch)
        );

        camera.rotation.y = yaw;
        camera.rotation.x = pitch;

    });

}

// =====================
// СЕНСОРНОЕ УПРАВЛЕНИЕ
// =====================

if (isMobile) {

    document.body.style.touchAction = "none";

    document.addEventListener("touchstart", (e) => {

        for (const touch of e.changedTouches) {

            if (
                touch.clientX < window.innerWidth / 2 &&
                moveTouch === null
            ) {

                moveTouch = {
                    id: touch.identifier,
                    startX: touch.clientX,
                    startY: touch.clientY
                };

            }

            else if (lookTouch === null) {

                lookTouch = {
                    id: touch.identifier,
                    lastX: touch.clientX,
                    lastY: touch.clientY
                };

            }

        }

    });

    document.addEventListener("touchmove", (e) => {

        for (const touch of e.changedTouches) {

            // ЛЕВЫЙ ПАЛЕЦ (движение)

            if (
                moveTouch &&
                touch.identifier === moveTouch.id
            ) {

                joystickX =
                    (touch.clientX - moveTouch.startX) / 70;

                joystickY =
                    (touch.clientY - moveTouch.startY) / 70;

                joystickX = Math.max(-1, Math.min(1, joystickX));
                joystickY = Math.max(-1, Math.min(1, joystickY));

            }

            // ПРАВЫЙ ПАЛЕЦ (камера)

            if (
                lookTouch &&
                touch.identifier === lookTouch.id
            ) {

                const dx =
                    touch.clientX - lookTouch.lastX;

                const dy =
                    touch.clientY - lookTouch.lastY;

                yaw -= dx * 0.003;
                pitch -= dy * 0.003;

                pitch = Math.max(
                    -Math.PI / 2,
                    Math.min(Math.PI / 2, pitch)
                );

                camera.rotation.y = yaw;
                camera.rotation.x = pitch;

                lookTouch.lastX = touch.clientX;
                lookTouch.lastY = touch.clientY;

            }

        }

    });

    document.addEventListener("touchend", (e) => {

        for (const touch of e.changedTouches) {

            if (
                moveTouch &&
                touch.identifier === moveTouch.id
            ) {

                moveTouch = null;

                joystickX = 0;
                joystickY = 0;

            }

            if (
                lookTouch &&
                touch.identifier === lookTouch.id
            ) {

                lookTouch = null;

            }

        }

    });

}
// =====================
// ДВИЖЕНИЕ
// =====================

function updateMovement(delta) {

    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(
        forward,
        new THREE.Vector3(0, 1, 0)
    ).normalize();

    const moveSpeed = speed * delta * 60;

    // ПК

    if (keys["w"] || keys["ц"]) {

        camera.position.add(
            forward.clone().multiplyScalar(moveSpeed)
        );

    }

    if (keys["s"] || keys["ы"]) {

        camera.position.add(
            forward.clone().multiplyScalar(-moveSpeed)
        );

    }

    if (keys["a"] || keys["ф"]) {

        camera.position.add(
            right.clone().multiplyScalar(-moveSpeed)
        );

    }

    if (keys["d"] || keys["в"]) {

        camera.position.add(
            right.clone().multiplyScalar(moveSpeed)
        );

    }

    if (keys[" "]) {

        camera.position.y += moveSpeed;

    }

    if (keys["shift"]) {

        camera.position.y -= moveSpeed;

    }

    // Телефон

    if (isMobile) {

        if (
            Math.abs(joystickX) > 0.05 ||
            Math.abs(joystickY) > 0.05
        ) {

            camera.position.add(
                forward.clone().multiplyScalar(
                    -joystickY * moveSpeed
                )
            );

            camera.position.add(
                right.clone().multiplyScalar(
                    joystickX * moveSpeed
                )
            );

        }

    }

}

// =====================
// ЧАСЫ
// =====================

const clock = new THREE.Clock();

// =====================
// RESIZE
// =====================

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth /
        window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

});

// =====================
// ВИРТУАЛЬНЫЙ ДЖОЙСТИК
// =====================

let joystickBase = null;
let joystickStick = null;

if (isMobile) {

    joystickBase = document.createElement("div");
    joystickStick = document.createElement("div");

    joystickBase.style.position = "fixed";
    joystickBase.style.left = "40px";
    joystickBase.style.bottom = "40px";
    joystickBase.style.width = "120px";
    joystickBase.style.height = "120px";
    joystickBase.style.borderRadius = "50%";
    joystickBase.style.background = "rgba(255,255,255,0.15)";
    joystickBase.style.border = "2px solid rgba(255,255,255,0.35)";
    joystickBase.style.zIndex = "1000";

    joystickStick.style.position = "absolute";
    joystickStick.style.left = "35px";
    joystickStick.style.top = "35px";
    joystickStick.style.width = "50px";
    joystickStick.style.height = "50px";
    joystickStick.style.borderRadius = "50%";
    joystickStick.style.background = "rgba(255,255,255,0.6)";

    joystickBase.appendChild(joystickStick);
    document.body.appendChild(joystickBase);

}
// =====================
// ОБНОВЛЕНИЕ ДЖОЙСТИКА
// =====================

function updateJoystick() {

    if (!isMobile || !joystickStick) return;

    const max = 35;

    const x = joystickX * max;
    const y = joystickY * max;

    joystickStick.style.transform =
        `translate(${x}px, ${y}px)`;

}


// =====================
// АНИМАЦИЯ
// =====================

function animate() {

    requestAnimationFrame(animate);

    const delta = clock.getDelta();


    // движение игрока

    updateMovement(delta);


    // обновление джойстика

    updateJoystick();


    // рендер

    renderer.render(
        scene,
        camera
    );

}


// =====================
// ЗАПУСК
// =====================

animate();
