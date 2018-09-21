let container, stats;
let camera, scene, renderer, controls;
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
//鼠标屏幕坐标
let x, y;
let intersects, ModelGroup;
let selectedObjects = [];

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

// Init gui

const gui = new dat.GUI({width: 300});

gui.add(params, 'edgeStrength', 0.01, 10).onChange(function (value) {

    outlinePass.edgeStrength = Number(value);

});

gui.add(params, 'edgeGlow', 0.0, 1).onChange(function (value) {

    outlinePass.edgeGlow = Number(value);

});

gui.add(params, 'edgeThickness', 1, 4).onChange(function (value) {

    outlinePass.edgeThickness = Number(value);

});

gui.add(params, 'pulsePeriod', 0.0, 5).onChange(function (value) {

    outlinePass.pulsePeriod = Number(value);

});

gui.add(params, 'usePatternTexture').onChange(function (value) {

    outlinePass.usePatternTexture = value;

});

const Configuration = function () {

    this.visibleEdgeColor = '#ffffff';
    this.hiddenEdgeColor = '#76ccc9';

};

const conf = new Configuration();

const controllerVisible = gui.addColor(conf, 'visibleEdgeColor').onChange(function (value) {

    outlinePass.visibleEdgeColor.set(value);

});

const controllerHidden = gui.addColor(conf, 'hiddenEdgeColor').onChange(function (value) {

    outlinePass.hiddenEdgeColor.set(value);

});

init();
animate();

function init() {

    container = document.createElement('div');
    container.setAttribute("id", "ModelDiv");

    document.body.appendChild(container);

    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.shadowMap.enabled = true;
    renderer.setSize(width, height);
    renderer.gammaFactor = 2.2;
    renderer.gammaOutput = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    document.body.appendChild(renderer.domElement);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xFFFFFF);
    camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 8);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.minDistance = 5;
    controls.maxDistance = 20;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;

    //Light
    light = new THREE.HemisphereLight(0xbbbbff, 0x444422);
    light = new THREE.DirectionalLight(0xffffff, 1.1);
    light.position.set(10, 20, 15);
    scene.add(light);

    // model

    var loader = new THREE.GLTFLoader();
    loader.load('Resources/ExampleModel.gltf', function (object) {
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
                child.receiveShadow = true;
                child.castShadow = true;

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
    composer.addPass(outlinePass);


    effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight);
    effectFXAA.renderToScreen = true;
    composer.addPass(effectFXAA);

    renderer.domElement.addEventListener('resize', onWindowResize, false);

    renderer.domElement.addEventListener('mousemove', checkIntersection);
    renderer.domElement.addEventListener('touchmove', checkIntersection);
    renderer.domElement.addEventListener('mousedown', mouseDown, false);
}
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

    function addSelectedObject(object) {
        selectedObjects = [];
        selectedObjects.push(object);
    }

    function allModel(object) {
        ModelGroup = [];
        ModelGroup.push(object.parent.parent.children);
    }

    function checkIntersection(event) {
        onTouchMove(event);
        if (intersects.length > 0) {
            const selectedObject = intersects[0].object;
            addSelectedObject(selectedObject);
            outlinePass.selectedObjects = selectedObjects;

        } else {
            // outlinePass.selectedObjects = [];
        }
    }

    function mouseDown(event) {
        onTouchMove(event);

        if (intersects.length > 0) {
            if (event.button === 0) {
                showHideSVG();
            }
            render();
        }
    }

    function ShowHide() {
        //intersects[0].object.visible = false;
        console.log(intersects[0].object.parent);
        allModel(intersects[0].object);
        console.log(ModelGroup[0]);
        for (let i = 0; i < ModelGroup[0].length; i++) {
            if (ModelGroup[0][i] !== intersects[0].object.parent) {
                console.log(ModelGroup[0][i]);
                ModelGroup[0][i].visible = false;
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
    //THREE.GLTFLoader.Shaders.update(scene, camera);
    renderer.render(scene, camera);
}

function showHideSVG() {
    let deskTop = document.getElementsByClassName('SVG_Rooter');
    console.log(x.toString());
    let position_x = x.toString() + "px";
    let position_y = y.toString() + "px";
    deskTop[0].style.left = position_x;
    deskTop[0].style.top = position_y;

    let bt = document.getElementsByClassName('button');
    bt[0].style.width = '50px';
    bt[0].onclick = function (){
        ShowHide();
    };

}
