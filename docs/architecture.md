# Architecture

## Overview

This project is a Next.js 16 App Router frontend for an ERP system. It is primarily a client-rendered application that relies on:

- NextAuth for session management
- A separate backend API for authentication and business data
- SWR hooks for data retrieval and refresh
- Shared components for CRUD tables, forms, reports, and navigation

The application is structured around business domains rather than technical layers alone, which keeps each module close to its UI, hook, and service dependencies.

## High-Level Flow

1. A user lands on the frontend and authenticates through NextAuth credentials.
2. The credentials provider calls the backend `login` endpoint using `NEXT_PUBLIC_API_PATH`.
3. The backend response is mapped into the NextAuth JWT and session.
4. Session data is consumed on the client through `useSession()`.
5. Protected pages in `app/(default)` render navigation and feature access according to user role and rank.
6. Module hooks fetch data from backend endpoints through SWR.
7. Service helpers send create, update, and delete requests back to the same backend API.

## Main Building Blocks

### Routing and layouts

- [`app/layout.tsx`](/d:/project/next_erp/app/layout.tsx) is the root layout.
- [`app/providers.tsx`](/d:/project/next_erp/app/providers.tsx) wraps the app with `HeroUIProvider`.
- [`app/context/AuthProvider.tsx`](/d:/project/next_erp/app/context/AuthProvider.tsx) wraps the tree with NextAuth `SessionProvider`.
- [`app/(default)/layout.tsx`](/d:/project/next_erp/app/(default)/layout.tsx) builds the authenticated shell, including navigation, header, and role-aware menus.

### Authentication

- [`app/api/auth/[...nextauth]/route.ts`](/d:/project/next_erp/app/api/auth/[...nextauth]/route.ts) exposes the NextAuth handler.
- [`app/api/auth/[...nextauth]/options.ts`](/d:/project/next_erp/app/api/auth/[...nextauth]/options.ts) defines the credentials provider and session callbacks.
- [`proxy.ts`](/d:/project/next_erp/proxy.ts) exports `withAuth` middleware.

The session stores additional ERP-specific user fields:

- `id`
- `username`
- `nama`
- `peran`
- `rank`
- `id_karyawan`
- `keteranganperan`

These fields are used throughout the client for navigation, permissions, and request context.

### Data access pattern

The app follows a lightweight three-part pattern:

1. Service modules define endpoint constants and mutation helpers.
2. Hook modules compose endpoints, query params, and SWR behavior.
3. UI components render data and trigger mutations.

Example:

- [`services/proyek.service.js`](/d:/project/next_erp/services/proyek.service.js) defines the `v2/proyek` endpoint and save/delete helpers.
- [`hooks/proyek.hooks.js`](/d:/project/next_erp/hooks/proyek.hooks.js) builds report and detail query hooks.
- Project pages under [`app/(default)/proyek`](/d:/project/next_erp/app/(default)/proyek) and related components consume those hooks.

### Shared UI

Reusable building blocks live in [`components`](/d:/project/next_erp/components), especially:

- generic CRUD helpers in [`components/default`](/d:/project/next_erp/components/default)
- shared navigation and session UI in [`components/nav.jsx`](/d:/project/next_erp/components/nav.jsx) and [`components/user.jsx`](/d:/project/next_erp/components/user.jsx)
- business-specific widgets for reports, detail views, and dialogs

[`components/default/DefaultTable.jsx`](/d:/project/next_erp/components/default/DefaultTable.jsx) is a good example of the project’s standard CRUD interaction style: fetch with SWR, render tabular data, open modal forms, mutate, and refresh.

## Key Directories

### `app/(default)`

Contains the main authenticated product areas, including:

- dashboard
- aktivitas
- produk
- proyek
- customer
- vendor
- bank
- karyawan
- coa
- laporan
- perusahaan

### `hooks`

Contains SWR hooks, column helpers, and fetch abstractions. The shared fetch layer is defined in [`hooks/useClientFetch.js`](/d:/project/next_erp/hooks/useClientFetch.js).

### `services`

Contains thin wrappers around backend endpoints. Shared mutation helpers are in [`services/default.service.js`](/d:/project/next_erp/services/default.service.js).

### `app/utils`

Contains common helpers for:

- API path resolution
- URL construction
- role checks
- formatting
- dates
- exports

Relevant files include:

- [`app/utils/apiconfig.js`](/d:/project/next_erp/app/utils/apiconfig.js)
- [`app/utils/tools.js`](/d:/project/next_erp/app/utils/tools.js)
- [`app/utils/roles.js`](/d:/project/next_erp/app/utils/roles.js)

## Permissions Model

The app uses two related concepts:

- `peran`: named role such as `super`, `owner`, or `admin`
- `rank`: numeric rank used by `highRoleCheck(rank)` to enable broader access

Navigation in [`app/(default)/layout.tsx`](/d:/project/next_erp/app/(default)/layout.tsx) is assembled dynamically from the active session, so users only see sections allowed by their current role/rank combination.

## External Dependencies

The frontend depends on a separate backend for:

- login/authentication
- business data retrieval
- CRUD mutations
- image hosting for logo assets

It also expects environment-driven image settings in [`next.config.js`](/d:/project/next_erp/next.config.js) so remote images can be loaded from the backend domain.

## Current Caveats

- The middleware matcher in [`proxy.ts`](/d:/project/next_erp/proxy.ts) is commented out, so route coverage should be verified before assuming all pages are protected.
- The login page UI in [`app/login/ui.jsx`](/d:/project/next_erp/app/login/ui.jsx) currently looks like a static or incomplete screen rather than a fully connected auth form.
- The codebase is mixed TypeScript and JavaScript, so typing consistency is partial rather than end-to-end.
