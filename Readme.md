# FinUp Sync API

Node.js + Express + PostgreSQL backend for offline-first **2-way sync** between the FinUp Android app and FinUp web.

Public API: `https://api.finup.yashchauhan.pro`

Based on [node-backend-boilerplate](https://github.com/RajRaiyani/node-backend-boilerplate).

## Quick start

```bash
npm install
cp .env.example .env
npx dbmate up
npm run dev
```

## Auth

| Method | Path | Notes |
|--------|------|-------|
| POST | `/auth/signup` | Direct signup (app + web) |
| POST | `/auth/login` | Returns JWT (30d) |
| POST | `/auth/register` | Email OTP flow (boilerplate) |
| POST | `/auth/verify-registration` | Verify OTP |

## Sync (Bearer token required)

| Method | Path | Notes |
|--------|------|-------|
| GET | `/sync/me` | User + sync revision meta |
| GET | `/sync/pull` | Full table snapshot + revision |
| POST | `/sync/push` | Upsert snapshot; bumps revision |

### Push body

```json
{
  "baseRevision": 3,
  "clientId": "android-…",
  "force": false,
  "tables": { "accounts": [], "transactions": [], "…": [] },
  "meta": { "source": "android" }
}
```

- If `baseRevision < server.revision` and `force` is false → **409 SYNC_CONFLICT** with current cloud payload.
- Clients resolve by keeping cloud or force-pushing local (LWW).
- Successful push emits Socket.IO `sync:updated` to the user's room.

Synced tables match the FinUp SQLite backup: accounts, categories, transactions, people, ledger, rules, budgets, goals, tags, txn_tags, receipts, deleted_refs.

## Env

See `.env.example`. Important:

- `PUBLIC_API_URL=https://api.finup.yashchauhan.pro`
- `DATABASE_URL=postgres://…`
- `JWT_SECRET=…`
# finup-server
# finup-server
