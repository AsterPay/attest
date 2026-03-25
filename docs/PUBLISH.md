# Publishing `@asterpay/attest`

1. **Version bump** — update `version` in both `packages/sdk/package.json` and `packages/cli/package.json`.
2. **Changelog** — summarize changes in `CHANGELOG.md` (optional but recommended).
3. **Build & test**
   ```bash
   npm install
   npm run build
   npm test
   ```
4. **Login** — `npm login` with an account that can publish to `@asterpay`.
5. **Before publishing the CLI**, set `@asterpay/attest-sdk` in `packages/cli/package.json` to the **semver** you are about to publish (not `file:../sdk`), e.g. `"^0.1.0"`, then `npm install` at the repo root so the lockfile matches. For local development you can switch back to `file:../sdk`.
6. **Publish SDK first**, then CLI:
   ```bash
   npm publish -w @asterpay/attest-sdk --access public
   npm publish -w @asterpay/attest --access public
   ```

If using a private registry mirror, set `publishConfig.registry` in each `package.json`.
