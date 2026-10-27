# Local Atlas demo sources

Source: https://github.com/omarmiri/Local-atlas/tree/0b1095d1ad02530f3aead96c01e523e24dfd1a55

`product.css` is the complete original inline stylesheet. `product.js` preserves the original public facts renderer, icons, escaping, freshness labels and waiting line. `product.html` supplies a browser-only mock transport and isolates the styles. No account, map provider or real calling backend runs in this example. The parent demo follows the source exact-question cache key, expiry and replace-on-save behavior; semantic matching and private actions are outside the sample.

`story-faq.html` uses the same original `factHTML` renderer in the “See the saved FAQ” disclosure below the animation, with larger text, an explicit collection date and no recheck control. The animation is an original explanation, not a recording of the author's app.

`cafe-scene.mjs` is original café scene code for this explanation. It uses Three.js 0.180.0 (r180), with two browser modules vendored from the official npm package. Package provenance and verified SHA-512 integrity are recorded in [vendor/SOURCE.md](vendor/SOURCE.md); the renderer's original MIT license is retained in [vendor/THREE-LICENSE.txt](vendor/THREE-LICENSE.txt). No package installation or scripts were run.

`cafe-poster.webp` is a crop of the current café scene captured in the browser and resized to 812×400, used when WebGL is unavailable or its context is lost. It is not AI-generated.

`narration-female-sweet.mp3` is English narration generated with ECNU `ecnu-tts`, voice `female_sweet`, on 27 October 2026. Pauses at measured sentence boundaries align it with the 25-second animation. It is not a recording of a phone call. Generation parameters, transcript and hashes are in `narration.json`; API credentials are not distributed with this site. Audio plays only after an explicit narration action, and is fully buffered locally so seeking also works on preview servers without HTTP Range support.

## Original Local Atlas component license

MIT License

Copyright (c) 2026 Omar Miri

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
