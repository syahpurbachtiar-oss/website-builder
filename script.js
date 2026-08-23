import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/* ------------------------------------------------------------------ */
/*  Real Monas photos (Wikimedia Commons, freely licensed)             */
/* ------------------------------------------------------------------ */

const PHOTOS = [
  {
    file: "The National Monument (Monas), Jakarta from afar.jpg",
    caption: "Monas dari kejauhan",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA 3.0",
  },
  {
    file: "Tugu Monas.jpg",
    caption: "Tugu Monas",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA",
  },
  {
    file: "Relief of Indonesian History, Monas.JPG",
    caption: "Relief sejarah Indonesia",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA",
  },
  {
    file: "Monas at night.jpg",
    caption: "Monas di malam hari",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA",
  },
  {
    file: "TUGU MONAS.jpg",
    caption: "Tugu Monas — tampak dekat",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA 4.0",
  },
  {
    file: "Monumen Nasional, Jakarta, Indonesia.jpg",
    caption: "Monumen Nasional",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA",
  },
  {
    file: "Around Monas Jakarta (2025) (cropped).jpg",
    caption: "Sekitar Monas, 2025",
    author: "Wikimedia Commons contributor",
    license: "CC BY 4.0",
  },
  {
    file: "Monas Museum of Indonesian History.JPG",
    caption: "Museum Sejarah di dasar Monas",
    author: "Wikimedia Commons contributor",
    license: "CC BY-SA",
  },
];

function commonsUrl(filename, width) {
  return (
    "https://commons.wikimedia.org/wiki/Special:FilePath/" +
    encodeURIComponent(filename).replace(/%2C/g, ",") +
    (width ? `?width=${width}` : "")
  );
}
function commonsPage(filename) {
  return "https://commons.wikimedia.org/wiki/File:" + encodeURIComponent(filename).replace(/%2C/g, ",");
}

/* ------------------------------------------------------------------ */
/*  Photo hero — real photo with 3D parallax tilt                      */
/* ------------------------------------------------------------------ */

const photoHero = document.getElementById("photoHero");
const photoHeroImg = document.getElementById("photoHeroImg");

let heroTiltX = 0, heroTiltY = 0;
window.addEventListener("pointermove", (e) => {
  const nx = e.clientX / window.innerWidth - 0.5;
  const ny = e.clientY / window.innerHeight - 0.5;
  heroTiltX = ny * -8; // rotateX
  heroTiltY = nx * 10; // rotateY
});

function updatePhotoHero(progress) {
  // fade + zoom the photo as the hero section is scrolled past
  const heroFade = Math.min(progress / 0.18, 1);
  photoHero.classList.toggle("is-hidden", heroFade >= 1);
  photoHero.style.opacity = String(1 - heroFade);
  const scrollScale = 1.06 + heroFade * 0.22;
  const scrollShiftY = heroFade * -40;
  photoHeroImg.style.transform =
    `translate(-50%, -50%) scale(${scrollScale}) translateY(${scrollShiftY}px) ` +
    `rotateX(${heroTiltX}deg) rotateY(${heroTiltY}deg)`;
}

/* ------------------------------------------------------------------ */
/*  Three.js setup                                                     */
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
camera.position.set(0, 60, 220);

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
/*  Real-photo backdrop — the actual Monas photographed, as a mural    */
/*  standing behind the procedural model                               */
/* ------------------------------------------------------------------ */

const textureLoader = new THREE.TextureLoader();
textureLoader.crossOrigin = "anonymous";

function loadTexture(filename, width) {
  const tex = textureLoader.load(commonsUrl(filename, width));
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const backdropTex = loadTexture("Monumen Nasional, Jakarta, Indonesia.jpg", 1600);
const backdrop = new THREE.Mesh(
  new THREE.PlaneGeometry(340, 200),
  new THREE.MeshBasicMaterial({ map: backdropTex, fog: true })
);
backdrop.position.set(0, 95, -260);
scene.add(backdrop);
// soft vignette in front of the backdrop to blend it with the fog
const backdropFade = new THREE.Mesh(
  new THREE.PlaneGeometry(340, 200),
  new THREE.MeshBasicMaterial({ color: 0x050c1c, transparent: true, opacity: 0.35 })
);
backdropFade.position.set(0, 95, -259);
scene.add(backdropFade);

// a small "plakat" — a real photo plaque resting near the base, like a
// signboard showing an actual archival photo of the monument
const plaqueTex = loadTexture("Relief of Indonesian History, Monas.JPG", 900);
const plaque = new THREE.Mesh(
  new THREE.PlaneGeometry(22, 15),
  new THREE.MeshStandardMaterial({ map: plaqueTex, roughness: 0.6 })
);
plaque.position.set(-42, 12, 34);
plaque.rotation.y = Math.PI / 5;
plaque.castShadow = true;
scene.add(plaque);
const plaqueFrame = new THREE.Mesh(
  new THREE.BoxGeometry(23.4, 16.4, 0.8),
  new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 0.7, roughness: 0.35 })
);
plaqueFrame.position.set(-42, 12, 33.5);
plaqueFrame.rotation.y = Math.PI / 5;
scene.add(plaqueFrame);

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

addMesh(new THREE.BoxGeometry(56, 16, 56), marble, 0, 8, 0);
addMesh(new THREE.BoxGeometry(60, 1.2, 60), marbleDark, 0, 16.6, 0);

addMesh(new THREE.BoxGeometry(30, 8, 30), marble, 0, 20, 0);
addMesh(new THREE.BoxGeometry(32, 1, 32), marbleDark, 0, 24.5, 0);

const shaftHeight = 92;
const shaftGeo = new THREE.CylinderGeometry(6.4, 9.4, shaftHeight, 4, 1);
const shaft = addMesh(shaftGeo, marble, 0, 25 + shaftHeight / 2, 0);
shaft.rotation.y = Math.PI / 4;

const cawanGeo = new THREE.CylinderGeometry(10.5, 6.4, 6, 4);
const cawan = addMesh(cawanGeo, gold, 0, 25 + shaftHeight + 3, 0);
cawan.rotation.y = Math.PI / 4;

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
  { pos: [0, 60, 220], look: [0, 60, 0] },     // hero (canvas hidden here — photo shows instead)
  { pos: [72, 24, 78], look: [10, 18, 0] },    // kisah — near the base reliefs
  { pos: [10, 148, 34], look: [0, 133, 0] },   // nyala — close on the flame
  { pos: [0, 74, 160], look: [0, 80, -60] },   // jelajah — pulled back, backdrop + model in frame
  { pos: [0, 90, 260], look: [0, 60, 0] },     // galeri (canvas hidden)
  { pos: [0, 100, 300], look: [0, 55, 0] },    // footer (canvas hidden)
];

const sectionIds = ["hero", "kisah", "nyala", "jelajah", "galeri", "footer"];
const canvasVisibleFor = new Set(["kisah", "nyala", "jelajah"]);
let currentSection = 0;
let exploreMode = false;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const id = entry.target.id;
        currentSection = sectionIds.indexOf(id);
        const wasExplore = exploreMode;
        exploreMode = id === "jelajah";
        controls.enabled = exploreMode;
        if (exploreMode && !wasExplore) {
          controls.target.set(0, 80, -20);
        }
        canvas.classList.toggle("is-visible", canvasVisibleFor.has(id));
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
  const p = scrollProgress();

  updatePhotoHero(p);

  if (!exploreMode) {
    monas.rotation.y += dt * 0.05;
  } else {
    monas.rotation.y += dt * 0.012;
  }

  flameMat.emissiveIntensity = 1.4 + Math.sin(elapsed * 9) * 0.2 + Math.sin(elapsed * 23) * 0.08;
  flameLight.intensity = 3.6 + Math.sin(elapsed * 9) * 0.5;
  flameGroup.scale.y = 1 + Math.sin(elapsed * 6) * 0.02;

  if (!exploreMode) {
    const target = prefersReducedMotion ? currentSection / (sectionIds.length - 1) : p;
    cameraFromProgress(target);
    camera.position.lerp(tmpPos, prefersReducedMotion ? 1 : 0.06);
    controls.target.lerp(tmpLook, prefersReducedMotion ? 1 : 0.06);
    camera.lookAt(controls.target);
  } else {
    controls.update();
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ------------------------------------------------------------------ */
/*  Gallery — real photos as 3D tilt cards                             */
/* ------------------------------------------------------------------ */

const tiltGrid = document.getElementById("tiltGrid");
const creditsEl = document.getElementById("photoCredits");
const creditParts = [];

PHOTOS.forEach((photo) => {
  const card = document.createElement("div");
  card.className = "tilt-card";

  const img = document.createElement("img");
  img.src = commonsUrl(photo.file, 700);
  img.alt = photo.caption;
  img.loading = "lazy";
  card.appendChild(img);

  const label = document.createElement("div");
  label.className = "tilt-card__label";
  label.textContent = photo.caption;
  card.appendChild(label);

  const maxTilt = 12;
  function handleMove(clientX, clientY) {
    const rect = card.getBoundingClientRect();
    const nx = (clientX - rect.left) / rect.width - 0.5;
    const ny = (clientY - rect.top) / rect.height - 0.5;
    card.style.transform =
      `perspective(1000px) rotateX(${(-ny * maxTilt).toFixed(2)}deg) rotateY(${(nx * maxTilt).toFixed(2)}deg) scale(1.03)`;
  }
  card.addEventListener("pointermove", (e) => handleMove(e.clientX, e.clientY));
  card.addEventListener("pointerleave", () => {
    card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)";
  });

  tiltGrid.appendChild(card);

  creditParts.push(`<a href="${commonsPage(photo.file)}" target="_blank" rel="noopener">${photo.caption}</a> (${photo.license})`);
});

creditsEl.innerHTML = "Foto: " + creditParts.join(" · ") + " — via Wikimedia Commons.";
