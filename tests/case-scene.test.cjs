const { test } = require('node:test');
const assert = require('node:assert/strict');
const load = () => Promise.all([import('../assets/case-demos/stories.mjs'), import('../assets/local-atlas-demo/vendor/three.module.min.js')]);
for (const kind of ['office', 'care', 'studio', 'restaurants']) {
    test(kind + ': full timeline keeps phones outside heads and moving records clear of people', async () => {
        const [{ buildStory }, THREE] = await load();
        const story = buildStory(kind);
        for (let frame = 0; frame <= 750; frame++) {
            story.sample(frame / 30);
            for (const actor of story.actors) {
                const head = new THREE.Box3().setFromObject(actor.head);
                const phone = new THREE.Box3().setFromObject(actor.phone);
                assert.equal(head.intersectsBox(phone), false, `phone/head at ${frame / 30}s`);
                for (const item of story.moving)
                    if (item.visible) {
                        assert.equal(new THREE.Box3().setFromObject(actor.g).intersectsBox(new THREE.Box3().setFromObject(item)), false, `record/person at ${frame / 30}s`);
                        for (const solid of story.solids)
                            assert.equal(new THREE.Box3().setFromObject(item).intersectsBox(solid.box), false, `record/${solid.name} at ${frame / 30}s`);
                    }
                for (const leg of actor.legs)
                    for (const solid of story.solids) {
                        assert.equal(new THREE.Box3().setFromObject(leg).intersectsBox(solid.box), false, `leg/${solid.name}`);
                    }
            }
        }
    });
    test(kind + ': seeking backwards exactly reconstructs the scene', async () => {
        const [{ buildStory }] = await load();
        const story = buildStory(kind);
        const snapshot = () => { const out = []; story.root.traverse(o => out.push([o.visible, ...o.position.toArray(), ...o.quaternion.toArray(), ...o.scale.toArray()])); return out; };
        for (const time of [0, 6.25, 9.5, 12.5, 16, 18.75, 22, 25]) {
            story.sample(time);
            const before = snapshot();
            story.sample(25);
            story.sample(4);
            story.sample(time);
            assert.deepEqual(snapshot(), before);
        }
    });
}
test('care retains both requests through handoff; the untouched restaurant phone stays down', async () => {
    const [{ buildStory }] = await load();
    const care = buildStory('care');
    care.sample(11);
    assert.equal(care.moving[0].visible, true);
    assert.equal(care.moving[1].visible, false);
    for (const t of [18, 20, 23, 25]) {
        care.sample(t);
        assert.ok(care.moving.every(o => o.visible));
        assert.ok(care.moving[1].position.x - care.moving[0].position.x > 1);
    }
    const food = buildStory('restaurants');
    food.sample(0);
    const untouched = food.actors[3].phone.position.clone();
    for (let t = 0; t <= 25; t += .1) {
        food.sample(t);
        assert.ok(food.actors[3].phone.position.equals(untouched));
    }
});

function projectedBox(object, camera, THREE) {
    const bounds = new THREE.Box3().setFromObject(object), result = new THREE.Box2();
    for (const x of [bounds.min.x, bounds.max.x])
        for (const y of [bounds.min.y, bounds.max.y])
            for (const z of [bounds.min.z, bounds.max.z]) {
                const point = new THREE.Vector3(x, y, z).project(camera);
                result.expandByPoint(new THREE.Vector2(point.x, point.y));
            }
    return result;
}

for (const kind of ['office', 'care', 'studio', 'restaurants']) {
    test(kind + ': moving records never mask faces through camera transitions', async () => {
        const [{ buildStory }, THREE] = await load();
        const { positionCamera } = await import('../assets/case-demos/scene.mjs');
        const story = buildStory(kind), camera = new THREE.OrthographicCamera(-8, 8, 5, -5, .1, 100);
        for (const aspect of [1120 / 480, 269 / 360]) {
            for (let frame = 0; frame <= 750; frame++) {
                positionCamera(camera, story, kind, frame / 30, aspect);
                for (const record of story.moving) if (record.visible) {
                    const recordBounds = projectedBox(record, camera, THREE);
                    assert.ok(recordBounds.min.x >= -1 && recordBounds.max.x <= 1 && recordBounds.min.y >= -1 && recordBounds.max.y <= 1, `${record.name} clipped at ${frame / 30}s, aspect ${aspect}`);
                    for (const actor of story.actors) {
                        const overlap = recordBounds.clone().intersect(projectedBox(actor.head, camera, THREE));
                        const size = overlap.getSize(new THREE.Vector2());
                        assert.ok(size.x <= .005 || size.y <= .005, `${record.name} masks a face at ${frame / 30}s, aspect ${aspect}`);
                    }
                }
            }
        }
    });
}
