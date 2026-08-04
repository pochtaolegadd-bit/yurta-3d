// ======================================================
// ИМПОРТЫ
// ======================================================

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


// ======================================================
// НАСТРОЙКИ ПРОЕКТА
// ======================================================

const SETTINGS = {

    background: 0xdcefff,


    camera: {

        fov: 75,

        near: 0.1,

        far: 1000,

    },


    movement: {

        speed: 0.15,

        mouseSensitivity: 0.002,

        touchSensitivity: 0.005

    }

};


// ======================================================
// СОСТОЯНИЕ ИГРЫ
// ======================================================

const state = {


    yaw: 0,

    pitch: 0,


    keys: {},


    joystick: {

        x: 0,

        y: 0

    },


    verticalMove: 0,


    cameraTouchId: null,


    lastTouchX: 0,

    lastTouchY: 0


};



// ======================================================
// СОЗДАНИЕ СЦЕНЫ
// ======================================================

const scene = new THREE.Scene();


scene.background =
    new THREE.Color(
        SETTINGS.background
    );



// ======================================================
// КАМЕРА
// ======================================================

const camera =
    new THREE.PerspectiveCamera(

        SETTINGS.camera.fov,

        window.innerWidth /
        window.innerHeight,

        SETTINGS.camera.near,

        SETTINGS.camera.far

    );


camera.position.set(

    0,

    3,

    8

);


camera.rotation.order = "YXZ";



// ======================================================
// РЕНДЕР
// ======================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true

    });


renderer.setPixelRatio(
    window.devicePixelRatio
);


renderer.setSize(

    window.innerWidth,

    window.innerHeight

);



document.body.style.margin = "0";

document.body.style.overflow = "hidden";


document.body.appendChild(
    renderer.domElement
);
// ======================================================
// ОСВЕЩЕНИЕ
// ======================================================

const ambientLight =
    new THREE.AmbientLight(

        0xffffff,

        2

    );


scene.add(
    ambientLight
);



const sun =
    new THREE.DirectionalLight(

        0xffffff,

        3

    );


sun.position.set(

    10,

    15,

    10

);


scene.add(
    sun
);



// ======================================================
// ЗАГРУЗКА МОДЕЛИ ЮРТЫ
// ======================================================

const loader =
    new GLTFLoader();



let yurta = null;



// объекты для будущих коллизий

const collisionObjects = [];



// ======================================================
// ТОЧКА СПАВНА
// ======================================================

const SPAWN = {

    x: -32,

    y: 2,

    z: -2


};



// куда смотрит камера после появления

const LOOK_POINT = {

    x: 0,

    y: 1,

    z: 0

};




// ======================================================
// ЗАГРУЗКА GLB
// ======================================================

loader.load(

    "/yurta.glb",


    (gltf) => {


        yurta =
            gltf.scene;



        // центрируем модель

        const box =
            new THREE.Box3()
                .setFromObject(yurta);



        const center =
            box.getCenter(
                new THREE.Vector3()
            );



        yurta.position.sub(
            center
        );



        scene.add(
            yurta
        );



        collisionObjects.push(
            yurta
        );



        console.log(
            "Юрта загружена"
        );



        // ==============================
        // СПАВН КАМЕРЫ
        // ==============================


        camera.position.set(

            SPAWN.x,

            SPAWN.y,

            SPAWN.z

        );



        camera.lookAt(

            LOOK_POINT.x,

            LOOK_POINT.y,

            LOOK_POINT.z

        );



        state.yaw =
            camera.rotation.y;



        state.pitch =
            camera.rotation.x;



    },


    undefined,


    (error) => {


        console.error(

            "Ошибка загрузки юрты",

            error

        );


    }


);
// ======================================================
// КЛАВИАТУРА
// ======================================================

window.addEventListener(

    "keydown",

    (event) => {


        state.keys[
            event.key.toLowerCase()
        ] = true;


    }

);



window.addEventListener(

    "keyup",

    (event) => {


        state.keys[
            event.key.toLowerCase()
        ] = false;


    }

);



// ======================================================
// POINTER LOCK (ЗАХВАТ МЫШИ)
// ======================================================

renderer.domElement.addEventListener(

    "click",

    () => {


        renderer.domElement.requestPointerLock();


    }

);



// ======================================================
// ДВИЖЕНИЕ МЫШИ
// ======================================================

document.addEventListener(

    "mousemove",

    (event) => {


        if (

            document.pointerLockElement !==
            renderer.domElement

        ) {

            return;

        }



        state.yaw -=

            event.movementX *
            SETTINGS.movement.mouseSensitivity;



        state.pitch -=

            event.movementY *
            SETTINGS.movement.mouseSensitivity;




        // ограничение взгляда вверх/вниз

        state.pitch = Math.max(

            -Math.PI / 2,

            Math.min(

                Math.PI / 2,

                state.pitch

            )

        );



        camera.rotation.y =
            state.yaw;



        camera.rotation.x =
            state.pitch;



    }

);
// ======================================================
// ПРОВЕРКА МОБИЛЬНОГО УСТРОЙСТВА
// ======================================================

const isMobile =

    ("ontouchstart" in window) ||

    navigator.maxTouchPoints > 0;



// ======================================================
// ОБЗОР КАМЕРЫ НА ТЕЛЕФОНЕ
// ======================================================

if (isMobile) {


    document.addEventListener(

        "touchstart",

        (event) => {


            for (
                const touch of event.changedTouches
            ) {


                // если это управление джойстиком
                // пропускаем

                if (

                    touch.target.classList
                        .contains("mobileControl")

                ) {

                    continue;

                }



                // первый свободный палец
                // становится камерой

                if (
                    state.cameraTouchId === null
                ) {


                    state.cameraTouchId =
                        touch.identifier;



                    state.lastTouchX =
                        touch.clientX;



                    state.lastTouchY =
                        touch.clientY;


                }


            }


        }

    );





    document.addEventListener(

        "touchmove",

        (event) => {


            for (
                const touch of event.changedTouches
            ) {



                if (

                    touch.identifier !==
                    state.cameraTouchId

                ) {

                    continue;

                }



                const dx =

                    touch.clientX -
                    state.lastTouchX;



                const dy =

                    touch.clientY -
                    state.lastTouchY;




                state.yaw -=

                    dx *
                    SETTINGS.movement.touchSensitivity;



                state.pitch -=

                    dy *
                    SETTINGS.movement.touchSensitivity;




                state.pitch = Math.max(

                    -Math.PI / 2,

                    Math.min(

                        Math.PI / 2,

                        state.pitch

                    )

                );



                camera.rotation.y =
                    state.yaw;



                camera.rotation.x =
                    state.pitch;



                state.lastTouchX =
                    touch.clientX;



                state.lastTouchY =
                    touch.clientY;



            }



        },

        {

            passive: true

        }

    );





    document.addEventListener(

        "touchend",

        (event) => {


            for (
                const touch of event.changedTouches
            ) {


                if (

                    touch.identifier ===
                    state.cameraTouchId

                ) {


                    state.cameraTouchId = null;


                }


            }


        }

    );


}
// ======================================================
// МОБИЛЬНЫЙ ДЖОЙСТИК
// ======================================================

if (isMobile) {


    const joystick =
        document.createElement("div");


    joystick.className =
        "mobileControl";



    Object.assign(

        joystick.style,

        {

            position: "fixed",

            left: "40px",

            bottom: "40px",

            width: "130px",

            height: "130px",

            borderRadius: "50%",

            background:
                "rgba(255,255,255,0.25)",

            border:
                "2px solid white",

            zIndex: "9999",

            touchAction: "none"

        }

    );



    document.body.appendChild(
        joystick
    );





    const stick =
        document.createElement("div");



    stick.className =
        "mobileControl";



    Object.assign(

        stick.style,

        {

            position: "absolute",

            left: "40px",

            top: "40px",

            width: "50px",

            height: "50px",

            borderRadius: "50%",

            background: "white"

        }

    );



    joystick.appendChild(
        stick
    );





    joystick.addEventListener(

        "touchmove",

        (event) => {


            event.preventDefault();

            event.stopPropagation();



            const touch =
                event.touches[0];



            const rect =
                joystick.getBoundingClientRect();



            let x =

                touch.clientX -
                (rect.left + 65);



            let y =

                touch.clientY -
                (rect.top + 65);



            x = Math.max(

                -45,

                Math.min(

                    45,

                    x

                )

            );



            y = Math.max(

                -45,

                Math.min(

                    45,

                    y

                )

            );





            stick.style.left =
                (40 + x) + "px";



            stick.style.top =
                (40 + y) + "px";




            state.joystick.x =
                x / 45;



            state.joystick.y =
                y / 45;



        },

        {

            passive: false

        }

    );





    joystick.addEventListener(

        "touchend",

        () => {


            state.joystick.x = 0;

            state.joystick.y = 0;



            stick.style.left =
                "40px";



            stick.style.top =
                "40px";


        }

    );




    // ======================================================
    // КНОПКИ ВВЕРХ / ВНИЗ
    // ======================================================


    function createMoveButton(

        text,

        bottom

    ) {


        const button =
            document.createElement("button");



        button.className =
            "mobileControl";



        button.textContent =
            text;



        Object.assign(

            button.style,

            {

                position: "fixed",

                right: "40px",

                bottom: bottom,

                width: "75px",

                height: "75px",

                borderRadius: "50%",

                border: "none",

                background:
                    "rgba(255,255,255,0.85)",

                fontSize: "32px",

                zIndex: "9999",

                touchAction: "none"

            }

        );



        document.body.appendChild(
            button
        );



        return button;

    }





    const upButton =

        createMoveButton(

            "⬆️",

            "140px"

        );



    const downButton =

        createMoveButton(

            "⬇️",

            "50px"

        );





    upButton.addEventListener(

        "touchstart",

        () => {

            state.verticalMove = 1;

        }

    );



    upButton.addEventListener(

        "touchend",

        () => {

            state.verticalMove = 0;

        }

    );





    downButton.addEventListener(

        "touchstart",

        () => {

            state.verticalMove = -1;

        }

    );



    downButton.addEventListener(

        "touchend",

        () => {

            state.verticalMove = 0;

        }

    );



}
// ======================================================
// ДВИЖЕНИЕ ИГРОКА
// ======================================================

const forward =
    new THREE.Vector3();


const right =
    new THREE.Vector3();


const up =
    new THREE.Vector3(
        0,
        1,
        0
    );




// ======================================================
// ОБНОВЛЕНИЕ ДВИЖЕНИЯ
// ======================================================

function updateMovement() {



    camera.getWorldDirection(
        forward
    );



    // убираем движение вверх/вниз
    // при ходьбе

    forward.y = 0;


    forward.normalize();



    right.crossVectors(

        forward,

        up

    );


    right.normalize();




    // ==========================
    // ПК WASD
    // ==========================


    if (

        state.keys["w"] ||
        state.keys["ц"]

    ) {


        camera.position.add(

            forward.clone()
                .multiplyScalar(

                    SETTINGS.movement.speed

                )

        );


    }





    if (

        state.keys["s"] ||
        state.keys["ы"]

    ) {


        camera.position.add(

            forward.clone()
                .multiplyScalar(

                    -SETTINGS.movement.speed

                )

        );


    }





    if (

        state.keys["a"] ||
        state.keys["ф"]

    ) {


        camera.position.add(

            right.clone()
                .multiplyScalar(

                    -SETTINGS.movement.speed

                )

        );


    }





    if (

        state.keys["d"] ||
        state.keys["в"]

    ) {


        camera.position.add(

            right.clone()
                .multiplyScalar(

                    SETTINGS.movement.speed

                )

        );


    }





    // ==========================
    // ВВЕРХ / ВНИЗ
    // ==========================


    if (
        state.keys[" "]
    ) {

        camera.position.y +=
            SETTINGS.movement.speed;

    }



    if (
        state.keys["shift"]
    ) {

        camera.position.y -=
            SETTINGS.movement.speed;

    }






    // ==========================
    // МОБИЛЬНЫЙ ДЖОЙСТИК
    // ==========================


    camera.position.add(

        forward.clone()
            .multiplyScalar(

                -state.joystick.y *
                SETTINGS.movement.speed

            )

    );



    camera.position.add(

        right.clone()
            .multiplyScalar(

                state.joystick.x *
                SETTINGS.movement.speed

            )

    );






    // кнопки вверх / вниз

    camera.position.y +=

        state.verticalMove *
        SETTINGS.movement.speed;



}
// ======================================================
// СИСТЕМА КОЛЛИЗИЙ
// ======================================================


// размеры игрока (камера)

const playerBox =
    new THREE.Box3();



const playerSize =
    new THREE.Vector3(

        0.7,

        1.8,

        0.7

    );




// ======================================================
// ПРОВЕРКА СТОЛКНОВЕНИЯ
// ======================================================

function checkCollision(position) {



    playerBox.setFromCenterAndSize(

        position,

        playerSize

    );



    for (

        const object of collisionObjects

    ) {



        const objectBox =

            new THREE.Box3()
                .setFromObject(object);




        if (

            playerBox.intersectsBox(
                objectBox
            )

        ) {


            return true;


        }


    }



    return false;


}





// ======================================================
// ДВИЖЕНИЕ С ПРОВЕРКОЙ
// ======================================================

function moveCamera(direction) {



    const nextPosition =

        camera.position.clone();



    nextPosition.add(
        direction
    );




    if (

        !checkCollision(
            nextPosition
        )

    ) {


        camera.position.copy(

            nextPosition

        );


    }


}






// ======================================================
// ОГРАНИЧЕНИЕ ВЫСОТЫ
// ======================================================

function limitCameraHeight() {



    if (

        camera.position.y < 0.5

    ) {


        camera.position.y = 0.5;


    }



    if (

        camera.position.y > 50

    ) {


        camera.position.y = 50;


    }



}
// ======================================================
// НОВОЕ ДВИЖЕНИЕ С КОЛЛИЗИЯМИ
// ======================================================

function updateMovementWithCollision() {



    camera.getWorldDirection(
        forward
    );



    forward.y = 0;

    forward.normalize();



    right.crossVectors(

        forward,

        up

    );


    right.normalize();





    const move =
        new THREE.Vector3();





    // ==========================
    // ПК WASD
    // ==========================


    if (

        state.keys["w"] ||
        state.keys["ц"]

    ) {

        move.add(

            forward.clone()
                .multiplyScalar(

                    SETTINGS.movement.speed

                )

        );

    }




    if (

        state.keys["s"] ||
        state.keys["ы"]

    ) {

        move.add(

            forward.clone()
                .multiplyScalar(

                    -SETTINGS.movement.speed

                )

        );

    }




    if (

        state.keys["a"] ||
        state.keys["ф"]

    ) {

        move.add(

            right.clone()
                .multiplyScalar(

                    -SETTINGS.movement.speed

                )

        );

    }




    if (

        state.keys["d"] ||
        state.keys["в"]

    ) {

        move.add(

            right.clone()
                .multiplyScalar(

                    SETTINGS.movement.speed

                )

        );

    }






    // ==========================
    // ДЖОЙСТИК
    // ==========================


    move.add(

        forward.clone()
            .multiplyScalar(

                -state.joystick.y *
                SETTINGS.movement.speed

            )

    );



    move.add(

        right.clone()
            .multiplyScalar(

                state.joystick.x *
                SETTINGS.movement.speed

            )

    );






    // применяем движение

    if (

        move.length() > 0

    ) {

        moveCamera(move);

    }







    // ==========================
    // ВЕРТИКАЛЬНОЕ ДВИЖЕНИЕ
    // ==========================


    const vertical =

        state.verticalMove *
        SETTINGS.movement.speed;



    if (

        vertical !== 0

    ) {


        const newPosition =

            camera.position.clone();



        newPosition.y += vertical;




        if (

            !checkCollision(
                newPosition
            )

        ) {

            camera.position.y += vertical;

        }


    }





    // ПК вверх/вниз

    if (

        state.keys[" "]

    ) {


        camera.position.y +=
            SETTINGS.movement.speed;


    }




    if (

        state.keys["shift"]

    ) {


        camera.position.y -=
            SETTINGS.movement.speed;


    }



}
// ======================================================
// КНОПКА P — КООРДИНАТЫ КАМЕРЫ
// ======================================================

window.addEventListener(

    "keydown",

    (event) => {


        if (

            event.key.toLowerCase() === "p"

        ) {


            console.log(
                "===================="
            );


            console.log(
                "Позиция камеры:"
            );


            console.log(
                "X:",
                camera.position.x
            );


            console.log(
                "Y:",
                camera.position.y
            );


            console.log(
                "Z:",
                camera.position.z
            );



            console.log(
                "Поворот:"
            );


            console.log(
                "Yaw:",
                state.yaw
            );


            console.log(
                "Pitch:",
                state.pitch
            );


            console.log(
                "===================="
            );


        }


    }

);




// ======================================================
// ИЗМЕНЕНИЕ РАЗМЕРА ЭКРАНА
// ======================================================

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


    }

);




// ======================================================
// ГЛАВНЫЙ ЦИКЛ
// ======================================================

function animate() {



    requestAnimationFrame(
        animate
    );



    updateMovementWithCollision();



    limitCameraHeight();



    renderer.render(

        scene,

        camera

    );



}



animate();
// ======================================================
// ПЛАВНОСТЬ ПОВОРОТА КАМЕРЫ
// ======================================================

const cameraRotation = {

    yaw: 0,

    pitch: 0

};



function smoothCameraRotation() {


    cameraRotation.yaw +=

        (state.yaw - cameraRotation.yaw)
        * 0.15;



    cameraRotation.pitch +=

        (state.pitch - cameraRotation.pitch)
        * 0.15;



    camera.rotation.y =
        cameraRotation.yaw;



    camera.rotation.x =
        cameraRotation.pitch;


}





// ======================================================
// ЗАЩИТА POINTER LOCK
// ======================================================

document.addEventListener(

    "pointerlockchange",

    () => {


        if (

            document.pointerLockElement ===
            renderer.domElement

        ) {


            console.log(
                "Мышь захвачена"
            );


        }

        else {


            console.log(
                "Мышь свободна"
            );


        }


    }

);




// ======================================================
// БЕЗОПАСНАЯ ЗАГРУЗКА ТЕКСТУР
// ======================================================

renderer.outputColorSpace =
    THREE.SRGBColorSpace;



renderer.shadowMap.enabled = true;




// ======================================================
// ДОПОЛНИТЕЛЬНАЯ ПРОВЕРКА ЮРТЫ
// ======================================================

function checkYurta() {


    if (
        yurta === null
    ) {

        return;

    }



    yurta.traverse(

        (object) => {


            if (

                object.isMesh

            ) {


                object.castShadow = true;


                object.receiveShadow = true;


            }


        }

    );


}



// запускаем после загрузки

setTimeout(

    checkYurta,

    1000

);
