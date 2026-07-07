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


// стартовая позиция

camera.position.set(
    0,
    3,
    10
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
));



const sun =
new THREE.DirectionalLight(
    0xffffff,
    3
);


sun.position.set(
    5,
    10,
    5
);


scene.add(sun);





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



// ставим юрту в центр

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



camera.lookAt(
0,
3,
0
);



},

undefined,


(error)=>{

console.error(error);

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
// КАМЕРА ПК (МЫШЬ)
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
// ТЕЛЕФОН
// =======================

const isMobile =
'ontouchstart' in window ||
navigator.maxTouchPoints > 0;



let cameraTouchId = null;


let touchX = 0;
let touchY = 0;



let joystickX = 0;
let joystickY = 0;


let verticalMove = 0;






// =======================
// ПОВОРОТ КАМЕРЫ ВТОРЫМ ПАЛЬЦЕМ
// =======================

if(isMobile){



document.addEventListener(
"touchstart",
(e)=>{


for(
const touch of e.changedTouches
){



// если это джойстик или кнопки - игнорируем

if(
touch.target.classList.contains(
"mobileControl"
)
)
continue;




if(cameraTouchId === null){


cameraTouchId =
touch.identifier;


touchX =
touch.clientX;


touchY =
touch.clientY;


}


}


});







document.addEventListener(
"touchmove",
(e)=>{


for(
const touch of e.changedTouches
){


if(
touch.identifier !== cameraTouchId
)
continue;



let dx =
touch.clientX - touchX;



let dy =
touch.clientY - touchY;



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




touchX =
touch.clientX;


touchY =
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
const touch of e.changedTouches
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
// МОБИЛЬНЫЙ ДЖОЙСТИК И КНОПКИ
// =======================

if(isMobile){



// =======================
// ДЖОЙСТИК
// =======================


const joystickBase =
document.createElement("div");


joystickBase.className =
"mobileControl";


Object.assign(
joystickBase.style,
{
position:"fixed",
left:"40px",
bottom:"40px",
width:"130px",
height:"130px",
borderRadius:"50%",
background:"rgba(255,255,255,0.25)",
zIndex:"9999",
touchAction:"none"
}
);


document.body.appendChild(
joystickBase
);




const joystickStick =
document.createElement("div");


joystickStick.className =
"mobileControl";


Object.assign(
joystickStick.style,
{
position:"absolute",
left:"40px",
top:"40px",
width:"50px",
height:"50px",
borderRadius:"50%",
background:"white",
}
);


joystickBase.appendChild(
joystickStick
);





joystickBase.addEventListener(
"touchmove",
(e)=>{


e.preventDefault();

e.stopPropagation();



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



x=Math.max(
-max,
Math.min(max,x)
);



y=Math.max(
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


function createMobileButton(
text,
bottom
){


const button =
document.createElement("button");


button.className =
"mobileControl";


button.textContent =
text;



Object.assign(
button.style,
{
position:"fixed",
right:"40px",
bottom:bottom,
width:"75px",
height:"75px",
borderRadius:"50%",
fontSize:"35px",
zIndex:"9999",
userSelect:"none",
webkitUserSelect:"none",
webkitTouchCallout:"none",
touchAction:"none"
}
);



document.body.appendChild(
button
);



return button;

}




const upButton =
createMobileButton(
"⬆️",
"140px"
);



const downButton =
createMobileButton(
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
// ПК WASD / ЦФЫВ
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
