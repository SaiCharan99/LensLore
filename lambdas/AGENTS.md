# Lambdas — Agent Orientation

TypeScript Lambda functions that run on Node 20. **Phase 3 — not started yet.**

This directory is empty. Build it here.

---

## What to build

Two Lambda functions:

| Function | Trigger | Purpose |
|----------|---------|---------|
| `story-generator` | Symfony API (SDK invoke) | Given image + note, call Claude vision, return DesignSpec JSON |
| `go-deeper` | Symfony API (SDK invoke) | Given photo ID + conversation history + new message, return Claude response |

---

## Step-by-step setup

```bash
cd lambdas

# 1. Initialise the project
npm init -y
npm install @anthropic-ai/sdk
npm install --save-dev typescript esbuild @types/node @types/aws-lambda vitest

# 2. Create tsconfig.json (strict, target ES2022, moduleResolution node)
# 3. Create esbuild.config.ts for bundling
# 4. Build: npm run build → dist/{function-name}/index.js
# 5. Test: npm test
```

---

## story-generator Lambda

### Input (from Symfony via AWS SDK invoke)

```typescript
interface StoryGeneratorInput {
  imageBase64: string;   // base64-encoded JPEG/PNG, max 5MB
  userNote: string;      // the photographer's written note
  mood?: string;         // optional mood hint from the frontend
}
```

### Output (returned to Symfony, passed to frontend)

```typescript
interface DesignSpec {
  palette: { bg: string; fg: string; accent: string; muted: string; };
  layout: 'centered-stacked' | 'asymmetric-left' | 'asymmetric-right'
        | 'vertical-rule' | 'minimal-corner' | 'frame-bordered';
  headingFont: 'Playfair Display' | 'EB Garamond';
  motif: 'horizon-rule' | 'ornamental-flourish' | 'rain-streaks'
       | 'small-crest' | 'thin-lines' | 'tide-line' | 'storm-line';
  title: string;    // 3-6 word evocative title in literary style
  caption: string;  // user's note, grammar-corrected, voice preserved
  mood: string;     // 1-2 words: e.g. "liminal", "amber-stillness"
}
```

### Claude prompt (copy this exactly)

```
You are an editorial designer for a nature memoir web app. Given a photographer's note and photo, design a personalised page.

Photographer's note: "{userNote}"

Return ONLY a valid JSON object (no markdown, no commentary) with this shape:
{
  "palette": {
    "bg": "#hex (deep, atmospheric, derived from the mood — dark)",
    "fg": "#hex (warm cream/parchment text colour, high contrast on bg)",
    "accent": "#hex (single saturated accent — picked from the photo's mood)",
    "muted": "#hex (low-contrast, for borders/decoration)"
  },
  "layout": "one of: centered-stacked | asymmetric-left | asymmetric-right | vertical-rule | minimal-corner | frame-bordered",
  "headingFont": "one of: Playfair Display | EB Garamond",
  "motif": "one of: horizon-rule | ornamental-flourish | rain-streaks | small-crest | thin-lines | tide-line | storm-line",
  "title": "a 3-6 word evocative title in literary style, drawn from the note",
  "caption": "the photographer's note, lightly edited for grammar and flow only — keep their voice, do NOT rewrite or extend",
  "mood": "one or two words: e.g. liminal, mineral, amber-stillness"
}

The design should feel like it was MADE for THIS specific moment. Wildly different from any other page.
```

### Claude API call pattern

```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic(); // reads ANTHROPIC_API_KEY from env

const response = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  messages: [{
    role: 'user',
    content: [
      {
        type: 'image',
        source: { type: 'base64', media_type: 'image/jpeg', data: imageBase64 },
      },
      { type: 'text', text: prompt },
    ],
  }],
});

const raw = (response.content[0] as { type: 'text'; text: string }).text;
const spec: DesignSpec = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, '').trim());
```

---

## go-deeper Lambda

### Input

```typescript
interface GoDeepInput {
  photoId: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
  newMessage: string;
}
```

### Output

```typescript
interface GoDeepOutput {
  reply: string;  // Claude's literary response
}
```

Append the new message to history, call Claude with the full conversation, return the reply. Persist conversation via a callback to Symfony (or the Lambda saves directly to RDS using a connection pool like RDS Proxy).

---

## File structure to create

```
lambdas/
├── AGENTS.md                ← this file
├── package.json
├── tsconfig.json
├── esbuild.config.ts
├── src/
│   ├── story-generator/
│   │   ├── handler.ts       Lambda entry point: exports handler()
│   │   ├── prompt.ts        The Claude prompt builder
│   │   └── types.ts         Input/output types
│   └── go-deeper/
│       ├── handler.ts
│       └── types.ts
└── tests/
    ├── story-generator.spec.ts
    └── go-deeper.spec.ts
```

---

## Build & deploy

```bash
npm run build   # esbuild bundles each handler into dist/{name}/index.js

# Terraform deploys the zipped dist — see infrastructure/AGENTS.md
# To test locally before Terraform:
npx aws-lambda-ric dist/story-generator/index.js handler
```

---

## Environment variables (set in Terraform, available at runtime)

| Variable | Value |
|----------|-------|
| `ANTHROPIC_API_KEY` | Anthropic API key (from AWS Secrets Manager) |
| `AWS_REGION` | e.g. `eu-west-1` |

---

## Testing standard

- Mock the Anthropic SDK in unit tests — do not make real API calls in CI
- Test the JSON parse + validation logic (Claude sometimes returns markdown-fenced JSON)
- Test the input validation (missing imageBase64, oversized payload, etc.)
- `npm test` must pass before any deploy
