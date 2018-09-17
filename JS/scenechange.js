//import * as THREE from "../Core/three/three";

let scene, camera, renderer, controls, light;
let mixer;

let composer, outlinePass;

let raycast = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let selectedObjects = [];

let params = {
    edgeStrength: 3.0,
    edgeGlow: 0.0,
    edgeThickness: 1.0,
    //是否闪烁
    pulsePeriod: 0
};

init();
GameLoop();

function init() {
    //scene and camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(5, 6, 7);
    //Light
    light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
    light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(10, 20, 15);
    scene.add(light);

    //render and loader
    renderer = new THREE.WebGLRenderer(
        {
            //抗锯齿
            antialias: true
        }
    );

    //postprocessing
    composer = new THREE.EffectComposer(renderer);
    outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene,
        camera);
    outlinePass.edgeStrength = params.edgeStrength;
    outlinePass.edgeGlow = params.edgeGlow;
    outlinePass.edgeThickness = params.edgeThickness;
    outlinePass.pulsePeriod = params.pulsePeriod;
    composer.addPass(outlinePass);

    let loader = new THREE.GLTFLoader();
    //设置GLTF模型的解压缩文件存放地址
    THREE.DRACOLoader.setDecoderPath('./draco');
    loader.setDRACOLoader(new THREE.DRACOLoader());
    loader.load(
        //模型地址
        'Resources/ExampleModel02.gltf',
        function (OBJ) {
            scene.add(OBJ.scene);
            let model = OBJ.scene;

            //获取动作
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(OBJ.animations[0]).play();
            //cycle over materials
            model.traverse(child => {
                //材质赋予
                if (child.material) {
                    child.material.needsUpdate = true;
                    child.material.flatShading = false;
                    child.material.transparent = true;
                }
            });
            console.log(model.children);
            scene.add(model);
        });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //Gamma 设置
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;
    //模型分辨率设置，启用后自适应设备的分辨率
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    //OrbitControls(camera)，控制镜头
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.update();
    //窗口的自适应
    window.addEventListener('resize', onWindowResize, false);
    //添加光投射器 及 鼠标二维向量 用于捕获鼠标移入物体
    //下次渲染时，通过mouse对于的二维向量判断是否经过指定物体

    renderer.domElement.addEventListener('mousedown', mouseDown, false);
    renderer.domElement.addEventListener('mousemove', onTouchMove);
    renderer.domElement.addEventListener('touchmove', onTouchMove);
}

function onTouchMove(event) {
    //转换坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    checkIntersection();
}

function addSelectedObject(object) {

    selectedObjects = [];
    selectedObjects.push(object);

}

function checkIntersection() {
    raycaster.setFromCamera(mouse, camera);

    let intersects = raycaster.intersectObjects(scene.children[1].children, true);

    if (intersects.length > 0) {
        console.log(scene.children[1].children.object);
        let selectedObject = scene.children[1].children.object;
        addSelectedObject(selectedObject);
        outlinePass.selectedObjects = selectedObjects;

    } else {

        // outlinePass.selectedObjects = [];

    }

}

//鼠标点击事件
function mouseDown(event) {
    event.preventDefault();
    raycast.setFromCamera(mouse, camera);
    let intersects = raycast.intersectObjects(scene.children[1].children);
    if (intersects.length > 0) {
        if (event.button === 0) {
            console.log('Click Me!');
        }
        render();
    }
}

//窗口自适应
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    //防止物体由于窗口的变换而形变
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

//Draw Scene
function render() {
    //THREE.GLTFLoader.Shaders.update(scene, camera);
    renderer.render(scene, camera);
}

//run GameLoop(renderer,update,repeat)
function GameLoop() {

    render();
    requestAnimationFrame(GameLoop);
    composer.render();
}

