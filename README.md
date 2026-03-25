# Attest — EU AI Act compliance in one SDK

**Powered by [AsterPay](https://asterpay.io)** — trust & settlement for AI commerce.

Attest helps EU teams **discover AI usage in code**, **classify risk heuristically**, **generate Annex IV-style documentation scaffolds**, and **keep tamper-evident audit logs** for AI inferences.

> **Not legal advice.** Attest is a developer tool. Always involve qualified counsel for conformity assessment and regulatory obligations.

## Packages

| Package | Description |
|---------|-------------|
| `@asterpay/attest` | CLI (`attest`) + re-exports SDK |
| `@asterpay/attest-sdk` | Programmatic API |

## Install

**From npm** (after publish):

```bash
npm install -g @asterpay/attest
```

**From this monorepo** (development):

```bash
npm install
npm run build
node packages/cli/dist/cli.js --help
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
# → http://127.0.0.1:3500/
```

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

## GitHub

See [docs/GITHUB_SETUP.md](docs/GITHUB_SETUP.md) for `gh repo create` and HTTPS push steps.

## Publish to npm

Requires npm login with access to the `@asterpay` scope.

```bash
npm install
npm run build
npm test
npm publish -w @asterpay/attest-sdk --access public
npm publish -w @asterpay/attest --access public
```

See [docs/PUBLISH.md](docs/PUBLISH.md) for details.

## License

MIT © AsterPay contributors
