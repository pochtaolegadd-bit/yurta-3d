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


// фиксированное место появления

camera.position.set(
    0,
    3,
    10
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


document.body.style.margin="0";

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

scene.add(ambientLight);



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


scene.add(dirLight);




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


// фиксируем юрту

yurta.position.set(
    0,
    0,
    0
);


// если слишком большая/маленькая
// меняй эти числа

yurta.scale.set(
    1,
    1,
    1
);



scene.add(yurta);



console.log(
"Юрта загружена"
);



// камера смотрит на юрту

camera.lookAt(
    0,
    3,
    0
);


},


undefined,


(error)=>{

console.error(
error
);

});





// =======================
// АНИМАЦИЯ
// =======================

function animate(){

requestAnimationFrame(
animate
);


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
