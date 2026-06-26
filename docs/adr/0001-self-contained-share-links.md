# Self-contained share links

Status: Accepted

Sharing a Radar must work with **no backend** — the app is a static SPA deployed to
nginx (Coolify) and GitHub Pages. We encode the entire Radar as `base64url(JSON(payload))`
in a `/share?d=…` query parameter rather than storing it server-side behind a short id;
the importing client validates and clamps the untrusted payload (`useRadars.importRadar`)
before it ever touches the store.

## Considered options

- **Self-contained link (chosen)** — full Radar in the URL.
- **Server-stored short link** — POST the Radar, share a short id. Rejected: requires a
  backend + datastore, which the zero-infra constraint forbids.
- **Compressed payload (LZ-string)** — shorter URLs, same self-contained property.
  Deferred, not rejected: the §7 fallback if link length becomes a problem.

## Consequences

- **Got:** zero infrastructure; links never expire; works on any static host; offline-capable.
- **Paid:** long URLs (no compression today); the full Radar is exposed in the URL (no
  privacy boundary); no revoke and no edit-after-share — a shared link is a frozen copy.
- Mitigated by the cardinality caps (≤7 Criteria, ≤5 Profiles) which bound payload size,
  keeping URLs within browser limits at current scale.
