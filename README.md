# Next ERP

Internal ERP frontend built with Next.js App Router, HeroUI, SWR, and NextAuth credentials authentication. The app organizes business modules like projects, products, customers, vendors, banking, accounting, reports, and employee operations behind a session-aware UI.

## Stack

- Next.js 16 with App Router
- React 19
- TypeScript for framework entry files, mixed with existing `.jsx` modules
- NextAuth v4 using a credentials provider
- HeroUI component library
- SWR for client-side data fetching
- Tailwind CSS v4

## What This App Does

- Renders authenticated ERP screens under `app/(default)`
- Connects to a separate backend API through `NEXT_PUBLIC_API_PATH`
- Uses role and rank checks to shape navigation and feature access
- Provides reusable table, modal, form, and report components for CRUD-style modules

## Project Layout

```text
app/
  (default)/              Protected application pages
  api/auth/[...nextauth]/ NextAuth route handler and options
  context/                Session provider wrapper
  login/                  Login screen
  utils/                  Shared helpers, config, roles, formatting
components/               Reusable UI and module-specific components
hooks/                    SWR-based data hooks and table column helpers
services/                 Backend endpoint wrappers
public/                   Static assets and spreadsheet templates
proxy.ts                  NextAuth middleware entry point
```

## Quick Start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with the required variables listed in `docs/setup.md`.
3. Make sure the backend API is running and reachable from `NEXT_PUBLIC_API_PATH`.
4. Start the frontend:

   ```bash
   npm run dev
   ```

5. Open `http://localhost:3000`.

## Documentation

- [Architecture](docs/architecture.md)
- [Setup](docs/setup.md)

## Notes

- The middleware entry point exists in [`proxy.ts`](/d:/project/next_erp/proxy.ts), but the route matcher is currently commented out, so protection behavior depends on NextAuth's default middleware coverage.
- The login UI under [`app/login/ui.jsx`](/d:/project/next_erp/app/login/ui.jsx) appears to be a placeholder screen and is not yet wired to `signIn()` directly.
- The repo currently has local uncommitted changes in [`app/api/auth/[...nextauth]/options.ts`](/d:/project/next_erp/app/api/auth/[...nextauth]/options.ts) and [`app/utils/apiconfig.js`](/d:/project/next_erp/app/utils/apiconfig.js); this documentation was written around the current working tree and does not modify those files.
