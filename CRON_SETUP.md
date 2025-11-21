## Serverless Cron Strategy

Vercel’s serverless functions cannot keep long-running `node-cron` jobs alive, so the auction platform exposes HTTP endpoints that Vercel Cron Jobs (or any external scheduler) can call:

| Endpoint | Description | Accepted Methods | Auth |
| --- | --- | --- | --- |
| `/api/v1/cron/ended-auctions` | Processes finished auctions, calculates commission, emails winners | `GET` or `POST` | `x-cron-key` header **or** `Authorization: Bearer <CRON_SECRET>` |
| `/api/v1/cron/verify-commissions` | Verifies approved payment proofs and settles commissions | `GET` or `POST` | Same as above |

### Required environment variables

```
RUN_CRONS=false          # ensures node-cron doesn’t run inside Vercel
CRON_SECRET=<random>     # used for Authorization/x-cron-key validation
```

### Vercel Cron Jobs

> **Note:** Vercel’s Hobby plan only allows daily cron jobs. For minute/hour-level schedules, upgrade to Pro or use an external scheduler (GitHub Actions, Zapier, AWS Scheduler, etc.).

To use Vercel Cron Jobs manually:

1. Go to **Project → Settings → Cron Jobs → Add Cron Job**.
2. Set the path (e.g., `/api/v1/cron/ended-auctions`) and schedule.
3. Vercel automatically adds `Authorization: Bearer <CRON_SECRET>` to each invocation; no extra headers are needed.

For external schedulers, send a `GET`/`POST` request with either the Authorization header or `x-cron-key` set to `CRON_SECRET`.

