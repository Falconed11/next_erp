# Setup

## Prerequisites

- Node.js 20 or newer recommended
- npm
- Access to the paired backend API used by this frontend

## Install

From the project root:

```bash
npm install
```

## Environment Variables

Create a `.env.local` file in the project root with these keys:

```env
NEXT_PUBLIC_API_PATH=
NEXTAUTH_URL=
NEXT_PUBLIC_MAIN_URL=
NEXTAUTH_SECRET=
MAIN_DOMAIN=
EXPRESS_PORT=
```

### What each variable is for

- `NEXT_PUBLIC_API_PATH`: Base URL for the backend API. The frontend uses this for login and most data requests.
- `NEXTAUTH_URL`: Public URL of this Next.js app for NextAuth callbacks and session behavior.
- `NEXT_PUBLIC_MAIN_URL`: Frontend base URL exposed to client-side utilities.
- `NEXTAUTH_SECRET`: Secret used by NextAuth to sign and verify tokens.
- `MAIN_DOMAIN`: Backend host used by Next.js remote image configuration.
- `EXPRESS_PORT`: Backend port used by the remote image configuration.

## Start the app

Run the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Build for production

```bash
npm run build
npm run start
```

## How the backend is used

This frontend is not self-contained. It expects a backend service that:

- exposes a `login` endpoint consumed by NextAuth credentials auth
- serves the domain and port referenced by `MAIN_DOMAIN` and `EXPRESS_PORT`
- provides the ERP REST endpoints used by files under [`services`](/d:/project/next_erp/services)

If the backend is unavailable or `NEXT_PUBLIC_API_PATH` is incorrect, authentication and most application screens will fail to load data.

## Recommended first checks

After starting the app, verify:

1. `http://localhost:3000` loads without build errors.
2. Requests to `${NEXT_PUBLIC_API_PATH}login` succeed from the frontend.
3. Remote images load correctly from the backend host configured in [`next.config.js`](/d:/project/next_erp/next.config.js).
4. A signed-in user can access the expected sections for their role.

## Known setup caveats

- Because the app uses client-side SWR fetching broadly, a valid API base URL is required even for basic page interaction after login.
- Route-protection behavior should be tested explicitly because the matcher configuration in [`proxy.ts`](/d:/project/next_erp/proxy.ts) is currently commented out.
- The login screen under [`app/login/ui.jsx`](/d:/project/next_erp/app/login/ui.jsx) may need additional wiring depending on how authentication is expected to work in your environment.
