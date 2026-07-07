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


camera.position.set(
    0,
    2,
    6
);


// =======================
// РЕНДЕР
// =======================

const renderer = new THREE.WebGLRenderer({
    antialias: true
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
// ЗАГРУЗКА ЮРТЫ
// =======================

const loader = new GLTFLoader();


loader.load(
    "/yurta.glb",

    (gltf)=>{

        const model = gltf.scene;


        scene.add(model);


        console.log(
            "Юрта загружена"
        );


        // =======================
        // ТОЧКА ПОЯВЛЕНИЯ КАМЕРЫ
        // =======================

        camera.position.set(
            0,
            2,
            6
        );


        camera.lookAt(
            0,
            2,
            0
        );


    },


    undefined,


    (error)=>{

        console.error(
            "Ошибка загрузки юрты",
            error
        );

    }
);
// =======================
// УПРАВЛЕНИЕ ПК
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
// POINTER LOCK МЫШЬ
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


        if(
            document.pointerLockElement === document.body
        ){

            yaw -= e.movementX * 0.002;

            pitch -= e.movementY * 0.002;



            pitch = Math.max(
                -Math.PI / 2,
                Math.min(
                    Math.PI / 2,
                    pitch
                )
            );



            camera.rotation.order = "YXZ";


            camera.rotation.y = yaw;

            camera.rotation.x = pitch;

        }

    }
);



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




    // W / Ц - вперёд

    if(keys["w"] || keys["ц"]){

        camera.position.add(
            forward.clone()
            .multiplyScalar(speed)
        );

    }



    // S / Ы - назад

    if(keys["s"] || keys["ы"]){

        camera.position.add(
            forward.clone()
            .multiplyScalar(-speed)
        );

    }



    // A / Ф - влево

    if(keys["a"] || keys["ф"]){

        camera.position.add(
            right.clone()
            .multiplyScalar(-speed)
        );

    }



    // D / В - вправо

    if(keys["d"] || keys["в"]){

        camera.position.add(
            right.clone()
            .multiplyScalar(speed)
        );

    }



    // Пробел вверх

    if(keys[" "]){

        camera.position.y += speed;

    }



    // Shift вниз

    if(keys["shift"]){

        camera.position.y -= speed;

    }

}
// =======================
// ПОВОРОТ КАМЕРЫ НА ТЕЛЕФОНЕ
// =======================

const isMobile =
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0;


let touchX = 0;
let touchY = 0;



if(isMobile){


    document.addEventListener(
        "touchstart",
        (e)=>{


            touchX =
            e.touches[0].clientX;


            touchY =
            e.touches[0].clientY;


        }
    );



    document.addEventListener(
        "touchmove",
        (e)=>{


            const newX =
            e.touches[0].clientX;


            const newY =
            e.touches[0].clientY;



            const deltaX =
            newX - touchX;


            const deltaY =
            newY - touchY;



            // поворот камеры

            yaw -= deltaX * 0.005;

            pitch -= deltaY * 0.005;



            pitch = Math.max(
                -Math.PI / 2,
                Math.min(
                    Math.PI / 2,
                    pitch
                )
            );



            camera.rotation.order = "YXZ";


            camera.rotation.y = yaw;

            camera.rotation.x = pitch;



            touchX = newX;

            touchY = newY;


        }
    );

}
// =======================
// ТЕЛЕФОН: ДЖОЙСТИК + СТРЕЛКИ
// =======================

let joystickX = 0;
let joystickY = 0;

let verticalMove = 0;


if(isMobile){


    // ===================
    // ДЖОЙСТИК
    // ===================

    const joystickBase = document.createElement("div");

    joystickBase.style.position = "fixed";
    joystickBase.style.left = "40px";
    joystickBase.style.bottom = "40px";
    joystickBase.style.width = "130px";
    joystickBase.style.height = "130px";
    joystickBase.style.borderRadius = "50%";
    joystickBase.style.background =
    "rgba(255,255,255,0.25)";
    joystickBase.style.zIndex = "9999";


    document.body.appendChild(joystickBase);



    const joystickStick = document.createElement("div");


    joystickStick.style.position = "absolute";
    joystickStick.style.left = "40px";
    joystickStick.style.top = "40px";
    joystickStick.style.width = "50px";
    joystickStick.style.height = "50px";
    joystickStick.style.borderRadius = "50%";
    joystickStick.style.background =
    "rgba(255,255,255,0.8)";


    joystickBase.appendChild(joystickStick);



    joystickBase.addEventListener(
    "touchmove",
    (e)=>{

        e.preventDefault();


        const touch = e.touches[0];

        const rect =
        joystickBase.getBoundingClientRect();


        let x =
        touch.clientX - (rect.left + 65);

        let y =
        touch.clientY - (rect.top + 65);



        const max = 45;


        x = Math.max(-max, Math.min(max,x));
        y = Math.max(-max, Math.min(max,y));



        joystickStick.style.left =
        40 + x + "px";


        joystickStick.style.top =
        40 + y + "px";



        joystickX = x / max;
        joystickY = y / max;


    },
    {passive:false}
    );



    joystickBase.addEventListener(
    "touchend",
    ()=>{

        joystickX = 0;
        joystickY = 0;


        joystickStick.style.left="40px";
        joystickStick.style.top="40px";

    });




    // ===================
    // СТРЕЛКИ ВВЕРХ / ВНИЗ
    // ===================


    function createButton(text,bottom){

        const btn =
        document.createElement("button");


        btn.innerHTML = text;

        btn.style.position="fixed";
        btn.style.right="40px";
        btn.style.bottom=bottom;
        btn.style.width="75px";
        btn.style.height="75px";
        btn.style.borderRadius="50%";
        btn.style.fontSize="35px";
        btn.style.zIndex="9999";


        document.body.appendChild(btn);


        return btn;

    }



    const up =
    createButton("⬆️","140px");


    const down =
    createButton("⬇️","50px");



    up.addEventListener(
    "touchstart",
    ()=>{
        verticalMove = 1;
    });



    up.addEventListener(
    "touchend",
    ()=>{
        verticalMove = 0;
    });



    down.addEventListener(
    "touchstart",
    ()=>{
        verticalMove = -1;
    });



    down.addEventListener(
    "touchend",
    ()=>{
        verticalMove = 0;
    });


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
// RESIZE ЭКРАНА
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


    }
);
