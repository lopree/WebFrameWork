let container, stats;
let camera, scene, renderer, controls;
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
//鼠标屏幕坐标
let x, y;
let intersects, ModelGroup;
let selectedObjects = [];
let Container;

let composer, effectFXAA, outlinePass;
const obj3d = new THREE.Object3D();

const group = new THREE.Group();

const params = {
    edgeStrength: 3.0,
    edgeGlow: 0.0,
    edgeThickness: 1.0,
    pulsePeriod: 0,
    usePatternTexture: false
};


init();
animate();
DrawlSVG();
function init() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    //renderer
    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(width, height);
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);
    //scene and Camera
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-0.005, 3, 3);
    //CameraControls
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls = new THREE.OrbitControls(camera);
    //Light
    light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
    light.position.set(100, 200, 150);
    scene.add(light);
    // model
    let loader = new THREE.GLTFLoader();
    THREE.DRACOLoader.setDecoderPath('./draco');
    loader.setDRACOLoader(new THREE.DRACOLoader());
    loader.load(
        'Resources/Fabrik.gltf',
        function (object) {
            scene.add(object.scene);
            let scale = 1.0;
            object.traverse(function (child) {

                if (child instanceof THREE.Mesh) {

                    child.geometry.center();
                    child.geometry.computeBoundingSphere();
                    scale = 0.2 * child.geometry.boundingSphere.radius;

                    const phongMaterial = new THREE.MeshPhongMaterial({
                        color: 0xffffff,
                        specular: 0x111111, shininess: 5
                    });

                    child.material = phongMaterial;

                }

            });

            object.position.y = 1;
            object.scale.divideScalar(scale);
            obj3d.add(object);

        });

    scene.add(group);
    group.add(obj3d);
    // postprocessing
    composer = new THREE.EffectComposer(renderer);

    const renderPass = new THREE.RenderPass(scene, camera);
    composer.addPass(renderPass);

    outlinePass = new THREE.OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight),
        scene, camera);
    //高光参数
    outlinePass.edgeStrength = params.edgeStrength;
    outlinePass.edgeGlow= params.edgeGlow;
    outlinePass.edgeThickness= params.edgeThickness;
    outlinePass.pulsePeriod = params.pulsePeriod;
    outlinePass.usePatternTexture = params.usePatternTexture;
    outlinePass.visibleEdgeColor.set("#ffd129");
    outlinePass.hiddenEdgeColor.set('#76ccc9');
    composer.addPass(outlinePass);

    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    effectFXAA.renderToScreen = true;
    composer.addPass(effectFXAA);
    //Mouse EventListener
    renderer.domElement.addEventListener('resize', onWindowResize, false);
    renderer.domElement.addEventListener('mousemove', checkIntersection);
    renderer.domElement.addEventListener('touchmove', checkIntersection);
    renderer.domElement.addEventListener('mousedown', mouseDown, false);
}
//Get Mouse Position
function onTouchMove(event) {

    if (event.changedTouches) {

        x = event.changedTouches[0].pageX;
        y = event.changedTouches[0].pageY;

    } else {

        x = event.clientX;
        y = event.clientY;

    }

    mouse.x = (x / window.innerWidth) * 2 - 1;
    mouse.y = -(y / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    intersects = raycaster.intersectObjects([scene], true);
    // checkIntersection();
}

function addSelectedObject(obj) {
    selectedObjects = [];
    Father_Obj02(obj);
}
//Get all Object
function allModel() {
    ModelGroup = [];
    ModelGroup = scene.children[2].children;
}
//Mouse Over Event
function checkIntersection(event) {
    onTouchMove(event);
    if (intersects.length > 0) {
        let selectedObject = intersects[0].object;
        addSelectedObject(selectedObject);
        outlinePass.selectedObjects = selectedObjects;
        //when click not Object don't show Button
        let tempName = intersects[0].object.name;
        Container = new RegExp("Floor").test(tempName);
    } else {
        // outlinePass.selectedObjects = [];
    }
}
//Mouse Click Event
function mouseDown(event) {
    onTouchMove(event);
    console.log(x,y);
    if (intersects.length > 0) {
        if (event.button === 0&&!Container) {
            showHideBtn();
            console.log(selectedObjects[0].position);
            transToScreenCoord(selectedObjects[0]);
        }
        render();
    }
}
//Button Click Show/Hide Object
function ShowHideObject() {
    allModel();
    for (let i = 0; i < ModelGroup.length; i++) {
        let tempObj = ModelGroup[i];
        let tempObjName = tempObj.name;
        let tempContainer = new RegExp("Object").test(tempObjName);
        if (ModelGroup[i].name!== selectedObjects[0].name&&tempContainer) {
            ModelGroup[i].visible = false;
        }
    }
    camera.position.set(0, 3, 3);
}


function onWindowResize() {

    const width = window.innerWidth;
    const height = window.innerHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    composer.setSize(width, height);

    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);

}

function animate() {
    render();
    requestAnimationFrame(animate);
    controls.update();
    composer.render();
}

function render() {
    renderer.render(scene, camera);

}
//Mouse Click Show/Hide Button
function showHideBtn() {
    let deskTop = document.getElementsByClassName('SVG_Rooter');
    deskTop[0].style.display = 'block';
    let position_x = x.toString() + "px";
    let position_y = y.toString() + "px";
    deskTop[0].style.left = position_x;
    deskTop[0].style.top = position_y;

    let bt = document.getElementsByClassName('button');
    bt[0].style.width = '50px';
    bt[0].onclick = function () {
        ShowHideObject();
        deskTop[0].style.display = 'none';
    };
}

function Father_Obj02(object){
    let tempObj02 = object.parent;
    let tempObjName02 = tempObj02.name;
    let tempContainer02 = new RegExp("Object").test(tempObjName02);
    if(tempContainer02){
        selectedObjects.push(tempObj02);
    }
    if (tempObjName02 === "Scene") {
        return;
    }
    else {
        Father_Obj02(tempObj02);
    }
}
//trans Object 3D_Coord to ScreenCoord
function transToScreenCoord(obj) {
    //创建一个3D坐标
    let vector = new THREE.Vector3();
    //获取模型
    vector = vector.setFromMatrixPosition(obj.matrixWorld).project(camera);
    let halfWidth = window.innerWidth / 2;
    let halfHeight = window.innerHeight / 2;
    console.log(vector.x * halfWidth + halfWidth);
    let result = {
        x: Math.round(vector.x * halfWidth + halfWidth),
        y: Math.round(-vector.y * halfHeight + halfHeight)
    };
    //2D坐标
    console.log(result);
}

//Drawl SVG by Coord
function DrawlSVG() {

}

