# Local Atlas starter pack

A single factual question becomes a dated answer with evidence that another visitor can reuse.

Adapted from [Local Atlas by Omar Miri](https://github.com/omarmiri/Local-atlas), source version `0b1095d1ad02530f3aead96c01e523e24dfd1a55`. The original project is MIT licensed; its notice is included below. The prompt and schema are building blocks, not a complete calling app.

## 1. Single-question prompt

Replace the business name and phone placeholders. This example asks about parking.

```text
Call {{business_name}} at {{phone_number}}.
Ask one question: “Is there parking on site?”

Let the staff member finish their greeting. Ask if it is a good moment for one quick question.
Before asking, say that you are an AI assistant calling for someone planning a visit.
If it is a bad time or they decline, thank them and end the call.
Ask only the stated question. If needed, ask at most one short clarification.
Never guess. Let them finish; then thank them and end the call.
Do not book, order, negotiate or collect personal or payment details.
If you reach voicemail or an automated menu, end without leaving a message.
```

## 2. Result schema

This keeps the author's field names and allowed statuses. Descriptions are shortened for this guide. An extraction schema does not itself prove an answer is true: the app must check call completion, request identity and the transcript before storing an answer.

```json
{
  "type": "object",
  "additionalProperties": false,
  "required": ["answer_status", "answer", "evidence_quote"],
  "properties": {
    "answer_status": {
      "type": "string",
      "enum": ["answered", "unclear", "refused", "unreachable", "unknown"]
    },
    "answer": {
      "type": "string",
      "description": "Use only what the business said. Write exactly unknown unless answer_status is answered."
    },
    "evidence_quote": {
      "type": "string",
      "description": "A direct staff quote supporting the answer, or an empty string when no usable quote exists."
    },
    "staff_confidence": {
      "type": "string",
      "enum": ["certain", "hedged", "unknown"]
    }
  }
}
```

## 3. Synthetic examples

The café and quotes below are fictional. No call was placed for these examples.

```json
{
  "answer_status": "answered",
  "answer": "Yes. There is a customer lot behind the café.",
  "evidence_quote": "Yes, we have a small customer lot out back.",
  "staff_confidence": "certain"
}
```

```json
{
  "answer_status": "unclear",
  "answer": "unknown",
  "evidence_quote": "I’m not sure — I’d have to check.",
  "staff_confidence": "unknown"
}
```

Local Atlas adds `collectedAt`, `expiresAt`, `simulated` and the originating call ID when storing an FAQ. Preserve the simulation flag when displaying test data. Shared FAQs can be reused; private answers remain private.

## 4. Run the author's app without a CALL-E key

Prerequisites: Git, Node.js 20+, npm, internet access for place search, and no Supabase configuration for review mode. These shell commands work on macOS/Linux.

```sh
git clone https://github.com/omarmiri/Local-atlas.git
cd Local-atlas
git checkout 0b1095d1ad02530f3aead96c01e523e24dfd1a55
npm install
REVIEW_MODE=1 CALLE_DRY_RUN=1 npm start
```

1. Open http://localhost:10000. Search a US or Canadian town.
2. Open a place with a listed phone number, then open “Ask the Place.”
3. Choose a preset question. Wait for its simulated result.
4. Ask the same question again to see the stored result reused.

Outcomes may be answered, unclear, refused or unreachable. `CALLE_DRY_RUN=1` prevents real calls even if a CALL-E key is present. Review mode requires Supabase to be unconfigured; a fresh clone has no user credentials. The simulated path skips the confirmation gate used by real calls.

## 5. Before making real calls

- Answered shared FAQs default to 90 days; other outcomes to one day. This version does not shorten expiry based on question type. Use a stricter policy for time-sensitive questions.
- Real calls need credentials, an access code, a callable number and explicit confirmation. This guide does not verify live calling.
- Preset questions work without an external moderation model; custom questions require one.

## Links

- [Author-hosted app](https://local-atlas-api.onrender.com/)
- [Author demo video](https://youtu.be/VHswi1U5qkE)
- [Pinned source](https://github.com/omarmiri/Local-atlas/tree/0b1095d1ad02530f3aead96c01e523e24dfd1a55)
- [Setup guide](https://github.com/omarmiri/Local-atlas/blob/0b1095d1ad02530f3aead96c01e523e24dfd1a55/README.md#run-locally)
- [App issues](https://github.com/omarmiri/Local-atlas/issues)
- [Case feedback](https://github.com/CALLE-AI/community-cases/issues)

## Original license

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
