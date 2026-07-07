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

camera.position.set(0, 2, 5);


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

document.body.appendChild(renderer.domElement);


// =======================
// СВЕТ
// =======================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1
);

scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

directionalLight.position.set(
    5,
    10,
    5
);

scene.add(directionalLight);


// =======================
// ЗАГРУЗКА ЮРТЫ
// =======================

let yurta;


const loader = new GLTFLoader();


loader.load(
    "/yurta.glb",

    (gltf)=>{

        yurta = gltf.scene;

        scene.add(yurta);

    },

    undefined,

    (error)=>{

        console.log(
            "Ошибка загрузки юрты",
            error
        );

    }
);
// =======================
// УПРАВЛЕНИЕ ПК
// =======================

const keys = {};

document.addEventListener(
    "keydown",
    (event)=>{

        keys[event.code] = true;

    }
);


document.addEventListener(
    "keyup",
    (event)=>{

        keys[event.code] = false;

    }
);


const moveSpeed = 0.1;


// =======================
// ПОВОРОТ КАМЕРЫ МЫШЬЮ
// =======================

let mouseDown = false;

let rotationX = 0;
let rotationY = 0;


document.addEventListener(
    "mousedown",
    ()=>{

        mouseDown = true;

    }
);


document.addEventListener(
    "mouseup",
    ()=>{

        mouseDown = false;

    }
);


document.addEventListener(
    "mousemove",
    (event)=>{

        if(!mouseDown) return;


        rotationY -= event.movementX * 0.002;

        rotationX -= event.movementY * 0.002;


        rotationX = Math.max(
            -Math.PI / 2,
            Math.min(
                Math.PI / 2,
                rotationX
            )
        );


    }
);


// =======================
// ДВИЖЕНИЕ
// =======================

function updateMovement(){

    const direction = new THREE.Vector3();


    camera.rotation.set(
        rotationX,
        rotationY,
        0
    );


    if(keys["KeyW"]){

        direction.z -= 1;

    }

    if(keys["KeyS"]){

        direction.z += 1;

    }

    if(keys["KeyA"]){

        direction.x -= 1;

    }

    if(keys["KeyD"]){

        direction.x += 1;

    }


    direction.normalize();


    camera.translateX(
        direction.x * moveSpeed
    );


    camera.translateZ(
        direction.z * moveSpeed
    );

}
// =======================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

const isMobile =
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;


// =======================
// ДЖОЙСТИК
// =======================

let joystickX = 0;
let joystickY = 0;


if(isMobile){


    const joystick = document.createElement("div");


    joystick.style.position = "fixed";
    joystick.style.left = "40px";
    joystick.style.bottom = "40px";
    joystick.style.width = "120px";
    joystick.style.height = "120px";
    joystick.style.borderRadius = "50%";
    joystick.style.background = "rgba(255,255,255,0.3)";
    joystick.style.zIndex = "9999";


    document.body.appendChild(joystick);



    const stick = document.createElement("div");


    stick.style.position = "absolute";
    stick.style.left = "35px";
    stick.style.top = "35px";
    stick.style.width = "50px";
    stick.style.height = "50px";
    stick.style.borderRadius = "50%";
    stick.style.background = "rgba(255,255,255,0.8)";


    joystick.appendChild(stick);



    joystick.addEventListener(
        "touchmove",
        (event)=>{


            const touch = event.touches[0];


            const rect = joystick.getBoundingClientRect();


            let x =
            touch.clientX - 
            (rect.left + 60);


            let y =
            touch.clientY -
            (rect.top + 60);



            const max = 40;


            x = Math.max(
                -max,
                Math.min(max,x)
            );


            y = Math.max(
                -max,
                Math.min(max,y)
            );



            stick.style.left =
            (35 + x) + "px";


            stick.style.top =
            (35 + y) + "px";



            joystickX = x / max;

            joystickY = y / max;


        }
    );



    joystick.addEventListener(
        "touchend",
        ()=>{


            joystickX = 0;

            joystickY = 0;


            stick.style.left = "35px";

            stick.style.top = "35px";


        }
    );



// =======================
// КНОПКИ ВВЕРХ / ВНИЗ
// =======================


let verticalMove = 0;



function createButton(text,bottom){


    const button =
    document.createElement("button");


    button.innerHTML = text;


    button.style.position = "fixed";
    button.style.right = "40px";
    button.style.bottom = bottom;
    button.style.width = "70px";
    button.style.height = "70px";
    button.style.borderRadius = "50%";
    button.style.fontSize = "30px";
    button.style.zIndex = "9999";


    document.body.appendChild(button);


    return button;

}



const upButton =
createButton("⬆️","140px");


const downButton =
createButton("⬇️","50px");



upButton.addEventListener(
"touchstart",
()=>{

    verticalMove = 1;

});


upButton.addEventListener(
"touchend",
()=>{

    verticalMove = 0;

});



downButton.addEventListener(
"touchstart",
()=>{

    verticalMove = -1;

});


downButton.addEventListener(
"touchend",
()=>{

    verticalMove = 0;

});


}
// =======================
// ДВИЖЕНИЕ ТЕЛЕФОНА
// =======================

function updateMobileMovement(){


    if(!isMobile) return;



    // движение вперёд / назад

    camera.translateZ(
        joystickY * moveSpeed
    );


    // движение влево / вправо

    camera.translateX(
        joystickX * moveSpeed
    );



    // вверх / вниз

    if(verticalMove !== 0){

        camera.position.y +=
        verticalMove * moveSpeed;

    }


}



// =======================
// ИГРОВОЙ ЦИКЛ
// =======================

function animate(){

    requestAnimationFrame(animate);



    updateMovement();


    updateMobileMovement();



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
