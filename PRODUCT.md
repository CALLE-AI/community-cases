# CALL-E Community Cases

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Community readers and builders looking for concrete CALL-E phone tasks and material they can reuse.

## Product Purpose

Show what community projects help people do with CALL-E, how to use them and what output to expect. Help visitors try a demo or adapt the idea before they need to read source code.

The public story follows the problem, usage, example outcome and next step. Internal source audits and test counts support editorial accuracy; they are not showcase sections or card status labels. State material conditions beside the relevant demo, result or instruction. Mark illustrative examples and simulations where readers encounter them.

## Operating Context

This is an existing static HTML/CSS/JavaScript site. The homepage in `index.html` groups the four CALL-E Hackathon main-award projects together: Local Atlas, Conversation-Clarify, Care Call AI and RingBack. HungryCall remains under more community cases. All five use shared card styles and have a separate HTML guide; the homepage does not repeat their detail sections. Local Atlas also provides `examples/local-atlas-starter.md`. The guides offer app and demo entries before source links.

The Local Atlas page places a full-width, 25-second Three.js WebGL café story above a clickable mock. In the scene, a visitor types and sends a parking question; a café cutaway reveals staff answering the telephone. The reply gains staff and date provenance and shrinks into a persistent shared-FAQ marker. Another visitor asks the same question and receives a copy while the original remains at the café and the call count stays at one. The location label and connection caption occupy separate layout rows outside the canvas. “See the saved FAQ” reveals the original native FAQ renderer; the lower mock retains the author's original public-facts components inside a style-isolated iframe.

## Capabilities and Constraints

- Local Atlas asks a business one factual question, saves the answer with supporting words and a collection date, and lets later visitors reuse a valid shared answer.
- The explanation plays silently by default; an explicit narration action starts generated English speech from the beginning. Pause, replay and paused seeking keep narration and visuals aligned. Ask, Call, Save and Reuse buttons seek to a scene and pause playback; playback also pauses offscreen or when the page is hidden. Reduced motion starts at the completed result and removes spatial movement during explicit playback. A text transcript and silent playback remain available if narration fails.
- The browser mock offers two fixed synthetic questions and reuses a valid answer for the same normalized question. Visitors can recheck or reset; state lasts only for the open page. It uses no account, map service, API key or real phone call.
- The starter contains an adapted prompt, result schema, synthetic examples and instructions for the author's local simulation. It is not a complete calling app.
- Answered FAQs default to 90 days; other outcomes to one day. Expiry is not adjusted by question type, so time-sensitive answers need a stricter policy.

## Brand Commitments

Preserve the official CALL-E logo and the incumbent warm white, yellow-and-blue, dark-button appearance evidenced in `index.html` and `assets/local-atlas.css`. This sample extends the existing site; it does not establish a replacement visual system.

The case guides share page navigation, type scale and action styles. Neutral reading surfaces keep the guides legible; blue marks links and yellow marks the closing action. Each guide explains its workflow, shows an example output and offers available material. Original concept illustrations, animations and written examples do not establish actual calls or fulfillment.

Detail pages use one compact header with the CALL-E logo and a return-to-cases link. The case name is the main heading, with its purpose in the introduction. Three chapter links follow the opening: Workflow, Example and Try it (Explore for the proprietary Care Call AI project). The Local Atlas page uses Watch the flow, Try the mock and Build your own. Documentation and Dashboard links appear in the footer. Existing evidence anchors lead to the visible example output or mock.

Shared design rules live in [DESIGN.md](DESIGN.md). Project skill routing and implementation checks live in [AGENTS.md](AGENTS.md).

## Internal Editorial Evidence

- Reviewed Local Atlas source: `0b1095d1ad02530f3aead96c01e523e24dfd1a55`. The recorded 19 Oct 2026 checks include 98 passing repository tests and an HTTP simulation of creation, polling, FAQ storage and reuse; these are prior results, not newly rerun checks.
- The recorded 22 Oct 2026 check loaded the public app, returned Boston places and confirmed that repository HEAD still matched the reviewed source. Sign-in and live calling were not tested.
- The café, answer and quotes shown in the sample are explicitly synthetic. Neither these examples nor the simulation establish a real call, production reliability or community adoption.
- The final main-award list was reread on 23 Oct 2026: Local Atlas — Most Practical; Conversation-Clarify — Most Innovative; Care Call AI and RingBack — Honorable Mention. Feedback prizes are outside this project-case batch.
- The 19 Oct source audit recorded Conversation-Clarify at `f21212b989b966ef8dec3a56cb1d4dba28c179a2`, Care Call AI at `b10621eb343a40de99cc5f1e80931b9f163eb0b7` and RingBack at `644db89627a5c5310435e724e45d453a05bfaca5`. Their submitted PR heads or application HEAD, README material and licenses were reread on 23 Oct. The recorded test counts are dated prior results, not tests rerun while writing these guides.
- Conversation-Clarify's reviewed gate has known false acceptances, and its Gmail compose action does not bind to the original thread or recipient. RingBack's full suite recorded two stale date-fixture failures; its simulated end-to-end bench passed. Neither guide claims live end-to-end validation.
- Care Call AI's public application is proprietary and allows limited hackathon evaluation. Its guide is original editorial prose and concept art, links to the author, and distributes no application code or design assets. Production deployment, Siri hardware and real support fulfillment remain unverified.
- HungryCall's public demo uses saved responses with calling disabled. The earlier case review recorded two author-reported sessions to one consenting test number, with the author playing the restaurant roles; these do not establish real restaurant orders.

## Ownership and Publication

- Omar Miri maintains Local Atlas under the MIT license; the starter retains its notice. CALL-E maintains the editorial case guide and receives case feedback. App issues belong in the author's repository.
- GitHub Pages publishes this repository's `main` branch at [CALL-E Community Cases](https://calle-ai.github.io/community-cases/). The Local Atlas editorial copy is still awaiting the author's review.
