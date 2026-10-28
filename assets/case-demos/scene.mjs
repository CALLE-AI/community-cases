import * as THREE from '../local-atlas-demo/vendor/three.module.min.js';
import { buildStory } from './stories.mjs?v=581ae40e65';
export function createScene(host, config) {
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(devicePixelRatio || 1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0xeaf2fb, 1);
    host.append(renderer.domElement);
    const scene = new THREE.Scene();
    const story = buildStory(config.kind);
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
    function cameraAt(time) {
        // Blend across shot cuts without depending on playback direction or frame rate.
        const cutTimes = config.kind === 'office' ? [10, 16, 19] : config.kind === 'care' ? [5, 9, 18] : config.kind === 'studio' ? [6.25, 10, 16.5, 20] : [6.25, 9.5, 12.5, 18];
        let pose = story.sample(time);
        for (const cut of cutTimes) {
            if (time >= cut && time < cut + .8) {
                const before = story.sample(cut - .001), p = (time - cut) / .8, s = p * p * (3 - 2 * p);
                pose = pose.map((n, i) => before[i] + (n - before[i]) * s);
                story.sample(time);
                break;
            }
        }
        return pose;
    }
    function render(progress = last, reduced = false) {
        last = progress;
        if (lost)
            return;
        const beat = Math.min(3, Math.floor(progress * 4));
        const time = reduced ? Math.min(25, (beat + 1) * 6.25 - .001) : progress * 25;
        const pose = reduced ? story.sample(time) : cameraAt(time);
        const aspect = width / height;
        // Portrait shots retain a minimum horizontal safe area rather than cropping arms/props.
        const halfHeight = Math.max(config.kind === 'restaurants' ? 3.1 : config.kind === 'studio' ? 2.8 : 2.5, pose[3] / (2 * aspect));
        camera.left = -halfHeight * aspect;
        camera.right = halfHeight * aspect;
        camera.top = halfHeight;
        camera.bottom = -halfHeight;
        camera.position.set(pose[0] + .7, pose[1] + 5.2, pose[2] + 12);
        camera.lookAt(pose[0], pose[1], pose[2]);
        camera.updateProjectionMatrix();
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
