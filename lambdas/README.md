# LensLore Lambdas

Two TypeScript Lambdas (Node.js 20) called by the Symfony backend via the AWS SDK:

| Function          | Purpose                                                                |
| ----------------- | ---------------------------------------------------------------------- |
| `story-generator` | Photo + note → `DesignSpec` JSON (palette, layout, motif, title, …)    |
| `go-deeper`       | Continue a literary conversation about an existing photo               |

For the design spec and Claude prompt rationale, see [AGENTS.md](AGENTS.md).

## Prerequisites

- Node.js 20+

## Build, test, typecheck

```bash
npm install
npm run build         # esbuild → dist/{story-generator,go-deeper}/index.mjs
npm test              # Vitest — 16 tests, SDK mocked, no real API calls
npm run typecheck     # tsc --noEmit (strict, noUncheckedIndexedAccess, verbatimModuleSyntax)
```

## Layout

```
src/
├── shared/
│   ├── client.ts           Anthropic SDK singleton + MODEL constant
│   └── types.ts            DesignSpec — mirrors the frontend interface and Symfony StorySpecResponse
├── story-generator/
│   ├── handler.ts          Lambda entry — exports `handler`
│   ├── prompt.ts           Prompt builder + JSON-schema for the response
│   └── types.ts
└── go-deeper/
    ├── handler.ts
    └── types.ts

tests/
├── story-generator.spec.ts
└── go-deeper.spec.ts
```

## Runtime environment

The Lambdas read `ANTHROPIC_API_KEY` from the environment. Terraform sets `ANTHROPIC_API_KEY_SECRET_ARN` so the function can pull the key from Secrets Manager.

## Notes worth knowing

- **Model.** Uses `claude-sonnet-4-6` — the current Sonnet (vision-capable, supports `output_config.format` structured outputs). The original AGENTS.md spec named `claude-sonnet-4-5`, which has since been retired.
- **Structured outputs.** `story-generator` constrains Claude with `output_config: { format: { type: 'json_schema', schema } }` instead of asking for JSON in the prompt and stripping markdown fences. Requires `@anthropic-ai/sdk` ≥ 0.95.0.
- **PHPUnit-style mocking in Vitest.** Tests `vi.mock('@anthropic-ai/sdk')` *before* dynamically importing the handler (`const { handler } = await import(...)`). The mock factory must come first or the SDK is loaded for real.
- **Image size cap.** `story-generator` rejects images above 5 MB decoded, before any tokens hit the API.
- **Conversation cap.** `go-deeper` truncates history to the last 40 turns to keep token spend bounded.

## Deploy

The Lambdas are deployed by Terraform from this repo's `infrastructure/` directory — `npm run build` first, then `terraform apply`. See [`../infrastructure/README.md`](../infrastructure/README.md).
