import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


// =======================
// СЦЕНА
// =======================

const scene = new THREE.Scene();

scene.background =
new THREE.Color(0xdcefff);



// =======================
// КАМЕРА
// =======================

const camera =
new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);


// СПАВН ИГРОКА

camera.position.set(
    0.02129659801721573,
    6,
    8
);





// =======================
// РЕНДЕР
// =======================

const renderer =
new THREE.WebGLRenderer({
    antialias:true
});


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    window.devicePixelRatio
);


document.body.style.margin = "0";


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
));


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
// ЮРТА
// =======================

let yurta = null;


const loader =
new GLTFLoader();



loader.load(

"/yurta.glb",


(gltf)=>{


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



yurta.position.x -= center.x;
yurta.position.y -= center.y;
yurta.position.z -= center.z;




scene.add(
    yurta
);



console.log(
"Юрта загружена"
);



// камера смотрит на юрту

camera.lookAt(
    yurta.position
);



yaw =
camera.rotation.y;


pitch =
camera.rotation.x;



},


undefined,


(error)=>{

console.error(
"Ошибка загрузки:",
error
);

}

);





// =======================
// КАМЕРА ПЕРЕМЕННЫЕ
// =======================

let yaw = 0;

let pitch = 0;

// =======================
// КЛАВИАТУРА ПК
// =======================

const keys = {};



document.addEventListener(
"keydown",
(e)=>{

keys[e.key.toLowerCase()] = true;


});



document.addEventListener(
"keyup",
(e)=>{

keys[e.key.toLowerCase()] = false;


});





// =======================
// ПРОВЕРКА ПОЗИЦИИ (P)
// =======================

document.addEventListener(
"keydown",
(e)=>{


if(
e.key.toLowerCase() === "p"
){

console.log(
"Позиция:",
camera.position
);


console.log(
"Поворот:",
camera.rotation
);


}


});







// =======================
// МЫШЬ ПК
// =======================


document.body.addEventListener(
"click",
()=>{


document.body.requestPointerLock();


});






document.addEventListener(
"mousemove",
(e)=>{


if(
document.pointerLockElement === document.body
){


yaw -=
e.movementX * 0.002;



pitch -=
e.movementY * 0.002;




pitch =
Math.max(
-Math.PI/2,
Math.min(
Math.PI/2,
pitch
)
);




camera.rotation.order =
"YXZ";



camera.rotation.y =
yaw;



camera.rotation.x =
pitch;



}


});

// =======================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

const isMobile = true;


let joystickX = 0;
let joystickY = 0;


let verticalMove = 0;



let cameraTouchId = null;

let lastTouchX = 0;
let lastTouchY = 0;





// =======================
// КАМЕРА ВТОРЫМ ПАЛЬЦЕМ
// =======================


document.addEventListener(
"touchstart",
(e)=>{


for(const touch of e.changedTouches){



const target =
document.elementFromPoint(
touch.clientX,
touch.clientY
);



if(
target &&
target.classList.contains(
"mobileControl"
)
)
continue;



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







document.addEventListener(
"touchmove",
(e)=>{


for(const touch of e.changedTouches){


if(
touch.identifier !== cameraTouchId
)
continue;



const dx =
touch.clientX -
lastTouchX;


const dy =
touch.clientY -
lastTouchY;



yaw -=
dx * 0.005;



pitch -=
dy * 0.005;



pitch =
Math.max(
-Math.PI/2,
Math.min(
Math.PI/2,
pitch
)
);



camera.rotation.order =
"YXZ";


camera.rotation.y =
yaw;


camera.rotation.x =
pitch;



lastTouchX =
touch.clientX;


lastTouchY =
touch.clientY;



}


});







document.addEventListener(
"touchend",
(e)=>{


for(const touch of e.changedTouches){


if(
touch.identifier === cameraTouchId
){

cameraTouchId = null;

}


}



});







// =======================
// ДЖОЙСТИК
// =======================


const joystick =
document.createElement(
"div"
);


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

background:
"rgba(255,255,255,0.3)",

zIndex:"99999",

touchAction:"none"

}
);



document.body.appendChild(
joystick
);





const stick =
document.createElement(
"div"
);


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





joystick.addEventListener(
"touchmove",
(e)=>{


e.preventDefault();

e.stopPropagation();



const touch =
e.touches[0];



const rect =
joystick.getBoundingClientRect();



let x =
touch.clientX -
(rect.left+65);



let y =
touch.clientY -
(rect.top+65);



x =
Math.max(
-45,
Math.min(
45,
x
)
);



y =
Math.max(
-45,
Math.min(
45,
y
)
);



stick.style.left =
40+x+"px";


stick.style.top =
40+y+"px";



joystickX =
x/45;


joystickY =
y/45;



},
{
passive:false
});






joystick.addEventListener(
"touchend",
()=>{


joystickX=0;

joystickY=0;


stick.style.left =
"40px";


stick.style.top =
"40px";


});






// =======================
// КНОПКИ ВВЕРХ / ВНИЗ
// =======================


function createButton(
text,
bottom
){


const btn =
document.createElement(
"button"
);


btn.className =
"mobileControl";


btn.textContent =
text;



Object.assign(
btn.style,
{

position:"fixed",

right:"40px",

bottom:bottom,

width:"75px",

height:"75px",

borderRadius:"50%",

fontSize:"35px",

zIndex:"99999",

touchAction:"none"

}
);



document.body.appendChild(
btn
);



return btn;


}





const upButton =
createButton(
"⬆️",
"140px"
);



const downButton =
createButton(
"⬇️",
"50px"
);





upButton.ontouchstart =
()=>{

verticalMove = 1;

};



upButton.ontouchend =
()=>{

verticalMove = 0;

};





downButton.ontouchstart =
()=>{

verticalMove = -1;

};



downButton.ontouchend =
()=>{

verticalMove = 0;

};

// =======================
// СКОРОСТЬ
// =======================

const speed = 0.15;





// =======================
// ДВИЖЕНИЕ ИГРОКА
// =======================

function updateMovement(){



const forward =
new THREE.Vector3();



camera.getWorldDirection(
forward
);



const right =
new THREE.Vector3();



right.crossVectors(
forward,
new THREE.Vector3(0,1,0)
);



right.normalize();





// =======================
// ПК
// =======================


if(
keys["w"] ||
keys["ц"]
){

camera.position.add(
forward.clone()
.multiplyScalar(speed)
);

}



if(
keys["s"] ||
keys["ы"]
){

camera.position.add(
forward.clone()
.multiplyScalar(-speed)
);

}



if(
keys["a"] ||
keys["ф"]
){

camera.position.add(
right.clone()
.multiplyScalar(-speed)
);

}



if(
keys["d"] ||
keys["в"]
){

camera.position.add(
right.clone()
.multiplyScalar(speed)
);

}




// вверх

if(
keys[" "]
){

camera.position.y += speed;

}




// вниз

if(
keys["shift"]
){

camera.position.y -= speed;

}







// =======================
// ТЕЛЕФОН
// =======================



camera.position.add(
forward.clone()
.multiplyScalar(
-joystickY * speed
)
);



camera.position.add(
right.clone()
.multiplyScalar(
joystickX * speed
)
);




camera.position.y +=
verticalMove * speed;



}







// =======================
// ИГРОВОЙ ЦИКЛ
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
window.innerWidth /
window.innerHeight;



camera.updateProjectionMatrix();



renderer.setSize(
window.innerWidth,
window.innerHeight
);



});





// =======================
// ОТКЛЮЧЕНИЕ ПРОКРУТКИ
// =======================


document.body.style.overflow =
"hidden";


document.body.style.touchAction =
"none";
