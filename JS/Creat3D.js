//import * as THREE from "../lib/Three/three";
let container;
let camera, scene, renderer;
let plane, cube;
let mouse, raycaster;
//射线可检测到的物体数组
let objects = [];

init();

function init() {
    //container
    container = document.createElement('div');
    document.body.appendChild(container);
    //camera and scene
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(500, 800, 1300);
    camera.lookAt(new THREE.Vector3());
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    //light and renderer
    let ambientLight = new THREE.AmbientLight(0x606060);
    scene.add(ambientLight);
    let directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 0.75, 0.5).normalize();
    scene.add(directionalLight);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    //grid 地面网格
    let gridHelper = new THREE.GridHelper(1000, 20);
    scene.add(gridHelper);
    // raycaster and plane--射线检测，添加地面(plane)，并加入到射线可检测到的Object中
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    let geometry = new THREE.PlaneBufferGeometry(1000, 1000);
    geometry.rotateX(-Math.PI / 2);
    plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ visible: false }));
    scene.add(plane);
    objects.push(plane);

    //window Adaptive
    window.addEventListener('resize', onWindowResize, false);

}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}