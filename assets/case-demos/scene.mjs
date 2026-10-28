import { timing, chapterAt, storyTime } from './timing.mjs?v=241e38dd42';
import * as THREE from '../local-atlas-demo/vendor/three.module.min.js';
import { buildStory } from './stories.mjs?v=496da7488b';
function cameraPose(story, kind, time, reduced) {
    let pose = story.sample(time);
    if (reduced)
        return pose;
    const cuts = kind === 'office' ? [10, 16, 19] : kind === 'care' ? [5, 9, 18] : [6.25, 9.5, 12.5, 18];
    for (const cut of cuts) {
        if (time >= cut && time < cut + .8) {
            const before = story.sample(cut - .001), p = (time - cut) / .8, blend = p * p * (3 - 2 * p);
            pose = pose.map((value, index) => before[index] + (value - before[index]) * blend);
            story.sample(time);
            break;
        }
    }
    return pose;
}
export function positionCamera(camera, story, kind, time, aspect, reduced = false) {
    const pose = cameraPose(story, kind, time, reduced);
    // Portrait shots retain a minimum horizontal safe area rather than cropping arms/props.
    const halfHeight = Math.max(kind === 'restaurants' ? 3.1 : 2.5, pose[3] / (2 * aspect));
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(pose[0] + .7, pose[1] + 5.2, pose[2] + 12);
    camera.lookAt(pose[0], pose[1], pose[2]);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld(true);
}
export function createScene(host, config) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xeaf2fb, 1);
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const loader = new THREE.TextureLoader();
    const textures = Object.fromEntries([['mark', 'call-e-mark.svg'], ['wordmark', 'call-e-logo.svg']].map(([key, file]) => {
        const texture = loader.load(new URL('../' + file, import.meta.url).href, () => resize());
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        return [key, texture];
    }));
    const story = buildStory(config.kind, textures);
    scene.add(story.root);
    renderer.domElement.setAttribute('role', 'img');
    renderer.domElement.setAttribute('aria-label', story.description);
    scene.add(new THREE.HemisphereLight(0xffffff, 0xb9b5a2, 2.4));
    const light = new THREE.DirectionalLight(0xfff4dc, 3);
    light.position.set(-3, 9, 6);
    light.castShadow = true;
    light.shadow.mapSize.set(2048, 2048);
    Object.assign(light.shadow.camera, { left: -12, right: 12, top: 10, bottom: -10 });
    light.shadow.normalBias = .025;
    scene.add(light);
    const camera = new THREE.OrthographicCamera(-8, 8, 5, -5, .1, 100);
    let width = 1, height = 1, last = 0, lost = false;
    function render(progress = last, reduced = false) {
        last = progress;
        if (lost)
            return;
        const seconds = progress * 25, beat = chapterAt(config.kind, seconds);
        const settled = (timing[config.kind].chapters[beat + 1] ?? 25) - .001;
        const time = storyTime(config.kind, reduced ? settled : seconds);
        positionCamera(camera, story, config.kind, time, width / height, reduced);
        if (renderer.getPixelRatio() !== (devicePixelRatio || 1))
            renderer.setPixelRatio(devicePixelRatio || 1);
        renderer.render(scene, camera);
        host.dataset.beat = String(beat);
        host.dataset.renderer = 'webgl';
    }
    function resize() {
        const rect = host.getBoundingClientRect();
        width = Math.max(1, rect.width);
        height = Math.max(1, rect.height);
        renderer.setSize(width, height, false);
        render(last, matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
    new ResizeObserver(resize).observe(host);
    renderer.domElement.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; host.dataset.renderer = 'fallback'; });
    renderer.domElement.addEventListener('webglcontextrestored', () => { lost = false; resize(); });
    resize();
    return { render };
}
