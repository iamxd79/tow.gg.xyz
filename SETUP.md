# Campaign activation
The visual page is implemented. Submissions fail closed until all required production settings exist.

1. Migrations 001 and 002 are already applied to project szozvdrhfbeianjqmler. Do not reapply them.
2. Set runtime secrets: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, RATE_LIMIT_SALT (random 32+ bytes), NOTIFICATION_JOB_SECRET (random 32+ bytes).
3. Set SUPABASE_URL, SUPABASE_ANON_KEY, EMAIL_FROM (a Resend-verified sender), GG_POST_PATH_PATTERN (anchored regex matching GG's confirmed post route).
4. Configure a scheduler to POST /api/notifications every minute with Authorization: Bearer NOTIFICATION_JOB_SECRET. This drains the durable transactional outbox after transient email failures. Unsent jobs older than 23 hours require manual review, avoiding retries outside Resend's 24-hour idempotency window.
5. Test one real post, canonical duplicate variants, invalid links, and both email deliveries before opening the campaign.

Both sarutobi@gg.xyz and jonathan@gg.xyz receive notifications. No credentials belong in client source.
Approved records are publicly readable. Anonymous users cannot insert or moderate records.
Team members moderate status in the Supabase dashboard. The UI refreshes on Realtime events and every 30 seconds to reconcile moderation.
The list currently renders the newest 1000 entries and counts all approved entries.
GG metadata is deliberately not fabricated.
Build and approved-entry reads passed. A rolled-back database check verified canonical duplicate rejection and one transactional email job. Browser UI and WebMCP checks were unavailable because the local browser sandbox failed. End-to-end submission and email delivery remain unverified until configuration is complete.

