import * as THREE from '../local-atlas-demo/vendor/three.module.min.js';
const C = { paper: 0xfffdf4, wood: 0xbca078, ink: 0x344442, blue: 0x527eae, yellow: 0xf4cc40, green: 0x598565, red: 0xb96753, skin: 0xe0ba96, floor: 0xe1e7dc };
const clamp = x => Math.max(0, Math.min(1, x));
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const between = (t, a, b) => ease((t - a) / (b - a));
const v = a => new THREE.Vector3(...a);
// Every pose is a function of absolute time, including reverse seeks and replay.
export function buildStory(kind) {
    const root = new THREE.Group();
    const materials = new Map();
    const actors = [], solids = [], moving = [];
    function material(color) {
        if (!materials.has(color))
            materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: .85 }));
        return materials.get(color);
    }
    function group(parent = root, x = 0, y = 0, z = 0) {
        const g = new THREE.Group();
        g.position.set(x, y, z);
        parent.add(g);
        return g;
    }
    function mesh(geometry, color, parent, x = 0, y = 0, z = 0) {
        const m = new THREE.Mesh(geometry, material(color));
        m.position.set(x, y, z);
        m.castShadow = true;
        m.receiveShadow = true;
        parent.add(m);
        return m;
    }
    function box(parent, w, h, d, color, x = 0, y = 0, z = 0) {
        return mesh(new THREE.BoxGeometry(w, h, d), color, parent, x, y, z);
    }
    function sphere(parent, r, color, x = 0, y = 0, z = 0) {
        return mesh(new THREE.SphereGeometry(r, 20, 12), color, parent, x, y, z);
    }
    function cylinder(parent, r, h, color, x = 0, y = 0, z = 0) {
        return mesh(new THREE.CylinderGeometry(r, r, h, 24), color, parent, x, y, z);
    }
    function stroke(parent, points, color = C.ink, r = .025) {
        const curve = new THREE.CatmullRomCurve3(points.map(v));
        return mesh(new THREE.TubeGeometry(curve, 32, r, 8, false), color, parent);
    }
    function check(parent, x, y, z, yes = true, scale = 1) {
        const g = group(parent, x, y, z);
        g.scale.setScalar(scale);
        stroke(g, yes ? [[-.23, 0, 0], [-.06, -.16, 0], [.3, .23, 0]] : [[-.2, -.2, 0], [.2, .2, 0]], yes ? C.green : C.red, .045);
        if (!yes)
            stroke(g, [[-.2, .2, 0], [.2, -.2, 0]], C.red, .045);
        return g;
    }
    function icon(parent, type, x = 0, y = 0, z = 0, scale = 1, tint = C.blue) {
        const g = group(parent, x, y, z);
        g.scale.setScalar(scale);
        if (type === 'sun' || type === 'afternoon') {
            sphere(g, .17, C.yellow, 0, .05, 0);
            for (let i = 0; i < 8; i++) {
                const a = i * Math.PI / 4;
                stroke(g, [[Math.cos(a) * .25, Math.sin(a) * .25 + .05, 0], [Math.cos(a) * .34, Math.sin(a) * .34 + .05, 0]], C.yellow, .025);
            }
            if (type === 'afternoon')
                box(g, .8, .075, .08, C.blue, 0, -.09, .1);
        }
        else if (type === 'broom') {
            const handle = box(g, .055, .62, .06, C.wood, 0, .13, 0);
            handle.rotation.z = -.2;
            box(g, .42, .22, .1, C.yellow, .07, -.25, 0);
            for (let i = 0; i < 4; i++)
                box(g, .025, .15, .02, C.wood, -.08 + i * .1, -.29, .06);
        }
        else if (type === 'basket') {
            box(g, .57, .36, .16, C.wood, 0, -.12, 0);
            stroke(g, [[-.22, .08, 0], [-.2, .4, 0], [.2, .4, 0], [.22, .08, 0]], C.ink, .028);
            sphere(g, .11, C.green, -.12, .09, .02);
            sphere(g, .1, C.red, .12, .1, .02);
        }
        else if (type === 'person') {
            sphere(g, .15, C.skin, 0, .18, 0);
            box(g, .34, .3, .12, tint, 0, -.12, 0);
        }
        else if (type === 'delivery') {
            box(g, .48, .26, .14, C.blue, -.1, .02, 0);
            box(g, .24, .2, .14, C.blue, .25, -.01, 0);
            sphere(g, .085, C.ink, -.22, -.16, .06);
            sphere(g, .085, C.ink, .25, -.16, .06);
        }
        else if (type === 'mail') {
            box(g, .7, .46, .08, C.paper);
            stroke(g, [[-.31, .18, .06], [0, -.02, .06], [.31, .18, .06]], C.blue, .025);
        }
        else if (type === 'lock') {
            box(g, .37, .3, .1, C.ink, 0, -.08, 0);
            stroke(g, [[-.13, .08, 0], [-.13, .3, 0], [.13, .3, 0], [.13, .08, 0]], C.ink, .035);
        }
        return g;
    }
    function tile(type, x, y, z, parent = root, tint = C.blue) {
        const g = group(parent, x, y, z);
        box(g, .9, 1, .09, C.paper);
        icon(g, type, 0, 0, .1, 1, tint);
        return g;
    }
    function desk(x, z, w = 2.1) {
        const g = group(root, x, 0, z);
        box(g, w, .14, .9, C.wood, 0, 1.08, 0);
        for (const dx of [-w / 2 + .12, w / 2 - .12])
            for (const dz of [-.32, .32])
                box(g, .09, 1, .09, C.ink, dx, .5, dz);
        solids.push({ name: 'desk', box: new THREE.Box3(v([x - w / 2, 0, z - .45]), v([x + w / 2, 1.15, z + .45])) });
        return g;
    }
    function plant(x, z) {
        cylinder(root, .2, .35, C.wood, x, .175, z);
        cylinder(root, .035, .7, C.wood, x, .65, z);
        sphere(root, .32, C.green, x, .94, z);
        sphere(root, .25, 0x94ab81, x + .18, 1.15, z);
    }
    function handset(parent) {
        const g = group(parent);
        box(g, .1, .34, .12, C.ink);
        box(g, .19, .12, .18, C.ink, 0, .2, 0);
        box(g, .19, .12, .18, C.ink, 0, -.2, 0);
        return g;
    }
    function limb(parent, a, b, color, r = .065) {
        const m = cylinder(parent, r, 1, color);
        const update = (start, end) => { const d = end.clone().sub(start); m.position.copy(start).add(end).multiplyScalar(.5); m.scale.y = d.length(); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); };
        update(v(a), v(b));
        return { m, update };
    }
    function person(x, z, color = C.blue) {
        const g = group(root, x, 0, z);
        box(g, .46, .65, .32, color, 0, 1.04, 0);
        const head = sphere(g, .23, C.skin, 0, 1.58, 0);
        const hair = sphere(g, .235, 0x62584e, 0, 1.69, -.055);
        hair.scale.y = .65;
        sphere(g, .025, C.ink, -.078, 1.61, .212);
        sphere(g, .025, C.ink, .078, 1.61, .212);
        const legs = [];
        for (const dx of [-.13, .13]) {
            legs.push(box(g, .17, .57, .2, C.ink, dx, .4, 0));
            box(g, .22, .13, .34, C.ink, dx, .065, .055);
        }
        limb(g, [.29, 1.28, 0], [.32, .75, .02], color);
        sphere(g, .08, C.skin, .32, .72, .02);
        const upper = limb(g, [-.29, 1.28, 0], [-.34, .98, .02], color);
        const lower = limb(g, [-.34, .98, .02], [-.35, .74, .04], color);
        const hand = sphere(g, .085, C.skin, -.35, .74, .04), phone = handset(g);
        const a = { g, head, phone, hand, legs, pose(amount = 0) {
                const elbow = v([-.34, .98, .02]).lerp(v([-.62, 1.17, .12]), amount);
                const wrist = v([-.35, .74, .04]).lerp(v([-.38, 1.53, .06]), amount);
                upper.update(v([-.29, 1.28, 0]), elbow);
                lower.update(elbow, wrist);
                hand.position.copy(wrist);
                // The phone is attached to the wrist, outside the head's bounding sphere.
                phone.position.copy(wrist).add(v([-.045, .065, .025]));
                phone.rotation.z = -.12 * amount;
            } };
        a.pose();
        actors.push(a);
        return a;
    }
    function call(from, to, start, end) {
        const a = v(from), b = v(to), mid = a.clone().lerp(b, .5);
        mid.y = Math.max(a.y, b.y) + (kind === 'restaurants' ? 2.2 : 1.05);
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const wire = mesh(new THREE.TubeGeometry(curve, 50, .018, 8, false), C.blue, root);
        const pulse = sphere(root, .09, C.yellow);
        return { update(time) { const active = time >= start && time < end; wire.visible = pulse.visible = active; if (active)
                pulse.position.copy(curve.getPoint(((time - start) % 1.3) / 1.3)); } };
    }
    function travel(object, from, to, start, end, t, lift = .45) {
        const p = between(t, start, end);
        object.position.copy(v(from).lerp(v(to), p));
        object.position.y += Math.sin(p * Math.PI) * lift;
    }
    function platform(w, d, x = 0, z = 0) { box(root, w, .2, d, C.floor, x, -.12, z); }
    function board(x, y, z, w, h) {
        const g = group(root, x, y, z);
        box(g, w + .12, h + .12, .15, C.wood);
        box(g, w, h, .035, C.paper, 0, 0, .1);
        return g;
    }
    function approvals(x, z) {
        const g = group(root, x, 1.42, z);
        box(g, .55, .48, .1, C.yellow);
        const mark = check(g, 0, 0, .1, true, .6);
        return { g, mark };
    }
    let update, focus, description;
    if (kind === 'office') {
        platform(8, 5);
        plant(3.5, -1.4);
        desk(-2, -.45, 2.5);
        const monitor = board(-2, 2, -.65, 2.6, 1.65);
        const envelope = icon(monitor, 'mail', -.85, .48, .16, .6);
        for (let i = 0; i < 2; i++)
            box(monitor, .95, .035, .02, C.blue, .35, .6 - i * .18, .15);
        const morning = tile('sun', -.65, -.32, .19, monitor), afternoon = tile('afternoon', .65, -.32, .19, monitor);
        morning.scale.setScalar(.6);
        afternoon.scale.setScalar(.6);
        const choice = check(monitor, .93, -.57, .32, true, .6);
        const gate = approvals(-1.05, -.4);
        const sender = person(-3.4, .8, C.yellow), recipient = person(2.5, .6, C.blue);
        const recipientStand = board(2.5, 2.6, -.45, 1.6, 1.05);
        icon(recipientStand, 'sun', -.42, 0, .16, .65);
        icon(recipientStand, 'afternoon', .42, 0, .16, .65);
        const answerCheck = check(recipientStand, .62, -.3, .25, true, .6);
        const connection = call([-1.6, 2.7, 0], [2.1, 1.8, .7], 10, 16);
        const answer = tile('afternoon', 1.5, 1.8, 1.5);
        answer.name = 'confirmed-answer';
        moving.push(answer);
        // Front-of-desk route: the answer never crosses a person or the monitor volume.
        const draft = board(-2, 1.5, 1.45, 1.6, .9);
        icon(draft, 'mail', -.45, 0, .16, .7);
        icon(draft, 'afternoon', .4, 0, .17, .7);
        const pencil = group(root, -.9, 2.1, 1.5);
        const shaft = box(pencil, .065, .6, .065, C.yellow);
        shaft.rotation.z = -.55;
        const locked = icon(root, 'lock', -.7, 1.45, 1.5, .5);
        update = t => {
            const approved = t >= 8.5;
            gate.mark.visible = approved;
            gate.g.position.y = 1.42 - .06 * Math.sin(Math.PI * between(t, 8, 9));
            gate.g.scale.setScalar(1 + .12 * Math.sin(Math.PI * between(t, 7, 8.5)));
            sender.pose(0);
            recipient.pose(between(t, 10, 11) - between(t, 15.8, 16.8));
            connection.update(t);
            answerCheck.visible = t >= 14;
            choice.visible = t >= 19;
            envelope.position.y = .48 + .5 * (1 - between(t, 0, 1.2));
            morning.visible = t >= 1.2;
            afternoon.visible = t >= 2;
            answer.visible = t >= 14 && t < 19;
            travel(answer, [1.5, 2, 1.5], [-2, 1.5, 1.5], 16, 19, t);
            draft.visible = t >= 19;
            pencil.visible = t >= 21;
            locked.visible = t >= 19;
            if (!approved)
                gate.g.scale.setScalar(.85);
            pencil.position.y = 2.1 - .12 * Math.sin(Math.PI * between(t, 21, 23));
        };
        focus = t => t < 10 ? [-1.6, 1.4, 0, 5.5] : t < 16 ? [1.8, 1.7, .5, 4.7] : t < 19 ? [1.5 - 3.5 * between(t, 16, 19), 1.6, 1, 5.5] : [-1.5, 1.4, .6, 5.6];
        description = 'The unselected email choices remain visible until the called recipient picks afternoon. That choice travels back into an unsent draft.';
    }
    else if (kind === 'care') {
        platform(10, 5.5);
        plant(3.4, -1.5);
        // A living room, with the recipient standing in front of (not inside) the sofa.
        box(root, 2.3, .46, .85, C.blue, 2, .48, -1.1);
        box(root, 2.3, .8, .18, C.blue, 2, .88, -1.6);
        for (const x of [.85, 3.15])
            box(root, .2, .68, .85, C.blue, x, .62, -1.1);
        const recipient = person(2.3, .3, C.green), coordinator = person(-4.05, .9, C.yellow);
        desk(-2, -.8, 2.4);
        const approval = approvals(-2, -.8);
        const folder = board(-1.5, 1.5, 1.5, 2.5, 1.5);
        box(folder, .55, .2, .08, C.blue, -.7, .83, 0);
        const cleaning = tile('broom', 1.15, 2, 1.6), groceries = tile('basket', 1.15, 2, 1.6);
        cleaning.name = 'cleaning-request';
        groceries.name = 'grocery-request';
        moving.push(cleaning, groceries);
        const cleanTick = check(folder, -.55, -.49, .24, true, .65), foodTick = check(folder, .55, -.49, .24, true, .65);
        const firstCall = call([-2, 1.8, -.5], [1.85, 1.8, .35], 5, 10);
        const callback = call([1.85, 1.8, .35], [-2, 1.8, -.5], 12.5, 16);
        const pending = icon(folder, 'lock', 1, .58, .2, .45);
        update = t => {
            approval.mark.visible = t >= 4;
            approval.g.scale.setScalar(1 + .15 * Math.sin(Math.PI * between(t, 2, 4)));
            const lift = (between(t, 5, 6) - between(t, 10, 11)) + (between(t, 12.5, 13.5) - between(t, 16, 17));
            recipient.pose(lift);
            coordinator.pose(lift);
            firstCall.update(t);
            callback.update(t);
            cleaning.visible = t >= 7;
            groceries.visible = t >= 14;
            travel(cleaning, [1.15, 2, 1.6], [-2.05, 1.6, 1.7], 8, 11, t, .35);
            travel(groceries, [1.15, 2, 1.6], [-.95, 1.6, 1.7], 15, 18, t, .35);
            cleanTick.visible = t >= 11;
            foodTick.visible = t >= 18;
            pending.visible = t >= 19;
            // The complete record moves as one unit; both requests retain their distinct slots.
            const handoff = between(t, 20, 23) * .65;
            folder.visible = t >= 5;
            folder.position.x = -1.5 - handoff;
            cleaning.position.x -= handoff;
            groceries.position.x -= handoff;
        };
        focus = t => t < 5 ? [-2.2, 1.3, .3, 6] : t < 9 ? [1.7, 1.5, .3, 4.7] : t < 18 ? [-.6, 1.4, .7, 8.4] : [-1.8, 1.4, 1, 6.4];
        description = 'Two calls produce a broom request and a grocery request. Each enters its own slot on the same record; the coordinator receives both together.';
    }
    else if (kind === 'studio') {
        platform(9, 5.5);
        // Salon and diary share a single space; the waiting list is a visible queue of people.
        cylinder(root, .55, .12, C.ink, -3, .12, -.8);
        cylinder(root, .08, .6, C.ink, -3, .45, -.8);
        box(root, .95, .2, .8, C.blue, -3, .8, -.8);
        box(root, .95, .85, .17, C.blue, -3, 1.3, -1.2);
        for (const x of [-3.55, -2.45])
            box(root, .12, .15, .8, C.wood, x, 1.02, -.8);
        const calendar = board(-.6, 2, -.9, 2.4, 2);
        for (const x of [-1.35, -.6, .15])
            cylinder(root, .055, .2, C.ink, x, 3.05, -.9);
        for (let i = 0; i < 6; i++)
            box(calendar, .61, .56, .06, i === 4 ? C.yellow : 0xd4dfd7, -.75 + (i % 3) * .75, .4 - Math.floor(i / 3) * .75, .15);
        const old = tile('person', -.6, 1.65, -.66);
        old.scale.setScalar(.5);
        const queue = [person(1.3, 1.1, C.blue), person(2.5, 1.1, C.green), person(3.7, 1.1, 0x9a9d96)];
        const no = check(root, 1.3, 2.2, 1.12, false), yes = check(root, 2.5, 2.2, 1.12, true), stop = icon(root, 'lock', 3.7, 2.2, 1.12, .6);
        const first = call([-.6, 2.8, -.5], [.9, 1.8, 1.2], 6.25, 9.5), next = call([-.6, 2.8, -.5], [2.1, 1.8, 1.2], 10, 15.5);
        const booking = tile('person', 2.5, 2, 1.8, root, C.green);
        booking.scale.setScalar(.5);
        booking.name = 'accepted-contact';
        moving.push(booking);
        const booked = check(calendar, .23, -.35, .27, true, .65);
        update = t => {
            old.visible = t < 4;
            old.position.set(-.6, 1.65 + between(t, 1, 4) * 1.8, -.66);
            old.scale.setScalar(.5 * (1 - between(t, 3, 4)));
            queue[0].pose(between(t, 6.25, 7) - between(t, 9, 10));
            queue[1].pose(between(t, 10, 11) - between(t, 15.5, 16.5));
            queue[2].pose(0);
            first.update(t);
            next.update(t);
            no.visible = t >= 9;
            yes.visible = t >= 14;
            stop.visible = t >= 15.5;
            booking.visible = t >= 15.5;
            // Raise in front of the queue, then approach the empty diary slot from above.
            if (t < 20)
                travel(booking, [2.5, 2, 1.8], [-.6, 3.45, .2], 16.5, 20, t, .3);
            else
                travel(booking, [-.6, 3.45, .2], [-.6, 1.65, -.62], 20, 23, t, 0);
            booked.visible = t >= 23;
        };
        focus = t => t < 6.25 ? [-1.3, 1.6, -.4, 5.5] : t < 10 ? [1.3, 1.5, 1, 4.4] : t < 16.5 ? [2.5, 1.7, 1, 4.6] : t < 20 ? [2.5 - 3.1 * between(t, 16.5, 20), 2, .7, 5.7] : [-.2, 1.9, .2, 5.7];
        description = 'A diary slot empties. The first waiting contact declines, the second accepts, and the third stays uncalled. The accepted person is then added to the open slot.';
    }
    else if (kind === 'restaurants') {
        platform(12, 6.8, 0, .5);
        const xs = [-4.5, -1.5, 1.5, 4.5], colors = [0xb67858, C.yellow, C.green, C.blue];
        const staff = [], results = [], connections = [];
        for (let i = 0; i < 4; i++) {
            const x = xs[i], store = group(root, x, 0, -1.2);
            box(store, 2.5, 2, .9, C.paper, 0, 1, 0);
            box(store, 2.7, .18, 1.15, colors[i], 0, 2.1, 0);
            box(store, 1.35, .85, .06, 0xb6d2d5, -.25, 1.2, .49);
            box(store, .5, 1.4, .07, C.wood, .87, .7, .49);
            if (i === 0)
                for (let j = 0; j < 6; j++)
                    box(store, .43, .1, .65, j % 2 ? C.paper : C.red, -1.08 + j * .43, 1.9, .7);
            if (i === 1) {
                box(store, 1.05, .12, .12, C.wood, 0, 2.5, 0);
                sphere(store, .38, C.yellow, 0, 2.53, 0).scale.y = .4;
                box(store, .76, .09, .16, C.green, 0, 2.49, .1);
            }
            if (i === 2) {
                const roof = box(store, 2.9, .14, 1.3, C.green, 0, 2.2, 0);
                roof.rotation.z = .04;
                stroke(store, [[-.45, 2.45, .1], [.35, 2.85, .1]], C.wood, .04);
                stroke(store, [[-.25, 2.45, .1], [.55, 2.85, .1]], C.wood, .04);
            }
            if (i === 3) {
                for (let j = 0; j < 3; j++)
                    cylinder(store, .1, .28, C.paper, -.35 + j * .35, 2.4, 0);
            }
            staff.push(person(x, .35, colors[i]));
            const result = group(root, x, 2.8, .75);
            check(result, 0, 0, 0, i === 2, .75);
            results.push(result);
            connections.push(call([0, 1.2, 3.5], [x - .4, 1.8, .4], [6.25, 9.5, 12.5, 30][i], [9.5, 12.5, 17, 31][i]));
        }
        // The brief lives at home, separate from the restaurants. No delivery is animated.
        const brief = board(0, 1, 3.5, 2.5, .95);
        icon(brief, 'delivery', -.7, 0, .16, .8);
        const budgetCoins = [];
        for (let i = 0; i < 5; i++)
            budgetCoins.push(cylinder(brief, .11, .055, C.yellow, .2 + i * .22, -.2, .2));
        const price = group(root, -5.7, 1.8, 1.1);
        box(price, 1.05, 1.1, .08, C.paper);
        for (let i = 0; i < 7; i++)
            cylinder(price, .12, .08, C.yellow, 0, -.35 + i * .085, .16);
        box(price, .8, .04, .04, C.red, 0, .05, .32);
        const noDelivery = tile('delivery', -2.7, 1.8, 1.1);
        check(noDelivery, .22, -.3, .2, false, .65);
        const match = tile('delivery', 1.5, 2.9, 1);
        match.name = 'delivery-match';
        moving.push(match);
        check(match, .24, -.33, .2, true, .65);
        const uncalled = icon(root, 'lock', 4.5, 2.8, .75, .65);
        update = t => {
            budgetCoins.forEach((coin, i) => { coin.visible = t >= .5 + i * .25; });
            const starts = [6.25, 9.5, 12.5, 30], ends = [9.5, 12.5, 17, 31];
            staff.forEach((a, i) => { a.pose(between(t, starts[i], starts[i] + .65) - between(t, ends[i] - .65, ends[i])); connections[i].update(t); results[i].visible = i < 2 && t >= ends[i]; });
            price.visible = t >= 7 && t < 9.5;
            noDelivery.visible = t >= 10.2 && t < 12.5;
            match.visible = t >= 15;
            uncalled.visible = t >= 17;
            travel(match, [1.5, 2.9, 1], [.65, 1.4, 3.75], 18, 21, t, .3);
            match.scale.setScalar(1 - .3 * between(t, 18, 21));
        };
        focus = t => t < 6.25 ? [0, 1.7, 1.8, 7] : t < 9.5 ? [-4.5, 1.8, .6, 4.7] : t < 12.5 ? [-1.5, 1.8, .6, 4.7] : t < 18 ? [2.4, 1.8, .8, 6] : [1.7, 1.7, 1.8, 7.5];
        description = 'The delivery brief calls each storefront in order: price exceeds the budget, delivery is unavailable, then both conditions match. The result returns home while the fourth phone stays down.';
    }
    else
        throw new Error('Unknown scene kind: ' + kind);
    function sample(seconds) {
        const t = Math.max(0, Math.min(25, seconds));
        update(t);
        root.updateMatrixWorld(true);
        return focus(t);
    }
    sample(0);
    return { root, sample, description, actors, solids, moving };
}
