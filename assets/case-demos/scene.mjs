import { mountScene } from '../scene-kit.mjs?v=ad2cd48ede';
import { buildStory } from './stories.mjs?v=5c20052d5b';
export function createScene(host, kind) { return mountScene(host, buildStory(kind)); }
