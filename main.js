/* Protection: Active */
import * as THREE from '\x74\x68\x72\x65\x65';
import { OrbitControls } from '\x74\x68\x72\x65\x65\x2f\x61\x64\x64\x6f\x6e\x73\x2f\x63\x6f\x6e\x74\x72\x6f\x6c\x73\x2f\x4f\x72\x62\x69\x74\x43\x6f\x6e\x74\x72\x6f\x6c\x73\x2e\x6a\x73';
import gsap from '\x67\x73\x61\x70';
import { Strawberry } from '\x2e\x2f\x73\x74\x72\x61\x77\x62\x65\x72\x72\x79\x2e\x6a\x73\x3f\x76\x3d\x35';
class Simulator {
constructor() {
this.canvas = document.querySelector('\x23\x63\x61\x6e\x76\x61\x73\x2d\x33\x64');
this.scene = new THREE.Scene();
this.renderer = null;
this.camera = null;
this.controls = null;
this.strawberry = null;
this.clippingPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
this.init();
this.setupLights();
this.setupEnvironment();
this.animate();
this.onResize();
this.addStrawberry(); // async
window.addEventListener('\x72\x65\x73\x69\x7a\x65', () => this.onResize());
}
init() {
this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
this.camera.position.set(5, 5, 10);
this.renderer = new THREE.WebGLRenderer({
canvas: this.canvas,
antialias: true,
alpha: true
});
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
this.renderer.setSize(window.innerWidth, window.innerHeight);
this.renderer.shadowMap.enabled = true;
this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
this.renderer.toneMappingExposure = 1.4;
this.renderer.localClippingEnabled = true;
this.controls = new OrbitControls(this.camera, this.renderer.domElement);
this.controls.enableDamping = true;
this.controls.dampingFactor = 0.05;
this.controls.minDistance = 2;
this.controls.maxDistance = 15;
}
setupLights() {
const keyLight = new THREE.DirectionalLight(0xfff4e0, 2.5);
keyLight.position.set(6, 10, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.width  = 2048;
keyLight.shadow.mapSize.height = 2048;
keyLight.shadow.camera.near = 0.5;
keyLight.shadow.camera.far  = 50;
keyLight.shadow.radius = 4;
this.scene.add(keyLight);
const rimLight = new THREE.DirectionalLight(0xaad4ff, 1.8);
rimLight.position.set(-6, 2, -8);
this.scene.add(rimLight);
const fillLight = new THREE.DirectionalLight(0xffe8d0, 0.6);
fillLight.position.set(-4, -2, 4);
this.scene.add(fillLight);
const ambientLight = new THREE.AmbientLight(0x3a2060, 1.2);
this.scene.add(ambientLight);
const underLight = new THREE.PointLight(0xff2244, 1.2, 8);
underLight.position.set(0, -3, 0);
this.scene.add(underLight);
const spotLight = new THREE.SpotLight(0xffffff, 4);
spotLight.position.set(2, 8, 3);
spotLight.angle     = Math.PI / 10;
spotLight.penumbra  = 0.7;
spotLight.castShadow = true;
this.scene.add(spotLight);
}
setupEnvironment() {
const groundGeo = new THREE.CircleGeometry(6, 64);
const groundMat = new THREE.MeshStandardMaterial({
color:    0x1a1030,
roughness: 0.1,
metalness: 0.6,
});
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -3.0;
ground.receiveShadow = true;
this.scene.add(ground);
const particleCount = 800;
const pGeo  = new THREE.BufferGeometry();
const pPos  = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount * 3; i++) {
pPos[i] = (Math.random() - 0.5) * 20;
}
pGeo.setAttribute('\x70\x6f\x73\x69\x74\x69\x6f\x6e', new THREE.BufferAttribute(pPos, 3));
const pMat  = new THREE.PointsMaterial({ color: 0xffaacc, size: 0.03, transparent: true, opacity: 0.5 });
this.scene.add(new THREE.Points(pGeo, pMat));
this.scene.background = new THREE.Color(0x0d0818);
this.scene.fog = new THREE.FogExp2(0x0d0818, 0.04);
}
async addStrawberry() {
this.strawberry = new Strawberry();
this.scene.add(this.strawberry.group);
try {
await this.strawberry.load('\x2e\x2f\x53\x74\x72\x61\x77\x62\x65\x72\x72\x79\x5f\x62\x6c\x65\x6e\x64\x2e\x67\x6c\x62');
} catch(e) {
console.error('\x47\x4c\x54\x46\x20\x6c\x6f\x61\x64\x20\x66\x61\x69\x6c\x65\x64\x3a', e);
document.querySelector('\x2e\x6c\x6f\x61\x64\x69\x6e\x67\x2d\x74\x65\x78\x74').textContent = '모델 로드 실패 ❌';
return;
}
const loaderEl = document.getElementById('\x6c\x6f\x61\x64\x65\x72');
loaderEl.style.opacity = '\x30';
setTimeout(() => loaderEl.style.display = '\x6e\x6f\x6e\x65', 500);
this.setupUI();
}
setupUI() {
const ripenessSlider = document.getElementById('\x72\x69\x70\x65\x6e\x65\x73\x73');
const wireframeToggle = document.getElementById('\x77\x69\x72\x65\x66\x72\x61\x6d\x65');
const infoState = document.getElementById('\x69\x6e\x66\x6f\x2d\x73\x74\x61\x74\x65').querySelector('\x2e\x76\x61\x6c\x75\x65');
ripenessSlider.addEventListener('\x69\x6e\x70\x75\x74', (e) => {
const value = e.target.value;
this.strawberry.updateRipeness(value);
if (value > 80) infoState.textContent = '숙성됨 (Ripe)';
else if (value > 40) infoState.textContent = '익는 중 (Ripening)';
else infoState.textContent = '덜 익음 (Unripe)';
});
wireframeToggle.addEventListener('\x63\x68\x61\x6e\x67\x65', (e) => {
this.strawberry.toggleWireframe(e.target.checked);
});
const crossToggle = document.getElementById('\x63\x72\x6f\x73\x73');
crossToggle.addEventListener('\x63\x68\x61\x6e\x67\x65', (e) => {
this.strawberry.toggleCrossSection(e.target.checked, this.clippingPlane);
});
const points = document.querySelectorAll('\x2e\x70\x6f\x69\x6e\x74\x73\x2d\x6c\x69\x73\x74\x20\x6c\x69');
points.forEach(point => {
point.addEventListener('\x63\x6c\x69\x63\x6b', () => {
const target = point.getAttribute('\x64\x61\x74\x61\x2d\x74\x61\x72\x67\x65\x74');
this.focusOn(target);
});
});
}
focusOn(target) {
const targets = {
'\x73\x65\x65\x64\x73': {
pos: { x: 2.0, y: 0.0, z: 3.0 },
look: { x: 0, y: 0, z: 0 }
},
'\x63\x61\x6c\x79\x78': {
pos: { x: 0, y: 5, z: 2 },
look: { x: 0, y: 1.5, z: 0 }
},
'\x73\x75\x72\x66\x61\x63\x65': {
pos: { x: 3.5, y: 0.5, z: 1.0 },
look: { x: 0, y: 0, z: 0 }
}
};
const config = targets[target];
if (config) {
gsap.to(this.camera.position, {
x: config.pos.x,
y: config.pos.y,
z: config.pos.z,
duration: 1.5,
ease: "\x70\x6f\x77\x65\x72\x32\x2e\x69\x6e\x4f\x75\x74",
onUpdate: () => this.controls.update()
});
gsap.to(this.controls.target, {
x: config.look.x,
y: config.look.y,
z: config.look.z,
duration: 1.5,
ease: "\x70\x6f\x77\x65\x72\x32\x2e\x69\x6e\x4f\x75\x74"
});
}
}
onResize() {
this.camera.aspect = window.innerWidth / window.innerHeight;
this.camera.updateProjectionMatrix();
this.renderer.setSize(window.innerWidth, window.innerHeight);
}
animate() {
requestAnimationFrame(() => this.animate());
if (this.strawberry && this.strawberry._ready) {
this.strawberry.group.rotation.y += 0.004;
this.strawberry.group.position.y = Math.sin(Date.now() * 0.0009) * 0.12;
}
this.controls.update();
this.renderer.render(this.scene, this.camera);
}
}
new Simulator();