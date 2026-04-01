/* Protection: Active */
import * as THREE from '\x74\x68\x72\x65\x65';
import { GLTFLoader } from '\x74\x68\x72\x65\x65\x2f\x61\x64\x64\x6f\x6e\x73\x2f\x6c\x6f\x61\x64\x65\x72\x73\x2f\x47\x4c\x54\x46\x4c\x6f\x61\x64\x65\x72\x2e\x6a\x73';
function hash(n) { return (Math.sin(n) * 43758.5453123) % 1; }
function noise3(x, y, z) {
const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
const fx = x - ix, fy = y - iy, fz = z - iz;
const ux = fx*fx*(3-2*fx), uy = fy*fy*(3-2*fy), uz = fz*fz*(3-2*fz);
const n000 = hash(ix+hash(iy+hash(iz))), n100 = hash(ix+1+hash(iy+hash(iz)));
const n010 = hash(ix+hash(iy+1+hash(iz))), n110 = hash(ix+1+hash(iy+1+hash(iz)));
const n001 = hash(ix+hash(iy+hash(iz+1))), n101 = hash(ix+1+hash(iy+hash(iz+1)));
const n011 = hash(ix+hash(iy+1+hash(iz+1))), n111 = hash(ix+1+hash(iy+1+hash(iz+1)));
return n000*(1-ux)*(1-uy)*(1-uz)+n100*ux*(1-uy)*(1-uz)+n010*(1-ux)*uy*(1-uz)+n110*ux*uy*(1-uz)
+n001*(1-ux)*(1-uy)*uz+n101*ux*(1-uy)*uz+n011*(1-ux)*uy*uz+n111*ux*uy*uz;
}
function fbm(x,y,z,o=4){let v=0,a=0.5,f=1,m=0;for(let i=0;i<o;i++){v+=noise3(x*f,y*f,z*f)*a;m+=a;a*=0.5;f*=2.1;}return v/m;}
function makeFleshTexture(size = 256) {
const canvas = document.createElement('\x63\x61\x6e\x76\x61\x73');
canvas.width = size; canvas.height = size;
const ctx = canvas.getContext('\x32\x64');
const g = ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
g.addColorStop(0,'\x23\x66\x66\x66\x35\x66\x35'); g.addColorStop(0.5,'\x23\x66\x66\x65\x30\x65\x30'); g.addColorStop(1,'\x23\x66\x66\x62\x33\x62\x33');
ctx.fillStyle = g; ctx.fillRect(0,0,size,size);
const imgData = ctx.getImageData(0,0,size,size); const data = imgData.data;
for(let py=0;py<size;py++) for(let px=0;px<size;px++){
const n=fbm(px/20,py/20,5.5,4)*20-10;
const idx=(py*size+px)*4;
data[idx]=Math.min(255,Math.max(0,data[idx]+n*0.5));
data[idx+1]=Math.min(255,Math.max(0,data[idx+1]-n*0.5));
data[idx+2]=Math.min(255,Math.max(0,data[idx+2]-n*0.5));
}
ctx.putImageData(imgData,0,0);
return new THREE.CanvasTexture(canvas);
}
export class Strawberry {
constructor() {
this.group    = new THREE.Group();
this.ripeness = 1.0;
this.meshes   = [];      // all loaded MeshPhysical meshes
this.fleshMat = null;    // cross-section material
this._clippingPlanes = [];
this._ready   = false;
this._fleshTex = makeFleshTexture(256);
}
/**
* Load the FBX model. Returns a Promise that resolves when ready.
*/
load(url) {
return new Promise((resolve, reject) => {
const loader = new GLTFLoader();
const texLoader = new THREE.TextureLoader();
const tex = texLoader.load('\x74\x65\x78\x74\x75\x72\x65\x73\x2f\x74\x65\x78\x74\x75\x72\x65\x5f\x30\x30\x2e\x6a\x70\x67\x3f\x76\x3d' + Date.now());
tex.colorSpace = THREE.SRGBColorSpace;
tex.flipY = false; // GLTF standard
loader.load(
url + '\x3f\x76\x3d' + Date.now(),
(gltf) => {
const model = gltf.scene;
const box    = new THREE.Box3().setFromObject(model);
const size   = new THREE.Vector3();
box.getSize(size);
const maxDim = Math.max(size.x, size.y, size.z, 0.001);
const scale  = 3.0 / maxDim;
model.scale.setScalar(scale);
box.setFromObject(model);
const center = new THREE.Vector3();
box.getCenter(center);
model.position.sub(center);
model.position.y += size.y * scale * 0.5;
model.traverse((child) => {
if (!child.isMesh) return;
child.castShadow    = true;
child.receiveShadow = true;
const baseMaterials = Array.isArray(child.material) ? child.material : [child.material];
const newMaterials = [];
baseMaterials.forEach(baseMat => {
let mat = new THREE.MeshPhysicalMaterial();
if (baseMat) {
mat.color.copy(baseMat.color || new THREE.Color(0xffffff));
if (mat.color.getHex() === 0) mat.color.setHex(0xffffff);
mat.roughness = baseMat.roughness !== undefined ? baseMat.roughness : 0.5;
mat.metalness = 0.0;
mat.normalMap = baseMat.normalMap;
if (baseMat.normalScale) mat.normalScale.copy(baseMat.normalScale);
mat.roughnessMap = baseMat.roughnessMap;
mat.metalnessMap = baseMat.metalnessMap;
mat.emissive.copy(baseMat.emissive || new THREE.Color(0x000000));
mat.emissiveMap = baseMat.emissiveMap;
mat.emissiveIntensity = baseMat.emissiveIntensity !== undefined ? baseMat.emissiveIntensity : 1;
mat.vertexColors = false; // Definitively disable faulty baked vertex colors
mat.transparent = baseMat.transparent || false;
mat.opacity = baseMat.opacity !== undefined ? baseMat.opacity : 1;
mat.alphaTest = baseMat.alphaTest || 0;
}
if (typeof tex !== '\x75\x6e\x64\x65\x66\x69\x6e\x65\x64') mat.map = tex;
mat.side = THREE.DoubleSide;
const name = (child.name || '').toLowerCase();
const matName = (baseMat && baseMat.name ? baseMat.name : '').toLowerCase();
const origColorHex = baseMat && baseMat.color ? baseMat.color.getHex() : 0xffffff;
mat.userData.origColorHex = origColorHex;
if (name.includes('\x6c\x65\x61\x66') || name.includes('\x63\x61\x6c\x79\x78') || name.includes('\x73\x65\x70\x61\x6c') || name.includes('\x73\x74\x65\x6d') || matName.includes('\x6c\x65\x61\x66') || matName.includes('\x67\x72\x65\x65\x6e') || matName.includes('\x6d\x61\x74\x65\x72\x69\x61\x6c\x2e\x30\x30\x31') || name.includes('잎')) {
mat.roughness = Math.max(mat.roughness || 0, 0.75);
mat.clearcoat = 0.1;
mat.userData.isLeaf = true;
} else if (name.includes('\x73\x65\x65\x64') || name.includes('\x61\x63\x68\x65\x6e\x65') || matName.includes('\x73\x65\x65\x64') || name.includes('씨')) {
mat.roughness = Math.max(mat.roughness || 0, 0.55);
mat.clearcoat = 0.3;
mat.userData.isSeed = true;
} else {
mat.clearcoat = 0.65;
mat.clearcoatRoughness = 0.18;
mat.emissive = new THREE.Color(0x2a000a);
mat.emissiveIntensity = 0.1;
mat.userData.isBody = true;
}
newMaterials.push(mat);
});
if (child.geometry) {
child.geometry.computeVertexNormals();
}
child.material = Array.isArray(child.material) ? newMaterials : newMaterials[0];
this.meshes.push(child);
});
const pre = document.createElement('\x70\x72\x65');
pre.style.position = '\x61\x62\x73\x6f\x6c\x75\x74\x65';
pre.style.top = '\x31\x30\x70\x78';
pre.style.left = '\x31\x30\x70\x78';
pre.style.color = '\x6c\x69\x6d\x65';
pre.style.background = '\x72\x67\x62\x61\x28\x30\x2c\x30\x2c\x30\x2c\x30\x2e\x38\x29';
pre.style.zIndex = '\x39\x39\x39\x39';
pre.style.padding = '\x31\x30\x70\x78';
pre.style.fontSize = '\x31\x32\x70\x78';
pre.style.pointerEvents = '\x6e\x6f\x6e\x65';
let debugText = `Mesh Count: ${this.meshes.length}\n`;
this.meshes.forEach((m, idx) => {
const hasUV = !!(m.geometry && m.geometry.attributes.uv);
const hasColor = !!(m.geometry && m.geometry.attributes.color);
debugText += `\n[Mesh ${idx}]: name="\x24\x7b\x6d\x2e\x6e\x61\x6d\x65\x7d" UVs=${hasUV} vColor=${hasColor}\n`;
const mats = Array.isArray(m.material) ? m.material : [m.material];
mats.forEach((mat, mi) => {
debugText += `  - Mat ${mi}: color=#${mat.color.getHexString()} map=${!!mat.map} metal=${mat.metalness} rough=${mat.roughness} vC=${mat.vertexColors}\n`;
});
});
const dl = new THREE.AmbientLight(0xffffff, 2.0);
model.add(dl);
debugText += `\nAdded forced AmbientLight(intensity=2.0) to model.\n`;
pre.innerText = debugText;
document.body.appendChild(pre);
this.group.add(model);
this._ready = true;
resolve(this);
},
(xhr) => {
const total = xhr.total > 0 ? xhr.total : 9891736;
const pct = (Math.min(100, (xhr.loaded / total * 100))).toFixed(0);
const textEl = document.querySelector('\x2e\x6c\x6f\x61\x64\x69\x6e\x67\x2d\x74\x65\x78\x74');
if (textEl) textEl.textContent = `모델 로딩 중... ${pct}%`;
},
(error) => {
console.error('\x47\x4c\x54\x46\x20\x6c\x6f\x61\x64\x69\x6e\x67\x20\x65\x72\x72\x6f\x72\x3a', error);
reject(error);
}
);
});
}
updateRipeness(t) {
if (!this.meshes || this.meshes.length === 0) return;
/*
const ripeSeed    = new THREE.Color(0xf5d76e);
const unripeSeed  = new THREE.Color(0xb4c97a);
this.meshes.forEach(m => {
const mats = Array.isArray(m.material) ? m.material : [m.material];
mats.forEach(mat => {
if (mat.userData.isLeaf) return;
const baseColor = new THREE.Color(mat.userData.origColorHex !== undefined ? mat.userData.origColorHex : 0xffffff);
if (mat.userData.isSeed) {
if (!mat.map) mat.color.copy(unripeSeed).lerp(ripeSeed, t);
} else if (mat.userData.isBody) {
const targetUnripe = new THREE.Color(0xc5d87a).multiply(baseColor).multiplyScalar(1.5);
mat.color.copy(targetUnripe).lerp(baseColor, t);
mat.emissiveIntensity = 0.03 + t * 0.07;
mat.clearcoat         = 0.2  + t * 0.5;
}
});
});
*/
}
toggleWireframe(enabled) {
this.meshes.forEach(m => { m.material.wireframe = enabled; });
}
toggleCrossSection(enabled, plane) {
const planes = enabled ? [plane] : [];
this.meshes.forEach(m => {
m.material.clippingPlanes = planes;
});
}
}