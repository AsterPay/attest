# Attest Cloud (roadmap) — Supabase

Future **Attest Pro** tier can sync tamper-evident audit entries to **Supabase** (EU region recommended).

## Suggested schema (`attest` schema)

- `audit_entries` — columns mirroring `AuditEntry` JSON (id, timestamp, system, action, hash, previous_hash, payload JSONB)
- RLS policies per organization / project API key
- Realtime channel for dashboard live tail

## Integration point

The open-source SDK will gain an optional `AttestCloudSync` adapter (env: `ATTEST_SUPABASE_URL`, `ATTEST_SUPABASE_KEY`) without breaking local JSONL logging.

This file documents intent only; implementation ships in a later minor version.
