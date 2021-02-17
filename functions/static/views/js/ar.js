let scene = new THREE.Scene();
const videoDOM = document.querySelector('#remoteVideo');
let user = document.querySelector('#<%=userName%>');

let renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setClearColor(new THREE.Color("black"), 0);
renderer.setSize(videoDOM.videoWidth, videoDOM.videoHeight);
user.appendChild(renderer.domElement);

let camera = new THREE.Camera();
scene.add(camera);

let light = new THREE.DirectionalLight(0xffffff);
light.position.set(0, 0, 2);
scene.add(light);

let source = new THREEx.ARToolkitSource({sourceType: "video", sourceUrl: videoDOM.src});

function onResize(){
    if(context.arController !== null){
        source.copyElementSizeTo(context.arController.canvas);
    }
}

source.init(function onReady(){
    onResize();
});

let context = new THREEx.ARToolkitContext({
    canvasWidth: source.parameters.sourceWidth,
    canvasHeight: source.parameters.sourceHeight,
    debug: false,
    detectionMode: "mono_and_matrix"
});

context.init(function onCompleted(){
    camera.projectionMatrix.copy(context.getProjectionMatrix());
});

let group = new THREE.Group();

let controls = new THREEx.ArMarkerControls(context, group, {
    type: "pattern",
    patternURL: patternURL
});

scene.add(group);

// geometry, material, mesh, mesh's position, mesh add to group
let geo = new THREE.CubeGeometry(1, 1, 1);

let mat = new THREE.MeshLambertMaterial({color: 0xff0000});

let mesh1 = new THREE.Mesh(geo, mat);

group.add(mesh1);

function renderScene(){
    requestAnimationFrame(renderScene);

    if(source.ready === false){
        return ;
    }

    context.update(source.domElement);

    renderer.render(scene, camera);
}

renderScene();

