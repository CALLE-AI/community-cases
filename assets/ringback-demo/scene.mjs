import * as THREE from '../local-atlas-demo/vendor/three.module.min.js';
import { createKit, mountScene, phase, vector } from '../scene-kit.mjs?v=ad2cd48ede';

export function buildWorld() {
  const { root, P, mat, group, mesh, box, sphere, cylinder, rod, plant, chair, room, picture, person } = createKit();

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
  const stylist = person(salon, -.7, -1.1, P.terra, 1.55, { variant: 2, style: 0, hair: '#3f3630' });
  stylist.phone.visible = false; stylist.setGrip('open');
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
  const alex = person(alexRoom, -.7, .35, P.blue, 1.7, { variant: 0, style: 1, hair: '#443a31' });
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
  const sam = person(samRoom, -.7, .35, P.teal, 1.7, { variant: 1, style: 2, hair: '#5a4636' });

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
    alex.pose(view.location === 'alex' ? lift : 0, view.location === 'alex' ? -reaction : 0, t);
    sam.pose(view.location === 'sam' ? lift : 0, view.location === 'sam' ? reaction : 0, t);
    for (const actor of [alex, sam]) {
      actor.g.position.y = .03 + (reduced ? 0 : Math.sin(t * 2) * .009);
      actor.freeArm.rotation.x += reduced ? 0 : Math.sin(t * 1.8) * .04;
    }
    const walking = view.phase === 'opening', progress = walking ? phase(t, .3, 3.1) : 1;
    stylist.g.position.set(-.9 + progress * 2.1, .03 + (reduced ? 0 : Math.abs(Math.sin(t * 6)) * .018 * (1 - phase(t, 2.6, 3.1))), -.95);
    stylist.g.rotation.y = Math.PI / 2 * (1 - phase(t, 2.5, 3.1)) + .15;
    stylist.setAction(view.phase === 'booked' ? .3 : 0, ['review', 'booked'].includes(view.phase) ? .2 : 0);
    stylist.pose(0, view.phase === 'booked' && !reduced ? .6 * Math.sin(t * 3) * (1 - phase(t, 1, 2)) : 0, t);
    stylist.walk(t * 1.2, walking ? phase(t, .3, .65) * (1 - phase(t, 2.5, 3.1)) : 0);
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

export function createScene(host) { return mountScene(host, buildWorld()); }
