import * as THREE from "./threejs/build/three.module.js";
import { OrbitControls } from "./threejs/examples/jsm/controls/OrbitControls.js";
import { FontLoader } from "./threejs/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "./threejs/examples/jsm/geometries/TextGeometry.js";
import { GLTFLoader } from "./threejs/examples/jsm/loaders/GLTFLoader.js";

var scene, camera1, camera2, selectedCamera, renderer;
let firstPersonCamera, cameraOffset;
var controls;
var raycaster;
var sphere, hoopPosition;
var clock;
var cone, cylinder, scoreBoard, chair;
const textureLoader = new THREE.TextureLoader();

const createPoints = () => {
  const points = [
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(2, 0, 0),
    new THREE.Vector3(2, -1, 0),
  ];
  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);

  const material = new THREE.PointsMaterial({ color: 0x000000 });

  return new THREE.Points(geometry, material);
};

const createLines = () => {
  const points = [
    new THREE.Vector3(-2, 0, 0),
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(2, 0, 0),
    new THREE.Vector3(2, -1, 0),
  ];

  const geometry = new THREE.BufferGeometry();
  geometry.setFromPoints(points);

  const material = new THREE.LineBasicMaterial({
    color: 0x000000,
  });

  return new THREE.LineLoop(geometry, material);
};

const createPlane = (width, height) => {
  const geometry = new THREE.PlaneGeometry(width, height);
  const texture = textureLoader.load("./public/assets/basketbalCourt.png");
  const material = new THREE.MeshStandardMaterial({
    wireframe: false,
    emissive: 0xff0000,
    metalness: 0.1,
    map: texture,
  });
  return new THREE.Mesh(geometry, material);
};

const createBox = (width, height, depth) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({
    color: 0x73706f,
    wireframe: false,
    metalness: 0.2,
  });
  return new THREE.Mesh(geometry, material);
};

const createTVReplay = (x, y, z, rotationX) => {
  const tvreplay = createBox(10, 5, 0.2);
  const tvreplayTexture = textureLoader.load("./public/assets/tvreplay.jpg");
  tvreplay.material.map = tvreplayTexture;
  tvreplay.position.set(x, y, z);
  tvreplay.rotateX(rotationX);
  tvreplay.castShadow = true;
  tvreplay.receiveShadow = true;
  return tvreplay;
};

const createSphere = (radius) => {
  const geometry = new THREE.SphereGeometry(radius);
  const texture = textureLoader.load("./public/assets/basketball texture.jpg");
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  const material = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    metalness: 0.2,
    map: texture,
  });
  return new THREE.Mesh(geometry, material);
};

const createCylinder = (radiusTop, radiusButtom, height) => {
  const geometry = new THREE.CylinderGeometry(
    radiusTop,
    radiusButtom,
    height,
    24
  );
  const material = new THREE.MeshLambertMaterial({ color: 0xff00ff });
  return new THREE.Mesh(geometry, material);
};

const createAmbientLight = () => {
  return new THREE.AmbientLight(0xffffff, 0.5);
};

const createSpotLight = (color) => {
  const light = new THREE.SpotLight(color, 0.5, 100, 10);
  const lightHelper = new THREE.SpotLightHelper(light, 0xffffff);
  scene.add(lightHelper);
  return light;
};

const createAndPositionSpotLight = (x, y, z, color) => {
  const spotLight = createSpotLight(color);
  spotLight.position.set(x, y, z);
  spotLight.shadow.mapSize.width = 1024;
  spotLight.shadow.mapSize.height = 1024;
  spotLight.castShadow = true;
  return spotLight;
};

const init = () => {
  scene = new THREE.Scene();
  const textureLoader = new THREE.TextureLoader();
  const geometry = new THREE.BoxGeometry(40, 20, 30);
  const wallTexture = textureLoader.load("./public/assets/skybox/wall.avif");
  const rightMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: wallTexture,
    side: THREE.BackSide,
  });
  const leftMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: wallTexture,
    side: THREE.BackSide,
  });
  const roofTexture = textureLoader.load("./public/assets/skybox/roof.png");
  roofTexture.wrapS = THREE.RepeatWrapping;
  roofTexture.wrapT = THREE.RepeatWrapping;
  roofTexture.repeat.set(1, 5);
  const topMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: roofTexture,
    side: THREE.BackSide,
  });
  const bottomMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    side: THREE.BackSide,
    metalness: 0.7,
  });
  const frontMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: wallTexture,
    side: THREE.BackSide,
  });
  const backMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    map: wallTexture,
    side: THREE.BackSide,
  });
  const skybox = new THREE.Mesh(geometry, [
    rightMat,
    leftMat,
    topMat,
    bottomMat,
    frontMat,
    backMat,
  ]);
  skybox.receiveShadow = true;
  skybox.castShadow = true;
  skybox.position.set(0, 9.99, 0);
  scene.add(skybox);

  camera1 = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera1.position.set(0, 10, 15);
  camera1.lookAt(0, 0, 0);
  camera1.layers.enable(1);

  camera2 = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera2.position.set(20, 7, 10);
  camera2.lookAt(0, 0, 0);

  firstPersonCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  cameraOffset = new THREE.Vector3(0, 1, 3);

  selectedCamera = camera1;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  document.body.appendChild(renderer.domElement);

  controls = new OrbitControls(camera1, renderer.domElement);

  const plane = createPlane(30, 20);
  plane.rotation.x = -Math.PI / 2;
  plane.position.y = 0;
  plane.receiveShadow = true;
  scene.add(plane);

  sphere = createSphere(0.25);
  sphere.position.set(0, 0.25, 0);
  sphere.castShadow = true;
  sphere.receiveShadow = true;

  scoreBoard = createBox(10, 5, 0.2);
  const scoreBoardTecture = textureLoader.load(
    "./public/assets/scoreboard.jpg"
  );
  scoreBoard.material.map = scoreBoardTecture;
  scoreBoard.position.set(0, 8, -14);
  scoreBoard.castShadow = true;
  scoreBoard.receiveShadow = true;

  const tvreplay1 = createTVReplay(0, 14, -14, Math.PI / 12);
  const tvreplay2 = createTVReplay(0, 14, 14, -Math.PI / 12);

  chair = createBox(3, 1, 2);
  const chairTexture = textureLoader.load("./public/assets/chair.jpeg");
  chair.material.map = chairTexture;
  chair.position.set(0, 0.5, -12);
  chair.castShadow = true;
  chair.receiveShadow = true;

  cylinder = createCylinder(0.5, 0.5, 12);
  cylinder.position.set(0, 0, -14);
  cylinder.castShadow = true;
  cylinder.receiveShadow = true;

  const light = createAmbientLight();

  const spotLight1 = createAndPositionSpotLight(-10, 20, 0, 0xffffff);
  const spotLight2 = createAndPositionSpotLight(0, 20, 0, 0xff00ff);
  const spotLight3 = createAndPositionSpotLight(10, 20, 0, 0xffff00);

  const ambientLight = createAmbientLight();
  scene.add(ambientLight);

  const fontLoader = new FontLoader();
  fontLoader.load(
    "./threejs/examples/fonts/gentilis_bold.typeface.json",
    (font) => {
      const geometry = new TextGeometry("LAKERS                          GSW", {
        font: font,
        size: 0.5,
        height: 0.2,
      });
      const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const textMesh = new THREE.Mesh(geometry, material);
      textMesh.position.set(-4.25, 9.7, -14);
      textMesh.castShadow = true;
      scene.add(textMesh);
    }
  );

  const gltfLoader = new GLTFLoader();
  gltfLoader.load("./public/assets/basketball_hoop/scene.gltf", (gltf) => {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);

    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    model.position.set(-14, 3.6, 0);
    scene.add(model);
  });
  hoopPosition = new THREE.Vector3(-12.1, 5.3, 0);
  clock = new THREE.Clock();

  const objects = [
    sphere,
    spotLight1,
    spotLight2,
    spotLight3,
    light,
    cone,
    cylinder,
    scoreBoard,
    chair,
    tvreplay1,
    tvreplay2,
  ];
  objects.forEach((object) => {
    scene.add(object);
  });

  raycaster = new THREE.Raycaster();
};

const render = () => {
  requestAnimationFrame(render);
  renderer.setClearColor(0xcfcfcf);
  controls.update();
  animate();
  renderer.render(scene, selectedCamera);
};

let falling = false;
let fallStartTime = 0;
let elapsedTime = 0;
const moveSpeed = 0.1;
const keyState = { w: false, a: false, s: false, d: false };
const jumpSpeed = 1;
let isJumping = false;

const animate = () => {
  requestAnimationFrame(animate);
  controls.update();

  elapsedTime = clock.getElapsedTime();
  const duration = 4;

  if (elapsedTime <= duration && !falling) {
    const t = elapsedTime / duration;
    const easedT = t * t * (2 * t);

    const currentPosition = new THREE.Vector3();
    currentPosition.lerpVectors(
      new THREE.Vector3(
        sphere.position.x,
        sphere.position.y,
        sphere.position.z
      ),
      hoopPosition,
      easedT
    );

    const maxArcHeight = 1;
    const arcHeight = maxArcHeight * Math.sin(easedT * Math.PI);

    currentPosition.y = currentPosition.y + arcHeight;

    sphere.position.set(
      currentPosition.x,
      currentPosition.y,
      currentPosition.z
    );

    if (easedT >= 0.98) {
      falling = true;
      fallStartTime = elapsedTime;
    }
  }

  if (falling) {
    const fallTime = elapsedTime - fallStartTime;
    const gravity = -9.8;

    sphere.position.y += gravity * fallTime * 0.01;

    if (sphere.position.y <= 0.25) {
      sphere.position.y = 0.25;
      falling = false;
    }
  }

  if (selectedCamera === firstPersonCamera) {
    firstPersonCamera.position.copy(sphere.position).add(cameraOffset);
    firstPersonCamera.lookAt(sphere.position);
  }
  if (keyState.w) {
    sphere.position.z -= moveSpeed;
  }
  if (keyState.s) {
    sphere.position.z += moveSpeed;
  }
  if (keyState.a) {
    sphere.position.x -= moveSpeed;
  }
  if (keyState.d) {
    sphere.position.x += moveSpeed;
  }
  if (isJumping) {
    sphere.position.y += jumpSpeed * 0.1;
    if (sphere.position.y >= 1) {
      isJumping = false;
      falling = true;
      fallStartTime = clock.getElapsedTime();
    }
  }

  renderer.render(scene, selectedCamera);
};

window.onload = () => {
  init();
  clock.start();
  animate();
};

window.onresize = () => {
  camera1.aspect = window.innerWidth / window.innerHeight;
  camera1.updateProjectionMatrix();

  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();

  firstPersonCamera.aspect = window.innerWidth / window.innerHeight;
  firstPersonCamera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
};

const rainbowColors = [
  0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x8b00ff,
];

let currentColorIndex = 0;

window.addEventListener("click", (e) => {
  const pointer = new THREE.Vector2();
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, selectedCamera);

  const objects = raycaster.intersectObjects(scene.children);

  objects.forEach((object) => {
    if (object.object === sphere) {
      sphere.material.color.setHex(rainbowColors[currentColorIndex]);

      currentColorIndex = (currentColorIndex + 1) % rainbowColors.length;
    }
  });
});

window.addEventListener("keydown", (e) => {
  if (e.key === "w") {
    keyState.w = true;
  }
  if (e.key === "a") {
    keyState.a = true;
  }
  if (e.key === "s") {
    keyState.s = true;
  }
  if (e.key === "d") {
    keyState.d = true;
  }
  if (e.key === "c") {
    if (selectedCamera === camera1) {
      selectedCamera = camera2;
      controls.enabled = false;
    } else if (selectedCamera === camera2) {
      selectedCamera = firstPersonCamera;
      controls.enabled = false;
    } else {
      selectedCamera = camera1;
      controls.enabled = true;
    }
  }
  if (e.key === " ") {
    if (!isJumping && !falling) {
      isJumping = true;
    }
  }
  if (e.key === "r") {
    clock.start();
    falling = false;
    fallStartTime = 0;
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "w") {
    keyState.w = false;
  }
  if (e.key === "a") {
    keyState.a = false;
  }
  if (e.key === "s") {
    keyState.s = false;
  }
  if (e.key === "d") {
    keyState.d = false;
  }
});
