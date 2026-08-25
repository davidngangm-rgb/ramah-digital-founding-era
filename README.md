<p align="center">
  <img src="./public/ramah-app-icon.png" alt="Ramah Digital logo" width="112" height="112">
</p>

<h1 align="center">Ramah Digital Founding Era</h1>

<p align="center">The public website for the first Travelers and Hosts helping shape Ramah Digital.</p>

<p align="center">
  <a href="https://nextjs.org/"><img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs"></a>
  <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white"></a>
  <a href="https://supabase.com/"><img alt="Supabase" src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white"></a>
  <a href="https://github.com/davidngangm-rgb/ramah-digital-founding-era/actions/workflows/ci.yml"><img alt="GitHub Actions" src="https://github.com/davidngangm-rgb/ramah-digital-founding-era/actions/workflows/ci.yml/badge.svg"></a>
</p>

## Overview

Ramah Digital is building a connected travel and hospitality community for Travelers and accommodation partners across Africa and the Global South. The Founding Era website supports the campaign story, Founder applications, onboarding, permanent Founder identity, property launch preparation, and protected administration.

This repository contains only the Next.js website. The Expo mobile application is maintained separately while both products use the existing shared Supabase backend.

## Features

- Founder applications with record-backed review and activation states.
- Traveler registration, membership selection, onboarding, and portal access.
- Host registration and owner-scoped property onboarding.
- Property launch preparation for information, policies, rooms, media, and inactive pre-launch deals.
- Protected Founding Admin dashboard for applications, Founder activation, and launch readiness.
- Supabase authentication with shared Ramah account identity.
- Supabase Realtime synchronization where live subscriptions are implemented.
- Responsive, accessible interfaces for mobile and desktop use.
- Founder badges, credentials, certificates, and consent-backed Hall of Founders records.

Functionality is limited to behavior implemented by the application and its existing shared backend contracts.

## Technology stack

| Technology | Role |
| --- | --- |
| Next.js 16 and React 19 | Application framework and interface |
| TypeScript | Static typing |
| Supabase | Authentication, database, Realtime, and storage |
| GitHub Actions | Continuous integration |
| ESLint and Node test runner | Code quality and verification |

## Project structure

| Path | Purpose |
| --- | --- |
| [`app/`](./app/) | App Router pages, layouts, route handlers, and server actions |
| [`components/`](./components/) | Shared interface and workflow components |
| [`features/`](./features/) | Feature-oriented modules |
| [`lib/`](./lib/) | Campaign, membership, authorization, and Supabase helpers |
| [`public/`](./public/) | Static images and product screenshots |
| [`styles/`](./styles/) | Global responsive styling |
| [`tests/`](./tests/) | Architecture, workflow, security, and regression checks |
| [`.github/workflows/`](./.github/workflows/) | Continuous integration workflow |

## Local development

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

## Environment variables

Copy [`.env.example`](./.env.example) to `.env.local` and replace its placeholders. The application uses the following browser-safe configuration:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Existing Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Existing browser-safe publishable/anon key |
| `NEXT_PUBLIC_SITE_URL` | Canonical website URL |
| `NEXT_PUBLIC_APP_URL` | Ramah application destination |
| `NEXT_PUBLIC_OPERATIONS_URL` | Operations workspace destination |
| `NEXT_PUBLIC_FOUNDING_CAMPAIGN_CODE` | Existing Founding Era campaign code |
| `NEXT_PUBLIC_FACEBOOK_URL` | Official Facebook profile |
| `NEXT_PUBLIC_INSTAGRAM_URL` | Official Instagram profile |
| `NEXT_PUBLIC_TIKTOK_URL` | Official TikTok profile |
| `NEXT_PUBLIC_YOUTUBE_URL` | Official YouTube destination |

## Hosting

The website is designed to run on any modern hosting platform that supports current Next.js applications. Configure the variables in [`.env.example`](./.env.example), use `npm run build` as the production build command, and follow the selected provider's Next.js guidance.

## Security

- All `.env*` files are ignored except the safe `.env.example` template.
- CI rejects committed private environment files.
- Only browser-safe `NEXT_PUBLIC_*` values belong in the frontend environment.
- Never add service-role keys, database passwords, private signing keys, or access tokens.
- Security headers are configured in [`next.config.ts`](./next.config.ts).
- Supabase RLS, protected RPCs, storage policies, and application authorization remain mandatory.
- Protected routes do not replace backend authorization or row-level security.

Report security concerns privately to `ramahdigital08@gmail.com` instead of opening a public issue containing sensitive details.

## Contributing

1. Create a focused branch from `main`.
2. Keep changes within the website architecture and existing Supabase contracts.
3. Never commit credentials, private applicant data, or generated build files.
4. Run the complete verification suite locally.
5. Open a pull request describing the change, validation, and operational impact.

Contributions must preserve authentication, RLS assumptions, Founder allocation protections, and compatibility with the shared backend.

## License

This project is available under the [MIT License](./LICENSE). Copyright © 2026 Ramah Digital.
