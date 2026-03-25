# Push Attest to GitHub (`AsterPay/attest`)

## One-time setup

From the `attest/` directory (this repo root):

```bash
git init
git branch -M main
git add -A
git commit -m "feat: initial Attest EU AI Act SDK and CLI"
```

## Create the remote repository

### Option A — GitHub CLI (fastest)

```bash
gh auth login
gh repo create AsterPay/attest --public --source=. --remote=origin --push --description "EU AI Act compliance toolkit for TypeScript — Powered by AsterPay"
```

### Option B — Web UI

1. Create **New repository** under org **AsterPay**, name **`attest`**, public, **no** README/license (avoid merge conflicts).
2. Then:

```bash
git remote add origin https://github.com/AsterPay/attest.git
git push -u origin main
```

## After push

- Add topics on GitHub: `eu-ai-act`, `typescript`, `compliance`, `cli`, `nodejs`, `asterpay`
- Pin release **v0.1.0** after npm publish (optional)
- Enable **Actions** (`.github/workflows/ci.yml` included)
