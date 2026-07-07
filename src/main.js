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


// камера перед центром

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

const ambient =
new THREE.AmbientLight(
    0xffffff,
    2
);

scene.add(ambient);



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



// добавляем

scene.add(yurta);



// находим настоящий центр модели

const box =
new THREE.Box3()
.setFromObject(yurta);



const center =
box.getCenter(
new THREE.Vector3()
);



// двигаем юрту в 0,0,0

yurta.position.x -= center.x;

yurta.position.y -= center.y;

yurta.position.z -= center.z;



console.log(
"Юрта поставлена в центр"
);



console.log(
"Старый центр:",
center
);



// камера смотрит на юрту

camera.lookAt(
    0,
    0,
    0
);



},


undefined,


(error)=>{

console.error(
"Ошибка:",
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
