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


// старт камеры возле юрты

camera.position.set(
    0,
    2,
    6
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


document.body.style.margin = "0";

document.body.appendChild(
    renderer.domElement
);



// =======================
// СВЕТ
// =======================

const ambientLight =
new THREE.AmbientLight(
    0xffffff,
    2
);


scene.add(
    ambientLight
);



const dirLight =
new THREE.DirectionalLight(
    0xffffff,
    3
);


dirLight.position.set(
    5,
    10,
    5
);


scene.add(
    dirLight
);




// =======================
// ЮРТА
// =======================

const loader = new GLTFLoader();


loader.load(

    "/yurta.glb",

    (gltf)=>{


        const model =
        gltf.scene;


        scene.add(
            model
        );


        console.log(
            "Юрта загружена"
        );


    },


    undefined,


    (error)=>{


        console.error(
            error
        );


    }

);
// =======================
// УПРАВЛЕНИЕ
// =======================

const keys = {};

document.addEventListener(
    "keydown",
    (e)=>{
        keys[e.key.toLowerCase()] = true;
    }
);


document.addEventListener(
    "keyup",
    (e)=>{
        keys[e.key.toLowerCase()] = false;
    }
);



// =======================
// POINTER LOCK МЫШЬ ПК
// =======================

let yaw = 0;
let pitch = 0;


document.body.addEventListener(
    "click",
    ()=>{
        document.body.requestPointerLock();
    }
);



document.addEventListener(
    "mousemove",
    (e)=>{

        if(document.pointerLockElement === document.body){

            yaw -= e.movementX * 0.002;
            pitch -= e.movementY * 0.002;


            pitch = Math.max(
                -Math.PI / 2,
                Math.min(Math.PI / 2,pitch)
            );


            camera.rotation.order = "YXZ";

            camera.rotation.y = yaw;
            camera.rotation.x = pitch;

        }

    }
);



// =======================
// ТЕЛЕФОН
// =======================

const isMobile =
'ontouchstart' in window ||
navigator.maxTouchPoints > 0;



let touchX = 0;
let touchY = 0;



// поворот камеры пальцем

if(isMobile){


document.addEventListener(
"touchstart",
(e)=>{

    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;

});



document.addEventListener(
"touchmove",
(e)=>{


    let dx =
    e.touches[0].clientX - touchX;


    let dy =
    e.touches[0].clientY - touchY;



    yaw -= dx * 0.005;

    pitch -= dy * 0.005;



    pitch = Math.max(
        -Math.PI/2,
        Math.min(Math.PI/2,pitch)
    );


    camera.rotation.order="YXZ";

    camera.rotation.y=yaw;

    camera.rotation.x=pitch;



    touchX=e.touches[0].clientX;

    touchY=e.touches[0].clientY;


});

}



// =======================
// ДЖОЙСТИК
// =======================

let joystickX = 0;
let joystickY = 0;

let verticalMove = 0;



if(isMobile){


const base =
document.createElement("div");


base.style.position="fixed";
base.style.left="40px";
base.style.bottom="40px";
base.style.width="130px";
base.style.height="130px";
base.style.borderRadius="50%";
base.style.background="rgba(255,255,255,0.25)";
base.style.zIndex="9999";


document.body.appendChild(base);



const stick =
document.createElement("div");


stick.style.position="absolute";
stick.style.left="40px";
stick.style.top="40px";
stick.style.width="50px";
stick.style.height="50px";
stick.style.borderRadius="50%";
stick.style.background="white";


base.appendChild(stick);



base.addEventListener(
"touchmove",
(e)=>{


e.preventDefault();


let touch=e.touches[0];

let rect=base.getBoundingClientRect();


let x =
touch.clientX-(rect.left+65);


let y =
touch.clientY-(rect.top+65);



let max=45;


x=Math.max(-max,Math.min(max,x));

y=Math.max(-max,Math.min(max,y));



stick.style.left =
40+x+"px";


stick.style.top =
40+y+"px";


joystickX=x/max;

joystickY=y/max;


},
{passive:false}
);



base.addEventListener(
"touchend",
()=>{


joystickX=0;

joystickY=0;


stick.style.left="40px";

stick.style.top="40px";


});




// =======================
// КНОПКИ ВВЕРХ ВНИЗ
// =======================


function createButton(text,bottom){


let btn=document.createElement("button");


btn.innerHTML=text;


btn.style.position="fixed";
btn.style.right="40px";
btn.style.bottom=bottom;
btn.style.width="75px";
btn.style.height="75px";
btn.style.borderRadius="50%";
btn.style.fontSize="35px";
btn.style.zIndex="9999";


// нельзя копировать

btn.style.userSelect="none";
btn.style.webkitUserSelect="none";
btn.style.touchAction="none";


document.body.appendChild(btn);


return btn;

}



let up =
createButton("⬆️","140px");


let down =
createButton("⬇️","50px");



up.ontouchstart=()=>{
verticalMove=1;
};


up.ontouchend=()=>{
verticalMove=0;
};



down.ontouchstart=()=>{
verticalMove=-1;
};


down.ontouchend=()=>{
verticalMove=0;
};



}



// =======================
// ДВИЖЕНИЕ
// =======================

const speed = 0.08;


function updateMovement(){


let forward =
new THREE.Vector3();


camera.getWorldDirection(forward);

forward.y=0;

forward.normalize();



let right =
new THREE.Vector3();


right.crossVectors(
forward,
new THREE.Vector3(0,1,0)
);

right.normalize();



// ПК

if(keys["w"]||keys["ц"])
camera.position.add(
forward.clone().multiplyScalar(speed)
);


if(keys["s"]||keys["ы"])
camera.position.add(
forward.clone().multiplyScalar(-speed)
);


if(keys["a"]||keys["ф"])
camera.position.add(
right.clone().multiplyScalar(-speed)
);


if(keys["d"]||keys["в"])
camera.position.add(
right.clone().multiplyScalar(speed)
);



// вверх вниз

if(keys[" "])
camera.position.y+=speed;


if(keys["shift"])
camera.position.y-=speed;



// телефон джойстик

if(isMobile){


camera.position.add(
forward.clone()
.multiplyScalar(-joystickY*speed)
);


camera.position.add(
right.clone()
.multiplyScalar(joystickX*speed)
);



camera.position.y +=
verticalMove*speed;


}



}




// =======================
// ЗАПУСК
// =======================

function animate(){

requestAnimationFrame(
animate
);


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
()=>{


camera.aspect =
window.innerWidth/window.innerHeight;


camera.updateProjectionMatrix();


renderer.setSize(
window.innerWidth,
window.innerHeight
);


});
