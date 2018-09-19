let container, stats;
let camera, scene, renderer, controls;
const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
let selectedObjects = [];

let composer, effectFXAA, outlinePass;
const obj3d = new THREE.Object3D();

const group = new THREE.Group();

const params = {
    edgeStrength: 3.0,
    edgeGlow: 0.0,
    edgeThickness: 1.0,
    pulsePeriod: 0,
    rotate: false,
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

gui.add(params, 'rotate');

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
    document.body.appendChild(container);

    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer = new THREE.WebGLRenderer();
    renderer.shadowMap.enabled = true;
    // todo - support pixelRatio in this demo
    renderer.setSize(width, height);
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

    //

    stats = new Stats();
    container.appendChild(stats.dom);

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

    window.addEventListener('resize', onWindowResize, false);

    window.addEventListener('mousemove', onTouchMove);
    window.addEventListener('touchmove', onTouchMove);

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

        checkIntersection();

    }

    function addSelectedObject(object) {

        selectedObjects = [];
        selectedObjects.push(object);

    }

    function checkIntersection() {

        raycaster.setFromCamera(mouse, camera);

        const intersects = raycaster.intersectObjects([scene], true);

        if (intersects.length > 0) {

            const selectedObject = intersects[0].object;
            addSelectedObject(selectedObject);
            outlinePass.selectedObjects = selectedObjects;

        } else {
            // outlinePass.selectedObjects = [];
        }
    }
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

    requestAnimationFrame(animate);

    stats.begin();

    const timer = performance.now();

    if (params.rotate) {

        group.rotation.y = timer * 0.0001;

    }

    controls.update();

    composer.render();

    stats.end();

}
