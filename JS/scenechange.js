//import * as THREE from "../Core/three/three";

let scene, camera, renderer, controls, light;
let mixer;

let composer, outlinePass;

let raycast = new THREE.Raycaster();
let mouse = new THREE.Vector2();

let intersects,selectedObjects = [];

let params = {
    edgeStrength: 3.0,
    edgeGlow: 1.0,
    edgeThickness: 2.0,
    //是否闪烁
    pulsePeriod: 0
};

let Configuration = function () {

    this.visibleEdgeColor = '#ff2f31';
    this.hiddenEdgeColor = '#190a05';

};
let conf = new Configuration();



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

    let loader = new THREE.GLTFLoader();
    //设置GLTF模型的解压缩文件存放地址
    THREE.DRACOLoader.setDecoderPath('./draco');
    loader.setDRACOLoader(new THREE.DRACOLoader());
    loader.load(
        //模型地址
        'Resources/ExampleModel.gltf',
        function (OBJ) {
            scene.add(OBJ.scene);
            let model = OBJ.scene;
            let scale = 1.0;
            //获取动作
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(OBJ.animations[0]).play();
            //cycle over materials
            model.traverse(child => {
                //材质赋予
                // if (child.material) {
                //     child.material.needsUpdate = true;
                //     child.material.flatShading = false;
                //     child.material.transparent = true;
                // }

                if ( child instanceof THREE.Mesh ) {

                    child.geometry.center();
                    child.geometry.computeBoundingSphere();
                    scale = 0.2 * child.geometry.boundingSphere.radius;

                    let phongMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff,
                        specular: 0x111111, shininess: 5 } );
                    child.material = phongMaterial;
                    child.receiveShadow = true;
                    child.castShadow = true;

                }
            });
            scene.add(model);
        });
    renderer.setSize(window.innerWidth, window.innerHeight);
    //Gamma 设置,直接影响场景的明亮程度
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
    //postprocessing
    composer = new THREE.EffectComposer(renderer);
    let renderPass = new THREE.RenderPass( scene, camera );
    composer.addPass( renderPass );
    outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene,
        camera);
    outlinePass.edgeStrength = params.edgeStrength;
    outlinePass.edgeGlow = params.edgeGlow;
    outlinePass.edgeThickness = params.edgeThickness;
    outlinePass.pulsePeriod = params.pulsePeriod;

    outlinePass.visibleEdgeColor.set(conf.visibleEdgeColor);
    outlinePass.hiddenEdgeColor.set( conf.hiddenEdgeColor );
    composer.addPass(outlinePass);


    //添加光投射器 及 鼠标二维向量 用于捕获鼠标移入物体
    //下次渲染时，通过mouse对于的二维向量判断是否经过指定物体

    renderer.domElement.addEventListener('mousedown', mouseDown, false);
    renderer.domElement.addEventListener('mousemove', mouseMove, false);
}

function onTouchMove(event) {
    let x, y;

    if (event.changedTouches) {

        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;

    } else {

        x = event.clientX;
        y = event.clientY;

    }

    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;

    raycast.setFromCamera(mouse, camera);
    intersects = raycast.intersectObjects(scene.children[1].children);
}

function addSelectedObject( object ) {

    selectedObjects = [];
    selectedObjects.push( object );

}

function mouseMove(event) {
    onTouchMove(event);
    if (intersects.length > 0) {
        //Objects
        console.log(scene.children[1].children);
        //Object
        console.log(intersects[0]);
        let selectedObject = intersects[ 0 ].object;
        addSelectedObject( selectedObject );
        outlinePass.selectedObjects = addSelectedObject;
    } else {

    }
    render();
}

//鼠标点击事件
function mouseDown(event) {
    onTouchMove(event);
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

