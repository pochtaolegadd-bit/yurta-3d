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


// старт

camera.position.set(
    0,
    5,
    15
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

const loader =
new GLTFLoader();



loader.load(
"/yurta.glb",

(gltf)=>{


const yurta =
gltf.scene;



// ставим модель в центр

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



},


undefined,


(error)=>{

console.error(
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
// МЫШЬ
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



pitch=Math.max(
-Math.PI/2,
Math.min(Math.PI/2,pitch)
);



camera.rotation.order="YXZ";


camera.rotation.y=yaw;


camera.rotation.x=pitch;


}


});





// =======================
// СВОБОДНЫЙ ПОЛЁТ
// =======================

const speed = 0.15;



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





// вперёд

if(keys["w"] || keys["ц"]){

camera.position.add(
forward.clone()
.multiplyScalar(speed)
);

}



// назад

if(keys["s"] || keys["ы"]){

camera.position.add(
forward.clone()
.multiplyScalar(-speed)
);

}



// влево

if(keys["a"] || keys["ф"]){

camera.position.add(
right.clone()
.multiplyScalar(-speed)
);

}



// вправо

if(keys["d"] || keys["в"]){

camera.position.add(
right.clone()
.multiplyScalar(speed)
);

}



// вверх

if(keys[" "] ){

camera.position.y += speed;

}



// вниз

if(keys["shift"]){

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
// МОБИЛЬНОЕ УПРАВЛЕНИЕ
// =======================

const isMobile =
'ontouchstart' in window ||
navigator.maxTouchPoints > 0;


let joystickX = 0;
let joystickY = 0;

let verticalMove = 0;


let cameraTouchId = null;

let lastTouchX = 0;
let lastTouchY = 0;
if(isMobile){


// =======================
// ПОВОРОТ КАМЕРЫ ВТОРЫМ ПАЛЬЦЕМ
// =======================


document.addEventListener(
"touchstart",
(e)=>{


for(const touch of e.changedTouches){


if(
touch.target.classList.contains(
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


let dx =
touch.clientX - lastTouchX;


let dy =
touch.clientY - lastTouchY;



yaw -= dx * 0.005;

pitch -= dy * 0.005;



pitch=Math.max(
-Math.PI/2,
Math.min(Math.PI/2,pitch)
);



camera.rotation.order="YXZ";

camera.rotation.y=yaw;

camera.rotation.x=pitch;



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

cameraTouchId=null;

}

}

});





// =======================
// ДЖОЙСТИК
// =======================


const base =
document.createElement("div");


base.className =
"mobileControl";


Object.assign(
base.style,
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


document.body.appendChild(base);




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


base.appendChild(stick);




base.addEventListener(
"touchmove",
(e)=>{


e.preventDefault();


e.stopPropagation();



const touch =
e.touches[0];


const rect =
base.getBoundingClientRect();



let x =
touch.clientX -
(rect.left+65);


let y =
touch.clientY -
(rect.top+65);



x=Math.max(
-45,
Math.min(45,x)
);


y=Math.max(
-45,
Math.min(45,y)
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


function button(text,bottom){


let b =
document.createElement("button");


b.className =
"mobileControl";


b.innerHTML=text;



Object.assign(
b.style,
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
touchAction:"none"
}
);



document.body.appendChild(b);


return b;

}



const up =
button("⬆️","140px");


const down =
button("⬇️","50px");



up.addEventListener(
"touchstart",
(e)=>{

e.stopPropagation();

verticalMove=1;

});



up.addEventListener(
"touchend",
()=>{

verticalMove=0;

});



down.addEventListener(
"touchstart",
(e)=>{

e.stopPropagation();

verticalMove=-1;

});



down.addEventListener(
"touchend",
()=>{

verticalMove=0;

});


}
