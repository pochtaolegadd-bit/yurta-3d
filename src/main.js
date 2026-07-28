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

camera.position.set(

    0,

    3,

    8

);

camera.rotation.order = "YXZ";

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

    Math.min(

        window.devicePixelRatio,

        2

    )

);

document.body.style.margin = "0";
document.body.style.overflow = "hidden";

document.body.appendChild(

    renderer.domElement

);

// =======================
// СВЕТ
// =======================

scene.add(

    new THREE.AmbientLight(

        0xffffff,

        2

    )

);

const light = new THREE.DirectionalLight(

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
// ПЕРЕМЕННЫЕ
// =======================

let yaw = 0;
let pitch = 0;

const keys = {};

const speed = 0.15;

let joystickX = 0;
let joystickY = 0;

let verticalMove = 0;

let cameraTouchId = null;

let lastTouchX = 0;
let lastTouchY = 0;

// =======================
// КОЛЛИЗИИ
// =======================

const colliders = [];

const playerBox = new THREE.Box3();

const playerSize = new THREE.Vector3(

    0.8,

    1.8,

    0.8

);

function updatePlayerBox(){

    playerBox.setFromCenterAndSize(

        camera.position.clone(),

        playerSize

    );

}

function addCollider(mesh){

    mesh.updateMatrixWorld(true);

    mesh.geometry.computeBoundingBox();

    const box = mesh.geometry.boundingBox.clone();

    box.applyMatrix4(

        mesh.matrixWorld

    );

    colliders.push(box);

}

function checkCollision(){

    updatePlayerBox();

    for(const box of colliders){

        if(

            playerBox.intersectsBox(box)

        ){

            return true;

        }

    }

    return false;

}

// =======================
// ЗАГРУЗЧИК
// =======================

const loader = new GLTFLoader();
loader.load(

    "/yurta.glb",

    (gltf)=>{

        const yurta = gltf.scene;

        // =======================
        // ЦЕНТРИРУЕМ МОДЕЛЬ
        // =======================

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

        // =======================
        // СОЗДАЕМ КОЛЛИЗИИ
        // =======================

        colliders.length = 0;

        yurta.updateMatrixWorld(true);

        yurta.traverse((child)=>{

            if(!child.isMesh) return;

            addCollider(child);

        });

        console.log(
            "Коллизий:",
            colliders.length
        );

        // =======================
        // СПАВН
        // =======================

        const yurtaBox =
            new THREE.Box3()
            .setFromObject(yurta);

        const yurtaSize =
            yurtaBox.getSize(
                new THREE.Vector3()
            );

        const yurtaCenter =
            yurtaBox.getCenter(
                new THREE.Vector3()
            );

        camera.position.set(

            yurtaCenter.x +
            yurtaSize.x / 2 -
            32,

            yurtaCenter.y +
            2,

            yurtaCenter.z +
            yurtaSize.z / 6 -
            2

        );

        camera.lookAt(

            new THREE.Vector3(

                yurtaCenter.x,

                yurtaCenter.y + 1,

                yurtaCenter.z

            )

        );

        yaw = camera.rotation.y;
        pitch = camera.rotation.x;

    },

    undefined,

    (error)=>{

        console.error(error);

    }

);

// =======================
// КЛАВИАТУРА
// =======================

document.addEventListener(

    "keydown",

    (e)=>{

        keys[
            e.key.toLowerCase()
        ] = true;

    }

);

document.addEventListener(

    "keyup",

    (e)=>{

        keys[
            e.key.toLowerCase()
        ] = false;

    }

);

// =======================
// POINTER LOCK
// =======================

renderer.domElement.addEventListener(

    "click",

    ()=>{

        renderer.domElement
        .requestPointerLock();

    }

);

// =======================
// МЫШЬ
// =======================

document.addEventListener(

    "mousemove",

    (e)=>{

        if(
            document.pointerLockElement !==
            renderer.domElement
        ) return;

        yaw -=
            e.movementX * 0.002;

        pitch -=
            e.movementY * 0.002;

        pitch = Math.max(

            -Math.PI / 2,

            Math.min(

                Math.PI / 2,

                pitch

            )

        );

        camera.rotation.order = "YXZ";

        camera.rotation.y = yaw;

        camera.rotation.x = pitch;

    }

);
// =======================
// ПРОВЕРКА ТЕЛЕФОНА
// =======================

const isMobile =
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0);

if (isMobile) {

    // =======================
    // КАМЕРА ПАЛЬЦЕМ
    // =======================

    document.addEventListener(

        "touchstart",

        (e)=>{

            for(const touch of e.changedTouches){

                if(
                    touch.target.classList.contains(
                        "mobileControl"
                    )
                ) continue;

                if(cameraTouchId === null){

                    cameraTouchId =
                        touch.identifier;

                    lastTouchX =
                        touch.clientX;

                    lastTouchY =
                        touch.clientY;

                }

            }

        }

    );

    document.addEventListener(

        "touchmove",

        (e)=>{

            for(const touch of e.changedTouches){

                if(
                    touch.identifier !==
                    cameraTouchId
                ) continue;

                const dx =
                    touch.clientX -
                    lastTouchX;

                const dy =
                    touch.clientY -
                    lastTouchY;

                yaw -= dx * 0.005;
                pitch -= dy * 0.005;

                pitch = Math.max(

                    -Math.PI / 2,

                    Math.min(

                        Math.PI / 2,

                        pitch

                    )

                );

                camera.rotation.order = "YXZ";
                camera.rotation.y = yaw;
                camera.rotation.x = pitch;

                lastTouchX =
                    touch.clientX;

                lastTouchY =
                    touch.clientY;

            }

        },

        {
            passive:true
        }

    );

    document.addEventListener(

        "touchend",

        (e)=>{

            for(const touch of e.changedTouches){

                if(
                    touch.identifier ===
                    cameraTouchId
                ){

                    cameraTouchId = null;

                }

            }

        }

    );

    // =======================
    // ДЖОЙСТИК
    // =======================

    const joystick =
        document.createElement("div");

    joystick.className =
        "mobileControl";

    Object.assign(

        joystick.style,

        {

            position:"fixed",

            left:"40px",

            bottom:"40px",

            width:"130px",

            height:"130px",

            borderRadius:"50%",

            background:"rgba(255,255,255,0.3)",

            zIndex:"99999",

            touchAction:"none"

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

            position:"absolute",

            left:"40px",

            top:"40px",

            width:"50px",

            height:"50px",

            borderRadius:"50%",

            background:"white"

        }

    );

    joystick.appendChild(
        stick
    );
    // =======================
// УПРАВЛЕНИЕ WASD
// =======================

const keys = {};

window.addEventListener(
    'keydown',
    (event)=>{
        keys[event.code] = true;
    }
);


window.addEventListener(
    'keyup',
    (event)=>{
        keys[event.code] = false;
    }
);


// скорость движения
const moveSpeed = 0.08;


// направление камеры
const direction = new THREE.Vector3();


function movePlayer(){

    direction.set(0,0,0);


    // вперед
    if(keys["KeyW"]){
        direction.z -= 1;
    }


    // назад
    if(keys["KeyS"]){
        direction.z += 1;
    }


    // влево
    if(keys["KeyA"]){
        direction.x -= 1;
    }


    // вправо
    if(keys["KeyD"]){
        direction.x += 1;
    }


    if(direction.length() > 0){

        direction.normalize();


        // учитываем куда смотрит камера
        direction.applyQuaternion(
            camera.quaternion
        );


        // убираем движение вверх/вниз
        direction.y = 0;


        camera.position.addScaledVector(
            direction,
            moveSpeed
        );

    }

}
    // =======================
// МЫШЬ + POINTER LOCK
// =======================

let mouseLocked = false;


// чувствительность мыши
const mouseSensitivity = 0.002;


// поворот камеры
let cameraRotation = {
    x: 0,
    y: 0
};


renderer.domElement.addEventListener(
    "click",
    ()=>{

        renderer.domElement.requestPointerLock();

    }
);



document.addEventListener(
    "pointerlockchange",
    ()=>{

        mouseLocked =
        document.pointerLockElement === renderer.domElement;

    }
);



document.addEventListener(
    "mousemove",
    (event)=>{


        if(!mouseLocked) return;


        cameraRotation.y -= 
        event.movementX * mouseSensitivity;


        cameraRotation.x -= 
        event.movementY * mouseSensitivity;



        // ограничение вверх/вниз
        cameraRotation.x = Math.max(
            -Math.PI / 2,
            Math.min(
                Math.PI / 2,
                cameraRotation.x
            )
        );


        camera.rotation.set(
            cameraRotation.x,
            cameraRotation.y,
            0
        );

    }
);
    // =======================
// КАМЕРА ИГРОКА
// =======================


const playerHeight = 1.7;


// точка взгляда игрока
camera.position.y = playerHeight;


// сохраняем направление камеры
let playerRotation = {
    x: 0,
    y: 0
};



// обновление камеры
function updateCamera(){

    camera.rotation.order = "YXZ";


    camera.rotation.y = playerRotation.y;

    camera.rotation.x = playerRotation.x;

}



// синхронизация мыши
document.addEventListener(
    "mousemove",
    (event)=>{


        if(!mouseLocked) return;


        playerRotation.y -= 
        event.movementX * mouseSensitivity;


        playerRotation.x -= 
        event.movementY * mouseSensitivity;



        // ограничение взгляда
        playerRotation.x = Math.max(
            -1.5,
            Math.min(
                1.5,
                playerRotation.x
            )
        );


    }
);
    // =======================
// КОЛЛИЗИИ
// =======================


const collidableObjects = [];


// добавляем объект в список коллизий
function addCollision(object){

    object.traverse((child)=>{

        if(child.isMesh){

            collidableObjects.push(child);

        }

    });

}



// после загрузки юрты
loader.load(
    '/yurta.glb',
    (gltf)=>{

        yurta = gltf.scene;

        scene.add(yurta);


        yurta.position.set(
            0,
            0,
            0
        );


        yurta.rotation.set(
            0,
            0,
            0
        );


        addCollision(yurta);


        console.log("Юрта с коллизией");

    }
);
    // =======================
// МОБИЛЬНЫЙ ДЖОЙСТИК
// =======================


let isMobile =
/Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent
);



let joystick = null;
let joystickMove = {
    x:0,
    y:0
};



if(isMobile){


    joystick = document.createElement("div");

    joystick.style.position = "fixed";
    joystick.style.left = "40px";
    joystick.style.bottom = "40px";

    joystick.style.width = "120px";
    joystick.style.height = "120px";

    joystick.style.borderRadius = "50%";

    joystick.style.background =
    "rgba(255,255,255,0.25)";

    joystick.style.zIndex = "10";

    document.body.appendChild(
        joystick
    );



    let stick =
    document.createElement("div");


    stick.style.position = "absolute";

    stick.style.left = "35px";
    stick.style.top = "35px";

    stick.style.width = "50px";
    stick.style.height = "50px";

    stick.style.borderRadius =
    "50%";


    stick.style.background =
    "rgba(255,255,255,0.5)";


    joystick.appendChild(stick);



    let joystickActive = false;



    joystick.addEventListener(
        "touchstart",
        ()=>{
            joystickActive = true;
        }
    );



    joystick.addEventListener(
        "touchend",
        ()=>{

            joystickActive = false;

            joystickMove.x = 0;
            joystickMove.y = 0;


            stick.style.left = "35px";
            stick.style.top = "35px";

        }
    );



    joystick.addEventListener(
        "touchmove",
        (event)=>{


            if(!joystickActive)
            return;



            let touch =
            event.touches[0];


            let rect =
            joystick.getBoundingClientRect();



            let x =
            touch.clientX -
            (rect.left + 60);


            let y =
            touch.clientY -
            (rect.top + 60);



            let max = 45;



            let length =
            Math.sqrt(
                x*x + y*y
            );



            if(length > max){

                x =
                x / length * max;

                y =
                y / length * max;

            }



            stick.style.left =
            (35+x)+"px";


            stick.style.top =
            (35+y)+"px";



            joystickMove.x =
            x / max;


            joystickMove.y =
            y / max;


        }
    );

}
    // =======================
// МОБИЛЬНЫЕ КНОПКИ ВВЕРХ / ВНИЗ
// =======================


let mobileVertical = 0;


if(isMobile){


    const upButton =
    document.createElement("div");


    upButton.innerHTML = "▲";


    upButton.style.position = "fixed";
    upButton.style.right = "50px";
    upButton.style.bottom = "150px";

    upButton.style.width = "60px";
    upButton.style.height = "60px";

    upButton.style.borderRadius = "50%";

    upButton.style.background =
    "rgba(255,255,255,0.3)";

    upButton.style.color = "white";

    upButton.style.fontSize = "35px";

    upButton.style.textAlign = "center";
    upButton.style.lineHeight = "60px";

    upButton.style.zIndex = "10";


    document.body.appendChild(
        upButton
    );



    const downButton =
    document.createElement("div");


    downButton.innerHTML = "▼";


    downButton.style.position = "fixed";
    downButton.style.right = "50px";
    downButton.style.bottom = "70px";


    downButton.style.width = "60px";
    downButton.style.height = "60px";


    downButton.style.borderRadius = "50%";


    downButton.style.background =
    "rgba(255,255,255,0.3)";


    downButton.style.color = "white";


    downButton.style.fontSize = "35px";


    downButton.style.textAlign = "center";

    downButton.style.lineHeight = "60px";


    downButton.style.zIndex = "10";


    document.body.appendChild(
        downButton
    );



    upButton.addEventListener(
        "touchstart",
        ()=>{
            mobileVertical = 1;
        }
    );


    upButton.addEventListener(
        "touchend",
        ()=>{
            mobileVertical = 0;
        }
    );



    downButton.addEventListener(
        "touchstart",
        ()=>{
            mobileVertical = -1;
        }
    );


    downButton.addEventListener(
        "touchend",
        ()=>{
            mobileVertical = 0;
        }
    );


}
    // =======================
// МОБИЛЬНАЯ КАМЕРА
// =======================


let cameraTouch = null;

let lastTouchX = 0;
let lastTouchY = 0;


const mobileCameraSensitivity = 0.005;



if(isMobile){


    renderer.domElement.addEventListener(
        "touchstart",
        (event)=>{


            for(let touch of event.changedTouches){


                // правая половина экрана = камера
                if(
                    touch.clientX >
                    window.innerWidth / 2
                ){

                    cameraTouch = touch.identifier;


                    lastTouchX =
                    touch.clientX;


                    lastTouchY =
                    touch.clientY;


                    break;

                }

            }


        },
        {passive:false}
    );




    renderer.domElement.addEventListener(
        "touchmove",
        (event)=>{


            for(let touch of event.changedTouches){


                if(
                    touch.identifier === cameraTouch
                ){


                    let deltaX =
                    touch.clientX -
                    lastTouchX;


                    let deltaY =
                    touch.clientY -
                    lastTouchY;



                    playerRotation.y -=
                    deltaX *
                    mobileCameraSensitivity;



                    playerRotation.x -=
                    deltaY *
                    mobileCameraSensitivity;



                    playerRotation.x =
                    Math.max(
                        -1.5,
                        Math.min(
                            1.5,
                            playerRotation.x
                        )
                    );



                    lastTouchX =
                    touch.clientX;


                    lastTouchY =
                    touch.clientY;



                }


            }


        },
        {passive:false}
    );




    renderer.domElement.addEventListener(
        "touchend",
        (event)=>{


            for(let touch of event.changedTouches){


                if(
                    touch.identifier === cameraTouch
                ){

                    cameraTouch = null;

                }


            }


        }
    );


}
    // =======================
// КООРДИНАТЫ КАМЕРЫ (P)
// =======================


window.addEventListener(
    "keydown",
    (event)=>{


        if(event.code === "KeyP"){


            console.log(
                "Позиция камеры:"
            );


            console.log(
                "x:",
                camera.position.x,
                "y:",
                camera.position.y,
                "z:",
                camera.position.z
            );



            console.log(
                "Поворот камеры:"
            );


            console.log(
                "x:",
                camera.rotation.x,
                "y:",
                camera.rotation.y,
                "z:",
                camera.rotation.z
            );


        }


    }
);
    // =======================
// ИГРОВОЙ ЦИКЛ
// =======================


function animate(){

    requestAnimationFrame(
        animate
    );


    // движение игрока
    movePlayer();


    // обновление камеры
    updateCamera();


    // проверка столкновений
    checkCollision();



    renderer.render(
        scene,
        camera
    );

}


animate();
