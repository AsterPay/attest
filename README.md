# Attest — EU AI Act compliance in one SDK

**Powered by [AsterPay](https://asterpay.io)** — trust & settlement for AI commerce.

Attest helps EU teams **discover AI usage in code**, **classify risk heuristically**, **generate Annex IV-style documentation scaffolds**, and **keep tamper-evident audit logs** for AI inferences.

> **Not legal advice.** Attest is a developer tool. Always involve qualified counsel for conformity assessment and regulatory obligations.

## Try it now (zero install)

```bash
cd your-project
npx @asterpay/attest scan
```

That's it. Attest scans your TypeScript/JavaScript source for AI SDK imports (OpenAI, Anthropic, Google AI, LangChain, etc.) and reports what it finds:

```
📦 Scanned 42 files in ./src

  src/chat/agent.ts
    → openai (line 1)        ai-sdk
    → @anthropic-ai/sdk (line 2)

  src/scoring/classifier.ts
    → langchain (line 3)     ai-sdk

🔍 3 AI-related imports found across 2 files
⚠️  Risk classification: HIGH (Annex III keywords detected)
```

## Install

```bash
npm install -g @asterpay/attest
```

## Quick start

```bash
cd your-project

# 1) See which AI SDKs your code imports (AST scan)
attest scan

# 2) Heuristic checks: transparency / logging / oversight signals
attest check

# 3) Generate Annex IV–style Markdown scaffolds (fill with counsel)
attest docs -o ./compliance

# 4) Local static dashboard (countdown + CLI hints)
attest dashboard
```

### What each command does

| Step | Command | What you get |
|------|---------|-------------|
| **Scan** | `attest scan` | List of every AI SDK import in your codebase, file by file |
| **Check** | `attest check` | Compliance signals: do you have logging? transparency disclosures? human oversight patterns? |
| **Docs** | `attest docs -o ./compliance` | Three Markdown files: `technical-documentation.md`, `risk-assessment.md`, `conformity-declaration.md` — pre-filled scaffolds for Annex IV, ready for your legal team |
| **Dashboard** | `attest dashboard` | Local web UI with EU AI Act deadline countdown + quick links |

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `@asterpay/attest` | [![npm](https://img.shields.io/npm/v/@asterpay/attest)](https://www.npmjs.com/package/@asterpay/attest) | CLI (`attest`) + re-exports SDK |
| `@asterpay/attest-sdk` | [![npm](https://img.shields.io/npm/v/@asterpay/attest-sdk)](https://www.npmjs.com/package/@asterpay/attest-sdk) | Programmatic API |

### CLI reference

| Command | Purpose |
|--------|---------|
| `attest scan [-r DIR]` | List AI-related package imports per file |
| `attest check [-r DIR]` | Compliance **signals** (not legal sign-off) |
| `attest docs -o DIR [-r DIR] [--name] [--provider]` | Write `technical-documentation.md`, `risk-assessment.md`, `conformity-declaration.md` |
| `attest export [--from ISO]` | Dump audit log JSON (needs prior `Attest.track()` usage) |
| `attest verify [-r DIR]` | Verify audit JSONL hash chain; exits `1` if broken |
| `attest dashboard [-p PORT]` | Serve local dashboard |

Project metadata for `attest docs` (optional): `.attest/config.json` — see below.

Optional project metadata (for `attest docs`):

```json
// .attest/config.json
{
  "system": {
    "name": "Customer Support Bot",
    "provider": "Your Company Ltd",
    "description": "Tier-1 support assistant"
  }
}
```

## Programmatic usage

```typescript
import { Attest } from '@asterpay/attest';

const attest = new Attest({
  system: {
    name: 'My AI feature',
    provider: 'My Org',
  },
  projectRoot: process.cwd(),
});

const risk = await attest.classifyRisk();
const report = attest.check();

await attest.track(
  async () => {
    /* your OpenAI / Anthropic call */
    return { ok: true };
  },
  { purpose: 'support', humanOversight: 'available', containsPII: false },
);
```

## Monorepo layout

```
attest/
  packages/
    sdk/     @asterpay/attest-sdk
    cli/     @asterpay/attest
  landing/   marketing site (static)
  docs/      publishing, domains, cloud roadmap
```

## Why?

The EU AI Act (Regulation 2024/1689) requires companies deploying AI in the EU to document, classify, and audit their AI systems. The **August 2, 2026** deadline for high-risk systems is approaching fast.

Attest doesn't replace legal counsel — it gives your engineering team a head start:

- **Discovery** — "Which of our 200 microservices actually use AI SDKs?"
- **Risk signal** — "Does our code have the logging/oversight patterns regulators expect?"
- **Documentation** — "Give us Annex IV scaffolds so legal doesn't start from a blank page"
- **Audit trail** — "Every AI inference is logged with SHA-256 hash chaining"

## Contributing

```bash
git clone https://github.com/AsterPay/attest
cd attest
npm install
npm run build
npm test
```

See [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) and [docs/PUBLISH.md](docs/PUBLISH.md) for setup and publishing details.

## License

MIT © AsterPay contributors
