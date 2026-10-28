# RingBack — play the opening

One state drives the native 3D scene, call replies, waiting list and local diary. No video player, narration track, progress bar, separate form or detached mock.

Start with Thursday 14:00 available. Call Alex, hear the decline, then call Sam. The visitor can choose acceptance or an unclear answer. A clear acceptance stops the waiting list before an availability check; an unclear answer ends in human review. Changing availability before saving produces a conflict without booking. All terminal results remain on screen until restart.

Without input, default actions run after a visible 3–6 second countdown. Pointer movement, clicks, typing and scrolling restart the wait. A stationary pointer or keyboard focus does not hold the countdown; after input stops, the same default flow continues to its result. Pause auto is explicit. Offscreen/hidden pages stop both idle time and spatial motion. Reduced motion begins with auto paused and suppresses gestures.

Reuse the salon and two home scenes. The stylist walks to the desk using the local Claude Motion people-gait module. A short arrival shot settles into each location; the ringing phone rises to the ear, listening gestures continue, and the accepted appointment slip lands on the physical diary only after a successful save. Native diary and call controls occupy a compact side surface, with at least 44px targets. At 900px and below, the scene occupies the upper 360px and the controls sit below it. If WebGL is unavailable, the same interactive controls and state remain usable.

The fictional scenario produces no real calls, messages or appointments. The other cases retain their existing player and mock.

Phone poses reuse huashu-art-motion’s fixed-length two-bone solver. The earpiece is anchored beside the ear, the screen faces inward and the hand grips the device. Source and adaptation details are in ADAPTATION.md.

Motion budget: render in sync with the display while visible; do not add a drifting 30fps timer. Input resets only the automatic-action countdown, never the animation clock. No rendering or CSS loops offscreen. Reduced motion renders settled poses on state changes and starts auto paused. No new runtime dependency.

Accepted baseline: the user approved the scene, interaction and smoothness on 28 October 2026. Future case revisions follow the interaction-scene acceptance criteria in ../../DESIGN.md.
