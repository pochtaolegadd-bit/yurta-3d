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



camera.position.set(
    0,
    5,
    10
);






// =======================
// РЕНДЕР
// =======================

const renderer =
new THREE.WebGLRenderer({
    antialias:true
});


renderer.setPixelRatio(
    window.devicePixelRatio
);


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
// ПЕРЕМЕННЫЕ
// =======================

let yurta = null;


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






let spawnPosition =
new THREE.Vector3();



let spawnRotation =
new THREE.Euler();

// =======================
// ЗАГРУЗКА ЮРТЫ
// =======================

const loader =
new GLTFLoader();



loader.load(
"/yurta.glb",


(gltf)=>{


yurta =
gltf.scene;





// =======================
// ЦЕНТРИРУЕМ ЮРТУ
// =======================

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



scene.add(yurta);




console.log(
"Юрта загружена"
);






// =======================
// НОВЫЙ СПАВН
// ПЕРЕД ЮРТОЙ
// =======================


const yurtaBox =
new THREE.Box3()
.setFromObject(yurta);



const size =
yurtaBox.getSize(
new THREE.Vector3()
);



const yurtaCenter =
yurtaBox.getCenter(
new THREE.Vector3()
);





// ставим игрока перед передней частью юрты

camera.position.set(
    yurtaCenter.x,
    yurtaCenter.y + 3,
    yurtaCenter.z + size.z / 2 + 5
);






// камера смотрит на центр юрты

camera.lookAt(
    yurtaCenter
);




yaw =
camera.rotation.y;


pitch =
camera.rotation.x;





// сохраняем спавн

spawnPosition.copy(
    camera.position
);


spawnRotation.copy(
    camera.rotation
);



},


undefined,


(error)=>{


console.error(
"Ошибка загрузки юрты:",
error
);


}

);

// =======================
// ПК КЛАВИАТУРА
// =======================

document.addEventListener(
"keydown",
(e)=>{

keys[e.code] = true;

});



document.addEventListener(
"keyup",
(e)=>{

keys[e.code] = false;

});







// =======================
// POINTER LOCK
// =======================

renderer.domElement.addEventListener(
"click",
()=>{

renderer.domElement.requestPointerLock();

});







// =======================
// ПОВОРОТ КАМЕРЫ МЫШЬЮ
// =======================

const mouseSensitivity = 0.002;



document.addEventListener(
"mousemove",
(e)=>{


if(
document.pointerLockElement !== renderer.domElement
)
return;



yaw -=
e.movementX * mouseSensitivity;



pitch -=
e.movementY * mouseSensitivity;



pitch =
Math.max(
-Math.PI / 2,
Math.min(
Math.PI / 2,
pitch
)
);



camera.rotation.order =
"YXZ";



camera.rotation.y =
yaw;



camera.rotation.x =
pitch;



});








// =======================
// R - ВЕРНУТЬ СПАВН
// =======================

document.addEventListener(
"keydown",
(e)=>{


if(
e.code === "KeyR"
){


camera.position.copy(
spawnPosition
);



camera.rotation.copy(
spawnRotation
);



yaw =
camera.rotation.y;


pitch =
camera.rotation.x;



}



});

// =======================
// ПРОВЕРКА ТЕЛЕФОНА
// =======================

const isMobile =
('ontouchstart' in window) ||
(navigator.maxTouchPoints > 0);




// =======================
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

if(isMobile){



// =======================
// КАМЕРА ПАЛЬЦЕМ
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


function createButton(text,bottom){


const btn =
document.createElement("button");



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

verticalMove=1;

};



upButton.ontouchend =
()=>{

verticalMove=0;

};




downButton.ontouchstart =
()=>{

verticalMove=-1;

};



downButton.ontouchend =
()=>{

verticalMove=0;

};



}

// =======================
// ДВИЖЕНИЕ ПК
// =======================

function movePC(){


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






if(keys["KeyW"]){

camera.position.add(
forward.clone()
.multiplyScalar(speed)
);

}



if(keys["KeyS"]){

camera.position.add(
forward.clone()
.multiplyScalar(-speed)
);

}



if(keys["KeyA"]){

camera.position.add(
right.clone()
.multiplyScalar(-speed)
);

}



if(keys["KeyD"]){

camera.position.add(
right.clone()
.multiplyScalar(speed)
);

}





if(keys["Space"]){

camera.position.y += speed;

}



if(keys["ShiftLeft"]){

camera.position.y -= speed;

}



}








// =======================
// ДВИЖЕНИЕ ТЕЛЕФОНА
// =======================

function moveMobile(){


if(!isMobile)
return;



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



movePC();


moveMobile();



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
// СТРАНИЦА
// =======================

document.body.style.margin =
"0";


document.body.style.overflow =
"hidden";


document.body.style.touchAction =
"none";
