const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');

const root = resolve(__dirname, '..');
const script = readFileSync(resolve(root, 'assets/local-atlas.js'), 'utf8');
const html = readFileSync(resolve(root, 'local-atlas.html'), 'utf8');
const pack = readFileSync(resolve(root, 'examples/local-atlas-starter.md'), 'utf8');
const snippets = Object.fromEntries([...html.matchAll(/<code id="([^"]+)">([\s\S]*?)<\/code>/g)].map(([, id, text]) => [id, text]));

function setup(writeText) {
  const buttons = Object.keys(snippets).map(id => ({
    dataset: { copy: id },
    nextElementSibling: { textContent: '' },
    addEventListener(event, handler) { this.click = handler; }
  }));
  vm.runInNewContext(script, {
    document: {
      querySelectorAll: () => buttons,
      getElementById: id => ({ textContent: snippets[id] })
    },
    navigator: { clipboard: { writeText } }
  });
  return buttons;
}

test('copy controls copy the complete snippet, also included in the download', async () => {
  const copied = [];
  for (const button of setup(async text => copied.push(text))) {
    await button.click();
    assert.equal(copied.at(-1), snippets[button.dataset.copy]);
    assert.ok(pack.includes(copied.at(-1)));
    assert.equal(button.nextElementSibling.textContent, 'Copied.');
  }
  assert.equal(copied.length, 3);
  assert.equal(JSON.parse(snippets['result-schema']).type, 'object');
});

test('clipboard denial provides an actionable fallback without claiming success', async () => {
  const [button] = setup(async () => { throw new Error('Clipboard denied'); });
  await button.click();
  assert.match(button.nextElementSibling.textContent, /Select the text or download/);
  assert.doesNotMatch(button.nextElementSibling.textContent, /Copied/);
});
