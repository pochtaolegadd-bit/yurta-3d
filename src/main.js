import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";


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


// стартовая позиция игрока
camera.position.set(
    0,
    2,
    6
);


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

renderer.setPixelRatio(
    window.devicePixelRatio
);


document.body.appendChild(renderer.domElement);


// =======================
// СВЕТ
// =======================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.5
);

scene.add(ambientLight);


const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);

sun.position.set(
    5,
    10,
    5
);

scene.add(sun);


// =======================
// ПЕРЕМЕННЫЕ
// =======================

let yurta = null;

let playerSpeed = 0.12;


// движение
const keys = {};


// камера
let yaw = 0;
let pitch = 0;


// мобильное управление
let joystickX = 0;
let joystickY = 0;

let mobileUp = false;
let mobileDown = false;
// =======================
// ЗАГРУЗКА ЮРТЫ
// =======================

const loader = new GLTFLoader();


loader.load(
    "/yurta.glb",

    (gltf) => {

        yurta = gltf.scene;

        scene.add(yurta);


        // размер юрты
        yurta.scale.set(
            1,
            1,
            1
        );


        // позиция юрты
        yurta.position.set(
            0,
            0,
            0
        );


        console.log("Юрта загружена");


        // =======================
        // СПАВН ИГРОКА
        // =======================

        camera.position.set(
            0,
            2,
            5
        );


        // смотрим на юрту
        camera.lookAt(
            yurta.position
        );

    },


    (progress) => {

        console.log(
            "Загрузка:",
            Math.round(
                progress.loaded / progress.total * 100
            ),
            "%"
        );

    },


    (error) => {

        console.error(
            "Ошибка загрузки юрты:",
            error
        );

    }
);

// =======================
// КЛАВИАТУРА WASD
// =======================

window.addEventListener(
    "keydown",
    (event) => {

        keys[event.code] = true;

    }
);


window.addEventListener(
    "keyup",
    (event) => {

        keys[event.code] = false;

    }
);



// =======================
// ДВИЖЕНИЕ ИГРОКА
// =======================

function movePlayer() {


    let direction = new THREE.Vector3();


    // направление камеры
    camera.getWorldDirection(direction);


    direction.y = 0;

    direction.normalize();



    let right = new THREE.Vector3();

    right.crossVectors(
        direction,
        camera.up
    );

    right.normalize();



    // вперед
    if (keys["KeyW"]) {

        camera.position.add(
            direction.multiplyScalar(playerSpeed)
        );

    }


    // назад
    if (keys["KeyS"]) {

        camera.position.add(
            direction.multiplyScalar(-playerSpeed)
        );

    }


    // влево
    if (keys["KeyA"]) {

        camera.position.add(
            right.multiplyScalar(-playerSpeed)
        );

    }


    // вправо
    if (keys["KeyD"]) {

        camera.position.add(
            right.multiplyScalar(playerSpeed)
        );

    }


    // вверх
    if (keys["Space"]) {

        camera.position.y += playerSpeed;

    }


    // вниз
    if (keys["ShiftLeft"]) {

        camera.position.y -= playerSpeed;

    }

}

// =======================
// КАМЕРА МЫШЬЮ
// =======================

let mouseDown = false;

let lastMouseX = 0;
let lastMouseY = 0;


const mouseSensitivity = 0.002;



window.addEventListener(
    "mousedown",
    (event) => {

        mouseDown = true;

        lastMouseX = event.clientX;
        lastMouseY = event.clientY;

    }
);



window.addEventListener(
    "mouseup",
    () => {

        mouseDown = false;

    }
);



window.addEventListener(
    "mousemove",
    (event) => {


        // если мышь не зажата — ничего не делаем
        if (!mouseDown) return;



        let movementX =
            event.clientX - lastMouseX;


        let movementY =
            event.clientY - lastMouseY;



        lastMouseX = event.clientX;
        lastMouseY = event.clientY;



        yaw -= movementX * mouseSensitivity;

        pitch -= movementY * mouseSensitivity;



        // ограничение взгляда вверх/вниз
        pitch = Math.max(
            -1.5,
            Math.min(
                1.5,
                pitch
            )
        );


        updateCameraRotation();

    }
);



// =======================
// ПОВОРОТ КАМЕРЫ
// =======================

function updateCameraRotation() {


    camera.rotation.order = "YXZ";


    camera.rotation.y = yaw;

    camera.rotation.x = pitch;


}

// =======================
// ПРОВЕРКА ТЕЛЕФОНА
// =======================

const isMobile =
    /Android|iPhone|iPad|iPod/i.test(
        navigator.userAgent
    );


// =======================
// СОЗДАЁМ МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

if (isMobile) {


    const controls = document.createElement("div");

    controls.id = "mobileControls";


    controls.innerHTML = `

        <div id="joystick">

            <div id="stick"></div>

        </div>


        <div id="verticalButtons">

            <button id="upButton">
                ▲
            </button>


            <button id="downButton">
                ▼
            </button>

        </div>

    `;


    document.body.appendChild(
        controls
    );



    // =======================
    // СТИЛИ
    // =======================

    const style =
    document.createElement("style");


    style.innerHTML = `


    #mobileControls {

        position: fixed;
        bottom: 30px;
        left: 30px;
        z-index: 10;

        user-select: none;

    }



    #joystick {

        width:120px;
        height:120px;

        border-radius:50%;

        background:
        rgba(255,255,255,0.25);

        display:flex;
        align-items:center;
        justify-content:center;

    }



    #stick {

        width:50px;
        height:50px;

        border-radius:50%;

        background:
        rgba(255,255,255,0.6);

    }



    #verticalButtons {

        position:absolute;

        left:170px;
        bottom:0;

        display:flex;
        flex-direction:column;

        gap:10px;

    }



    #verticalButtons button {

        width:60px;
        height:60px;

        font-size:25px;

    }


    `;


    document.head.appendChild(
        style
    );



    // =======================
    // ДЖОЙСТИК
    // =======================

    const joystick =
        document.getElementById(
            "joystick"
        );


    const stick =
        document.getElementById(
            "stick"
        );



    let joystickActive = false;



    joystick.addEventListener(
        "touchstart",
        (e)=>{

            joystickActive = true;

        }
    );



    joystick.addEventListener(
        "touchmove",
        (e)=>{


            if(!joystickActive)
                return;


            const touch =
                e.touches[0];


            const rect =
                joystick.getBoundingClientRect();



            let x =
            touch.clientX -
            (rect.left + rect.width/2);


            let y =
            touch.clientY -
            (rect.top + rect.height/2);



            let distance =
            Math.sqrt(
                x*x+y*y
            );



            const max = 45;



            if(distance > max){

                x =
                x / distance * max;

                y =
                y / distance * max;

            }



            stick.style.transform =
            `translate(${x}px,${y}px)`;


            joystickX =
            x / max;


            joystickY =
            y / max;



        }
    );



    joystick.addEventListener(
        "touchend",
        ()=>{


            joystickActive=false;


            joystickX=0;

            joystickY=0;


            stick.style.transform =
            "translate(0px,0px)";


        }
    );



    // =======================
    // КНОПКИ ВВЕРХ / ВНИЗ
    // =======================

    const up =
    document.getElementById(
        "upButton"
    );


    const down =
    document.getElementById(
        "downButton"
    );



    up.ontouchstart = () => {

        mobileUp=true;

    };


    up.ontouchend = () => {

        mobileUp=false;

    };



    down.ontouchstart = () => {

        mobileDown=true;

    };


    down.ontouchend = () => {

        mobileDown=false;

    };


}

// =======================
// МОБИЛЬНОЕ ДВИЖЕНИЕ
// =======================

function moveMobilePlayer() {


    if (!isMobile)
        return;



    let direction =
    new THREE.Vector3();


    camera.getWorldDirection(
        direction
    );


    direction.y = 0;

    direction.normalize();



    let right =
    new THREE.Vector3();


    right.crossVectors(
        direction,
        camera.up
    );


    right.normalize();



    // вперед / назад

    if (joystickY !== 0) {


        camera.position.add(
            direction.multiplyScalar(
                -joystickY * playerSpeed
            )
        );


    }



    // влево / вправо

    if (joystickX !== 0) {


        camera.position.add(
            right.multiplyScalar(
                joystickX * playerSpeed
            )
        );


    }



    // вверх

    if(mobileUp){

        camera.position.y += playerSpeed;

    }



    // вниз

    if(mobileDown){

        camera.position.y -= playerSpeed;

    }


}




// =======================
// КАМЕРА НА ТЕЛЕФОНЕ
// =======================

let touchStartX = 0;
let touchStartY = 0;



let cameraTouch = false;



window.addEventListener(
"touchstart",
(e)=>{


    // если касание по джойстику
    // не трогаем камеру

    if(
        e.target.closest("#joystick") ||
        e.target.closest("#verticalButtons")
    ){

        cameraTouch=false;

        return;

    }



    // камера только одним пальцем

    if(e.touches.length === 1){


        cameraTouch=true;


        touchStartX =
        e.touches[0].clientX;


        touchStartY =
        e.touches[0].clientY;


    }


});




window.addEventListener(
"touchmove",
(e)=>{


    if(!cameraTouch)
        return;



    // второе касание игнорируем

    if(e.touches.length !== 1)
        return;



    let x =
    e.touches[0].clientX;


    let y =
    e.touches[0].clientY;



    let dx =
    x - touchStartX;


    let dy =
    y - touchStartY;



    touchStartX=x;
    touchStartY=y;



    yaw -= dx * 0.005;

    pitch -= dy * 0.005;



    pitch =
    Math.max(
        -1.5,
        Math.min(
            1.5,
            pitch
        )
    );



    updateCameraRotation();



});




window.addEventListener(
"touchend",
()=>{

    cameraTouch=false;

});

// =======================
// ИГРОВОЙ ЦИКЛ
// =======================

function animate(){


    requestAnimationFrame(
        animate
    );


    // ПК движение

    movePlayer();



    // Телефон движение

    moveMobilePlayer();



    renderer.render(
        scene,
        camera
    );

}



animate();




// =======================
// АДАПТАЦИЯ ЭКРАНА
// =======================

window.addEventListener(
"resize",
()=>{


    camera.aspect =
    window.innerWidth /
    window.innerHeight;


    camera.updateProjectionMatrix();



    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


});




// =======================
// ОТКЛЮЧАЕМ ПРОКРУТКУ
// НА ТЕЛЕФОНЕ
// =======================

document.body.style.margin = "0";

document.body.style.overflow = "hidden";

document.body.style.touchAction = "none";
