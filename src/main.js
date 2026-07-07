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


// стартовая позиция
// потом подгоним под дверь юрты

camera.position.set(
    0,
    1.7,
    5
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


document.body.appendChild(
    renderer.domElement
);


// =======================
// СВЕТ
// =======================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1
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
// ЮРТА
// =======================

let yurta;


const loader = new GLTFLoader();


loader.load(
    "/yurta.glb",

    (gltf)=>{

        yurta = gltf.scene;

        scene.add(yurta);


        // камера возле входа
        camera.position.set(
            0,
            1.7,
            5
        );


        camera.lookAt(
            0,
            1.5,
            0
        );


    },


    undefined,


    (error)=>{

        console.log(
            "Ошибка загрузки модели",
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
// КАМЕРА МЫШЬЮ
// =======================

let mouseDown = false;

let rotX = 0;
let rotY = 0;



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


        rotY -= event.movementX * 0.002;

        rotX -= event.movementY * 0.002;


        rotX = Math.max(
            -Math.PI / 2,
            Math.min(
                Math.PI / 2,
                rotX
            )
        );

    }
);



// =======================
// ДВИЖЕНИЕ ПК
// =======================

function updatePCMovement(){


    camera.rotation.set(
        rotX,
        rotY,
        0
    );


    if(keys["KeyW"]){

        camera.translateZ(
            -moveSpeed
        );

    }


    if(keys["KeyS"]){

        camera.translateZ(
            moveSpeed
        );

    }


    if(keys["KeyA"]){

        camera.translateX(
            -moveSpeed
        );

    }


    if(keys["KeyD"]){

        camera.translateX(
            moveSpeed
        );

    }


}
// =======================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

const isMobile =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;


let joystickX = 0;
let joystickY = 0;

let verticalMove = 0;



if(isMobile){


// =======================
// ДЖОЙСТИК
// =======================

const joystickBase =
document.createElement("div");


joystickBase.style.position = "fixed";
joystickBase.style.left = "40px";
joystickBase.style.bottom = "40px";
joystickBase.style.width = "130px";
joystickBase.style.height = "130px";
joystickBase.style.borderRadius = "50%";
joystickBase.style.background =
"rgba(255,255,255,0.25)";
joystickBase.style.zIndex = "9999";


document.body.appendChild(
    joystickBase
);



const joystickStick =
document.createElement("div");


joystickStick.style.position = "absolute";
joystickStick.style.left = "40px";
joystickStick.style.top = "40px";
joystickStick.style.width = "50px";
joystickStick.style.height = "50px";
joystickStick.style.borderRadius = "50%";
joystickStick.style.background =
"rgba(255,255,255,0.8)";


joystickBase.appendChild(
    joystickStick
);




joystickBase.addEventListener(
"touchmove",
(e)=>{

    e.preventDefault();


    const touch =
    e.touches[0];


    const rect =
    joystickBase.getBoundingClientRect();



    let x =
    touch.clientX -
    (rect.left + 65);



    let y =
    touch.clientY -
    (rect.top + 65);



    const max = 45;



    x = Math.max(
        -max,
        Math.min(max,x)
    );


    y = Math.max(
        -max,
        Math.min(max,y)
    );



    joystickStick.style.left =
    (40 + x) + "px";


    joystickStick.style.top =
    (40 + y) + "px";



    joystickX = x / max;

    joystickY = y / max;


},
{passive:false}
);



joystickBase.addEventListener(
"touchend",
()=>{

    joystickX = 0;

    joystickY = 0;


    joystickStick.style.left =
    "40px";


    joystickStick.style.top =
    "40px";

}
);



// =======================
// КНОПКИ ВВЕРХ / ВНИЗ
// =======================


function createArrow(text, bottom){


const button =
document.createElement("button");


button.innerHTML = text;


button.style.position = "fixed";
button.style.right = "40px";
button.style.bottom = bottom;
button.style.width = "75px";
button.style.height = "75px";
button.style.borderRadius = "50%";
button.style.fontSize = "35px";
button.style.opacity = "0.7";
button.style.zIndex = "9999";


document.body.appendChild(button);


return button;

}



const upButton =
createArrow("⬆️","140px");


const downButton =
createArrow("⬇️","50px");



upButton.addEventListener(
"touchstart",
()=>{

    verticalMove = 1;

}
);


upButton.addEventListener(
"touchend",
()=>{

    verticalMove = 0;

}
);



downButton.addEventListener(
"touchstart",
()=>{

    verticalMove = -1;

}
);


downButton.addEventListener(
"touchend",
()=>{

    verticalMove = 0;

}
);


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


    requestAnimationFrame(
        animate
    );



    updatePCMovement();


    updateMobileMovement();



    renderer.render(
        scene,
        camera
    );


}



animate();





// =======================
// РАЗМЕР ЭКРАНА
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
