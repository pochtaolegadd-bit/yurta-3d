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
