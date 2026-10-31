import * as THREE from "three";

const stage = document.getElementById("stage");
const hpEl = document.getElementById("hp");
const foesEl = document.getElementById("foes");

const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.setSize(stage.clientWidth, stage.clientHeight);
renderer.xr.enabled = true;
stage.appendChild(renderer.domElement);

const vrButton = document.getElementById("enter-vr");
vrButton.addEventListener("click", async function () {
  if (renderer.xr.isPresenting) {
    const current = renderer.xr.getSession();
    if (current) current.end();
    return;
  }
  if (!navigator.xr || !navigator.xr.isSessionSupported) return;
  const supported = await navigator.xr.isSessionSupported("immersive-vr");
  if (!supported) return;
  const session = await navigator.xr.requestSession("immersive-vr", {
    optionalFeatures: ["local-floor", "bounded-floor", "hand-tracking"]
  });
  renderer.xr.setSession(session);
  vrButton.textContent = "Exit VR";
  session.addEventListener("end", function () { vrButton.textContent = "Enter VR"; });
});

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x8ea4b3);
scene.fog = new THREE.Fog(0x8ea4b3, 24, 90);

const camera = new THREE.PerspectiveCamera(70, stage.clientWidth / stage.clientHeight, 0.1, 200);
camera.position.set(0, 2.35, 0);

const rig = new THREE.Group();
rig.add(camera);
scene.add(rig);

const cockpit = new THREE.Group();
camera.add(cockpit);
function bar(w, h, d, x, y, z, color) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshBasicMaterial({ color: color }));
  mesh.position.set(x, y, z);
  cockpit.add(mesh);
  return mesh;
}
bar(0.08, 0.5, 0.08, -0.55, -0.15, -0.8, 0xc45c26);
bar(0.08, 0.5, 0.08, 0.55, -0.15, -0.8, 0xc45c26);
bar(1.2, 0.08, 0.08, 0, -0.42, -0.8, 0x8d3e16);
bar(0.7, 0.1, 0.2, 0, -0.5, -0.7, 0x2a241c);

const buildings = [];
const box = new THREE.BoxGeometry(1, 1, 1);
const tones = [0xc4b49a, 0x8d9aa3, 0xb07a62, 0x6e7480];
for (let gx = -4; gx <= 4; gx++) {
  for (let gz = -4; gz <= 4; gz++) {
    if (Math.abs(gx) < 1 && Math.abs(gz) < 1) continue;
    if (Math.abs((gx * 13 + gz * 7) % 5) === 0) continue;
    const h = 3 + Math.abs((gx * 5 + gz * 3) % 6) * 1.4;
    const mesh = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: tones[(gx + gz) & 3] }));
    mesh.scale.set(7, h, 7);
    mesh.position.set(gx * 14, h / 2, gz * 14);
    scene.add(mesh);
    buildings.push({ x: mesh.position.x, z: mesh.position.z, hx: 3.7, hz: 3.7 });
  }
}
const ground = new THREE.Mesh(new THREE.BoxGeometry(160, 0.2, 160), new THREE.MeshBasicMaterial({ color: 0x6e6a62 }));
ground.position.y = -0.1;
scene.add(ground);
for (let i = -4; i <= 4; i++) {
  const ns = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.05, 150), new THREE.MeshBasicMaterial({ color: 0x3e3c38 }));
  ns.position.set(i * 14, 0.02, 0);
  const ew = new THREE.Mesh(new THREE.BoxGeometry(150, 0.05, 2.4), new THREE.MeshBasicMaterial({ color: 0x3e3c38 }));
  ew.position.set(0, 0.02, i * 14);
  scene.add(ns, ew);
}

const boltGeo = new THREE.BoxGeometry(0.18, 0.18, 0.7);
const playerBoltMat = new THREE.MeshBasicMaterial({ color: 0xe6c15a });
const foeBoltMat = new THREE.MeshBasicMaterial({ color: 0xd24a3a });
const bolts = [];

const saberMat = new THREE.MeshBasicMaterial({ color: 0x7ee0d0 });
const saberGeo = new THREE.BoxGeometry(0.08, 0.08, 1.15);
const vrSaber = new THREE.Mesh(saberGeo, saberMat);
vrSaber.position.set(0, 0, -0.7);
vrSaber.visible = false;
const deskSaber = new THREE.Mesh(saberGeo, saberMat);
deskSaber.visible = false;
camera.add(deskSaber);

function makeFoe(x, z) {
  const group = new THREE.Group();
  const mat = new THREE.MeshBasicMaterial({ color: 0x3d4c3a });
  const torso = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.3, 0.7), mat);
  torso.position.y = 1.7;
  const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.4, 0.45), new THREE.MeshBasicMaterial({ color: 0x2a3328 }));
  head.position.y = 2.6;
  const hip = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.35, 0.7), mat);
  hip.position.y = 0.9;
  const legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 0.28), mat);
  legL.position.set(-0.35, 0.45, 0);
  const legR = legL.clone();
  legR.position.x = 0.35;
  group.add(torso, head, hip, legL, legR);
  group.position.set(x, 0, z);
  group.userData = { hp: 40, cool: 1.5 + Math.random(), hit: 0, base: 0x3d4c3a };
  scene.add(group);
  return group;
}
const foes = [makeFoe(16, 10), makeFoe(-14, 16), makeFoe(12, -18), makeFoe(-18, -12)];

const velocity = new THREE.Vector3();
const keys = {};
let yaw = 0;
let pitch = 0;
let kick = 0;
let snapLatch = false;
let playerHp = 100;
let swing = 0;
const prevTip = new THREE.Vector3();
let havePrevTip = false;
const tip = new THREE.Vector3();
const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const wish = new THREE.Vector3();

const controllerGrip = [renderer.xr.getControllerGrip(0), renderer.xr.getControllerGrip(1)];
const controllers = [renderer.xr.getController(0), renderer.xr.getController(1)];
controllers.forEach(function (controller, index) {
  controller.userData.hand = "";
  controller.addEventListener("connected", function (event) {
    controller.userData.hand = event.data.handedness || "";
    if (controller.userData.hand === "left") controllerGrip[index].add(vrSaber);
  });
  controller.addEventListener("selectstart", function () {
    if (controller.userData.hand === "right" || controller.userData.hand === "") fireFromController(controller);
  });
  controller.addEventListener("squeezestart", function () {
    if (controller.userData.hand === "left") vrSaber.visible = true;
  });
  controller.addEventListener("squeezeend", function () {
    if (controller.userData.hand === "left") vrSaber.visible = false;
  });
  rig.add(controller);
  rig.add(controllerGrip[index]);
});

function muzzle(obj) {
  const origin = new THREE.Vector3(0.25, -0.15, -0.9);
  obj.localToWorld(origin);
  obj.getWorldDirection(forward);
  return { origin: origin, direction: forward.clone() };
}

function fireFromController(controller) {
  const aim = controller.userData.hand ? controller : camera;
  const shot = muzzle(aim);
  launch(shot.origin, shot.direction, true);
}

function launch(origin, direction, fromPlayer) {
  const bolt = new THREE.Mesh(boltGeo, fromPlayer ? playerBoltMat : foeBoltMat);
  bolt.position.copy(origin);
  bolt.lookAt(origin.clone().add(direction));
  bolt.userData.velocity = direction.clone().normalize().multiplyScalar(fromPlayer ? 22 : 8);
  bolt.userData.life = 2.2;
  bolt.userData.fromPlayer = fromPlayer;
  scene.add(bolt);
  bolts.push(bolt);
  if (fromPlayer) {
    const back = direction.clone();
    back.y = 0;
    if (back.lengthSq() > 0.001) velocity.addScaledVector(back.normalize(), -2.4);
    if (!renderer.xr.isPresenting) kick = 0.045;
  }
}

function hurtFoe(foe, amount) {
  if (foe.userData.hp <= 0) return;
  foe.userData.hp -= amount;
  foe.userData.hit = 0.12;
  if (foe.userData.hp <= 0) {
    foe.visible = false;
    sayHull();
  }
}

function sayHull() {
  const alive = foes.filter(function (foe) { return foe.userData.hp > 0; }).length;
  hpEl.textContent = String(Math.max(0, Math.round(playerHp)));
  foesEl.textContent = String(alive);
}

function pushOut(pos) {
  buildings.forEach(function (b) {
    const dx = pos.x - b.x;
    const dz = pos.z - b.z;
    if (Math.abs(dx) < b.hx + 0.7 && Math.abs(dz) < b.hz + 0.7) {
      const px = (b.hx + 0.7) - Math.abs(dx);
      const pz = (b.hz + 0.7) - Math.abs(dz);
      if (px < pz) pos.x += Math.sign(dx || 1) * px;
      else pos.z += Math.sign(dz || 1) * pz;
    }
  });
}

function stickAxes(source) {
  const axes = source.gamepad && source.gamepad.axes;
  if (!axes || axes.length < 4) return { x: 0, y: 0 };
  return { x: axes[2] || 0, y: axes[3] || 0 };
}

function updateLocomotion(dt) {
  wish.set(0, 0, 0);
  const session = renderer.xr.getSession();
  if (session) {
    for (let i = 0; i < session.inputSources.length; i++) {
      const source = session.inputSources[i];
      const stick = stickAxes(source);
      if (source.handedness === "left") {
        wish.x += stick.x;
        wish.z += stick.y;
      }
      if (source.handedness === "right") {
        if (!snapLatch && Math.abs(stick.x) > 0.75) {
          rig.rotation.y -= Math.sign(stick.x) * (Math.PI / 6);
          snapLatch = true;
        }
        if (Math.abs(stick.x) < 0.35) snapLatch = false;
      }
    }
    const euler = new THREE.Euler(0, rig.rotation.y, 0, "YXZ");
    const q = new THREE.Quaternion().setFromEuler(euler);
    wish.applyQuaternion(q);
  } else {
    if (keys.KeyA || keys.ArrowLeft) wish.x -= 1;
    if (keys.KeyD || keys.ArrowRight) wish.x += 1;
    if (keys.KeyW || keys.ArrowUp) wish.z -= 1;
    if (keys.KeyS || keys.ArrowDown) wish.z += 1;
    if (keys.KeyQ) yaw += 2.2 * dt;
    if (keys.KeyE) yaw -= 2.2 * dt;
    rig.rotation.y = yaw;
    camera.rotation.x = pitch - kick;
    camera.rotation.y = 0;
    wish.y = 0;
    wish.applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  }
  if (wish.lengthSq() > 1) wish.normalize();
  const target = wish.multiplyScalar(4.2);
  const blend = 1 - Math.exp(-1.3 * dt);
  velocity.x += (target.x - velocity.x) * blend;
  velocity.z += (target.z - velocity.z) * blend;
  if (wish.lengthSq() < 0.01) {
    velocity.x *= Math.exp(-0.7 * dt);
    velocity.z *= Math.exp(-0.7 * dt);
  }
  rig.position.x += velocity.x * dt;
  rig.position.z += velocity.z * dt;
  pushOut(rig.position);
  kick *= Math.exp(-7 * dt);
}

function updateBolts(dt) {
  for (let i = bolts.length - 1; i >= 0; i--) {
    const bolt = bolts[i];
    bolt.position.addScaledVector(bolt.userData.velocity, dt);
    bolt.userData.life -= dt;
    let gone = bolt.userData.life <= 0;
    if (bolt.userData.fromPlayer) {
      foes.forEach(function (foe) {
        if (foe.userData.hp > 0 && bolt.position.distanceTo(foe.position.clone().setY(1.6)) < 1.3) {
          hurtFoe(foe, 15);
          gone = true;
        }
      });
    } else if (bolt.position.distanceTo(rig.position.clone().setY(1.6)) < 1.1) {
      playerHp -= 8;
      if (playerHp <= 0) {
        playerHp = 100;
        rig.position.set(0, 0, 0);
        velocity.set(0, 0, 0);
      }
      sayHull();
      gone = true;
    }
    if (gone) {
      scene.remove(bolt);
      bolts.splice(i, 1);
    }
  }
}

function saberTip(mesh) {
  tip.set(0, 0, -0.6);
  mesh.localToWorld(tip);
  return tip;
}

function updateSaber(dt) {
  const active = renderer.xr.isPresenting ? vrSaber.visible : swing > 0;
  const mesh = renderer.xr.isPresenting ? vrSaber : deskSaber;
  if (!renderer.xr.isPresenting) {
    if (swing > 0) {
      swing -= dt;
      deskSaber.visible = true;
      const t = 1 - swing / 0.38;
      deskSaber.position.set(Math.sin(t * Math.PI) * 0.55, -0.1, -0.95);
      deskSaber.rotation.y = -0.8 + t * 1.8;
    } else {
      deskSaber.visible = false;
    }
  }
  if (!active) {
    havePrevTip = false;
    return;
  }
  const worldTip = saberTip(mesh).clone();
  if (havePrevTip && dt > 0) {
    const speed = worldTip.distanceTo(prevTip) / dt;
    if (speed > 1.6) {
      foes.forEach(function (foe) {
        if (foe.userData.hp <= 0 || foe.userData.hit > 0) return;
        const body = foe.position.clone().setY(1.5);
        if (worldTip.distanceTo(body) < 1.6) hurtFoe(foe, 25);
      });
    }
  }
  prevTip.copy(worldTip);
  havePrevTip = true;
}

function updateFoes(dt) {
  foes.forEach(function (foe) {
    if (foe.userData.hp <= 0) return;
    foe.userData.hit = Math.max(0, foe.userData.hit - dt);
    foe.traverse(function (child) {
      if (child.isMesh && child.material && child.material.color) {
        child.material.color.setHex(foe.userData.hit > 0 ? 0xf4efe6 : foe.userData.base || 0x3d4c3a);
      }
    });
    const flat = rig.position.clone();
    flat.y = 0;
    const there = foe.position.clone();
    there.y = 0;
    const gap = flat.distanceTo(there);
    if (gap > 3.5) {
      const step = flat.sub(there).normalize().multiplyScalar(1.15 * dt);
      foe.position.add(step);
      foe.lookAt(rig.position.x, foe.position.y, rig.position.z);
    }
    foe.userData.cool -= dt;
    if (foe.userData.cool <= 0 && gap < 28) {
      foe.userData.cool = 2.8;
      const origin = foe.position.clone();
      origin.y = 1.7;
      const dir = rig.position.clone();
      dir.y = 1.6;
      dir.sub(origin).normalize();
      launch(origin, dir, false);
    }
  });
}

const clock = new THREE.Clock();
renderer.setAnimationLoop(function () {
  const dt = Math.min(clock.getDelta(), 0.05);
  updateLocomotion(dt);
  updateBolts(dt);
  updateSaber(dt);
  updateFoes(dt);
  renderer.render(scene, camera);
});

window.addEventListener("resize", function () {
  camera.aspect = stage.clientWidth / Math.max(1, stage.clientHeight);
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
});

window.addEventListener("keydown", function (event) {
  keys[event.code] = true;
  if (event.code === "KeyF") swing = 0.38;
});
window.addEventListener("keyup", function (event) { keys[event.code] = false; });

renderer.domElement.addEventListener("mousedown", function (event) {
  if (document.pointerLockElement !== renderer.domElement) {
    renderer.domElement.requestPointerLock();
    return;
  }
  if (event.button === 0) {
    const shot = muzzle(camera);
    launch(shot.origin, shot.direction, true);
  }
  if (event.button === 2) swing = 0.38;
});
renderer.domElement.addEventListener("contextmenu", function (event) { event.preventDefault(); });
document.addEventListener("mousemove", function (event) {
  if (document.pointerLockElement !== renderer.domElement || renderer.xr.isPresenting) return;
  yaw -= event.movementX * 0.0022;
  pitch -= event.movementY * 0.0022;
  pitch = Math.max(-1.1, Math.min(1.1, pitch));
});

sayHull();
