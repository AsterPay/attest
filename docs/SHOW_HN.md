# Show HN draft — Attest

**Title:** Show HN: Attest – EU AI Act compliance CLI for Node/TypeScript (scanner, docs, audit log)

**Text:**

EU teams shipping AI features face the AI Act timeline and documentation expectations. Attest is a small open-source toolkit that:

- Scans your repo for AI SDK imports (OpenAI, Anthropic, Google AI, LangChain, …) using the TypeScript AST
- Gives a heuristic risk hint (not legal classification)
- Runs cheap compliance *signals* (transparency / logging / oversight keywords)
- Writes Annex IV–style Markdown scaffolds you can complete with counsel
- Optional tamper-evident JSONL audit log + `attest track()` wrapper

Install: `npm install -g @asterpay/attest` then `attest scan`, `attest check`, `attest docs -o ./compliance`.

MIT. Not legal advice. Powered by AsterPay (trust layer for agent commerce).

Links: GitHub `https://github.com/AsterPay/attest` · product context `https://asterpay.io`

---

HN is skeptical of compliance tools — lead with the technical scanner + AST, and be explicit that this is scaffolding + engineering hygiene, not a lawyer replacement.
