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


document.body.style.margin="0";

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



loader.load(
"/yurta.glb",

(gltf)=>{


const yurta =
gltf.scene;


scene.add(yurta);



console.log(
"Юрта загружена"
);



// получаем размеры юрты

const box =
new THREE.Box3()
.setFromObject(yurta);



const center =
box.getCenter(
new THREE.Vector3()
);



const size =
box.getSize(
new THREE.Vector3()
);



// спавн камеры возле юрты

camera.position.set(
    0.021,
    6,
    5
);

camera.lookAt(
    0.021,
    4.5,
    -0.026
);


console.log(
"Центр юрты:",
center
);


},


undefined,


(error)=>{

console.error(
"Ошибка юрты:",
error
);

});
// =======================
// КЛАВИАТУРА
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
// МЫШЬ ПК
// =======================

let yaw = 0;
let pitch = 0;



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


yaw -= e.movementX * 0.002;


pitch -= e.movementY * 0.002;



pitch = Math.max(
-Math.PI/2,
Math.min(Math.PI/2,pitch)
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
// МОБИЛЬНЫЙ РЕЖИМ
// =======================

const isMobile =
'ontouchstart' in window ||
navigator.maxTouchPoints > 0;



// движение джойстика

let joystickX = 0;
let joystickY = 0;


// вверх / вниз

let verticalMove = 0;



// палец камеры

let cameraTouchId = null;


let lastTouchX = 0;

let lastTouchY = 0;





// =======================
// ВТОРОЙ ПАЛЕЦ КАМЕРЫ
// =======================


if(isMobile){



document.addEventListener(
"touchstart",
(e)=>{


for(
let touch of e.changedTouches
){



// кнопки и джойстик игнорируем

if(
touch.target.classList.contains(
"mobileControl"
)
)
continue;



if(
cameraTouchId === null
){


cameraTouchId =
touch.identifier;


lastTouchX =
touch.clientX;


lastTouchY =
touch.clientY;


}


}


});





document.addEventListener(
"touchmove",
(e)=>{


for(
let touch of e.changedTouches
){


if(
touch.identifier !== cameraTouchId
)
continue;



let dx =
touch.clientX - lastTouchX;


let dy =
touch.clientY - lastTouchY;



yaw -= dx * 0.005;


pitch -= dy * 0.005;



pitch = Math.max(
-Math.PI/2,
Math.min(Math.PI/2,pitch)
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


},
{
passive:true
}
);





document.addEventListener(
"touchend",
(e)=>{


for(
let touch of e.changedTouches
){


if(
touch.identifier === cameraTouchId
){

cameraTouchId = null;

}


}


});


}
// =======================
// МОБИЛЬНЫЙ ДЖОЙСТИК
// =======================

if(isMobile){



const joystickBase =
document.createElement("div");


joystickBase.className =
"mobileControl";


joystickBase.style.position="fixed";
joystickBase.style.left="40px";
joystickBase.style.bottom="40px";
joystickBase.style.width="130px";
joystickBase.style.height="130px";
joystickBase.style.borderRadius="50%";
joystickBase.style.background=
"rgba(255,255,255,0.25)";
joystickBase.style.zIndex="9999";
joystickBase.style.touchAction="none";



document.body.appendChild(
joystickBase
);





const joystickStick =
document.createElement("div");


joystickStick.className =
"mobileControl";


joystickStick.style.position="absolute";
joystickStick.style.left="40px";
joystickStick.style.top="40px";
joystickStick.style.width="50px";
joystickStick.style.height="50px";
joystickStick.style.borderRadius="50%";
joystickStick.style.background=
"white";



joystickBase.appendChild(
joystickStick
);






joystickBase.addEventListener(
"touchmove",
(e)=>{


e.stopPropagation();

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
40+x+"px";


joystickStick.style.top =
40+y+"px";



joystickX =
x/max;


joystickY =
y/max;



},
{
passive:false
}
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


});







// =======================
// КНОПКИ ВВЕРХ / ВНИЗ
// =======================


function createButton(
text,
bottom
){


const btn =
document.createElement("button");



btn.className =
"mobileControl";


btn.innerHTML =
text;



btn.style.position="fixed";
btn.style.right="40px";
btn.style.bottom=bottom;
btn.style.width="75px";
btn.style.height="75px";
btn.style.borderRadius="50%";
btn.style.fontSize="35px";
btn.style.zIndex="9999";


// запрет выделения

btn.style.userSelect="none";
btn.style.webkitUserSelect="none";
btn.style.webkitTouchCallout="none";
btn.style.touchAction="none";



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





upButton.addEventListener(
"touchstart",
(e)=>{

e.stopPropagation();

verticalMove = 1;

});



upButton.addEventListener(
"touchend",
()=>{

verticalMove = 0;

});






downButton.addEventListener(
"touchstart",
(e)=>{

e.stopPropagation();

verticalMove = -1;

});



downButton.addEventListener(
"touchend",
()=>{

verticalMove = 0;

});



}
// =======================
// ДВИЖЕНИЕ
// =======================

const speed = 0.08;


// высота игрока над землей

const groundHeight = 2;



function updateMovement(){



const forward =
new THREE.Vector3();



camera.getWorldDirection(
forward
);


forward.y = 0;


forward.normalize();




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


if(keys["w"] || keys["ц"]){

camera.position.add(
forward.clone()
.multiplyScalar(speed)
);

}



if(keys["s"] || keys["ы"]){

camera.position.add(
forward.clone()
.multiplyScalar(-speed)
);

}



if(keys["a"] || keys["ф"]){

camera.position.add(
right.clone()
.multiplyScalar(-speed)
);

}



if(keys["d"] || keys["в"]){

camera.position.add(
right.clone()
.multiplyScalar(speed)
);

}



// вверх

if(keys[" "]){

camera.position.y += speed;

}



// вниз

if(keys["shift"]){

camera.position.y -= speed;

}




// =======================
// ТЕЛЕФОН
// =======================


if(isMobile){



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





// защита от провала в землю

if(
camera.position.y < groundHeight
){

camera.position.y =
groundHeight;

}



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
// РАЗМЕР ОКНА
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
