# CALL-E Community Cases

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Community readers and builders looking for concrete CALL-E phone tasks and material they can reuse.

## Product Purpose

Help visitors understand the value of a phone task and obtain reusable material before they need to read source code.

## Operating Context

This is an existing static HTML/CSS/JavaScript site. The homepage in `index.html` lists Local Atlas and HungryCall using shared card styles. Full guides live in `local-atlas.html` and `hungrycall.html`; the homepage does not repeat a case's detail sections. Local Atlas also provides `examples/local-atlas-starter.md`. The guides offer app and demo entries before source links.

## Capabilities and Constraints

- Local Atlas asks a business one factual question, saves the answer with supporting words and a collection date, and lets later visitors reuse a valid shared answer.
- The starter contains an adapted prompt, result schema, synthetic examples and instructions for the author's local simulation. It is not a complete calling app.
- Answered FAQs default to 90 days; other outcomes to one day. Expiry is not adjusted by question type, so time-sensitive answers need a stricter policy.

## Brand Commitments

Preserve the official CALL-E logo and the incumbent warm white, yellow-and-blue, dark-button appearance evidenced in `index.html` and `assets/local-atlas.css`. This sample extends the existing site; it does not establish a replacement visual system.

The two case guides share the same illustrated opening, page navigation, type scale, action styles and evidence layout. Neutral reading surfaces keep the long guides legible; blue marks links and yellow marks the closing action. Local Atlas places its synthetic answer beside the walkthrough, while HungryCall shows an ordered candidate sequence. Both retain their original links and reusable material.

Shared design rules live in [DESIGN.md](DESIGN.md). Project skill routing and implementation checks live in [AGENTS.md](AGENTS.md).

## Evidence on Hand

- Reviewed Local Atlas source: `0b1095d1ad02530f3aead96c01e523e24dfd1a55`. The recorded 19 Oct 2026 checks include 98 passing repository tests and an HTTP simulation of creation, polling, FAQ storage and reuse; these are prior results, not newly rerun checks.
- The recorded 22 Oct 2026 check loaded the public app, returned Boston places and confirmed that repository HEAD still matched the reviewed source. Sign-in and live calling were not tested.
- The café, answer and quotes shown in the sample are explicitly synthetic. Neither these examples nor the simulation establish a real call, production reliability or community adoption.

## Ownership and Publication

- Omar Miri maintains Local Atlas under the MIT license; the starter retains its notice. CALL-E maintains the editorial case guide and receives case feedback. App issues belong in the author's repository.
- GitHub Pages publishes this repository's `main` branch at [CALL-E Community Cases](https://calle-ai.github.io/community-cases/). The Local Atlas editorial copy is still awaiting the author's review.
