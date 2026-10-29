# RingBack motion sources

The two-bone inverse-kinematics solver in `ik2.mjs` is adapted from `RIG.ik2` in [huashu-art-motion, scripts/engine/lib/rig.js](https://github.com/alchaincyf/huashu-art-motion/blob/8a0d7d72ca65fcce6f8ba82c4a6c8dfe35b8422c/scripts/engine/lib/rig.js), commit `8a0d7d72ca65fcce6f8ba82c4a6c8dfe35b8422c`. Copyright 2026 alchaincyf (花叔 · 花生), MIT; the full notice is retained in `LICENSE-HUASHU`.

Retained: the original fixed-length, two-bone angle calculation, elbow direction and reachable hand position. Adapted: ES module export, self-contained clamp and small-coordinate reach limits, including the folded-arm singularity. The shared [scene-kit.mjs](../scene-kit.mjs) maps its two-dimensional solution into the shoulder–wrist plane. The original character artwork and video pipeline are not used.

The existing RingBack character, rooms and interactive workflow remain in use. New contact anchors place the phone earpiece beside the ear with its screen facing inward. A single grip carries the palm, fingers and phone; the elbow follows that grip with constant upper-arm and forearm lengths. The phone travels outside the head before settling into contact, then follows the head's response gesture.

The RingBack character, grip rig, scene primitives, materials and renderer are now shared through `../scene-kit.mjs`. RingBack retains its salon, rooms, camera choreography and workflow modules. Conversation-Clarify, Care Call AI and HungryCall use the same kit with independently authored scene layouts and choreography in `../case-demos/stories.mjs`; they do not replace the rig with a separate character implementation.

`gait.mjs` is copied from the restored local Claude Motion `assets/extensions/people-gait/template/gait.js`. It ports the JOINTS table and Catmull-Rom interpolation from [stefanomainardi/omacrt, shell/src/people.rs](https://github.com/stefanomainardi/omacrt/blob/8a643fdeffc79f7cf965e68c5699caa0e1280771/shell/src/people.rs), commit `8a643fdeffc79f7cf965e68c5699caa0e1280771`. Copyright 2026 Stefano Mainardi, MIT; the notice is retained in `LICENSE-PEOPLE`. RingBack uses the joint angles for the stylist's short walk and keeps its existing character meshes, camera and workflow state. No upstream speech or cleanup script runs in the demo.

Verification checks the earpiece–ear gap, inward-facing screen, fixed arm lengths, mesh bounds in the head's coordinate frame, panel clearance, deterministic reset and reduced-motion poses. Visual acceptance still requires reviewing the actual receiving, holding and lowering motions.
