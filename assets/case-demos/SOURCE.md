# Community workflow demonstrations

These four scenes, mock controls and fictional fixtures are original CALL-E editorial implementations of the workflows already documented in the case guides. They are not recordings or replicas of the authors’ applications. No application code or design asset from proprietary Care Call AI is redistributed. The individual guides retain their author links, licensing information and known limitations; those limitations still apply to the actual applications. The mock uses deliberately simple, deterministic choices, not the authors’ detection or answer-validation algorithms.

The native scenes reuse the site's official vendored Three.js 0.180.0 modules and existing playback controller. See ../local-atlas-demo/vendor/SOURCE.md and its retained MIT license. English text is native HTML. All shown people, messages, requests, restaurant responses and bookings are fictional; mock state is page-local and makes no calls or external submissions.

The four MP3 files were generated on 28 October 2026 with ECNU ecnu-tts, voice female_sweet, then tempo-adjusted for the 25-second explanations. Each companion JSON records the script, original generation parameters and source/final hashes. Credentials are retrieved from the local keychain during generation and are never included in this site. Sound requires an explicit action; captions and transcripts remain available without audio or WebGL.

The scene geometry and absolute-time choreography are in `stories.mjs`; `scene.mjs` owns rendering, responsive camera framing and context recovery. Each case has its own layout and actions. Phones follow articulated wrists; request and answer cards travel through clear foreground routes. Care retains two distinct request slots. RingBack inserts the accepting contact into the diary. HungryCall returns a match record, never a delivered parcel. No scene uses floating text over a character.

`timing.mjs` maps each narration’s phrase boundaries to the scene choreography and chapter previews. Care Call AI and HungryCall use four individually verified speech segments, padded to their chapter boundaries; their JSON files retain segment parameters and hashes. Narration downloads hold the opening frame, and subsequent playback controls cancel a pending narration start.

Scene checks sample the actual camera projection at 30 fps in desktop and narrow portrait aspect ratios, checking moving records against faces and viewport edges in addition to world-space clearance. RingBack’s accepted-contact card travels above Sam; HungryCall moves the returned match sideways before lowering it past the chef.

Official CALL-E SVGs appear on the active call relay and inside returned records. They are scene-attached surfaces with depth testing, not page overlays. Record branding stays within the original card outline; relay geometry is included in face-clearance, viewport and solid-intersection checks.
