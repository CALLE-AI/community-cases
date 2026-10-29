import * as THREE from '../local-atlas-demo/vendor/three.module.min.js';
import { createKit, phase, vector } from '../scene-kit.mjs?v=ad2cd48ede';

export function buildStory(kind) {
  const { root, P, mat, group, mesh, box, sphere, cylinder, rod, plant, room, picture, person } = createKit();
  const actors = [], records = [], solids = [];
  const camera = new THREE.OrthographicCamera(-5, 5, 3, -3, .1, 100);
  function table(parent, x, z, width = 2.6) {
    const g = group(parent, x, 0, z);
    box(g, width, .14, 1.1, P.wood, 0, 1.15, 0);
    for (const dx of [-width / 2 + .15, width / 2 - .15]) for (const dz of [-.36, .36]) box(g, .09, 1.1, .09, P.dark, dx, .56, dz);
    solids.push(g); return g;
  }
  function window(parent, x, y, z, width = 1.6) {
    box(parent, width, 1.5, .1, P.wood, x, y, z);
    box(parent, width - .16, 1.34, .04, '#c5dbd9', x, y, z + .08);
    box(parent, .05, 1.35, .04, P.white, x, y, z + .12);
    box(parent, width - .16, .05, .04, P.white, x, y, z + .12);
    box(parent, width + .15, .08, .32, P.white, x, y - .78, z + .16);
  }
  function book(parent, x, y, z, color, width = .45) {
    box(parent, width, .08, .35, color, x, y, z);
    box(parent, width - .02, .04, .32, P.white, x, y, z + .02);
  }
  function tick(parent, x, y, z, color = P.teal) {
    rod(parent, [x - .13, y, z], [x - .035, y - .09, z], .02, color);
    rod(parent, [x - .035, y - .09, z], [x + .17, y + .13, z], .02, color);
  }
  function note(parent, color = '#e3ebda') {
    const g = group(parent); box(g, .75, .62, .04, color);
    for (let i = 0; i < 3; i++) box(g, .42 - i * .05, .018, .008, '#9caa92', 0, .11 - i * .13, .028, .002);
    records.push(g); return g;
  }
  function actor(parent, x, z, color, scale = 1.6, look = {}) {
    const a = person(parent, x, z, color, scale, look); actors.push(a); return a;
  }
  function listen(a, amount, t, reduced, nod = 1) {
    a.pose(amount, reduced ? 0 : Math.sin(t * 3.2) * .25 * amount * nod, t);
    a.g.position.y = .03 + (reduced ? 0 : Math.sin(t * 1.8) * .008);
    a.freeArm.rotation.x += reduced ? 0 : Math.sin(t * 2) * .04;
  }
  function ringing(a) {
    const g = group(root), rings = [0, 1, 2].map(() => mesh(new THREE.TorusGeometry(.14, .01, 6, 32), new THREE.MeshBasicMaterial({ color: P.yellow, transparent: true, depthWrite: false }), g));
    return (active, t, reduced) => {
      g.visible = active && !reduced && t < 1.2;
      if (!g.visible) return;
      a.g.updateWorldMatrix(true, true); g.position.copy(a.phone.getWorldPosition(vector(0, 0, 0))); g.quaternion.copy(camera.quaternion);
      rings.forEach((ring, i) => { const p = (t * 1.5 + i / 3) % 1; ring.scale.setScalar(1 + p * 2); ring.material.opacity = .8 * (1 - p); });
    };
  }
  function moveNote(object, from, to, progress, lift = .3) {
    object.position.lerpVectors(vector(...from), vector(...to), progress);
    object.position.y += Math.sin(progress * Math.PI) * lift;
    object.rotation.z = (1 - progress) * -.12;
  }
  let update, focus, ring = () => {};
  if (kind === 'office') {
    const office = room('desk', 7.2, 4.6, '#e9e4d7');
    window(office, -2, 2.15, -2.16, 2);
    picture(office, 1.5, 2.15, -2.16, P.blue);
    for (let i = 0; i < 9; i++) box(office, .012, .01, 4.3, '#d7cfb8', -3.3 + i * .8, .005, 0, .002);
    const desk = table(office, -.4, -.55, 3.4);
    box(desk, 1.3, .82, .09, P.dark, 0, 1.85, -.25);
    box(desk, 1.16, .68, .02, '#f3f4e9', 0, 1.85, -.19);
    cylinder(desk, .06, .26, P.dark, 0, 1.33, -.25);
    box(desk, .5, .04, .32, P.dark, 0, 1.23, -.25);
    box(desk, .9, .035, .3, '#c1c9be', 0, 1.25, .28);
    const mail = group(desk, 0, 1.86, -.155);
    box(mail, .72, .38, .02, P.white);
    rod(mail, [-.33, .15, .025], [0, -.04, .025], .015, P.blue);
    rod(mail, [0, -.04, .025], [.33, .15, .025], .015, P.blue);
    const choices = [-1, 1].map(sign => box(desk, .35, .1, .025, sign < 0 ? '#dedbd0' : P.yellow, sign * .25, 1.61, -.13));
    cylinder(desk, .11, .21, P.cream, -1.25, 1.34, .1);
    for (let i = 0; i < 3; i++) book(desk, 1.25, 1.26 + i * .07, 0, [P.teal, P.terra, P.blue][i]);
    const lamp = group(desk, -1.3, 1.25, -.35);
    cylinder(lamp, .18, .035, P.blue, 0, 0, 0);
    rod(lamp, [0, 0, 0], [0, .6, -.08], .028, P.blue);
    rod(lamp, [0, .6, -.08], [.28, .85, -.08], .028, P.blue);
    cylinder(lamp, .18, .16, P.yellow, .28, .8, -.08, .08);
    plant(office, 2.9, -1.4, 1.1);
    box(office, 1.2, 1.05, .65, '#b8c1ac', -2.75, .56, -.65);
    for (const y of [.27, .62, .97]) box(office, .35, .025, .035, P.dark, -2.75, y, -.3);
    const writer = actor(office, -1.95, .65, P.terra, 1.6, { variant: 2, style: 2, hair: '#3d342b' }); writer.phone.visible = false; writer.setGrip('open'); writer.g.rotation.y = -.18;
    const tray = group(desk, .8, 1.27, .24); tray.rotation.x = -Math.PI / 2;
    box(tray, .84, .63, .06, P.teal); box(tray, .74, .53, .02, P.white, 0, 0, .045);
    const answer = note(office, '#e5edda'); answer.name = 'supported-answer';
    const draft = note(tray, '#fff9e6'); draft.scale.setScalar(.8); draft.position.z = .065; draft.name = 'unsent-draft';
    tick(draft, .15, -.16, .035);
    const pencil = group(office, .55, 1.9, .1);
    rod(pencil, [0, 0, 0], [.18, -.38, .03], .025, P.yellow);
    const porch = room('recipient', 5.6, 3.8, '#e2e8df'); porch.position.x = 9;
    window(porch, -1.2, 2.05, -1.76, 1.8);
    box(porch, 1.9, .35, .72, '#9da993', .85, .4, -1.05, .12);
    box(porch, 1.9, .62, .16, '#9da993', .85, .85, -1.35, .1);
    for (const x of [0, 1.7]) box(porch, .18, .62, .75, '#9da993', x, .62, -1.05);
    plant(porch, -2, -.8, .9);
    const recipient = actor(porch, -.55, .45, P.blue, 1.7, { variant: 1, style: 0, hair: '#5a4636' }); const pulse = ringing(recipient);
    update = (v, t, reduced) => {
      const calling = v.phase === 'calling';
      office.visible = !calling || t < 1;
      porch.visible = calling || ['answer', 'unresolved'].includes(v.phase) && t < 1;
      listen(recipient, calling ? phase(t, .4, 1.25) : v.phase === 'answer' ? 1 - phase(t, .1, .85) : 0, t, reduced);
      writer.setAction(.38, ['answer', 'draft'].includes(v.phase) ? .6 : .15);
      listen(writer, 0, t, reduced);
      mail.position.y = t < 1.2 && v.phase === 'start' ? 1.86 + (1 - phase(t, 0, 1.2)) * .25 : 1.86;
      choices.forEach(choice => { choice.visible = v.phase !== 'draft'; });
      answer.visible = v.phase === 'answer';
      moveNote(answer, [1.7, 2.45, 1.4], [.4, 1.48, .15], phase(t, 1.1, 2.9), .2);
      answer.rotation.x = -Math.PI / 2 * phase(t, 2.1, 2.9);
      draft.visible = v.phase === 'draft';
      draft.scale.y = .8 * phase(t, .15, 1.1);
      pencil.visible = v.phase === 'draft';
      pencil.position.set(.1, 1.66 - .33 * phase(t, 1.1, 2), .22);
      pencil.rotation.z = 1.13 * phase(t, 1.1, 2);
      ring = () => pulse(calling, t, reduced);
    };
    focus = (v, t) => {
      const p = phase(t, 0, 1);
      const x = v.phase === 'calling' ? 9 * p : v.phase === 'answer' || v.phase === 'unresolved' ? 9 * (1 - p) : 0;
      return [x, 1.25, v.phase === 'calling' ? 5.3 : 5.8];
    };
  } else if (kind === 'care') {
    const home = room('home', 7.6, 4.8, '#e9e3d3');
    window(home, -2, 2.15, -2.25, 1.75);
    box(home, 2.9, .045, 2, '#d3d4bc', -1.25, .025, .1, .12);
    const sofa = group(home, -.5, 0, -1.45);
    box(sofa, 2.5, .45, .85, '#9fae98', 0, .48, 0, .12);
    box(sofa, 2.5, .68, .18, '#9fae98', 0, .96, -.4, .1);
    for (const x of [-1.2, 1.2]) box(sofa, .2, .75, .95, '#9fae98', x, .65, 0, .09);
    for (const x of [-.58, .58]) box(sofa, 1.05, .14, .7, '#b8c5a8', x, .75, 0, .08);
    const cushion = box(sofa, .48, .46, .15, '#e6d5aa', .7, 1.04, -.2, .09); cushion.rotation.z = -.15;
    cylinder(home, .4, .1, P.wood, -2.65, .7, -.6); cylinder(home, .055, .65, P.wood, -2.65, .35, -.6);
    cylinder(home, .09, .16, P.white, -2.6, .83, -.6);
    book(home, -2.76, .8, -.45, P.terra, .35);
    plant(home, -3, -1.7, .9);
    picture(home, .3, 2.3, -2.24, P.yellow);
    const morgan = actor(home, -1.1, .7, P.teal, 1.7, { variant: 2, style: 1, hair: '#4b3a2c' }); const pulse = ringing(morgan);
    function stand(parent, x) {
      const g = group(parent, x, 0, .7);
      rod(g, [0, 0, 0], [0, 1.35, 0], .045, P.wood);
      for (const dx of [-.45, .45]) rod(g, [0, .55, 0], [dx, .06, .28], .04, P.wood);
      rod(g, [0, .55, 0], [0, .06, -.4], .04, P.wood);
      box(g, 1.9, .07, .22, P.wood, 0, .82, .15);
      return g;
    }
    const homeStand = stand(root, 1.8), teamStand = stand(root, 7.95);
    const file = group(root, 1.8, 1.55, .85); file.name = 'whole-handoff';
    box(file, 1.9, 1.42, .1, P.wood); box(file, 1.78, 1.3, .025, '#fff9e8', 0, 0, .07);
    box(file, .6, .14, .08, '#829188', 0, .7, .11);
    const cleaning = note(file, '#e3ebda'), groceries = note(file, '#f5e4ae');
    cleaning.name = 'cleaning'; groceries.name = 'groceries';
    // Each need keeps its own slot; the later request never replaces the earlier one.
    const broom = group(cleaning, 0, 0, .05); rod(broom, [-.07, -.14, 0], [.07, .2, 0], .02, P.wood); box(broom, .18, .1, .025, P.yellow, -.08, -.16, .015);
    cleaning.children.slice(1, 4).forEach(o => o.visible = false);
    const basket = group(groceries, 0, -.03, .05); box(basket, .3, .19, .03, P.wood, 0, -.04, 0);
    rod(basket, [-.13, .08, 0], [-.07, .2, 0], .016, P.dark); rod(basket, [-.07, .2, 0], [.1, .2, 0], .016, P.dark); rod(basket, [.1, .2, 0], [.14, .08, 0], .016, P.dark);
    sphere(basket, .065, P.teal, -.07, .1, .04); sphere(basket, .06, P.terra, .08, .09, .04);
    groceries.children.slice(1, 4).forEach(o => o.visible = false);
    const query = group(file, .45, -.12, .15); box(query, .62, .3, .025, '#e5d3c5');
    for (let i = 0; i < 3; i++) sphere(query, .025, P.terra, -.12 + i * .12, 0, .025);
    const support = room('coordinator', 5.8, 4.4, '#e1e7db'); support.position.x = 9;
    const desk = table(support, -.25, -.7, 2.8);
    box(desk, .9, .64, .06, P.dark, .2, 1.62, -.25); box(desk, .79, .53, .02, '#dce7e1', .2, 1.62, -.21);
    book(desk, -.9, 1.28, .1, P.terra);
    plant(support, 2, -1.4, 1);
    const shelves = group(support, -1.5, 1.8, -2);
    for (const y of [0, .65]) {
      box(shelves, 1.8, .09, .35, P.wood, 0, y, 0);
      for (let i = 0; i < 6; i++) box(shelves, .14, .38 + i % 2 * .08, .24, [P.teal, P.terra, '#d5c58f'][i % 3], -.65 + i * .23, y + .25, 0, .012);
    }
    const coordinator = actor(support, 1.15, .55, P.terra, 1.6, { variant: 1, style: 0, hair: '#3a322c' }); coordinator.phone.visible = false; coordinator.setGrip('open');
    update = (v, t, reduced) => {
      const onCall = ['checkin', 'callback'].includes(v.phase);
      const afterCall = ['recorded', 'combined'].includes(v.phase);
      listen(morgan, onCall ? phase(t, .4, 1.2) : afterCall ? 1 - phase(t, .2, 1) : 0, t, reduced);
      coordinator.setAction(v.phase === 'handoff' ? .22 : 0, v.phase === 'handoff' ? .7 : 0);
      listen(coordinator, 0, t, reduced);
      const handoff = v.phase === 'handoff' ? phase(t, .3, 2.8) : 0;
      home.visible = v.phase !== 'handoff' || t < 2.8;
      support.visible = v.phase === 'handoff';
      homeStand.visible = v.needs.length > 0 && home.visible; teamStand.visible = support.visible;
      file.position.set(1.8 + 6.15 * handoff, 1.55 + .2 * Math.sin(handoff * Math.PI), .85);
      file.rotation.y = -.08 * handoff;
      file.visible = v.needs.length > 0;
      cleaning.visible = v.needs.includes('Cleaning'); groceries.visible = v.needs.includes('Groceries'); query.visible = v.uncertain;
      moveNote(cleaning, [-1.25, .45, .75], [-.45, -.05, .12], v.phase === 'recorded' ? phase(t, .4, 2) : 1, .15);
      moveNote(groceries, [-1.25, .45, .8], [.45, -.05, .12], v.phase === 'combined' ? phase(t, .4, 2.2) : 1, .25);
      ring = () => pulse(onCall, t, reduced);
    };
    focus = (v, t) => [v.phase === 'handoff' ? 8.25 * phase(t, .15, 2.8) : 0, 1.25, 6];
  } else if (kind === 'restaurants') {
    const street = group();
    box(street, 13.4, .18, 5.8, '#dddac9', 0, -.12, -.1);
    box(street, 13.4, .09, 1.65, '#c2cabf', 0, -.01, 2.1);
    for (let i = 0; i < 17; i++) box(street, .018, .012, 1.6, '#aeb9ab', -6.4 + i * .8, .04, 2.1, .002);
    const xs = [-4.8, -1.6, 1.6, 4.8], colors = [P.terra, P.yellow, P.teal, P.blue];
    const staff = [], stamps = [], pulses = [];
    const LOOKS = [{ variant: 1, style: 0, hair: '#3f3630' }, { variant: 0, style: 1, hair: '#54483c' },
      { variant: 2, style: 2, hair: '#6b5541' }, { variant: 0, style: 0, hair: '#332c26' }];
    xs.forEach((x, i) => {
      const shop = group(street, x, 0, -1);
      box(shop, 2.8, 2.7, .18, ['#ead8c1', '#e7e0c9', '#d8e1d2', '#d9e2e1'][i], 0, 1.35, -.55);
      box(shop, 2.9, .18, 1.75, colors[i], 0, 2.75, -.05);
      box(shop, .15, 2.7, 1.5, '#e3dac6', -1.34, 1.35, .1);
      box(shop, 1.6, .85, .06, '#b9ceca', -.3, 1.65, -.43);
      box(shop, .65, 1.95, .08, P.wood, 1, 1, -.4);
      box(shop, .48, 1.65, .03, '#bed3cd', 1, 1.12, -.34);
      sphere(shop, .035, P.dark, .8, 1, -.29);
      box(shop, 1.9, .13, .6, P.wood, -.3, .99, .2);
      for (let j = 0; j < 3; j++) cylinder(shop, .085, .16, P.white, -.85 + j * .4, 1.13, .14);
      if (i === 0) {
        for (let j = 0; j < 7; j++) { const awning = box(shop, .4, .1, .9, j % 2 ? P.white : P.terra, -1.2 + j * .4, 2.25, .55, .02); awning.rotation.x = .14; }
        const pizza = cylinder(shop, .3, .06, '#d6b468', 0, 3.02, -.1); pizza.rotation.x = Math.PI / 2;
        for (const [dx, dy] of [[-.1, 0], [.1, .08], [0, -.12]]) sphere(shop, .045, P.terra, dx, 3.02 + dy, -.05, [1, 1, .3]);
      } else if (i === 1) {
        sphere(shop, .45, '#d9aa4f', 0, 3.05, -.1, [1, .4, .8]);
        box(shop, .78, .08, .5, P.teal, 0, 2.99, -.08); box(shop, .78, .1, .5, '#8d5e41', 0, 2.9, -.08);
        box(shop, .82, .1, .55, '#d9aa4f', 0, 2.83, -.08);
      } else if (i === 2) {
        cylinder(shop, .35, .22, P.dark, 0, 2.98, -.1, .45);
        rod(shop, [-.3, 3.03, -.08], [.3, 3.45, -.08], .024, P.wood);
        rod(shop, [-.12, 3.03, -.08], [.5, 3.45, -.08], .024, P.wood);
        for (const dx of [-.85, .85]) sphere(shop, .16, '#d6b06b', dx, 2.4, .45, [.8, 1.3, .8]);
      } else {
        for (let j = 0; j < 3; j++) { cylinder(shop, .14, .19, P.dark, -.4 + j * .4, 3.01, -.1); cylinder(shop, .115, .02, P.white, -.4 + j * .4, 3.12, -.1); cylinder(shop, .055, .024, P.terra, -.4 + j * .4, 3.13, -.1); }
        for (let j = 0; j < 5; j++) box(shop, .28, .45, .03, P.blue, -.8 + j * .36, 2.28, .25, .01);
      }
      const a = actor(street, x - .3, .55, colors[i], 1.35, LOOKS[i]); staff.push(a); pulses.push(ringing(a));
      if (i === 0 || i === 2) { box(a.g, .27, .31, .04, P.cream, 0, .73, .16); cylinder(a.g, .17, .08, P.white, 0, 1.32, 0); }
      const stamp = group(street, x + .65, 1.5, .9); stamps.push(stamp);
      const mark = box(stamp, .45, .38, .04, P.white); mark.rotation.z = -.1;
      tick(stamp, 0, 0, .035);
    });
    plant(street, -6.2, .55, .65); plant(street, 6.15, .55, .65);
    const route = box(street, 1, .015, .045, P.blue, xs[0], .065, 2.05, .001);
    const cursor = group(street); cylinder(cursor, .18, .035, P.yellow, 0, .07, 0);
    const match = note(street, '#e3ebda'); match.name = 'match-receipt'; tick(match, .15, -.16, .035);
    const receiptTray = group(street);
    cylinder(receiptTray, .2, .06, P.blue, 0, .08, 0);
    cylinder(receiptTray, .035, .65, P.blue, 0, .4, 0);
    box(receiptTray, .88, .06, .73, P.wood, 0, .76, 0);
    update = (v, t, reduced) => {
      const calling = v.phase === 'calling';
      staff.forEach((a, i) => {
        const isCurrent = i === v.index && v.phase !== 'brief';
        listen(a, isCurrent ? calling ? phase(t, .45, 1.2) : 1 - phase(t, .1, .9) : 0, t, reduced);
        stamps[i].visible = v.results[i] === 'Match';
      });
      const previous = xs[Math.max(0, v.index - 1)], x = calling ? previous + (xs[v.index] - previous) * phase(t, 0, 1.1) : xs[v.index];
      cursor.position.set(x, 0, 2.05); cursor.visible = v.phase !== 'brief';
      route.scale.x = Math.max(.01, x - xs[0]); route.position.x = (x + xs[0]) / 2; route.visible = v.phase !== 'brief' && v.index > 0;
      match.visible = v.phase === 'matched'; receiptTray.visible = match.visible;
      receiptTray.position.set(xs[v.index] + .8, 0, 2.15);
      moveNote(match, [xs[v.index] + .8, 2.2, 1.15], [xs[v.index] + .8, .82, 2.15], phase(t, .3, 2), .15);
      match.rotation.x = -Math.PI / 2 * phase(t, 1, 2);
      ring = () => pulses.forEach((pulse, i) => pulse(calling && i === v.index, t, reduced));
    };
    focus = (v, t, portrait) => {
      if (v.phase === 'brief') return portrait ? [-2.8 + 5.6 * phase(t, 1, 5.5), 1.2, 6] : [0, 1.2, 8.8];
      const target = xs[v.index], previous = v.index === 0 ? 0 : xs[v.index - 1];
      return [v.phase === 'calling' ? previous + (target - previous) * phase(t, 0, 1.1) : target, 1.35, 5.5];
    };
  } else throw new Error('Unknown scene kind: ' + kind);

  function sample(view, age = 0, aspect = 2, reduced = false, portrait = aspect < 1.1) {
    const t = reduced ? 5 : age;
    update(view, t, reduced);
    const [x, y, size] = focus(view, t, portrait), overview = kind === 'restaurants' && view.phase === 'brief';
    const span = portrait ? Math.max(size, (overview ? 6.8 : kind === 'restaurants' ? 5.2 : kind === 'care' ? 6.6 : 6.4) / aspect) : size * Math.max(1, 1.55 / aspect);
    const targetX = x + (portrait || overview ? 0 : 1.8);
    camera.left = -span * aspect / 2; camera.right = span * aspect / 2; camera.top = span / 2; camera.bottom = -span / 2;
    camera.position.set(targetX + 2.3, y + 4.4, 12); camera.lookAt(targetX, y, 0);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld(true); root.updateMatrixWorld(true); ring(); root.updateMatrixWorld(true);
    return view;
  }
  return { root, camera, sample, actors, records, solids };
}
