# Ramah Digital Founding Era

Production Next.js website for the Ramah Digital Founding Era campaign. This repository contains only the website. The Expo mobile application is maintained separately.

## Technology

- Next.js 16 and React 19
- TypeScript
- Supabase authentication, database, realtime, and storage
- Vercel deployment
- GitHub Actions verification

## Local setup

Requirements: Node.js 22 and npm.

1. Copy `.env.example` to `.env.local`.
2. Replace `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with the existing Supabase publishable key.
3. Install and start the website:

```bash
npm ci
npm run dev
```

Never commit `.env.local`. The repository ignores all `.env*` files except `.env.example`, and CI rejects committed environment files.

## Verification

Run the same checks used by CI:

```bash
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## GitHub Actions

`.github/workflows/ci.yml` runs on pull requests and pushes to `main`. Configure these GitHub repository values before expecting CI to pass.

### GitHub Actions secrets

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

### GitHub Actions variables

- `NEXT_PUBLIC_SITE_URL` = `https://ramahdigital.online`
- `NEXT_PUBLIC_APP_URL` = `https://app.ramahdigital.online`
- `NEXT_PUBLIC_OPERATIONS_URL` = `https://app.ramahdigital.online/workspace`

## Vercel deployment

1. In Vercel, choose **Add New → Project** and import this GitHub repository.
2. Confirm Framework Preset is **Next.js**.
3. Leave Root Directory as `./` because this is a website-only repository.
4. `vercel.json` configures `npm ci`, `npm run build`, and the Frankfurt deployment region.
5. Add every environment variable listed below to Production, Preview, and Development as appropriate.
6. Deploy and attach `ramahdigital.online` under **Settings → Domains**.
7. Add the final production and preview callback URLs to the existing Supabase Auth URL configuration. Do not create another Supabase project.

### Required Vercel environment variables

| Variable | Production value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Existing Supabase publishable/anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://ramahdigital.online` |
| `NEXT_PUBLIC_APP_URL` | `https://app.ramahdigital.online` |
| `NEXT_PUBLIC_OPERATIONS_URL` | `https://app.ramahdigital.online/workspace` |
| `NEXT_PUBLIC_FOUNDING_CAMPAIGN_CODE` | `founding-era-2026` |
| `NEXT_PUBLIC_FACEBOOK_URL` | `https://www.facebook.com/profile.php?id=61587858783607` |
| `NEXT_PUBLIC_INSTAGRAM_URL` | `https://www.instagram.com/ramahdigital08?igsi=MWcwZGhjd3ZwOGd6cA==` |
| `NEXT_PUBLIC_TIKTOK_URL` | `https://www.tiktok.com/@ramah.digital3` |
| `NEXT_PUBLIC_YOUTUBE_URL` | `https://www.youtube.com/` until the official channel URL is available |

All variables currently used by the browser are intentionally public (`NEXT_PUBLIC_`). Never add a Supabase service-role key to Vercel for this website.

## Security and firewall setup

The application sends a restrictive Content Security Policy plus HTTPS, clickjacking, MIME-sniffing, referrer, and permissions headers from `next.config.ts`.

After the Vercel project is created, complete the network layer in **Vercel → Project → Firewall**:

1. Enable Vercel Firewall and keep managed DDoS protection active.
2. Enable bot protection for automated abuse.
3. Add rate limits to `/auth/*`, `/portal/*`, and `/founding-admin/*`. Start in log mode, verify legitimate traffic, then switch to deny/challenge mode.
4. Never create a rule that bypasses authentication for `/portal` or `/founding-admin`.
5. Restrict `/founding-admin/*` by trusted country or IP only if administrators have stable access locations; application RBAC remains mandatory.
6. Review firewall events before public launch and after every rule change.

Vercel firewall controls complement, but do not replace, Supabase RLS, protected RPCs, storage policies, and application authorization.

## Production release checklist

- CI passes on `main`.
- Vercel environment variables exist in the correct environments.
- Production domain and DNS are verified.
- Supabase Auth Site URL and allowed redirect URLs include the production domain.
- HTTPS is active and security headers are present.
- Vercel firewall rules have been tested in log mode.
- Traveler, Host, and Founding Admin smoke tests pass against production.
- Uploads use the intended Supabase buckets and remain protected by existing policies.
- No `.env.local`, service-role key, or private credential appears in Git history.
