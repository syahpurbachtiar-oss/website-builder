import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */

const canvas = document.getElementById("scene");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050c1c);
scene.fog = new THREE.FogExp2(0x050c1c, 0.0028);

const camera = new THREE.PerspectiveCamera(
  42,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);
camera.position.set(0, 55, 220);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enabled = false;
controls.minDistance = 60;
controls.maxDistance = 260;
controls.maxPolarAngle = Math.PI * 0.49;
controls.target.set(0, 70, 0);

/* ------------------------------------------------------------------ */
/*  Lighting & sky                                                     */
/* ------------------------------------------------------------------ */

scene.add(new THREE.AmbientLight(0x8fa3c8, 0.55));

const moon = new THREE.DirectionalLight(0xcdd9ff, 0.65);
moon.position.set(-120, 200, -80);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -160;
moon.shadow.camera.right = 160;
moon.shadow.camera.top = 160;
moon.shadow.camera.bottom = -160;
scene.add(moon);

const flameLight = new THREE.PointLight(0xffbf4d, 4, 260, 2);
flameLight.position.set(0, 132, 0);
scene.add(flameLight);

// Stars
{
  const starGeo = new THREE.BufferGeometry();
  const count = 1400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 500 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.9);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 40;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const starMat = new THREE.PointsMaterial({ color: 0xdbe6ff, size: 1.4, sizeAttenuation: true });
  scene.add(new THREE.Points(starGeo, starMat));
}

/* ------------------------------------------------------------------ */
/*  Ground plaza                                                       */
/* ------------------------------------------------------------------ */

const groundMat = new THREE.MeshStandardMaterial({ color: 0x0e1c33, roughness: 0.95, metalness: 0.05 });
const ground = new THREE.Mesh(new THREE.CircleGeometry(420, 64), groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const plaza = new THREE.Mesh(
  new THREE.CylinderGeometry(90, 92, 3, 4),
  new THREE.MeshStandardMaterial({ color: 0x2a2f3d, roughness: 0.8 })
);
plaza.rotation.y = Math.PI / 4;
plaza.position.y = 1.5;
plaza.receiveShadow = true;
scene.add(plaza);

// faint radial ring accents
for (let i = 1; i <= 3; i++) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(60 * i, 60 * i + 0.4, 80),
    new THREE.MeshBasicMaterial({ color: 0xc9a227, transparent: true, opacity: 0.06, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.05;
  scene.add(ring);
}

/* ------------------------------------------------------------------ */
/*  Monas — stylized obelisk (alu & lesung)                            */
/* ------------------------------------------------------------------ */

const monas = new THREE.Group();
scene.add(monas);

const marble = new THREE.MeshStandardMaterial({ color: 0xd8d2c2, roughness: 0.55, metalness: 0.05 });
const marbleDark = new THREE.MeshStandardMaterial({ color: 0xb9b2a0, roughness: 0.6, metalness: 0.05 });
const gold = new THREE.MeshStandardMaterial({
  color: 0xc9a227,
  emissive: 0x8a5a0a,
  emissiveIntensity: 0.55,
  roughness: 0.3,
  metalness: 0.85,
});
const flameMat = new THREE.MeshStandardMaterial({
  color: 0xffcf6b,
  emissive: 0xffb020,
  emissiveIntensity: 1.6,
  roughness: 0.25,
  metalness: 0.4,
});

function addMesh(geo, mat, x, y, z, castShadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.castShadow = castShadow;
  m.receiveShadow = true;
  monas.add(m);
  return m;
}

// Museum base (Cawan bawah / relief hall)
addMesh(new THREE.BoxGeometry(56, 16, 56), marble, 0, 8, 0);
addMesh(new THREE.BoxGeometry(60, 1.2, 60), marbleDark, 0, 16.6, 0);

// Courtyard tier
addMesh(new THREE.BoxGeometry(30, 8, 30), marble, 0, 20, 0);
addMesh(new THREE.BoxGeometry(32, 1, 32), marbleDark, 0, 24.5, 0);

// Tapered obelisk shaft (square prism via 4 radial segments)
const shaftHeight = 92;
const shaftGeo = new THREE.CylinderGeometry(6.4, 9.4, shaftHeight, 4, 1);
const shaft = addMesh(shaftGeo, marble, 0, 25 + shaftHeight / 2, 0);
shaft.rotation.y = Math.PI / 4;

// Cawan (bowl) beneath the flame
const cawanGeo = new THREE.CylinderGeometry(10.5, 6.4, 6, 4);
const cawan = addMesh(cawanGeo, gold, 0, 25 + shaftHeight + 3, 0);
cawan.rotation.y = Math.PI / 4;

// Flame — Lidah Api Kemerdekaan
const flameGroup = new THREE.Group();
const flameCore = new THREE.Mesh(new THREE.ConeGeometry(4.6, 12, 8), flameMat);
flameCore.position.y = 6;
flameCore.castShadow = true;
flameGroup.add(flameCore);
const flameTip = new THREE.Mesh(new THREE.ConeGeometry(2.4, 7, 8), flameMat);
flameTip.position.y = 13.5;
flameGroup.add(flameTip);
flameGroup.position.y = 25 + shaftHeight + 6;
monas.add(flameGroup);

// Small decorative flagpoles around the plaza
const poleMat = new THREE.MeshStandardMaterial({ color: 0xe6e0d2, roughness: 0.4, metalness: 0.6 });
const flagMat = new THREE.MeshStandardMaterial({ color: 0xa8382f, roughness: 0.8 });
for (let i = 0; i < 8; i++) {
  const ang = (i / 8) * Math.PI * 2;
  const rad = 78;
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 14, 8), poleMat);
  pole.position.set(Math.cos(ang) * rad, 7 + 1.5, Math.sin(ang) * rad);
  pole.castShadow = true;
  scene.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(3, 2), flagMat);
  flag.position.set(Math.cos(ang) * rad + 1.4, 12 + 1.5, Math.sin(ang) * rad);
  flag.rotation.y = -ang;
  scene.add(flag);
}

/* ------------------------------------------------------------------ */
/*  Scroll-driven camera waypoints                                     */
/* ------------------------------------------------------------------ */

const waypoints = [
  { pos: [0, 60, 220], look: [0, 60, 0] },     // hero — wide establishing shot
  { pos: [72, 24, 78], look: [10, 18, 0] },    // kisah — near the base reliefs
  { pos: [10, 148, 34], look: [0, 133, 0] },   // nyala — close on the flame
  { pos: [0, 72, 130], look: [0, 70, 0] },     // jelajah — pulled back, orbit-ready
  { pos: [0, 100, 300], look: [0, 55, 0] },    // footer — wide fade
];

const sectionIds = ["hero", "kisah", "nyala", "jelajah", "footer"];
let currentSection = 0;
let exploreMode = false;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        currentSection = sectionIds.indexOf(entry.target.id);
        const wasExplore = exploreMode;
        exploreMode = entry.target.id === "jelajah";
        controls.enabled = exploreMode;
        if (exploreMode && !wasExplore) {
          controls.target.set(0, 70, 0);
        }
      }
    });
  },
  { threshold: [0.5, 0.6] }
);
sectionIds.forEach((id) => {
  const el = document.getElementById(id);
  if (el) observer.observe(el);
});

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function scrollProgress() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  return max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
}

const tmpPos = new THREE.Vector3();
const tmpLook = new THREE.Vector3();

function cameraFromProgress(p) {
  const segments = waypoints.length - 1;
  const scaled = p * segments;
  let idx = Math.floor(scaled);
  idx = Math.min(idx, segments - 1);
  const localT = smoothstep(scaled - idx);
  const a = waypoints[idx];
  const b = waypoints[idx + 1];
  tmpPos.set(
    a.pos[0] + (b.pos[0] - a.pos[0]) * localT,
    a.pos[1] + (b.pos[1] - a.pos[1]) * localT,
    a.pos[2] + (b.pos[2] - a.pos[2]) * localT
  );
  tmpLook.set(
    a.look[0] + (b.look[0] - a.look[0]) * localT,
    a.look[1] + (b.look[1] - a.look[1]) * localT,
    a.look[2] + (b.look[2] - a.look[2]) * localT
  );
}

/* ------------------------------------------------------------------ */
/*  Animate                                                             */
/* ------------------------------------------------------------------ */

const clock = new THREE.Clock();
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  // gentle perpetual rotation — the "landing background" idle motion
  if (!exploreMode) {
    monas.rotation.y += dt * 0.05;
  } else {
    monas.rotation.y += dt * 0.012;
  }

  // flame flicker
  flameMat.emissiveIntensity = 1.4 + Math.sin(elapsed * 9) * 0.2 + Math.sin(elapsed * 23) * 0.08;
  flameLight.intensity = 3.6 + Math.sin(elapsed * 9) * 0.5;
  flameGroup.scale.y = 1 + Math.sin(elapsed * 6) * 0.02;

  if (!exploreMode) {
    const p = prefersReducedMotion ? sectionAt(currentSection) : scrollProgress();
    cameraFromProgress(p);
    camera.position.lerp(tmpPos, prefersReducedMotion ? 1 : 0.06);
    controls.target.lerp(tmpLook, prefersReducedMotion ? 1 : 0.06);
    camera.lookAt(controls.target);
  } else {
    controls.update();
  }

  renderer.render(scene, camera);
}

function sectionAt(i) {
  return i / (sectionIds.length - 1);
}

animate();

/* ------------------------------------------------------------------ */
/*  Resize                                                             */
/* ------------------------------------------------------------------ */

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
