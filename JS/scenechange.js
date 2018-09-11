//import * as THREE from "../Core/three/three";
let container;
let scene,camera,render,controls,light;
let raycast,mouse;

init();
GameLoop();
function init(){
    container = document.createElement( 'div' );
    document.body.appendChild( container );
    //scene and camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFFFFFF );
    camera = new THREE .PerspectiveCamera(75,window.innerWidth/window.innerHeight,0.1,1000);
    camera.position.z = 3;
    //Light
    light = new THREE.HemisphereLight( 0xbbbbff, 0x444422 );
    light.position.set( 0, 1, 0 );
    scene.add( light );
    //OrbitControls(camera)，控制镜头
    controls = new THREE.OrbitControls(camera);
    controls.update();
    //render and loader
    render = new THREE.WebGLRenderer(
        {
            //抗锯齿
            antialias: true
        }
    );
    let loader = new THREE.GLTFLoader();
    //设置GLTF模型的解压缩文件存放地址
    THREE.DRACOLoader.setDecoderPath('./draco');
    loader.setDRACOLoader( new THREE.DRACOLoader());
    loader.load(
        //模型地址
        './Resources/Cube.gltf',
        function (OBJ) {
            let model = OBJ.scene;
            //获取动作s
            // mixer = new THREE.AnimationMixer(model);
            // mixer.clipAction(OBJ.animations[0]).play();
            //cycle over materials
            model.traverse(child => {
                //材质赋予
                if (child.material) {
                    child.material.needsUpdate = true;
                    child.material.flatShading = false;
                }
            });
            scene.add(model);
        });
    render.setSize(window.innerWidth,window.innerHeight);
    //Gamma 设置
    render.gammaFactor = 2.2;
    render.gammaOutput = true;
    //模型分辨率设置，启用后自适应设备的分辨率
    render.setPixelRatio( window.devicePixelRatio );
    container.appendChild(render.domElement);
    //窗口的自适应
    window.addEventListener( 'resize', onWindowResize, false );
    //添加光投射器 及 鼠标二维向量 用于捕获鼠标移入物体
    //下次渲染时，通过mouse对于的二维向量判断是否经过指定物体
    raycast = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    document.addEventListener('mousedown',mouseDown,false)
}
//鼠标点击事件
function mouseDown(event){
    event.preventDefault();
    //转换坐标
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycast.setFromCamera( mouse, camera );
    let intersects = raycast.intersectObjects( scene.children );
    if (intersects.length>0){
        let intersect = intersects[0];
        if (event.button===0) {
            showSVG();
        }
        renderer();
    }
}
//窗口自适应
function onWindowResize() {
    camera.aspect= window.innerWidth/window.innerHeight;
    //防止物体由于窗口的变换而形变
    camera.updateProjectionMatrix();
    render.setSize(window.innerWidth,window.innerHeight);
}

//Draw Scene
function renderer(){
    //THREE.GLTFLoader.Shaders.update(scene, camera);
    render.render(scene,camera);
}
//run GameLoop(renderer,update,repeat)
function GameLoop() {
    renderer();
    requestAnimationFrame(GameLoop);
}
//展示对应SVG,
function showSVG() {
    //原生查找并修改CSS中style的方法
    const deskTop = document.getElementsByClassName('svg-rooter');
    deskTop[0].style.display='block';
    //通过D3方法修改style
    // const deskTop = d3.select('.svg-rooter');
    // deskTop.style('display','block');
}

