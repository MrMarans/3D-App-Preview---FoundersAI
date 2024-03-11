//toDo: creat the idea images in alpha and rgb



//how this script works:
/*
at the beginning, we only declare most of the elements we have and also import other bibs.
the Lib Bib is a module with many function i wrote for this project, but arent needed in the main.js
I wish I was able to put more functions into the lib, but then it would be more difficult.
To use one function in the Lib script, write "Lib.functionName"

after setting all the variables for screens, videos etc, we initiate the 3D scene:
we add all the important models here we need right now, like the screen, phone model,
hologram etc. And also we add parents/childs here so rotation works as intended.

we also start a function that constantly makes the hologram float

then we animate it. the Animate function is called in an update/loop. the render function changes things. Both kinda work in a loop/every frame.

the event listener waits for a click and start function click, which does things based on the clicked collider of the UI.

for people not knowing what "export" means for functions and variables, it basically is "public" from Java/C#
*/

import * as THREE from 'three';
import { OBJLoader } from "https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/loaders/OBJLoader.js";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { HDRCubeTextureLoader } from 'three/addons/loaders/HDRCubeTextureLoader.js';
import { RGBMLoader } from 'three/addons/loaders/RGBMLoader.js';


import * as Lib from './threeJS_functionLib.js';


const params = {
    envMap: 'LDR',
    roughness: 0.2,
    metalness: 1.0,
    exposure: 1.0,
    debug: false
};

let container, stats;
export let camera, scene, renderer, controls;
export let CaseModel, ScreenModel;
export let HologramModel;
let sphereYellow, sphereBlue, sphereRed;
let generatedCubeRenderTarget, ldrCubeRenderTarget;
let ldrCubeMap, hdrCubeMap, rgbmCubeMap;
const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

let width = window.innerWidth;
let height = window.innerHeight;
const loader = new OBJLoader();
let intersects = []
let hovered = {}
let isRotated = Boolean(false);

const textureLoader = new THREE.TextureLoader();

//loading all videos and images
let main_menu, burger_menu, businessModelCanvas, hologram_empty_tex, hologram_half_tex, hologram_full_tex, idea_empty_rgb, idea_half_rgb, idea_full_rgb;
let main_menu_mat, burger_menu_mat, hologram_empty_mat, hologram_half_mat, hologram_full_mat, businessModelCanvas_mat, idea_empty_mat, idea_half_mat, idea_full_mat;

const [chat_video_texture, chat_video] = Lib.createVideoTexture('./files/Chat_Website_1.mp4')
const [gifAnim_texture, gifAnim_video] = Lib.createVideoTexture('./files/LogoAnimation.mp4')


//-----------------------------
const promises = [];
// Funktion zum Laden einer Textur mit einem Promise und Hinzufügen zum promises-Array
function loadTexture(url) {
    return new Promise((resolve) => {
        const texture = textureLoader.load(url, () => {
            resolve(texture);
        });
    });
}



promises.push(loadTexture("files/main_menu.jpg").then(texture => { main_menu = texture; }));
promises.push(loadTexture("files/burger_menu.png").then(texture => { burger_menu = texture; }));
promises.push(new Promise((resolve) => {
    businessModelCanvas = textureLoader.load("files/businessModelCanvas.png", (tex) => {
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        resolve();
    });
}));
promises.push(loadTexture("files/Hologram_Empty.png").then(texture => { hologram_empty_tex = texture; }));
promises.push(loadTexture("files/Hologram_Half.png").then(texture => { hologram_half_tex = texture; }));
promises.push(loadTexture("files/Hologram_Full.png").then(texture => { hologram_full_tex = texture; }));
promises.push(loadTexture("files/Idea_Empty.png").then(texture => { idea_empty_rgb = texture; }));
promises.push(loadTexture("files/Idea_Half.png").then(texture => { idea_half_rgb = texture; }));
promises.push(loadTexture("files/Idea_Full.png").then(texture => { idea_full_rgb = texture; }));
// Fortfahren mit dem Laden anderer Ressourcen...




const loadAsync = (url) => {
    return new Promise((resolve) => {
        loader.load(url, (gltf) => {
            resolve(gltf);
        });
    });
};

function onAllResourcesLoaded() {
    // Führe hier die init-Funktion aus, da alle Ressourcen geladen wurden
    main_menu_mat = new THREE.MeshBasicMaterial({ map: main_menu });
    burger_menu_mat = new THREE.MeshBasicMaterial({ map: burger_menu });
    hologram_empty_mat = new THREE.MeshBasicMaterial({ map: hologram_empty_tex, transparent: true, opacity: 1 });
    hologram_half_mat = new THREE.MeshBasicMaterial({ map: hologram_half_tex, transparent: true, opacity: 1 });
    hologram_full_mat = new THREE.MeshBasicMaterial({ map: hologram_full_tex, transparent: true, opacity: 1 });
    businessModelCanvas_mat = new THREE.MeshBasicMaterial({ map: businessModelCanvas });
    idea_empty_mat = new THREE.MeshBasicMaterial({ map: idea_empty_rgb });
    idea_half_mat = new THREE.MeshBasicMaterial({ map: idea_half_rgb });
    idea_full_mat = new THREE.MeshBasicMaterial({ map: idea_full_rgb });

    
    console.log("doneLoading")
async function loadObjectsAndInit() {
    const firstObject = await loadAsync("./files/smartphone.obj");
    //await loadAsync('./files/LogoAnimation.mp4')
    init(firstObject.children[0].geometry, firstObject.children[1].geometry); //phone and screen loaded
    console.log("start")
}
loadObjectsAndInit()
}
//-----------------------------
/*
const main_menu_mat = new THREE.MeshBasicMaterial({ map: main_menu });

const burger_menu_mat = new THREE.MeshBasicMaterial({ map: burger_menu });


const hologram_empty_mat = new THREE.MeshBasicMaterial({ map: hologram_empty_tex, transparent: true, opacity: 1 });
const hologram_half_mat = new THREE.MeshBasicMaterial({ map: hologram_half_tex, transparent: true, opacity: 1 });
const hologram_full_mat = new THREE.MeshBasicMaterial({ map: hologram_full_tex, transparent: true, opacity: 1 });


const businessModelCanvas_mat = new THREE.MeshBasicMaterial({ map: businessModelCanvas });
const idea_empty_mat = new THREE.MeshBasicMaterial({ map: idea_empty_rgb });
const idea_half_mat = new THREE.MeshBasicMaterial({ map: idea_half_rgb });
const idea_full_mat = new THREE.MeshBasicMaterial({ map: idea_full_rgb });
*/
const particleGeometry = new THREE.BufferGeometry;
const particleCount = 5000
let particlesMesh;


export const video_material = new THREE.MeshBasicMaterial({ map: chat_video_texture });
export const gifAnim_material = new THREE.MeshBasicMaterial({ map: gifAnim_texture });


//collider things:
export let colliders_bottom = []
export let colliders_main_menu = []
export let colliders_burger_buttons = []

export const Status = {
    chat: Symbol("Chat"),
    main_menu: Symbol("Main_menu"),
    idea: Symbol("idea"),
    burger: Symbol("burger"),
    document: Symbol("document"),
    model: Symbol("model")
}
var currently = Status.Chat;
//end of collider

//if everything is loaded by now, start the set variables and start
Promise.all(promises).then(onAllResourcesLoaded);



function init(Case, Screen) {
    container = document.getElementById('ThreeJS');
    document.body.appendChild(container);

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(-45, 0, 90);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio((window.devicePixelRatio) ? window.devicePixelRatio : 1);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.autoClear = false;
    renderer.setClearColor(0x000000, 0.0);
    //document.getElementById('canvas').appendChild(renderer.domElement);



    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    let material = new THREE.MeshStandardMaterial({
        color: 0x00A5FF,
        metalness: params.metalness,
        roughness: params.roughness
    });

    let scaling = 5;
    Case.scale(scaling, scaling, scaling);
    Screen.scale(scaling + 0.01, scaling + 0.01, scaling + 0.01);
    CaseModel = new THREE.Mesh(Case, material);
    scene.add(CaseModel);



    ScreenModel = new THREE.Mesh(Screen, gifAnim_material);


    //console.log(video_material.map.offset)
    //video_material.map.offset = new THREE.Vector2(-0.9,0)
    scene.add(ScreenModel);
    CaseModel.add(ScreenModel);
    Lib.createColliders();

    HologramModel = new THREE.Mesh(Screen, hologram_empty_mat)
    scene.add(HologramModel);
    HologramModel.rotation.set(0, Math.PI * 2.8, 0)
    //HologramModel.position.set(21, 0, 2) hovering does this now.
    Lib.hoverHologram(HologramModel, 10000, 24, 3, -3); //Model, duration, x,y,z pos

    colliders_bottom.forEach((collider) => CaseModel.add(collider));
    //colliders_main_menu.forEach((collider) => CaseModel.add(collider));
    colliders_burger_buttons.slice(0, 1).forEach((collider) => CaseModel.add(collider));


    const ballGeometry = new THREE.SphereGeometry(15, 16, 16);


    sphereYellow = new THREE.Mesh(ballGeometry, new THREE.MeshBasicMaterial({ color: 0xfdc940, transparent: true, opacity: 1 }));
    sphereBlue = new THREE.Mesh(ballGeometry, new THREE.MeshBasicMaterial({ color: 0x08AFC, transparent: true, opacity: 1 }));
    sphereRed = new THREE.Mesh(ballGeometry, new THREE.MeshBasicMaterial({ color: 0xff6161, transparent: true, opacity: 1 }));
    scene.add(sphereYellow);
    scene.add(sphereBlue);
    scene.add(sphereRed);
    sphereYellow.position.set(17, 3, -25) //links, oben,hinten
    sphereBlue.position.set(-10, -15, -25)
    sphereRed.position.set(-14, 15, -25)


    const particlesCount = 5000;

    const posArray = new Float32Array(particleCount * 3)

    for (let i = 0; i < particleCount * 3;i++)
    {
        posArray[i] = (Math.random() - 0.5) * (Math.random()*300)
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(posArray,3))
    var tex = new THREE.TextureLoader().load("https://threejs.org/examples/textures/sprites/disc.png");

    const particleMat = new THREE.PointsMaterial({
        size: 0.25,
        color: "#00A5FF",
        map: tex,
        transparent: true
    })
    particlesMesh = new THREE.Points(particleGeometry,particleMat)
    scene.add(particlesMesh)


    CaseModel.add(sphereBlue,sphereYellow,sphereRed)

    THREE.DefaultLoadingManager.onLoad = function () {

        pmremGenerator.dispose();

    };



    const ldrUrls = ['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'];
    ldrCubeMap = new THREE.CubeTextureLoader()
        .setPath('./textures/cube/pisa/')
        .load(ldrUrls, function () {

            ldrCubeRenderTarget = pmremGenerator.fromCubemap(ldrCubeMap);

        });

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileCubemapShader();


    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);


    controls = new OrbitControls(camera, renderer.domElement);
    controls.minDistance = 50;
    controls.maxDistance = 300;
    controls.minPolarAngle = Math.PI * 0.3;
    controls.maxPolarAngle = Math.PI * 0.7;
    controls.minAzimuthAngle = Math.PI * 1.7;
    controls.maxAzimuthAngle = Math.PI * 0.3;



    window.addEventListener('resize', onWindowResize);



    animate(Case);
}

function onWindowResize() {


    let width = window.innerWidth;
    let height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);

}


//-----------------
const HologramStatus = {
    Empty: Symbol("Empty"),
    Half: Symbol("Half"),
    Full: Symbol("Full")
}
var currentlyHologram = HologramStatus.Empty
let duration = 1000
var currentIdeaPage = idea_empty_mat;
function rotateHologram() {
    if (currently != Status.document) {


        //console.log(chat_video.currentTime)
        if (currentlyHologram == HologramStatus.Empty && chat_video.currentTime > 20 && chat_video.currentTime < 40) {
            currentlyHologram = HologramStatus.Half
            Lib.changeHologram(HologramModel, new THREE.Euler(0, Math.PI * 1.8, 0), new THREE.Euler(0, Math.PI * 2.8, 0), duration, true, hologram_half_mat)
            currentIdeaPage = idea_half_mat;
        }
        else if (currentlyHologram == HologramStatus.Half && chat_video.currentTime > 41) {
            currentlyHologram = HologramStatus.Full
            Lib.changeHologram(HologramModel, new THREE.Euler(0, Math.PI * 1.8, 0), new THREE.Euler(0, Math.PI * 2.8, 0), duration, true, hologram_full_mat)
            currentIdeaPage = idea_full_mat;
        }

        else if (currentlyHologram == HologramStatus.Full && chat_video.currentTime > 59.5) {
            currentlyHologram = HologramStatus.Empty
            Lib.changeHologram(HologramModel, new THREE.Euler(0, Math.PI * 1.8, 0), new THREE.Euler(0, Math.PI * 2.8, 0), duration * 3, true, hologram_empty_mat)
            currentIdeaPage = idea_empty_mat;
        }
    }
}
//-----------------


let mouseX = 1;
let mouseY = 1;

document.addEventListener("mousemove",saveMousePos)

function saveMousePos(event){
    //mouseX = event.clientX;
    //mouseY = event.clientY;
}
const clock =  new THREE.Clock();
let timing = 0
function animateParticles(){
    const elapsedTime = clock.getElapsedTime()
    //console.log(mouseX - window.innerWidth*0.5, mouseY)

    //particlesMesh.rotation.y = (mouseX - window.innerWidth * 0.5) * elapsedTime * 0.00005
    //particlesMesh.rotation.x = (mouseY - window.innerHeight * 0.5) *elapsedTime * 0.00005

    

    particlesMesh.rotation.y = mouseY * elapsedTime * 0.01;
    particlesMesh.rotation.x = mouseX * elapsedTime * 0.01;

}

function animate() {
    if (ScreenModel.material == gifAnim_material && gifAnim_video.currentTime > gifAnim_video.duration *0.98)
    {
        console.log("")
        restartChatScreen() //basically show chat screen
    } 

    animateParticles();

    rotateHologram();

    requestAnimationFrame(animate);
    render();
}


function render() {

    CaseModel.material.roughness = params.roughness; //kind of old, but wont refactor now
    CaseModel.material.metalness = params.metalness;
    //*
    let renderTarget, cubeMap;

    switch (params.envMap) {

        case 'LDR':
            renderTarget = ldrCubeRenderTarget;
            cubeMap = ldrCubeMap;
            break;


    }

    const newEnvMap = renderTarget ? renderTarget.texture : null;

    if (newEnvMap && newEnvMap !== CaseModel.material.envMap) {

        CaseModel.material.envMap = newEnvMap;
        CaseModel.material.needsUpdate = true;


    }

    //torusMesh.rotation.y += 0.005;


    scene.background = null;
    renderer.toneMappingExposure = params.exposure;

    renderer.render(scene, camera);
}


// events
window.addEventListener('pointermove', (e) => {
    mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1)
    raycaster.setFromCamera(mouse, camera)
    intersects = raycaster.intersectObjects(scene.children, true)

    // If a previously hovered item is not among the hits we must call onPointerOut
    Object.keys(hovered).forEach((key) => {
        const hit = intersects.find((hit) => hit.object.uuid === key)
        if (hit === undefined) {
            const hoveredItem = hovered[key]
            if (hoveredItem.object.onPointerOver) hoveredItem.object.onPointerOut(hoveredItem)
            delete hovered[key]
        }
    })

    intersects.forEach((hit) => {
        // If a hit has not been flagged as hovered we must call onPointerOver
        if (!hovered[hit.object.uuid]) {
            hovered[hit.object.uuid] = hit
            if (hit.object.onPointerOver) hit.object.onPointerOver(hit)
        }
        // Call onPointerMove
        if (hit.object.onPointerMove) hit.object.onPointerMove(hit)
    })
})

window.addEventListener('mousedown', (e) => {
    intersects.forEach((hit) => {
        // Call onClick
        onClick(hit.object)
        //if (hit.object.onClick) hit.object.onClick(hit)
    })
})


function onClick(clickedObject) {

    if (currently == Status.burger) {
        //Idea
        if (clickedObject == colliders_burger_buttons[1]) {
            ScreenModel.material = currentIdeaPage;
            currently = Status.idea;
            Lib.handleButtons(colliders_burger_buttons.slice(1), false)
        }
        //document
        if (clickedObject == colliders_burger_buttons[2]) {
            ScreenModel.material = businessModelCanvas_mat;
            currently = Status.document;
            rotatePhone(CaseModel, true);
            Lib.handleButtons(colliders_burger_buttons.slice(1), false)
            Lib.changeHologram(HologramModel, new THREE.Euler(0, Math.PI * 1.8, 0), new THREE.Euler(0, Math.PI * 2.8, 0), duration / 2, false, hologram_full_mat)
            console.log(currently);
        }
        //model
        if (clickedObject == colliders_burger_buttons[3]) {
            currently = Status.model;
            Lib.handleButtons(colliders_burger_buttons.slice(1), false)
        }

    }



    // colliders Array, 0 is middle, 1 is left (chat), need to add state of screens
    if (clickedObject == colliders_bottom[0] && currently != Status.main_menu) {
        ScreenModel.material = main_menu_mat;

        chat_video.pause();
        chat_video.currentTime = 0;
        chat_video.needsUpdate = true;
        rotatePhone(CaseModel, false);
        Lib.handleButtons(colliders_main_menu, true)
        Lib.handleButtons(colliders_bottom, false)

        if (currently == Status.burger) {
            Lib.handleButtons(colliders_burger_buttons.slice(1), false)
        }
        currently = Status.main_menu;
    }

    if (clickedObject == colliders_bottom[1] && currently != Status.main_menu) { //chat
        openChatScreen()

        if (currently == Status.burger) {
            Lib.handleButtons(colliders_burger_buttons.slice(1), false)
        }
        console.log(currently)
        rotatePhone(CaseModel, false);
        currently = Status.chat;
    }

    //main Screens
    if (clickedObject == colliders_main_menu[0] && currently == Status.main_menu) {

        rotatePhone(CaseModel, false);
        Lib.handleButtons(colliders_main_menu, false)
        Lib.handleButtons(colliders_bottom, true)
        openChatScreen()
        currently = Status.chat;
    }
    if (clickedObject == colliders_main_menu[2] && currently == Status.main_menu) {
        ScreenModel.material = currentIdeaPage;
        currently = Status.idea;
        Lib.handleButtons(colliders_bottom, true)
        Lib.handleButtons(colliders_main_menu, false)
    }

    if (clickedObject == colliders_burger_buttons[0]) {
        ScreenModel.material = burger_menu_mat;



        //spawn buttons
        Lib.handleButtons(colliders_burger_buttons.slice(1), true);
        if (currently == Status.main_menu) {
            Lib.handleButtons(colliders_main_menu, false)
            Lib.handleButtons(colliders_bottom, true)
        }

        rotatePhone(CaseModel, false);
        currently = Status.burger
    }

}


let animationTime = 2000 //300 i guess its frames, could add to deltaTime later
function rotatePhone(obj, rotate) {
    if (rotate) {
        Lib.rotate(obj, animationTime, 0.5, isRotated);

    }
    else {
        Lib.rotate(obj, animationTime, 0, isRotated)
        if (currently == Status.document) {
            Lib.changeHologram(HologramModel, HologramModel.rotation, new THREE.Euler(0, Math.PI * 1.8, 0), duration / 2, false, hologram_full_mat)
        }
    }
}

function openChatScreen() {
    ScreenModel.material = video_material;
    chat_video.play();
}
function restartChatScreen(){ //only used once after Logo Animation
    chat_video.currentTime = 0;
    //chat_video.load()
    ScreenModel.material = video_material;
    chat_video.play();
    Lib.changeHologram(HologramModel, new THREE.Euler(0, Math.PI * 2.8, 0),new THREE.Euler(0, Math.PI * 1.8, 0), duration / 2, false, hologram_full_mat)
}
