# Tazkflow — Frontend

Vue 3 SPA (plain JavaScript) for Tazkflow. The API is a separate Laravel app in `../tazkflow-backend`.

## Setup

```bash
npm install
cp .env.example .env     # VITE_API_URL points at the API
npm run dev              # http://localhost:5173
```

The API must be running too:

```bash
cd ../tazkflow-backend
php artisan serve        # http://localhost:8000
php artisan queue:work   # verification and invitation emails
```

Seeded logins: `admin@example.com`, `rupash.das.202@gmail.com` — password `Pass123#`.

## What is built (Plan A)

| Path | Screen |
|---|---|
| `/login`, `/register` | sign in, sign up |
| `/forgot-password`, `/reset-password` | password reset |
| `/verify-email`, `/email-verified` | email confirmation |
| `/invitations/:token` | accept an invitation, or join with an existing account |
| `/welcome`, `/welcome/:workspace/invite` | two-step setup wizard |
| `/workspaces` | every workspace you can open |
| `/:workspace` | the app shell and Home |

Settings and Account screens are Plan B:
`../docs/superpowers/plans/2026-09-28-frontend-foundation-b.md`.

## How the theme works

`<html>` carries `data-theme` (`light`/`dark`) and `data-accent` (`blue`, `violet`,
`emerald`, `amber`, `rose`). Every colour is a CSS variable defined per attribute in
`src/styles/tokens.css`, mapped into Tailwind utilities with `@theme inline`.
Components use utilities like `bg-surface` and `text-muted` — never a raw colour.

Design: `../docs/superpowers/specs/2026-09-28-frontend-foundation-design.md`.
