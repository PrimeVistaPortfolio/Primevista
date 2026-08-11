# PrimeVista Technologies — Platform Monorepo

A full-stack, 100% CMS-driven company website + admin panel. "PrimeVista Technologies" is the working
company name — it lives only in the `SiteSettings.siteName` field (seeded default) and is editable from
the admin panel; nothing else in the codebase hardcodes it.

## Architecture

- **`apps/web`** — public site (Next.js App Router, JavaScript). Also hosts the backend: all REST
  endpoints live under `apps/web/app/api/*` as Route Handlers, backed by MongoDB via Mongoose. Public
  pages query the database directly from Server Components (no self-HTTP round trip); write operations
  go through the same API routes, protected by admin JWT auth.
- **`apps/admin`** — admin panel (Next.js App Router, JavaScript), a separate app/origin. It never talks
  to MongoDB directly. On login it forwards credentials to `apps/web`'s `/api/auth/login`, then stores
  the returned JWT in an **httpOnly cookie on its own domain**. All admin UI calls hit admin's own
  same-origin `/api/proxy/[...path]`, which reads that cookie server-side and forwards the request to
  `apps/web`'s API with an `Authorization: Bearer` header. The JWT never touches browser-side JS.
- **`packages/shared`** — Mongoose models, Zod validation schemas, the seed data for the Services
  catalog, and Cloudinary/email/JWT/rate-limit utilities. Imported by `apps/web` (directly, server-side)
  and referenced conceptually by `apps/admin` (which only uses shared's validation shape indirectly via
  the API — admin has no direct DB/Mongoose dependency).
- **Database**: MongoDB + Mongoose — chosen for the flexible, block-based `Pages` content model and
  polymorphic media/SEO subdocuments a CMS needs.

This is the "alternative architecture" the spec pre-approved: one Next.js app owns the DB and API, a
second Next.js app is a pure client of that API over HTTP with its own admin auth.

## Project structure

```
primevista/
├── apps/
│   ├── web/       Public site + /app/api backend (Next.js, JS)
│   └── admin/     Admin panel (Next.js, JS) — calls web's API via a same-origin proxy
├── packages/
│   └── shared/    Mongoose models, Zod schemas, service catalog seed, Cloudinary/email/JWT utils
├── .env.example
└── turbo.json
```

## Running locally

Requires Node 18.18+ and a MongoDB instance (local or Atlas).

```bash
npm install                    # installs all three workspaces

# copy env files and fill in real values
# apps/web/.env.local already exists with placeholders — edit it:
#   MONGODB_URI, JWT_SECRET, CLOUDINARY_* (optional until you upload media), SMTP_* (optional)
# apps/admin/.env.local already exists — WEB_API_URL should point at the web app

npm run seed:admin              # creates the first admin user (see below)
npm run seed:services           # seeds the starter Services catalog

npm run dev                     # runs both apps via Turborepo
# web   → http://localhost:3000
# admin → http://localhost:3001
```

Or run them individually: `npm run dev:web` / `npm run dev:admin`.

### Seeding the first admin user

```bash
npm run seed:admin
```

Reads `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` from `apps/web/.env.local`
(defaults: `admin@primevista.dev` / `ChangeMe123!`). **Change the password after first login** — there's
no public signup route by design; further admins are created by inserting into `AdminUser` directly or
extending this script.

### Seeding the Services catalog

```bash
npm run seed:services
```

Bulk-inserts the ~48 starter services from `packages/shared/src/constants/serviceCatalog.js` (grouped by
category, each with a target keyword). Safe to re-run — it skips slugs that already exist. The same
action is available from **Admin → Services → "Seed default catalog"**.

## Environment variables

See `.env.example` for the full list and which app reads each one. Nothing is hardcoded — Cloudinary,
Mongo, JWT secret, SMTP, and the site URL are all env-driven.

## What's fully built vs. simplified

Built end-to-end: auth, all CRUD modules (Settings, Projects, Services, Team, Pages, Inquiries), media
upload via Cloudinary, on-demand ISR revalidation on every admin save, the inquiry form (validation +
honeypot + rate limiting + email hooks), sitemap/robots/JSON-LD SEO, GSAP/Lenis/Framer Motion animation,
and an R3F hero scene + optional per-project `.glb` viewer.

Simplified for scope, documented here rather than left silent:

- **Rich text**: long-form fields (project case studies, service descriptions, bios) use plain textareas
  rather than a WYSIWYG editor like TipTap. Swap in TipTap in `apps/admin/components/**/*Form.jsx` if you
  want formatted rich text — the API layer already stores these as free-form strings.
- **Drag-and-drop reordering**: admin uses a numeric `order` field instead of a dnd library. Functionally
  equivalent, less polished UX.
- **Media Library** (browse/reuse previously uploaded assets) is not built — each field uploads directly
  to Cloudinary. Nice-to-have per the spec.
- **Page block editor** stores each block's `data` as raw JSON in a textarea rather than a bespoke form
  per block type — flexible (matches the "block-based, zero-code-for-new-fields" CMS goal) but less
  friendly than dedicated inputs.
- **Custom cursor** (explicitly optional in the spec) was not built.

## Version constraints — read before upgrading

The React/3D stack is tightly coupled. Next.js 16's App Router serves client components its own
**vendored React 19**, whose internals object was renamed (`__CLIENT_INTERNALS_…`) from React 18's
(`__SECRET_INTERNALS_…`). Consequences:

- **`@react-three/fiber` must be v9+** (v8 depends on `react-reconciler@0.27`, which reads the React 18
  internals key and throws `Cannot read properties of undefined (reading 'ReactCurrentOwner')` the moment
  the 3D scene chunk evaluates). Fiber v9 drops the standalone reconciler entirely.
- **`react`/`react-dom` are pinned to `19.2.8`** (exact, plus a root `overrides` block) because fiber v9
  declares `react: ">=19 <19.3"`. A bump to 19.3+ will break the 3D hero — raise fiber first.
- **`@react-three/drei` must be v10+** to match fiber v9.

In R3F, `<bufferAttribute>` takes constructor `args={[array, itemSize]}` — `count` is derived and cannot
be passed as a prop.

## Key design decisions worth knowing

- **On-demand revalidation**: every admin write calls `revalidateTag()` for the relevant collection
  (`projects`, `services`, `team`, `pages`, `site-settings`), so public pages reflect edits immediately
  without a redeploy, while `unstable_cache` keeps read paths fast otherwise.
- **SEO fallback chain**: per-entity `seo.metaTitle`/`metaDescription` → `SiteSettings.metaTitleTemplate`
  / `defaultSeo` → a generated default. Nothing ships with blank meta tags even if the admin never
  touches the SEO tab.
- **Service pages are the SEO backbone**: each `/services/[slug]` page is fully CMS-driven — adding a new
  service from the admin panel produces a complete, indexable, keyword-targeted page with zero code
  changes, per the spec's requirement.
