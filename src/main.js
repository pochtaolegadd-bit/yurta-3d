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


// стартовый спавн
camera.position.set(
    0.02129659801721573,
    6,
    4
);



// =======================
// РЕНДЕР
// =======================

const renderer = new THREE.WebGLRenderer({
    antialias:true
});


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    window.devicePixelRatio
);


document.body.appendChild(
    renderer.domElement
);



// =======================
// СВЕТ
// =======================

const light = new THREE.AmbientLight(
    0xffffff,
    1.5
);

scene.add(light);



const sun = new THREE.DirectionalLight(
    0xffffff,
    2
);


sun.position.set(
    10,
    10,
    5
);


scene.add(sun);



// =======================
// ПЕРЕМЕННЫЕ
// =======================

let yurta = null;


const speed = 0.15;



// клавиатура

const keys = {};



// камера

let yaw = 0;
let pitch = 0;



// телефон

let joystickX = 0;
let joystickY = 0;


let mobileUp = false;
let mobileDown = false;



// мышь

let mouseDown = false;

let lastMouseX = 0;
let lastMouseY = 0;

// =======================
// ЗАГРУЗКА ЮРТЫ
// =======================

const loader = new GLTFLoader();



loader.load(
    "/yurta.glb",

    (gltf)=>{


        yurta = gltf.scene;


        scene.add(
            yurta
        );



        // координаты юрты
        yurta.position.set(
            0.02129659801721573,
            4.555867652827213,
            -0.026299932971596718
        );



        yurta.scale.set(
            1,
            1,
            1
        );



        console.log(
            "Юрта загружена"
        );



        // стартовая позиция игрока
        spawnPlayer();


    },


    undefined,


    (error)=>{

        console.error(
            "Ошибка юрты:",
            error
        );

    }
);





// =======================
// ТОЧКА СПАВНА
// =======================

function spawnPlayer(){


    camera.position.set(
        0.02129659801721573,
        6,
        4
    );


    camera.rotation.set(
        0,
        0,
        0
    );


    yaw = 0;

    pitch = 0;



    if(yurta){

        camera.lookAt(
            yurta.position
        );

    }


}






// =======================
// РЕСПАВН НА R
// =======================

window.addEventListener(
"keydown",
(e)=>{


    if(e.code === "KeyR"){


        spawnPlayer();


        console.log(
            "Игрок перемещен на спавн"
        );


    }


});

// =======================
// КЛАВИАТУРА
// =======================

window.addEventListener(
"keydown",
(e)=>{

    keys[e.code] = true;

});



window.addEventListener(
"keyup",
(e)=>{

    keys[e.code] = false;

});





// =======================
// ДВИЖЕНИЕ ПК
// =======================

function movePlayer(){


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





    // вперед

    if(keys["KeyW"]){

        camera.position.add(
            direction.clone()
            .multiplyScalar(speed)
        );

    }




    // назад

    if(keys["KeyS"]){

        camera.position.add(
            direction.clone()
            .multiplyScalar(-speed)
        );

    }





    // влево

    if(keys["KeyA"]){

        camera.position.add(
            right.clone()
            .multiplyScalar(-speed)
        );

    }





    // вправо

    if(keys["KeyD"]){

        camera.position.add(
            right.clone()
            .multiplyScalar(speed)
        );

    }





    // вверх

    if(keys["Space"]){

        camera.position.y += speed;

    }





    // вниз

    if(keys["ShiftLeft"]){

        camera.position.y -= speed;

    }


}

// =======================
// КАМЕРА МЫШЬЮ
// =======================

const mouseSensitivity = 0.002;



window.addEventListener(
"mousedown",
(e)=>{


    mouseDown = true;


    lastMouseX = e.clientX;

    lastMouseY = e.clientY;


});





window.addEventListener(
"mouseup",
()=>{


    mouseDown = false;


});






window.addEventListener(
"mousemove",
(e)=>{


    if(!mouseDown)
        return;



    let dx =
    e.clientX - lastMouseX;


    let dy =
    e.clientY - lastMouseY;



    lastMouseX =
    e.clientX;


    lastMouseY =
    e.clientY;




    yaw -= dx * mouseSensitivity;


    pitch -= dy * mouseSensitivity;




    // ограничение вверх вниз

    pitch = Math.max(
        -1.5,
        Math.min(
            1.5,
            pitch
        )
    );



    updateCameraRotation();


});







// =======================
// ОБНОВЛЕНИЕ КАМЕРЫ
// =======================

function updateCameraRotation(){


    camera.rotation.order =
    "YXZ";



    camera.rotation.y =
    yaw;



    camera.rotation.x =
    pitch;


}

// =======================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

const isMobile =
/Android|iPhone|iPad|iPod/i.test(
    navigator.userAgent
);



if(isMobile){


const mobileUI =
document.createElement("div");


mobileUI.innerHTML = `

<div id="joystick">
    <div id="stick"></div>
</div>


<div id="flyButtons">

<button id="upBtn">▲</button>
<button id="downBtn">▼</button>

</div>

`;



document.body.appendChild(
    mobileUI
);





const style =
document.createElement("style");

style.innerHTML = `


#joystick{

position:fixed;

left:30px;

bottom:30px;

width:120px;

height:120px;

border-radius:50%;

background:rgba(255,255,255,.25);

z-index:20;

display:flex;

align-items:center;

justify-content:center;

touch-action:none;

}



#stick{

width:50px;

height:50px;

border-radius:50%;

background:rgba(255,255,255,.7);

}



#flyButtons{

position:fixed;

right:30px;

bottom:40px;

display:flex;

flex-direction:column;

gap:15px;

z-index:20;

}



#flyButtons button{

width:70px;

height:70px;

font-size:30px;

touch-action:none;

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



let joystickTouchId = null;



joystick.addEventListener(
"touchstart",
(e)=>{


joystickTouchId =
e.changedTouches[0].identifier;


},
{
passive:false
}
);





joystick.addEventListener(
"touchmove",
(e)=>{


e.preventDefault();



let touch =
[...e.touches]
.find(
t=>t.identifier===joystickTouchId
);



if(!touch)
return;



let rect =
joystick.getBoundingClientRect();



let x =
touch.clientX -
(rect.left + rect.width/2);



let y =
touch.clientY -
(rect.top + rect.height/2);




let max = 45;


let distance =
Math.sqrt(
x*x+y*y
);



if(distance>max){

x =
x/distance*max;

y =
y/distance*max;

}



stick.style.transform =
`translate(${x}px,${y}px)`;


joystickX =
x/max;


joystickY =
y/max;



},
{
passive:false
});






joystick.addEventListener(
"touchend",
(e)=>{


joystickX=0;

joystickY=0;


stick.style.transform =
"translate(0,0)";



},
{
passive:false
});






// =======================
// КНОПКИ ПОЛЁТА
// =======================


const upBtn =
document.getElementById(
"upBtn"
);


const downBtn =
document.getElementById(
"downBtn"
);



upBtn.ontouchstart=()=>{
mobileUp=true;
};


upBtn.ontouchend=()=>{
mobileUp=false;
};



downBtn.ontouchstart=()=>{
mobileDown=true;
};


downBtn.ontouchend=()=>{
mobileDown=false;
};



}

// =======================
// МОБИЛЬНАЯ КАМЕРА
// =======================

let cameraTouchId = null;


let lastTouchX = 0;
let lastTouchY = 0;



window.addEventListener(
"touchstart",
(e)=>{


for(
let touch of e.changedTouches
){



// если палец не на управлении

let element =
document.elementFromPoint(
touch.clientX,
touch.clientY
);



if(
element &&
(
element.closest("#joystick") ||
element.closest("#flyButtons")
)
){

continue;

}




// назначаем палец камеры

if(cameraTouchId === null){


cameraTouchId =
touch.identifier;


lastTouchX =
touch.clientX;


lastTouchY =
touch.clientY;



}



}



},
{
passive:false
});








window.addEventListener(
"touchmove",
(e)=>{


let touch =
[...e.touches]
.find(
t=>t.identifier===cameraTouchId
);



if(!touch)
return;





let dx =
touch.clientX -
lastTouchX;


let dy =
touch.clientY -
lastTouchY;




lastTouchX =
touch.clientX;


lastTouchY =
touch.clientY;




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



},
{
passive:false
});







window.addEventListener(
"touchend",
(e)=>{


for(
let touch of e.changedTouches
){


if(
touch.identifier === cameraTouchId
){


cameraTouchId=null;


}


}



});

// =======================
// ДВИЖЕНИЕ С ТЕЛЕФОНА
// =======================

function moveMobilePlayer(){


    if(!isMobile)
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

    if(joystickY !== 0){


        camera.position.add(
            direction.clone()
            .multiplyScalar(
                -joystickY * speed
            )
        );


    }





    // влево / вправо

    if(joystickX !== 0){


        camera.position.add(
            right.clone()
            .multiplyScalar(
                joystickX * speed
            )
        );


    }






    // вверх

    if(mobileUp){


        camera.position.y += speed;


    }






    // вниз

    if(mobileDown){


        camera.position.y -= speed;


    }


}







// =======================
// ИГРОВОЙ ЦИКЛ
// =======================

function animate(){


requestAnimationFrame(
    animate
);




movePlayer();



moveMobilePlayer();




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







// =======================
// НАСТРОЙКИ СТРАНИЦЫ
// =======================

document.body.style.margin =
"0";


document.body.style.overflow =
"hidden";


document.body.style.touchAction =
"none";
