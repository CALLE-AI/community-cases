import * as THREE from './local-atlas-demo/vendor/three.module.min.js';
import { ik2 } from './ringback-demo/ik2.mjs';
import { joints } from './ringback-demo/gait.mjs';

export const ease = n => { n = Math.max(0, Math.min(1, n)); return n * n * (3 - 2 * n); };
export const phase = (t, a, b) => ease((t - a) / (b - a));
export const vector = (x, y, z) => new THREE.Vector3(x, y, z);
// Garment shades derive from the case palette, so a character never needs a second colour.
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), f = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return `#${((f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).padStart(6, '0')}`;
};

export function createKit() {
  const root = new THREE.Group(), materials = new Map(), geometries = new Map();
  const mat = (color, extra = {}) => {
    const key = color + JSON.stringify(extra);
    if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness: .8, ...extra }));
    return materials.get(key);
  };
  const P = { cream: '#f5f0df', white: '#fffdf5', wood: '#b79a72', dark: '#34433e', teal: '#47796e', skin: '#e4bd90', blue: '#527c9e', yellow: '#ecc34d', terra: '#ba8064' };
  function group(parent = root, x = 0, y = 0, z = 0) {
    const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g;
  }
  function mesh(geometry, color, parent, x = 0, y = 0, z = 0) {
    const m = new THREE.Mesh(geometry, typeof color === 'string' ? mat(color) : color);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
  }
  function box(parent, w, h, d, color, x = 0, y = 0, z = 0, radius = .06) {
    const r = Math.min(radius, w / 4, h / 4, d / 4), key = [w, h, d, r].join(',');
    if (!geometries.has(key)) {
      const s = new THREE.Shape(), a = -w / 2, b = -h / 2;
      s.moveTo(a + r, b); s.lineTo(a + w - r, b); s.quadraticCurveTo(a + w, b, a + w, b + r);
      s.lineTo(a + w, b + h - r); s.quadraticCurveTo(a + w, b + h, a + w - r, b + h);
      s.lineTo(a + r, b + h); s.quadraticCurveTo(a, b + h, a, b + h - r);
      s.lineTo(a, b + r); s.quadraticCurveTo(a, b, a + r, b);
      const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.01, d - 2 * r), bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: r * .35, bevelThickness: r, curveSegments: 5 });
      g.translate(0, 0, -d / 2 + r); geometries.set(key, g);
    }
    return mesh(geometries.get(key), color, parent, x, y, z);
  }
  function sphere(parent, r, color, x, y, z, scale = [1, 1, 1]) {
    const key = 'sphere' + r;
    if (!geometries.has(key)) geometries.set(key, new THREE.SphereGeometry(r, 24, 16));
    const m = mesh(geometries.get(key), color, parent, x, y, z); m.scale.set(...scale); return m;
  }
  function cylinder(parent, r, h, color, x, y, z, top = r) {
    const key = ['cylinder', r, h, top].join(',');
    if (!geometries.has(key)) geometries.set(key, new THREE.CylinderGeometry(top, r, h, 24));
    return mesh(geometries.get(key), color, parent, x, y, z);
  }
  function rod(parent, start, end, r, color) {
    const a = vector(...start), b = vector(...end), d = b.clone().sub(a);
    const m = cylinder(parent, r, d.length(), color, ...a.clone().add(b).multiplyScalar(.5).toArray());
    m.quaternion.setFromUnitVectors(vector(0, 1, 0), d.normalize()); return m;
  }
  function plant(parent, x, z, size = 1) {
    const g = group(parent, x, 0, z); g.scale.setScalar(size);
    cylinder(g, .27, .45, P.terra, 0, .23, 0, .32);
    cylinder(g, .24, .03, '#4d5340', 0, .46, 0);
    for (const [dx, h, dz] of [[-.22, 1.2, 0], [.24, 1.5, -.05], [.02, 1.7, .1]]) {
      rod(g, [0, .4, 0], [dx, h, dz], .025, '#6b7654');
      const leaf = sphere(g, .3, h > 1.4 ? '#819b6b' : '#557957', dx, h, dz, [.7, 1.5, .5]); leaf.rotation.z = -dx;
    }
  }
  function chair(parent, x, z, color = P.teal) {
    const g = group(parent, x, 0, z);
    cylinder(g, .58, .1, '#65726a', 0, .12, 0);
    cylinder(g, .09, .55, '#9ea8a1', 0, .43, 0);
    box(g, 1.02, .23, .88, color, 0, .79, 0, .12);
    box(g, 1.02, .83, .21, color, 0, 1.22, -.43, .1);
    for (const dx of [-.59, .59]) {
      rod(g, [dx, .72, -.2], [dx, 1.02, -.2], .045, '#9ea8a1');
      box(g, .16, .13, .8, P.wood, dx, 1.04, -.06);
    }
    rod(g, [-.3, .65, .4], [-.3, .37, .9], .04, '#9ea8a1');
    rod(g, [.3, .65, .4], [.3, .37, .9], .04, '#9ea8a1');
    rod(g, [-.3, .37, .9], [.3, .37, .9], .055, '#9ea8a1');
    return g;
  }
  function room(name, width, depth, wallColor) {
    const g = group(); g.name = name;
    box(g, width, .2, depth, P.cream, 0, -.12, 0);
    box(g, width, 3.2, .16, wallColor, 0, 1.6, -depth / 2);
    box(g, width, .14, .08, P.wood, 0, .09, -depth / 2 + .1);
    return g;
  }
  function picture(parent, x, y, z, color) {
    box(parent, .9, 1.2, .07, P.wood, x, y, z);
    box(parent, .78, 1.08, .025, P.white, x, y, z + .05);
    sphere(parent, .23, color, x, y + .14, z + .08, [1, 1, .05]);
    box(parent, .5, .32, .02, '#b9c5ac', x, y - .24, z + .08, .01);
  }
  // Soft-clay volumes: a turned torso and tapered limbs instead of capsules and sticks.
  function limbGeometry(rBottom, rTop) {
    const key = `limb:${rBottom}:${rTop}`;
    if (!geometries.has(key)) {
      const pts = [[0, -.5], [rBottom * .7, -.494], [rBottom, -.45], [rBottom * .92 + rTop * .08, -.16],
        [rBottom * .45 + rTop * .55, .18], [rTop, .45], [rTop * .7, .494], [0, .5]]
        .map(([r, y]) => new THREE.Vector2(Math.max(0, r), y));
      geometries.set(key, new THREE.LatheGeometry(pts, 18));
    }
    return geometries.get(key);
  }
  function torsoGeometry(girth) {
    const key = `torso:${girth}`;
    if (!geometries.has(key)) {
      const pts = [[0, .552], [.142, .568], [.156, .628], [.126, .712], [.134, .798], [.156, .884],
        [.148, .928], [.094, .952], [.050, .968], [0, .974]]
        .map(([r, y]) => new THREE.Vector2(r * girth, y));
      geometries.set(key, new THREE.LatheGeometry(pts, 30));
    }
    return geometries.get(key);
  }
  function person(parent, x, z, color, scale = 1.5, look = {}) {
    // One rig, three builds: the skeleton stays fixed so the phone/ear contact and IK still hold.
    const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
    const seed = hash(color + '|' + x + '|' + z);
    const BUILDS = [
      { girth: .94, headW: .245, headH: .285, headD: .240, armR: .045, skin: '#e7c09a', hair: '#54483c', style: 0, stature: 1.03 },
      { girth: 1.10, headW: .268, headH: .305, headD: .255, armR: .052, skin: '#cf9d74', hair: '#3f3630', style: 1, stature: .96 },
      { girth: 1.00, headW: .252, headH: .292, headD: .248, armR: .046, skin: '#f0d0aa', hair: '#6b5541', style: 2, stature: 1.05 }
    ];
    const b = { ...BUILDS[look.variant ?? seed % 3], ...(look.build || {}) };
    if (look.style !== undefined) b.style = look.style;
    if (look.hair) b.hair = look.hair;
    if (look.skin) b.skin = look.skin;
    if (look.stature) b.stature = look.stature;
    const headR = b.headH / 2;
    const dark = shade(color, .74), light = shade(color, 1.16);
    const g = group(parent, x, .03, z); g.scale.setScalar(scale * b.stature); g.rotation.y = .2 + (seed % 4) * .045;
    // Torso: shoulder, waist and hip volumes turned on a lathe, flattened front-to-back like clay.
    const body = group(g);
    const torso = mesh(torsoGeometry(b.girth), color, body); torso.scale.z = .84;
    const neck = mesh(limbGeometry(.052, .050), b.skin, body); neck.position.y = .995; neck.scale.y = .11;
    const collar = mesh(limbGeometry(.060 * b.girth, .080 * b.girth), light, body); collar.position.y = .958; collar.scale.y = .032;
    const hem = mesh(limbGeometry(.160 * b.girth, .164 * b.girth), dark, body); hem.position.y = .596; hem.scale.y = .026;
    box(body, .020, .15, .008, dark, 0, .80, .112, .004);
    box(body, .046, .042, .007, light, .062, .734, .114, .004);
    const legs = [-.085, .085].map((dx, i) => {
      const hip = group(g, dx, .55, i ? .008 : -.008), knee = group(hip, 0, -.225, 0);
      const thigh = mesh(limbGeometry(.062, .055), '#44514a', hip); thigh.position.y = -.1125; thigh.scale.y = .23;
      const shin = mesh(limbGeometry(.053, .046), '#44514a', knee); shin.position.y = -.1075; shin.scale.y = .218;
      const foot = group(knee, 0, -.215, 0);
      foot.rotation.y = i ? .1 : -.1;
      box(foot, .125, .082, .25, '#3e4944', 0, -.010, .045, .045);
      box(foot, .132, .024, .262, '#2f3430', 0, -.052, .045, .03);
      return { hip, knee, foot };
    });
    const head = group(g, 0, 1.15, 0);
    sphere(head, headR, b.skin, 0, 0, 0, [.95, 1.02, .96]);
    sphere(head, b.headH * .22, b.skin, 0, -b.headH * .30, b.headD * .10, [1.2, .5, .9]);
    const hairMat = mat(b.hair);
    sphere(head, headR * .98, hairMat, 0, .004, -.05, [1.05, .98, .8]);
    const cap = mesh(new THREE.SphereGeometry(headR * 1.06, 24, 14, 0, Math.PI * 2, 0, Math.PI * .44), hairMat, head, 0, .03, -.012);
    cap.scale.set(1.02, 1.0, 1.02);
    if (b.style === 0) {
      sphere(head, headR * .5, hairMat, 0, headR * .58, headR * .55, [1.35, .35, .5]);
    } else if (b.style === 1) {
      const sweep = sphere(head, headR * .55, hairMat, headR * .28, headR * .62, headR * .28, [1.25, .45, .8]);
      sweep.rotation.z = -.36;
    } else {
      for (const side of [-1, 1]) sphere(head, .026, hairMat, side * headR * 1.0, -.02, .01, [.5, .9, .6]);
    }
    const eyeColor = '#2c2f2d';
    const eyeSpread = .29 + (seed % 3) * .014, browTilt = .13 + ((seed >> 2) % 3) * .045, mouthW = .15 + ((seed >> 4) % 3) * .025;
    for (const side of [-1, 1]) sphere(head, .0115, eyeColor, side * headR * eyeSpread, .006, headR * .94, [1, 1.15, .5]);
    const browY = .052, brows = [-1, 1].map(side => {
      const m = box(head, headR * .22, .010, .012, hairMat, side * headR * (eyeSpread + .015), browY, headR * .92, .004);
      m.rotation.z = -side * browTilt; return m;
    });
    const mouth = mesh(new THREE.TorusGeometry(headR * mouthW, .006, 6, 18, Math.PI), '#9a6255', head);
    mouth.position.set(0, -.048, headR * .97); mouth.rotation.z = Math.PI;
    sphere(head, .017, b.skin, 0, -.024, headR * 1.01, [.8, .9, 1]);
    for (const side of [-1, 1]) sphere(head, .019, b.skin, side * headR * 1.04, -.006, 0, [.9, 1.2, .7]);
    const ear = group(head, -headR * 1.28, -.006, 0);
    const upper = mesh(limbGeometry(b.armR * .96, b.armR * .86), color, g);
    const forearm = mesh(limbGeometry(b.armR * .86, b.armR * .74), color, g);
    const qX = new THREE.Quaternion().setFromAxisAngle(vector(1, 0, 0), Math.PI / 2);
    const cuff = mesh(new THREE.TorusGeometry(b.armR * .9, .011, 6, 18), dark, g);
    const freeArm = group(g, .17, .95, 0);
    const freeElbow = group(freeArm, 0, -.22, 0);
    const freeUpperMesh = mesh(limbGeometry(b.armR * .92, b.armR * .82), color, freeArm);
    freeUpperMesh.position.y = -.11; freeUpperMesh.scale.y = .22;
    const freeForeMesh = mesh(limbGeometry(b.armR * .82, b.armR * .7), color, freeElbow);
    freeForeMesh.position.y = -.095; freeForeMesh.scale.y = .19;
    const freeCuff = mesh(new THREE.TorusGeometry(b.armR * .78, .010, 6, 16), dark, freeElbow);
    freeCuff.position.y = -.182; freeCuff.rotation.x = Math.PI / 2;
    const freeHand = group(freeElbow, 0, -.19, 0);
    sphere(freeHand, .043, b.skin, 0, -.015, .012, [.95, 1.05, .68]);
    sphere(freeHand, .017, b.skin, .006, -.03, .05, [.8, .9, .8]);
    const grip = group(g), phone = group(grip);
    box(phone, .11, .23, .036, '#34433e'); box(phone, .083, .17, .009, '#bed4d1', 0, -.005, .023, .01);
    box(phone, .03, .006, .004, '#1b2926', 0, .098, .028, .001);
    const speaker = group(phone, 0, .098, .03);
    const gripHand = sphere(grip, .040, b.skin, 0, -.072, -.043, [1.05, 1.1, .62]);
    const gripThumb = sphere(grip, .018, b.skin, -.038, -.068, .026, [.6, 1.6, .8]);
    const fingers = group(grip);
    for (const y of [-.052, -.074]) box(fingers, .026, .013, .044, b.skin, .045, y, -.004, .004);
    const shoulder = vector(-.17, .95, 0), elbow = vector(0, 0, 0), wrist = vector(0, 0, 0);
    const wristAnchor = vector(0, -.103, -.04), rest = vector(-.212, .62, .07);
    const inward = new THREE.Quaternion().setFromAxisAngle(vector(0, 1, 0), Math.PI / 2);
    const resting = new THREE.Quaternion();
    let actLook = 0, actReach = 0, gripKind = 'phone';
    function setAction(look = 0, reach = 0) { actLook = look; actReach = reach; }
    function setGrip(kind) {
      gripKind = kind;
      const open = kind !== 'phone';
      fingers.visible = !open;
      gripHand.scale.set(...(open ? [1.18, .92, .72] : [1.05, 1.1, .62]));
    }
    function segment(m, a, b) {
      const delta = b.clone().sub(a); m.position.copy(a).add(b).multiplyScalar(.5); m.scale.y = delta.length(); m.quaternion.setFromUnitVectors(vector(0, 1, 0), delta.normalize());
    }
    function pose(lift, reaction = 0, time = 0) {
      // Idle layering: weight shifts through the torso, the head counters it, the free arm breathes.
      const sway = Math.sin(time * .5 + (seed % 9) * .7), breath = Math.sin(time * .95 + (seed % 5) * .9);
      const arms = [{ x: .08, z: .05, elbow: -.2 }, { x: .02, z: .26, elbow: -.6 }, { x: .14, z: .12, elbow: -.36 }][seed % 3];
      body.rotation.z = -.018 * sway;
      head.rotation.set(reaction * .07 + actLook, -.06 * lift + .028 * Math.sin(time * .33 + seed * .5), .035 * lift - .012 * sway); head.updateMatrix();
      freeArm.rotation.set(arms.x + .035 * breath - actReach * .45, 0, arms.z - .02 * sway + actReach * .3);
      freeElbow.rotation.x = arms.elbow - .045 * breath - actReach * .65;
      brows.forEach((m, i) => { m.position.y = browY + .012 * lift; m.rotation.z = (i ? 1 : -1) * (.16 - .07 * lift); });
      mouth.scale.y = 1 + .22 * lift;
      const heldRotation = head.quaternion.clone().multiply(inward);
      const earPosition = ear.position.clone().applyMatrix4(head.matrix);
      // Keep the earpiece at the ear; the grip and fixed-length arm follow that contact.
      const held = earPosition.add(vector(-.008, 0, 0).applyQuaternion(head.quaternion)).sub(speaker.position.clone().applyQuaternion(heldRotation));
      grip.quaternion.slerpQuaternions(resting, heldRotation, lift);
      grip.position.lerpVectors(rest, held, lift); grip.position.x -= .045 * Math.sin(lift * Math.PI);
      wrist.copy(wristAnchor).applyQuaternion(grip.quaternion).add(grip.position);
      const axis = wrist.clone().sub(shoulder).normalize();
      const bend = vector(-1, -1, .5); bend.addScaledVector(axis, -bend.dot(axis)).normalize();
      const { E } = ik2([0, 0], [shoulder.distanceTo(wrist), 0], .23, .22);
      elbow.copy(shoulder).addScaledVector(axis, E[0]).addScaledVector(bend, E[1]);
      segment(upper, shoulder, elbow); segment(forearm, elbow, wrist);
      cuff.position.copy(wrist).addScaledVector(axis, -.035); cuff.quaternion.copy(forearm.quaternion).multiply(qX);
    }
    function walk(t, amount) {
      legs.forEach(({ hip, knee, foot }, i) => {
        const [thigh, shin, ankle] = joints(t + i * .5);
        hip.rotation.x = -thigh * amount; knee.rotation.x = shin * amount; foot.rotation.x = -ankle * amount;
      });
      freeArm.rotation.x += Math.sin(t * Math.PI * 2) * .22 * amount;
    }
    pose(0); return { g, head, phone, ear, speaker, freeArm, legs, joints: { shoulder, elbow, wrist }, pose, walk, setAction, setGrip, build: b };
  }

  return { root, P, mat, group, mesh, box, sphere, cylinder, rod, plant, chair, room, picture, person };
}

export function mountScene(host, world) {
  const narrow = matchMedia('(max-width:900px)');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(devicePixelRatio || 1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor('#eaf2fb', 1); renderer.domElement.setAttribute('aria-hidden', 'true'); host.prepend(renderer.domElement);
  const scene = new THREE.Scene(); scene.add(world.root);
  scene.add(new THREE.HemisphereLight('#f2f7ff', '#a2ad92', 2.1));
  const light = new THREE.DirectionalLight('#fff0d6', 3.2); light.position.set(-3, 8, 6); light.castShadow = true;
  light.shadow.mapSize.set(2048, 2048); Object.assign(light.shadow.camera, { left: -8, right: 8, top: 8, bottom: -7, near: .5, far: 25 });
  light.shadow.normalBias = .025; scene.add(light);
  const fill = new THREE.DirectionalLight('#d9ebff', 1.1); fill.position.set(6, 4, -4); scene.add(fill);
  let width = 1, height = 1, lastView, lastAge = 0, reducedLast = false, lost = false;
  function render(view = lastView, age = lastAge, reduced = reducedLast) {
    lastView = view; lastAge = age; reducedLast = reduced; if (lost || !view) return;
    world.sample(view, age, width / height, reduced, narrow.matches);
    if (renderer.getPixelRatio() !== (devicePixelRatio || 1)) renderer.setPixelRatio(devicePixelRatio || 1);
    renderer.render(scene, world.camera); host.dataset.renderer = 'webgl'; host.dataset.location = view.location;
  }
  function resize() { const r = host.getBoundingClientRect(); width = Math.max(1, r.width); height = narrow.matches ? 360 : Math.max(1, r.height); renderer.setSize(width, height, false); render(); }
  new ResizeObserver(resize).observe(host);
  renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); lost = true; host.dataset.renderer = 'fallback'; });
  renderer.domElement.addEventListener('webglcontextrestored', () => { lost = false; resize(); });
  resize(); return { render };
}
