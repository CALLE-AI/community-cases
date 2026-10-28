import * as THREE from '../local-atlas-demo/vendor/three.module.min.js';
import { ik2 } from './ik2.mjs';
import { joints } from './gait.mjs';

const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const phase = (t, a, b) => ease((t - a) / (b - a));
const vector = (x, y, z) => new THREE.Vector3(x, y, z);

// Rounded forms follow the Local Atlas scene.
export function buildWorld() {
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
  function person(parent, x, z, color, scale = 1.5) {
    const g = group(parent, x, .03, z); g.scale.setScalar(scale); g.rotation.y = .35;
    mesh(new THREE.CapsuleGeometry(.16, .27, 6, 16), color, g, 0, .78, 0);
    const legs = [-.085, .085].map(dx => {
      const hip = group(g, dx, .55, 0), knee = group(hip, 0, -.225, 0);
      cylinder(hip, .055, .225, '#44514a', 0, -.1125, 0);
      cylinder(knee, .05, .215, '#44514a', 0, -.1075, 0);
      const foot = group(knee, 0, -.215, 0);
      box(foot, .13, .09, .24, '#3e4944', 0, -.01, .04, .03);
      return { hip, knee, foot };
    });
    const head = group(g, 0, 1.15, 0);
    sphere(head, .15, P.skin, 0, 0, 0, [.94, 1.06, 1]);
    mesh(new THREE.SphereGeometry(.156, 24, 12, 0, Math.PI * 2, 0, Math.PI * .56), '#5b5044', head, 0, .023, -.015);
    for (const dx of [-.046, .046]) sphere(head, .012, '#34433e', dx, .008, .14);
    sphere(head, .022, P.skin, 0, -.034, .153, [.8, .9, 1]);
    for (const side of [-1, 1]) sphere(head, .022, P.skin, side * .151, -.006, 0, [1, 1.3, .8]);
    const ear = group(head, -.174, -.006, 0);
    const upper = cylinder(g, .05, 1, color, 0, 0, 0), forearm = cylinder(g, .043, 1, color, 0, 0, 0);
    const freeArm = group(g, .17, .95, 0);
    rod(freeArm, [0, 0, 0], [.06, -.3, .07], .05, color);
    sphere(freeArm, .047, P.skin, .06, -.33, .08);
    const grip = group(g), phone = group(grip);
    box(phone, .11, .23, .036, '#34433e'); box(phone, .083, .17, .009, '#bed4d1', 0, -.005, .023, .01);
    box(phone, .03, .006, .004, '#1b2926', 0, .098, .028, .001);
    const speaker = group(phone, 0, .098, .03);
    sphere(grip, .038, P.skin, 0, -.072, -.043, [1, 1.05, .6]);
    for (const y of [-.045, -.064, -.083]) box(grip, .028, .014, .046, P.skin, .047, y, -.005, .005);
    sphere(grip, .018, P.skin, -.038, -.068, .026, [.6, 1.6, .8]);
    const shoulder = vector(-.17, .95, 0), elbow = vector(0, 0, 0), wrist = vector(0, 0, 0);
    const wristAnchor = vector(0, -.103, -.04), rest = vector(-.23, .67, .12);
    const inward = new THREE.Quaternion().setFromAxisAngle(vector(0, 1, 0), Math.PI / 2);
    const resting = new THREE.Quaternion();
    function segment(m, a, b) {
      const delta = b.clone().sub(a); m.position.copy(a).add(b).multiplyScalar(.5); m.scale.y = delta.length(); m.quaternion.setFromUnitVectors(vector(0, 1, 0), delta.normalize());
    }
    function pose(lift, reaction = 0) {
      head.rotation.set(reaction * .07, 0, .035 * lift); head.updateMatrix();
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
    }
    function walk(t, amount) {
      legs.forEach(({ hip, knee, foot }, i) => {
        const [thigh, shin, ankle] = joints(t + i * .5);
        hip.rotation.x = -thigh * amount; knee.rotation.x = shin * amount; foot.rotation.x = -ankle * amount;
      });
      freeArm.rotation.x = Math.sin(t * Math.PI * 2) * .3 * amount;
    }
    pose(0); return { g, head, phone, ear, speaker, freeArm, legs, joints: { shoulder, elbow, wrist }, pose, walk };
  }

  const salon = room('salon', 8, 4.7, '#ede6d3');
  // An open front and a partial side wall keep the chair, desk and diary visible.
  box(salon, .15, 3.2, 2.3, '#e5dcc6', -4, 1.6, -1.2);
  for (let i = 0; i < 13; i++) box(salon, .016, .012, 4.35, '#d8d0b7', -3.8 + i * .61, .003, 0, .002);
  box(salon, 1.65, 2.08, .11, P.wood, -2.48, 1.91, -2.2, .09);
  box(salon, 1.48, 1.91, .04, mat('#b7ccc4', { metalness: .35, roughness: .24 }), -2.48, 1.91, -2.12, .08);
  box(salon, 2.15, .12, .64, P.wood, -2.48, .93, -1.93);
  for (let i = 0; i < 3; i++) { cylinder(salon, .07, .25 + .06 * i, ['#5a8178', '#ceb97c', '#e4ded0'][i], -3.1 + i * .21, 1.12 + .03 * i, -1.9); cylinder(salon, .035, .055, P.dark, -3.1 + i * .21, 1.27 + .06 * i, -1.9); }
  chair(salon, -2.35, -.4);
  box(salon, 2.7, .045, 1.65, '#d2d4bf', -2.35, .02, -.12, .04);
  const desk = group(salon, 1.45, 0, .3);
  box(desk, 2.9, 1.05, .8, P.wood, 0, .56, 0);
  for (let i = 0; i < 18; i++) box(desk, .055, .88, .04, '#a78a63', -1.3 + i * .15, .55, .42, .005);
  box(desk, 3.06, .14, .98, P.white, 0, 1.16, 0);
  box(desk, .5, .035, .28, '#52776a', -1, 1.26, .02);
  cylinder(desk, .11, .2, P.cream, 1.1, 1.32, -.05);
  picture(salon, -.2, 2.25, -2.22, '#d4aa60');
  plant(salon, 3.35, -1.5, 1.1);
  const stylist = person(salon, -.7, -1.1, P.terra, 1.55);
  stylist.phone.visible = false;
  box(stylist.g, .28, .35, .04, '#e8dbbd', 0, .73, .16);
  // The appointment slip lands on this physical book only after availability passes.
  const book = group(desk, -.25, 1.27, .1); book.rotation.x = -Math.PI / 2;
  box(book, .8, .5, .06, P.teal); box(book, .71, .43, .025, P.white, 0, 0, .04);
  for (let i = 0; i < 4; i++) box(book, .5, .012, .008, '#b9c4b5', 0, -.12 + i * .08, .06, .001);
  const slip = group(salon);
  box(slip, .58, .35, .035, '#e6efdc');
  for (const [a,b] of [[[-.15,0,.03],[-.04,-.08,.03]],[[-.04,-.08,.03],[.16,.11,.03]]]) rod(slip,a,b,.018,P.teal);
  // Small studio objects give the room a working purpose at the wider opening shot.
  box(salon, 1.25, .08, .4, P.wood, .95, 2.25, -2.1);
  for (let i = 0; i < 5; i++) cylinder(salon, .07, .24 + .025 * i, i % 2 ? P.terra : P.teal, .5 + i * .22, 2.41, -2.1);
  const clockFace = cylinder(salon, .29, .04, P.white, 2.25, 2.45, -2.15); clockFace.rotation.x = Math.PI / 2;
  rod(salon,[2.25,2.45,-2.11],[2.25,2.62,-2.11],.014,P.dark);
  rod(salon,[2.25,2.45,-2.10],[2.4,2.38,-2.10],.014,P.dark);
  const lamp = group(salon, -2.5, 2.95, -.75);
  cylinder(lamp, .025, .5, P.dark, 0, .25, 0); cylinder(lamp, .26, .26, P.cream, 0, -.1, 0, .12);
  cylinder(lamp, .23, .02, mat('#ffe4a0', { emissive: '#f8d783', emissiveIntensity: .5 }), 0, -.24, 0);

  const alexRoom = room('alex', 6.2, 3.6, '#e6e9df');
  box(alexRoom, 2.2, .16, .9, P.wood, -1.5, .95, -1.08);
  for (const dx of [-2.4, -.6]) for (const dz of [-1.4, -.8]) box(alexRoom, .09, .9, .09, P.dark, dx, .45, dz);
  box(alexRoom, .84, .57, .05, P.dark, -1.5, 1.28, -1.14);
  box(alexRoom, .73, .46, .012, '#bbcdca', -1.5, 1.28, -1.1);
  box(alexRoom, .86, .035, .43, '#6a7b72', -1.5, 1.05, -.91);
  cylinder(alexRoom, .09, .18, P.cream, -2.18, 1.13, -.9);
  box(alexRoom, 1.7, 1.6, .09, P.wood, -.9, 2.2, -1.67);
  box(alexRoom, 1.51, 1.42, .025, '#c1d5d6', -.9, 2.2, -1.61);
  box(alexRoom, .045, 1.45, .04, P.white, -.9, 2.2, -1.57);
  box(alexRoom, 1.53, .045, .04, P.white, -.9, 2.2, -1.57);
  plant(alexRoom, -2.6, .5, .9);
  box(alexRoom, 1.35, .08, .34, P.wood, 1.45, 2.05, -1.56);
  for (let i = 0; i < 7; i++) box(alexRoom, .11, .33 + .05 * (i % 3), .22, [P.teal,P.terra,'#d5bc7d'][i % 3], .91 + i * .16, 2.26, -1.56, .015);
  box(alexRoom, 1.1, .18, .75, '#7d9290', 1.3, .63, -.65);
  box(alexRoom, 1.1, .85, .2, '#7d9290', 1.3, 1.05, -1);
  for (const dx of [.85,1.75]) for (const dz of [-.9,-.4]) cylinder(alexRoom,.035,.54,P.wood,dx,.27,dz);
  const alex = person(alexRoom, -.7, .35, P.blue, 1.7);
  const samRoom = room('sam', 6.2, 3.6, '#eee5d7');
  box(samRoom, 1.8, .14, .65, P.wood, -1.5, .9, -1.13);
  for (const dx of [-2.25, -.75]) box(samRoom, .09, .84, .09, P.wood, dx, .43, -1.13);
  cylinder(samRoom, .19, .38, '#afba98', -2.1, 1.14, -1.13, .12);
  for (const dx of [-.13, .12]) rod(samRoom, [-2.1, 1.22, -1.13], [-2.1 + dx, 1.78, -1.13], .018, '#65825c');
  sphere(samRoom, .17, '#819b6b', -2.23, 1.63, -1.13, [.7, 1.2, .3]);
  picture(samRoom, -.9, 2.3, -1.68, '#c38767');
  box(samRoom, .7, .5, .3, P.terra, -2.3, .3, -.1, .09);
  rod(samRoom, [-2.5, .5, -.1], [-2.4, .8, -.1], .035, P.dark); rod(samRoom, [-2.4, .8, -.1], [-2.1, .8, -.1], .035, P.dark); rod(samRoom, [-2.1, .8, -.1], [-2.05, .5, -.1], .035, P.dark);
  plant(samRoom, -2.6, .8, .9);
  const sofa = group(samRoom, 1.2, 0, -.6);
  box(sofa, 2, .43, .85, '#bc977f', 0, .43, 0, .12);
  box(sofa, 2, .62, .2, '#bc977f', 0, .91, -.4, .1);
  for (const x of [-.96,.96]) box(sofa,.2,.65,.9,'#bc977f',x,.64,0,.08);
  for (const x of [-.48,.48]) box(sofa,.78,.13,.65,'#d1b496',x,.69,.05,.08);
  const cushion = box(sofa,.42,.42,.12,'#dce3ce',.56,.94,-.2,.08);cushion.rotation.z=-.2;
  cylinder(samRoom,.25,.08,P.wood,2.55,.07,-1);
  cylinder(samRoom,.025,1.95,P.dark,2.55,1.06,-1);
  cylinder(samRoom,.34,.45,P.cream,2.55,2,-1,.2);
  const sam = person(samRoom, -.7, .35, P.teal, 1.7);

  const rooms = { salon, alex: alexRoom, sam: samRoom };
  const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 80);
  const rings = [alex, sam].map(actor => {
    const holder = group(actor.g.parent);
    const lines = [0, 1, 2].map(() => mesh(new THREE.TorusGeometry(.17, .012, 6, 40), new THREE.MeshBasicMaterial({ color: P.yellow, transparent: true, depthWrite: false }), holder));
    return { holder, lines, actor };
  });
  function sample(view, age = 0, aspect = 2, reduced = false, portrait = aspect < 1.1) {
    const t = reduced ? 4 : age, home = view.location !== 'salon';
    const arrival = reduced || !['opening','alex','sam','review'].includes(view.phase) ? 1 : phase(age, 0, .85);
    Object.entries(rooms).forEach(([name, room]) => {
      room.visible = name === view.location;
      room.position.set(portrait ? 0 : -1.3, 0, 0);
      room.scale.setScalar(home ? .9 : portrait ? .77 : .83);
    });
    const lift = reduced ? view.answered ? 0 : 1 : view.answered ? 1 - phase(age, 1, 1.8) : phase(age, .45, 1.25);
    const reaction = reduced ? 0 : view.answered ? Math.sin(phase(age, 0, .8) * Math.PI) : .22 * Math.sin(age * 3.6) * lift;
    alex.pose(view.location === 'alex' ? lift : 0, view.location === 'alex' ? -reaction : 0);
    sam.pose(view.location === 'sam' ? lift : 0, view.location === 'sam' ? reaction : 0);
    for (const actor of [alex, sam]) {
      actor.g.position.y = .03 + (reduced ? 0 : Math.sin(t * 2) * .009);
      actor.freeArm.rotation.x = reduced ? 0 : Math.sin(t * 1.8) * .06;
    }
    const walking = view.phase === 'opening', progress = walking ? phase(t, .3, 3.1) : 1;
    stylist.g.position.set(-.9 + progress * 2.1, .03 + (reduced ? 0 : Math.abs(Math.sin(t * 6)) * .018 * (1 - phase(t, 2.6, 3.1))), -.95);
    stylist.g.rotation.y = Math.PI / 2 * (1 - phase(t, 2.5, 3.1)) + .15;
    stylist.walk(t * 1.2, walking ? phase(t, .3, .65) * (1 - phase(t, 2.5, 3.1)) : 0);
    stylist.pose(0, view.phase === 'booked' && !reduced ? .6 * Math.sin(t * 3) * (1 - phase(t, 1, 2)) : 0);
    stylist.freeArm.rotation.x += ['review','booked'].includes(view.phase) ? -.65 + (reduced ? 0 : Math.sin(t * 4) * .07) : 0;
    slip.visible = view.phase === 'booked';
    const saved = phase(t, .2, 1.5);
    slip.position.set(1.2, 3.2 - saved * 1.86, 1.4 - saved);
    slip.rotation.set(-Math.PI / 2 * saved, 0, (1 - saved) * -.25);
    const span = portrait ? Math.max(home ? 4.1 : 4.8, (home ? 4.5 : 6.8) / aspect) : home ? 5 : 5.8;
    const cy = home ? 1.45 : 1.35, targetX = portrait ? home ? -.6 : 0 : .2;
    camera.left = -span * aspect / 2; camera.right = span * aspect / 2; camera.top = span / 2; camera.bottom = -span / 2;
    // A brief arrival move settles before the first default action; controls do not move with it.
    camera.zoom = 1 - (1 - arrival) * .07;
    camera.position.set(targetX + 2.3 + (1 - arrival) * .8, cy + 4.4, 12);
    camera.lookAt(targetX, cy, 0); camera.updateProjectionMatrix(); camera.updateMatrixWorld(true);
    root.updateMatrixWorld(true);
    rings.forEach(({ holder, lines, actor }) => {
      holder.visible = !reduced && !view.answered && view.location === actor.g.parent.name && age < 1.25;
      holder.position.copy(actor.phone.getWorldPosition(vector(0, 0, 0))); holder.parent.worldToLocal(holder.position); holder.quaternion.copy(camera.quaternion);
      lines.forEach((line, i) => { const p = (t * 1.4 + i / 3) % 1; line.scale.setScalar(1 + p * 2); line.material.opacity = .8 * (1 - p); });
    });
    root.updateMatrixWorld(true);
    return { ...view, portrait };
  }
  return { root, camera, sample, actors: { alex, sam }, stylist, slip };
}

export function createScene(host) {
  const narrow = matchMedia('(max-width:900px)');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(devicePixelRatio || 1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.setClearColor('#eaf2fb', 1); renderer.domElement.setAttribute('aria-hidden', 'true'); host.prepend(renderer.domElement);
  const scene = new THREE.Scene(), world = buildWorld(); scene.add(world.root);
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
