# Campaign status

The Supabase schema and Edge Function are deployed to project `szozvdrhfbeianjqmler`.

The browser receives only the public Supabase key. The Edge Function validates and rate-limits submissions, then uses Supabase's server environment for privileged database access. The service key is never sent to the browser or stored in this Site.

Email notifications are intentionally disabled for V1. Approved records are publicly readable, while anonymous users cannot write directly to tables or execute the privileged database functions. Team members can moderate `status` in the Supabase dashboard.

The UI listens for Supabase Realtime changes and also refreshes every 30 seconds. GG post metadata is deliberately not fabricated.
