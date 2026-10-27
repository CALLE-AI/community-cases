import * as THREE from './vendor/three.module.min.js';

const clamp = n => Math.max(0, Math.min(1, n));
const ease = n => { n = clamp(n); return n * n * (3 - 2 * n); };
const phase = (t, a, b) => ease((t - a) / (b - a));
const mix = (a, b, k) => a + (b - a) * k;

export function createCafeScene(host, { entry }) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  host.replaceChildren(renderer.domElement);
  renderer.domElement.setAttribute('role', 'presentation');
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6, 6, 5, -5, .1, 60);
  const root = new THREE.Group(); scene.add(root);
  const mats = new Map(), geometries = new Map();
  function material(color, extra = {}) {
    const key = color + JSON.stringify(extra);
    if (!mats.has(key)) mats.set(key, new THREE.MeshStandardMaterial({ color, roughness: .78, ...extra }));
    return mats.get(key);
  }
  const palette = {
    plaster: material('#eee5d4'), trim: material('#faf5e9'), stone: material('#d0d0bd'),
    wood: material('#9a6842'), oak: material('#c2945d'), roof: material('#537f7d', { metalness: .15, roughness: .65 }),
    roofEdge: material('#3b6564', { metalness: .25 }), teal: material('#447d81'), cream: material('#f5eddb'),
    metal: material('#3c4b49', { metalness: .55, roughness: .4 }), brass: material('#b59a61', { metalness: .65, roughness: .34 }),
    asphalt: material('#829593'), sidewalk: material('#e4dfce'), paint: material('#f7f5df'),
    blue: material('#356aba'), yellow: material('#edc83b'), skin: material('#d7aa84'), dark: material('#394744'),
    green: material('#527d57'), leaf: material('#7c9b66'), leafLight: material('#9eae78'), terra: material('#bc805d')
  };
  function mesh(geometry, mat, x, y, z, parent = root, cast = true) {
    const node = new THREE.Mesh(geometry, mat); node.position.set(x, y, z);
    node.castShadow = cast; node.receiveShadow = true; parent.add(node); return node;
  }
  function roundedGeometry(w, h, d, r) {
    const key = [w, h, d, r].join(',');
    if (geometries.has(key)) return geometries.get(key);
    const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
    s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
    const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(.01, d - r * 2), bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: r * .35, bevelThickness: r, curveSegments: 4 });
    g.translate(0, 0, -d / 2 + r); geometries.set(key, g); return g;
  }
  function box(w, h, d, x, y, z, mat, r = 0, parent = root, cast = true) {
    let g;
    if (r) g = roundedGeometry(w, h, d, Math.min(r, w / 4, h / 4, d / 4));
    else {
      const key = `box:${w},${h},${d}`;
      if (!geometries.has(key)) geometries.set(key, new THREE.BoxGeometry(w, h, d));
      g = geometries.get(key);
    }
    return mesh(g, mat, x, y, z, parent, cast);
  }
  function sphere(r, x, y, z, mat, scale = [1, 1, 1], parent = root) {
    const key = `sphere:${r}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.SphereGeometry(r, 16, 10));
    const node = mesh(geometries.get(key), mat, x, y, z, parent); node.scale.set(...scale); return node;
  }
  function cylinder(r, h, x, y, z, mat, parent = root, top = r) {
    const key = `cylinder:${r},${h},${top}`;
    if (!geometries.has(key)) geometries.set(key, new THREE.CylinderGeometry(top, r, h, 16));
    return mesh(geometries.get(key), mat, x, y, z, parent);
  }
  function rod(a, b, radius, mat, parent = root) {
    const p = new THREE.Vector3(...a), q = new THREE.Vector3(...b), delta = q.clone().sub(p);
    const node = cylinder(radius, delta.length(), ...p.clone().add(q).multiplyScalar(.5).toArray(), mat, parent);
    node.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.normalize()); return node;
  }
  function label(text, color, background, w, h, x, y, z, parent = root) {
    const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 256;
    const ctx = canvas.getContext('2d'); ctx.fillStyle = background; ctx.fillRect(0, 0, 768, 256);
    ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.font = '600 100px system-ui, sans-serif'; ctx.fillText(text, 384, 134, 710);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    return mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, roughness: .8 }), x, y, z, parent, false);
  }

  scene.add(new THREE.HemisphereLight('#f2f7ff', '#a2ad92', 2.1));
  const key = new THREE.DirectionalLight('#fff0d6', 3.2); key.position.set(-3, 8, 6); key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048); key.shadow.camera.left = -7; key.shadow.camera.right = 7;
  key.shadow.camera.top = 7; key.shadow.camera.bottom = -7; key.shadow.camera.near = .5; key.shadow.camera.far = 25;
  key.shadow.normalBias = .025; key.shadow.bias = -.0001; key.shadow.radius = 3; scene.add(key);
  const fill = new THREE.DirectionalLight('#d9ebff', 1.2); fill.position.set(6, 4, -4); scene.add(fill);

  box(9.15, .34, 7.5, 0, -.24, 0, material('#bfcbbc'), .15);
  box(8.95, .13, 7.3, 0, -.02, 0, material('#d6ddc9'), .10);
  box(8.95, .035, 1.1, 0, .07, 3.05, palette.asphalt, .02);
  for (let x = -4.1; x < 4.2; x += .75) box(.4, .008, .035, x, .093, 3.05, palette.paint, 0, root, false);
  box(8.9, .12, .24, 0, .14, 2.42, palette.stone, .025);
  box(6.7, .10, 1.15, -1, .12, 1.77, palette.sidewalk, .045);
  for (let x = -4.2; x < 2.2; x += .45) box(.012, .004, 1.08, x, .176, 1.77, material('#c9c7b7'), 0, root, false);
  for (const z of [1.45, 1.95]) box(6.65, .004, .012, -1, .177, z, material('#c9c7b7'), 0, root, false);

  box(3.0, .04, 3.05, 2.65, .07, -1.64, palette.asphalt, .08);
  const parkingPaint = material('#f7f5df');
  for (const x of [1.3, 2.6, 3.9]) box(.034, .009, 2.28, x, .097, -1.68, parkingPaint, 0, root, false);
  box(2.65, .009, .034, 2.6, .097, -2.81, parkingPaint, 0, root, false);
  const parkingSign = new THREE.Group(); parkingSign.position.set(3.75, 0, -2.72); root.add(parkingSign);
  cylinder(.027, 1.15, 0, .64, 0, palette.metal, parkingSign);
  box(.42, .46, .065, 0, 1.17, 0, palette.blue, .04, parkingSign);
  label('P', '#ffffff', '#356aba', .35, .33, 0, 1.17, .036, parkingSign);

  const car = new THREE.Group(); car.position.set(2.0, .11, -1.65); root.add(car);
  const carPaint = material('#577f91', { roughness: .35, metalness: .3 });
  box(.93, .27, 1.65, 0, .31, 0, carPaint, .10, car);
  box(.73, .34, .82, 0, .57, -.08, material('#c4d9d7', { metalness: .25, roughness: .2 }), .10, car);
  box(.77, .055, .62, 0, .76, -.12, carPaint, .045, car);
  box(.85, .025, .78, 0, .46, .36, carPaint, .025, car);
  for (const x of [-.46, .46]) for (const z of [-.5, .53]) {
    const wheel = cylinder(.18, .12, x, .19, z, material('#303e3d'), car); wheel.rotation.z = Math.PI / 2;
    const hub = cylinder(.085, .125, x, .19, z, material('#b9c5c1', { metalness: .7 }), car); hub.rotation.z = Math.PI / 2;
  }
  for (const x of [-.29, .29]) {
    box(.19, .08, .025, x, .37, .835, palette.cream, .02, car);
    box(.17, .06, .025, x, .37, -.835, material('#a75e4f'), .015, car);
    box(.09, .065, .13, x * 1.7, .53, .18, carPaint, .02, car);
  }

  const cafe = new THREE.Group(); cafe.name='cafe-building'; cafe.position.set(-.9, .15, -.05); root.add(cafe);
  box(4.15, .17, 2.65, 0, .03, 0, palette.stone, .05, cafe);
  box(4.0, .07, 2.45, 0, .14, 0, palette.wood, .02, cafe);
  box(4.0, 2.45, .15, 0, 1.35, -1.18, palette.plaster, .03, cafe);
  box(.16, 2.45, 2.45, -1.94, 1.35, 0, palette.plaster, .025, cafe);
  box(.16, .64, 2.45, 1.94, .45, 0, palette.plaster, .025, cafe);
  box(.16, .45, 2.45, 1.94, 2.35, 0, palette.plaster, .025, cafe);
  for (const z of [-1.16, 0, 1.16]) box(.16, 1.45, .13, 1.94, 1.46, z, palette.plaster, .018, cafe);
  const front = new THREE.Group(); cafe.add(front);
  box(4.04, .43, .18, 0, 2.4, 1.2, palette.plaster, .025, front);
  for (const x of [-1.95, .61, 1.94]) box(.15, 2.2, .2, x, 1.25, 1.2, palette.trim, .02, front);
  box(2.48, .38, .17, - .66, .34, 1.2, palette.wood, .02, front);
  for (const y of [.30, .56]) {
    box(.008, .012, 2.26, 2.026, y, -.03, material('#d3c8b3'), 0, cafe, false);
    for (let z = -1; z < 1.1; z += .43) box(.009, .25, .012, 2.027, y - .13, z + (Math.round(y * 100) % 2 ? .2 : 0), material('#d3c8b3'), 0, cafe, false);
  }

  const glass = new THREE.MeshPhysicalMaterial({ color: '#b8dcd8', roughness: .12, metalness: .08, transparent: true, opacity: .27, clearcoat: 1, clearcoatRoughness: .12, side: THREE.DoubleSide });
  for (const z of [-.58, .58]) {
    box(.022, 1.35, .94, 2.04, 1.45, z, glass, .005, cafe, false);
    for (const edge of [-.5, .5]) box(.08, 1.42, .04, 2.055, 1.45, z + edge, palette.brass, .006, cafe);
    for (const y of [.76, 2.14]) box(.08, .045, 1.04, 2.055, y, z, palette.brass, .006, cafe);
    box(.08, .025, .96, 2.06, 1.25, z, palette.brass, .005, cafe);
  }
  for (const x of [-1.32, -.05]) {
    box(1.21, 1.61, .022, x, 1.36, 1.23, glass, .015, front, false);
    for (const edge of [-.625, .625]) box(.035, 1.68, .08, x + edge, 1.36, 1.26, palette.brass, .006, front);
  }
  for (const y of [.53, 2.2]) box(2.55, .045, .09, -.67, y, 1.26, palette.brass, .008, front);
  box(2.5, .035, .05, -.67, 1.05, 1.27, palette.brass, .005, front);
  box(.86, 2.14, .13, 1.25, 1.23, 1.2, palette.wood, .025, front);
  box(.69, 1.4, .022, 1.25, 1.49, 1.279, glass, .025, front, false);
  for (const x of [.88, 1.61]) box(.055, 2.11, .06, x, 1.23, 1.29, palette.oak, .01, front);
  rod([1.53, 1, 1.34], [1.53, 1.28, 1.34], .025, palette.brass, front);
  box(.84, .05, .36, 1.25, .16, 1.48, palette.stone, .02, front);

  box(2.32, .82, .54, -.52, .62, .34, palette.wood, .035, cafe);
  box(2.42, .07, .64, -.52, 1.06, .34, palette.oak, .025, cafe);
  box(.65, .34, .35, -.84, 1.27, .28, material('#d5ded5', { metalness: .65, roughness: .3 }), .04, cafe);
  box(.62, .05, .14, -.84, 1.13, .51, palette.metal, .01, cafe);
  for (const x of [-1.02, -.69]) { cylinder(.045, .10, x, 1.16, .47, palette.cream, cafe); rod([x, 1.3, .48], [x, 1.3, .65], .015, palette.metal, cafe); }
  for (const y of [1.14, 1.8]) {
    box(2.8, .07, .32, -.25, y, -.93, palette.oak, .012, cafe);
    for (let x = -1.4; x < 1.1; x += .39) {
      cylinder(.07, .19, x, y + .13, -.91, material(x < 0 ? '#937752' : '#c2b48c'), cafe);
      cylinder(.075, .025, x, y + .235, -.91, palette.metal, cafe);
    }
  }
  const warm = material('#ffe4a0', { emissive: '#ffd384', emissiveIntensity: .6 });
  for (const x of [-1.25, -.1, 1.06]) {
    cylinder(.009, .42, x, 2.21, .25, palette.metal, cafe);
    cylinder(.21, .16, x, 1.94, .25, palette.cream, cafe, .04);
    sphere(.095, x, 1.875, .25, warm, [1, .6, 1], cafe);
  }
  const interiorLight = new THREE.PointLight('#ffd999', 1.4, 4); interiorLight.position.set(-.9, 1.75, .35); cafe.add(interiorLight);
  box(2.4, .29, .09, -.15, 2.42, 1.32, palette.roofEdge, .028, front);
  label('EXAMPLE CAFÉ', '#f8efd6', '#3b6564', 2.22, .23, -.15, 2.42, 1.372, front);

  const awning = new THREE.Group(); cafe.add(awning);
  for (let i = 0; i < 10; i++) {
    const positions = [], indices = [], x0 = -2.05 + i * .41;
    for (let j = 0; j <= 12; j++) {
      const k = j / 12, z = 1.25 + k * .91, y = 2.25 - .34 * Math.sin(k * Math.PI / 2);
      positions.push(x0, y, z, x0 + .412, y, z);
      if (j < 12) { const n = j * 2; indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); g.setIndex(indices); g.computeVertexNormals();
    const fabric = material(i % 2 ? '#f5eddb' : '#447d81', { side: THREE.DoubleSide, roughness: .95 });
    mesh(g, fabric, 0, 0, 0, awning);
    box(.408, .16, .035, x0 + .205, 1.84, 2.16, fabric, .034, awning);
  }
  rod([-2.05, 1.92, 2.13], [2.05, 1.92, 2.13], .018, palette.metal, awning);
  for (const x of [-1.85, 1.85]) rod([x, 1.87, 2.10], [x, 1.55, 1.25], .018, palette.metal, awning);

  const roof = new THREE.Group(); cafe.add(roof);
  box(4.17, .09, 2.75, 0, 2.66, 0, palette.trim, .025, roof);
  for (const side of [-1, 1]) {
    const roofPanel = box(4.38, .105, 1.56, 0, 2.97, side * .72, palette.roof, .018, roof);
    roofPanel.rotation.x = side * .355;
    for (let x = -2; x <= 2.05; x += .34) {
      const seam = box(.018, .032, 1.58, x, 3.037, side * .72, palette.roofEdge, .005, roof); seam.rotation.x = side * .355;
    }
  }
  rod([-2.2, 3.275, 0], [2.2, 3.275, 0], .043, palette.roofEdge, roof);
  for (const x of [-2.02, 2.02]) {
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([x, 2.63, -1.47, x, 3.25, 0, x, 2.63, 1.47], 3)); g.computeVertexNormals();
    mesh(g, material('#eee5d4', { side: THREE.DoubleSide }), 0, 0, 0, roof);
  }
  cylinder(.13, .45, -.85, 3.35, -.63, palette.metal, roof);
  cylinder(.20, .045, -.85, 3.59, -.63, palette.roofEdge, roof);
  const skylight = box(.66, .07, .56, .85, 3.09, -.55, palette.metal, .025, roof); skylight.rotation.x = -.355;
  const skyglass = box(.57, .015, .46, .85, 3.137, -.535, glass, .015, roof, false); skyglass.rotation.x = -.355;

  function planter(x, z, w = .7) {
    box(w, .31, .37, x, .33, z, palette.terra, .045);
    box(w - .06, .02, .30, x, .5, z, material('#635b46'), .015);
    for (let i = 0; i < 7; i++) {
      const k = i / 6;
      sphere(.13, x - w * .36 + k * w * .72, .58 + (i % 3) * .035, z, i % 2 ? palette.leaf : palette.green, [.65, 1.25, .7]);
    }
  }
  planter(-2.0, 1.36, .85); planter(.2, 1.42, .55); planter(3.78, 1.85, .65);
  function tree(x, z, s = 1) {
    const group = new THREE.Group(); group.position.set(x, .1, z); group.scale.setScalar(s); root.add(group);
    cylinder(.09, 1.45, 0, .72, 0, palette.wood, group, .052);
    rod([0, .8, 0], [-.36, 1.65, .1], .035, palette.wood, group);
    rod([0, 1.0, 0], [.31, 1.8, -.1], .03, palette.wood, group);
    for (const [a, b, c, r] of [[-.3,1.65,.15,.43],[.26,1.83,-.1,.45],[0,2.1,0,.48],[-.28,2.05,-.2,.33],[.2,1.62,.3,.36],[.38,2,.19,.32],[-.06,1.78,-.35,.35]]) sphere(r, a, b, c, c > 0 ? palette.leaf : palette.leafLight, [1, 1.12, .92], group);
    cylinder(.44, .15, 0, .06, 0, palette.stone, group);
  }
  tree(-3.8, -1.7, .7);
  function chair(x, z, rotation) {
    const g = new THREE.Group(); g.position.set(x, .18, z); g.rotation.y = rotation; root.add(g);
    cylinder(.22, .045, 0, .43, 0, palette.oak, g);
    for (const a of [-1, 1]) for (const b of [-1, 1]) rod([a * .13, .41, b * .12], [a * .2, .02, b * .2], .019, palette.metal, g);
    mesh(new THREE.TorusGeometry(.21, .025, 8, 20, Math.PI), palette.oak, 0, .68, -.16, g);
    for (const a of [-1, 1]) rod([a * .21, .68, -.16], [a * .18, .44, -.15], .024, palette.oak, g);
  }
  function table(x, z) {
    cylinder(.34, .055, x, .93, z, palette.oak);
    cylinder(.035, .7, x, .56, z, palette.metal);
    for (let a = 0; a < 3; a++) { const angle = a * Math.PI * 2 / 3; rod([x, .25, z], [x + Math.cos(angle) * .27, .2, z + Math.sin(angle) * .27], .024, palette.metal); }
    cylinder(.055, .09, x + .1, 1, z, palette.cream);
    cylinder(.07, .018, x + .1, .954, z, palette.cream);
  }
  table(-2.65, 1.87); chair(-3.12, 1.85, Math.PI / 2); chair(-2.2, 1.85, -Math.PI / 2);
  table(-3.5, .6); chair(-3.5, 1.06, Math.PI); chair(-3.5, .13, 0);
  const board = new THREE.Group(); board.position.set(.78, .17, 1.95); board.rotation.y = -.12; root.add(board);
  box(.43, .61, .045, 0, .5, 0, palette.wood, .02, board);
  label('COFFEE', '#f4eddb', '#394744', .36, .46, 0, .5, .026, board);
  for (const x of [-.18,.18]) { rod([x,.8,0],[x,.01,.2],.025,palette.wood,board); rod([x,.8,0],[x,.01,-.2],.025,palette.wood,board); }
  for (const x of [-3.95, 1.9, 3.6]) { cylinder(.045,.4,x,.34,2.48,palette.metal); sphere(.046,x,.55,2.48,palette.brass); }

  function visitor(color, phone = true) {
    const group = new THREE.Group(); root.add(group);
    const torso = mesh(new THREE.CapsuleGeometry(.15, .27, 4, 12), material(color), 0, .78, 0, group);
    box(.21,.09,.22,0,.55,0,palette.dark,.025,group);
    const legs = [];
    for (const x of [-.085,.085]) {
      const leg = new THREE.Group(); leg.position.set(x,.57,0); group.add(leg);
      cylinder(.053,.39,0,-.2,0,palette.dark,leg);
      box(.12,.08,.23,0,-.43,.035,palette.metal,.035,leg); legs.push(leg);
    }
    const head=sphere(.145,0,1.15,0,palette.skin,[.94,1.06,1],group);head.name='head';
    const hair=mesh(new THREE.SphereGeometry(.151,16,10,0,Math.PI*2,0,Math.PI*.57),material('#5c4c3d'),0,1.17,-.012,group);hair.name='hair';
    for (const x of [-.045,.045]) sphere(.012,x,1.16,.136,palette.dark,[1,1,1],group);
    sphere(.025,0,1.115,.147,palette.skin,[.8,.85,1],group);
    const arms = [];
    for (const x of [-.17,.17]) {
      const arm = new THREE.Group(); arm.position.set(x,.94,0); group.add(arm);
      rod([0,0,0],[x*.2,-.19,.12],.047,material(color),arm);
      rod([x*.2,-.19,.12],[-x*.5,-.16,.26],.04,material(color),arm);
      sphere(.043,-x*.5,-.16,.235,palette.skin,[1,1,1],arm); arms.push(arm);
    }
    const device = new THREE.Group(); group.add(device);
    if (phone) { box(.14,.22,.032,0,.83,.29,palette.metal,.02,device); box(.106,.17,.008,0,.835,.31,material('#9cbfd6',{emissive:'#6b9fc5',emissiveIntensity:.25}),.009,device,false); }
    const grip=new THREE.Object3D();grip.position.set(0,.83,.29);group.add(grip);
    return { group, legs, torso, arms, device, grip, head };
  }
  const first = visitor('#e2b932'), next = visitor('#477abd');
  first.group.name='first-visitor';next.group.name='next-visitor';
  const staff = visitor('#e5ddc7', false); staff.group.name='cafe-staff';staff.group.position.set(-.65,.214,-.60); staff.group.scale.setScalar(1.2);
  box(.23,.30,.025,0,.74,.17,palette.teal,.025,staff.group);
  rod([-.08,.98,.15],[-.06,.85,.18],.013,palette.teal,staff.group);
  rod([.08,.98,.15],[.06,.85,.18],.013,palette.teal,staff.group);

  const collected = new Date(entry.collectedAt).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
  function wrapped(ctx, text, x, y, maxWidth, size, color, weight = 600, lineHeight = 1.23) {
    ctx.font = `${weight} ${size}px system-ui, sans-serif`; ctx.fillStyle = color;
    let line = '', row = 0;
    for (const word of text.split(' ')) {
      if (line && ctx.measureText(line + ' ' + word).width > maxWidth) {
        ctx.fillText(line, x, y + row * size * lineHeight); row++; line = word;
      } else line += (line ? ' ' : '') + word;
    }
    ctx.fillText(line, x, y + row * size * lineHeight);
    return y + (row + 1) * size * lineHeight;
  }
  function check(ctx, x, y, size, color = '#2f7151') {
    ctx.strokeStyle=color;ctx.lineWidth=size*.085;ctx.lineCap='round';ctx.lineJoin='round';
    ctx.beginPath();ctx.arc(x,y,size*.45,0,Math.PI*2);ctx.stroke();
    ctx.beginPath();ctx.moveTo(x-size*.22,y);ctx.lineTo(x-size*.035,y+size*.18);ctx.lineTo(x+size*.25,y-size*.19);ctx.stroke();
  }
  function surface(w,h,pw,ph,frameColor,depth=.1) {
    const group = new THREE.Group();root.add(group);
    const frame = box(w,h,depth,0,0,0,material(frameColor),.08,group,false);
    const canvas=document.createElement('canvas');canvas.width=pw;canvas.height=ph;
    const ctx=canvas.getContext('2d'),texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    const face=mesh(new THREE.PlaneGeometry(w*.94,h*.94),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}),0,0,depth*.55,group,false);
    face.receiveShadow=false;
    return {group,frame,canvas,ctx,texture,key:''};
  }
  const phoneView=surface(1.94,3.4,1024,1792,'#263732',.15);phoneView.group.name='visitor-phone';
  box(.31,.026,.02,0,1.57,.10,palette.metal,.008,phoneView.group,false);
  box(.31,.025,.02,0,-1.57,.10,palette.metal,.008,phoneView.group,false);
  box(.035,.30,.06,-.99,.66,0,palette.metal,.008,phoneView.group,false);
  const tapMat=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.8});
  const tap=mesh(new THREE.TorusGeometry(.11,.012,8,32),tapMat,0,-.81,.13,phoneView.group,false);
  function phoneScreen(mode, typed) {
    const key=mode+':'+typed;if(phoneView.key===key)return;phoneView.key=key;
    const c=phoneView.ctx;c.fillStyle='#fbfaf5';c.fillRect(0,0,1024,1792);c.textAlign='left';c.textBaseline='top';
    c.fillStyle='#2f6048';c.fillRect(0,0,1024,174);c.fillStyle='#ffffff';c.font='600 60px system-ui, sans-serif';c.fillText('LOCAL ATLAS',76,57);
    c.fillStyle='#58645a';c.font='500 48px system-ui, sans-serif';c.fillText('Example café',76,242);
    c.fillStyle='#dde5da';c.fillRect(76,332,872,3);
    if(mode==='answer') {
      check(c,158,472,115);
      wrapped(c,'Shared answer',250,419,680,66,'#2f7151');
      wrapped(c,entry.answer,76,625,862,105,'#263d32');
      wrapped(c,'Café staff · '+collected,76,1165,860,49,'#526357',500);
      c.fillStyle='#e2eddf';c.fillRect(76,1370,872,174);
      wrapped(c,'No new call',134,1424,760,74,'#2f7151');
      wrapped(c,'From the place’s saved FAQ',76,1635,870,43,'#526357',500);
    } else {
      wrapped(c,'Ask the place',76,420,860,64,'#2f6048');
      wrapped(c,entry.question.slice(0,typed),76,590,858,112,'#263d32');
      c.fillStyle=mode==='sending'?'#d8e6d4':'#f4d74a';c.fillRect(76,1265,872,180);
      wrapped(c,mode==='sending'?'Sending…':'Ask',153,1319,720,87,'#263d32');
      wrapped(c,mode==='repeat'?'Same place. Same question.':'One useful question.',76,1560,870,49,'#526357',500);
    }
    phoneView.texture.needsUpdate=true;
  }
  const message=surface(2.94,1.48,1280,640,'#f2d351');message.group.name='place-answer';
  const pinTip=mesh(new THREE.ConeGeometry(.18,.28,4),palette.blue,0,-.88,0,message.group,false);pinTip.rotation.z=Math.PI;
  const copied=surface(1.05,.56,960,512,'#356aba',.07);copied.group.name='answer-copy';
  function answerToken(c,w,h) {
    c.fillStyle='#fbfaf5';c.fillRect(0,0,w,h);c.textBaseline='middle';c.textAlign='left';
    check(c,w*.15,h*.5,h*.47);c.font=`600 ${Math.round(h*.17)}px system-ui, sans-serif`;c.fillStyle='#2f6048';c.fillText('PARKING',w*.31,h*.44);
    c.font=`500 ${Math.round(h*.12)}px system-ui, sans-serif`;c.fillStyle='#526357';c.fillText('Shared FAQ',w*.31,h*.67);
  }
  answerToken(copied.ctx,960,512);copied.texture.needsUpdate=true;
  function messageScreen(mode) {
    if(message.key===mode)return;message.key=mode;
    const c=message.ctx;c.textAlign='left';c.textBaseline='top';c.fillStyle='#fbfaf5';c.fillRect(0,0,1280,640);
    if(mode==='token')answerToken(c,1280,640);
    else {
      c.fillStyle=mode==='question'?'#8b681b':'#2f7151';c.font='600 50px system-ui, sans-serif';
      c.fillText(mode==='question'?'CALL-E IS ASKING':mode==='reply'?'CAFÉ STAFF':'SAVED AT THIS PLACE',68,52);
      wrapped(c,mode==='question'?entry.question:entry.evidenceQuote,68,164,1140,93,'#263d32');
      c.font='500 45px system-ui, sans-serif';c.fillStyle='#526357';
      c.fillText(mode==='question'?'One factual question':mode==='reply'?'Customer parking, out back':'Café staff · '+collected,68,544);
    }
    message.texture.needsUpdate=true;
  }
  const storeAnchor=new THREE.Vector3(2.25,1.85,2.10);
  cylinder(.025,1.45,storeAnchor.x,.92,storeAnchor.z,palette.metal);
  cylinder(.11,.06,storeAnchor.x,.21,storeAnchor.z,palette.metal);
  const assistant=surface(.67,.72,512,512,'#edc83b');
  assistant.ctx.fillStyle='#f4d74a';assistant.ctx.fillRect(0,0,512,512);assistant.ctx.fillStyle='#263d32';assistant.ctx.font='700 94px system-ui, sans-serif';assistant.ctx.textAlign='center';assistant.ctx.fillText('CALL-E',256,284);assistant.texture.needsUpdate=true;
  new THREE.TextureLoader().load(new URL('../call-e-mark.svg',import.meta.url).href,texture=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    const logo=mesh(new THREE.PlaneGeometry(.53,.53),new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false}),0,0,.064,assistant.group,false);logo.receiveShadow=false;render();
  });
  const telephone=new THREE.Group();telephone.name='telephone-base';telephone.position.set(-.40,1.30,.31);root.add(telephone);
  box(.50,.085,.30,0,0,0,palette.metal,.04,telephone);
  box(.12,.012,.07,0,.055,.035,material('#9cc9a4',{emissive:'#5ba56c',emissiveIntensity:.3}),.01,telephone,false);
  const receiver=new THREE.Group();receiver.name='telephone-receiver';root.add(receiver);
  rod([-.17,0,0],[.17,0,0],.035,palette.metal,receiver);
  for(const x of [-.17,.17]){const ear=cylinder(.066,.08,x,-.025,0,palette.metal,receiver);ear.rotation.x=Math.PI/2;}
  const cordGeometry=new THREE.BufferGeometry();cordGeometry.setAttribute('position',new THREE.BufferAttribute(new Float32Array(90),3));
  const cord=new THREE.Line(cordGeometry,new THREE.LineBasicMaterial({color:'#33483c'}));root.add(cord);
  const rings=[];
  for(let i=0;i<2;i++)rings.push(mesh(new THREE.TorusGeometry(.24,.018,6,32),new THREE.MeshBasicMaterial({color:'#edbd27',transparent:true,opacity:.8}),0,0,0,root,false));
  const questionPath=new THREE.CatmullRomCurve3([new THREE.Vector3(-2.2,2.6,4.2),new THREE.Vector3(-1.4,3.15,4.1),new THREE.Vector3(-.65,3.4,3.7)]);
  const copyPoints=[new THREE.Vector3(2.65,2.75,2.70),new THREE.Vector3(3.7,2.80,3.3),new THREE.Vector3(4.3,1.7,3.5),new THREE.Vector3(4.0,.85,3.4),new THREE.Vector3(3.253,.824,3.22)];
  const copyPath=new THREE.CatmullRomCurve3(copyPoints);
  const route=new THREE.CatmullRomCurve3([storeAnchor.clone().add(new THREE.Vector3(.4,.36,.2)),...copyPoints]);
  const copyLine=mesh(new THREE.TubeGeometry(route,60,.012,6,false),new THREE.MeshBasicMaterial({color:'#477abd',transparent:true,opacity:.4}),0,0,0,root,false);
  let current={time:0,reduced:false},width=1,height=1,lost=false;
  function cameraPose(t,portrait) {
    const phoneX=-2.2,nextX=4.55;
    const poses=[
      [0,0,1,0,Math.max(7.8,12/(width/height)),.56,.51],
      [.55,0,1,0,Math.max(7.8,12/(width/height)),.56,.51],
      [1.25,phoneX,2.0,3.9,4.35,.08,.17],
      [2.7,phoneX,2.0,3.9,4.35,.08,.17],
      [4.2,-.65,2.0,1.2,portrait?4.2:3.8,.06,.15],
      [6.1,-.65,2.0,1.2,portrait?4.2:3.8,.06,.15],
      [7.1,2.5,2.0,1.0,portrait?7.4:6.6,.75,.38],
      [7.5,2.5,2.0,1.0,portrait?7.4:6.6,.75,.38],
      [9.2,2.25,2.6,4.2,portrait?5.0:4.6,.15,.2],
      [11.65,2.25,2.6,4.2,portrait?5.0:4.6,.15,.2],
      [13.2,.2,1.25,1.1,Math.max(7.5,11.8/(width/height)),.48,.43],
      [14.8,nextX,2.0,3.9,4.35,-.06,.17],
      [15.5,nextX,2.0,3.9,4.35,-.06,.17],
      [16.0,2.25,1.90,2.5,portrait?3.4:3.0,.03,.12],
      [16.4,2.25,1.90,2.5,portrait?3.4:3.0,.03,.12],
      [16.8,portrait?3.15:3.5,1.8,3.1,portrait?5.5:4.0,-.06,.14],
      [18.2,portrait?3.15:3.35,1.4,3.0,portrait?5.5:3.5,-.06,.12],
      [18.85,nextX,2.0,3.9,4.35,-.06,.17],
      [20.8,nextX,2.0,3.9,4.35,-.06,.17],
      [23.3,1.0,1.45,1.2,Math.max(7.7,12/(width/height)),.20,.43],
      [25,1.0,1.45,1.2,Math.max(7.7,12/(width/height)),.20,.43]
    ];
    let a=poses[0],b=poses.at(-1);
    for(let i=1;i<poses.length;i++){if(t<=poses[i][0]){a=poses[i-1];b=poses[i];break;}}
    const k=phase(t,a[0],b[0]);return a.slice(1).map((v,i)=>mix(v,b[i+1],k));
  }
  const v=(x,y,z)=>new THREE.Vector3(x,y,z);
  function render(state=current) {
    current=state;if(lost)return;
    const t=state.time,reduced=state.reduced,portrait=width/height<1.1;
    const motion=(a,b)=>reduced?Number(t>=b):phase(t,a,b);
    const walk1=reduced?1:phase(t,.05,.85),walk2=reduced?1:phase(t,13,15.0);
    first.group.visible=t<14;next.group.visible=t>=13;
    first.group.position.set(mix(-4,-.65,walk1)-motion(12.8,14.0)*4,-.0055,2.75);first.group.rotation.y=t<12.8?.05:1.2;
    next.group.position.set(mix(4.1,3.35,walk2),-.0055,2.75);next.group.rotation.y=-.34;
    for(const [person,k] of [[first,walk1],[next,walk2]]){
      const stride=reduced||k===1||k===0?0:Math.sin(k*Math.PI*8)*.4;
      person.legs[0].rotation.x=stride;person.legs[1].rotation.x=-stride;person.torso.position.y=.78+Math.abs(stride)*.035;
    }
    const cutaway=reduced?0:phase(t,3.15,3.85)*(1-phase(t,7.0,7.8));
    roof.position.y=cutaway*3.8;roof.visible=cutaway<.98;awning.position.y=cutaway*1.9;awning.visible=cutaway<.98;front.visible=cutaway<.98;
    const pickup=motion(3.8,4.65)*(1-motion(5.6,6.1));
    staff.arms[0].rotation.x=-1.15*pickup;staff.group.rotation.y=-.15*pickup;
    receiver.position.lerpVectors(v(-.4,1.45,.31),v(-.79,1.55,-.29),pickup);receiver.rotation.z=pickup*1.35;
    const cp=cordGeometry.attributes.position;
    for(let i=0;i<30;i++){const k=i/29;cp.setXYZ(i,mix(-.28,receiver.position.x,k)+Math.sin(k*Math.PI*14)*.018,mix(1.33,receiver.position.y-.12,k)-Math.sin(k*Math.PI)*.12,mix(.40,receiver.position.z,k)+Math.cos(k*Math.PI*14)*.018);}
    cp.needsUpdate=true;
    interiorLight.intensity=t>=3&&t<8?2.0:1.0;warm.emissiveIntensity=t>=3&&t<8?1.0:.6;
    parkingPaint.color.set(t>=5.4&&t<8.1?'#f1ca2e':'#f7f5df');
    const phoneOne=t<3.35,phoneTwo=t>=13.7;
    phoneView.group.visible=phoneOne||phoneTwo;
    const expand=reduced?1:phoneOne?phase(t,.8,1.22):phase(t,13.7,15.1),out=reduced?0:phoneOne?phase(t,2.9,3.35):phase(t,21.75,23.3);
    const p1=v(-2.2,2.0,3.9),p2=v(4.55,2.0,3.9);
    const hand=(phoneOne?first:next).grip.getWorldPosition(v(0,0,0));
    const placement=phoneOne&&!reduced?phase(t,.45,1.0):expand;
    phoneView.group.position.lerpVectors(hand,phoneOne?p1:p2,placement);
    if(phoneOne)phoneView.group.position.lerp(hand,out);else phoneView.group.position.lerp(v(4.7,1.85,3.9),out);
    const retrieve=reduced?0:phase(t,15.5,15.95)*(1-phase(t,18.2,18.7));
    if(!phoneOne)phoneView.group.position.lerp(hand,retrieve);
    phoneView.group.scale.setScalar(mix(.065,1,expand)*(phoneOne?mix(1,.065,out):mix(1,.72,out))*(1-retrieve*.935));
    first.device.visible=!phoneOne;next.device.visible=!phoneTwo;
    const typed=phoneOne&&!reduced?Math.min(entry.question.length,Math.floor(phase(t,1.15,2.05)*entry.question.length)):entry.question.length;
    phoneScreen(phoneOne?(t>=2.45?'sending':'ask'):t>=18.2?'answer':'repeat',typed);
    tap.visible=!reduced&&((t>=2.15&&t<2.7)||(t>=15.1&&t<15.5));
    if(tap.visible){const k=phoneOne?phase(t,2.15,2.7):phase(t,15.1,15.6);tap.scale.setScalar(.5+k*1.6);tapMat.opacity=1-k;}
    message.group.visible=t>=2.65;
    const arrival=motion(2.65,4.15),replyMove=motion(6.1,7.1),saveMove=motion(7.9,9.2),stored=motion(11.65,12.85);
    let messagePos=questionPath.getPoint(arrival);
    if(t>=4.15)messagePos=v(-.65,3.4,3.7);
    if(t>=6.1)messagePos.lerp(v(3.1,3.35,4.2),replyMove);
    if(t>=7.9)messagePos.lerp(v(2.25,2.90,4.2),saveMove);
    if(t>=11.65)messagePos.lerp(storeAnchor,stored);
    message.group.position.copy(messagePos);
    const callScale=(.12+motion(2.65,4.15)*.88)*(1-motion(3.2,4.15)*.26+motion(6.1,7.1)*.26);
    message.group.scale.setScalar(mix(callScale,.42,stored));
    messageScreen(t<5.4?'question':t<8?'reply':t<12.1?'saved':'token');
    pinTip.visible=t>=8;
    assistant.group.visible=t>=2.9&&t<4.15;assistant.group.position.set(.9,3.0,3.8);
    rings.forEach((ring,i)=>{ring.visible=!reduced&&t>=3.35&&t<4.65;if(ring.visible){const k=((t-3.35)*.8+i*.5)%1;ring.position.set(-.4,1.55,.35);ring.scale.setScalar(1+k*1.7);ring.material.opacity=(1-k)*.7;}});
    copied.group.visible=!reduced&&t>=16.9&&t<18.2;
    copyLine.visible=copied.group.visible;
    if(copied.group.visible){const k=phase(t,16.9,18.2);copied.group.position.copy(copyPath.getPoint(k));copied.group.scale.setScalar(mix(.72,.11,phase(k,.45,1)));}
    const pose=cameraPose(reduced?25:t,portrait),[cx,cy,cz,span,angle,elevation]=pose,aspect=width/height;
    camera.left=-span*aspect/2;camera.right=span*aspect/2;camera.top=span/2;camera.bottom=-span/2;
    camera.position.set(cx+Math.sin(angle)*12,cy+Math.sin(elevation)*12,cz+Math.cos(angle)*Math.cos(elevation)*12);
    camera.lookAt(cx,cy,cz);camera.updateProjectionMatrix();
    for(const panel of [phoneView,message,assistant,copied])panel.group.quaternion.copy(camera.quaternion);
    renderer.render(scene,camera);host.dataset.renderer='webgl';host.dataset.triangles=renderer.info.render.triangles;
    host.dataset.beat=t<3?'ask':t<8?'call':t<13?'save':t<21.75?'reuse':'resolve';
  }
  function resize() {
    const bounds=host.getBoundingClientRect();width=Math.max(1,bounds.width);height=Math.max(1,bounds.height);
    renderer.setSize(width,height,false);render();
  }
  const observer=new ResizeObserver(resize);observer.observe(host);
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();lost=true;host.parentElement.classList.remove('scene-ready');host.dataset.renderer='fallback';});
  renderer.domElement.addEventListener('webglcontextrestored',()=>{lost=false;host.parentElement.classList.add('scene-ready');render();});
  host.parentElement.classList.add('scene-ready');resize();
  return { render, dispose() { observer.disconnect();scene.traverse(node=>{node.geometry?.dispose();});mats.forEach(m=>m.dispose());glass.dispose();renderer.dispose(); } };
}
