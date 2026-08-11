# Deploying PrimeVista to Vercel

This monorepo ships **two independent Next.js apps** that become **two Vercel projects**
built from this same GitHub repo, distinguished only by their **Root Directory** setting:

| Vercel project     | Root Directory | Serves                          |
| ------------------ | -------------- | ------------------------------- |
| `primevista-web`   | `apps/web`     | Public site **and all API routes** |
| `primevista-admin` | `apps/admin`   | Admin panel (its own hostname)  |

## How the two talk to each other

The browser never calls the web API directly from the admin panel. The flow is:

```
admin browser ──> admin.../api/proxy/*  ──(server-to-server, Bearer token)──> web.../api/*
                  (reads httpOnly cookie)                                      (verifies JWT)
```

`pv_admin_token` is an httpOnly cookie scoped to the **admin** hostname only, and the admin
browser only ever makes **same-origin** requests. That means there are no cross-site cookie
problems, and putting admin on a separate hostname (or later a real subdomain) needs **zero
code changes** — only the `WEB_API_URL` env var.

---

## 1. Prepare MongoDB Atlas

Vercel builds and functions run from rotating IPs, so the cluster must accept them.

- Atlas → **Network Access** → **Add IP Address** → `0.0.0.0/0` (Allow access from anywhere).

Without this the build fails at "Collecting page data" — the public pages are prerendered
from the database at build time.

## 2. Deploy the web project (do this first)

Vercel → **Add New… → Project** → import `PrimeVistaPortfolio/Primevista`.

- **Project Name:** `primevista-web`
- **Root Directory:** `apps/web` — click *Edit* and select it. Leave
  *Include source files outside of the Root Directory* **enabled**; the app depends on
  `packages/shared`.
- **Framework Preset:** Next.js (auto-detected). Leave build/install commands untouched —
  Vercel detects the npm workspace root and installs from there.

### Environment variables

Add these under **Settings → Environment Variables** for **Production, Preview, and
Development**. Copy the values from your local `apps/web/.env.local`.

| Variable                   | Value                                                     |
| -------------------------- | --------------------------------------------------------- |
| `MONGODB_URI`              | your Atlas connection string                               |
| `JWT_SECRET`               | **generate a new one — see below**                         |
| `CLOUDINARY_CLOUD_NAME`    | from `.env.local`                                          |
| `CLOUDINARY_API_KEY`       | from `.env.local`                                          |
| `CLOUDINARY_API_SECRET`    | from `.env.local`                                          |
| `NEXT_PUBLIC_SITE_URL`     | `https://primevista-web.vercel.app` (your real URL)        |
| `EMAIL_FROM`               | `no-reply@primevista.dev` *(optional)*                     |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` / `SMTP_USER` / `SMTP_PASS` | *optional — leave `SMTP_HOST` blank to disable inquiry emails* |
| `ADMIN_NOTIFICATION_EMAIL` | *optional*                                                 |

> `SEED_ADMIN_*` are **not** needed on Vercel — the seed script runs from your machine.

**Generate a real `JWT_SECRET`** (the repo default is the literal placeholder
`replace-with-a-long-random-string`, which must never reach production):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Deploy, then **note the assigned URL**. If `primevista-web` was taken, Vercel appends a
suffix — use whatever it actually assigned in the next step.

## 3. Deploy the admin project

**Add New… → Project** → import **the same repo again**.

- **Project Name:** `primevista-admin`
- **Root Directory:** `apps/admin`

### Environment variable

| Variable      | Value                                 |
| ------------- | ------------------------------------- |
| `WEB_API_URL` | `https://primevista-web.vercel.app` — the URL from step 2, **no trailing slash** |

That is the only variable admin needs. It never verifies JWTs itself; it forwards them.

Deploy.

## 4. Point `NEXT_PUBLIC_SITE_URL` at the real URL

If you guessed the web URL in step 2, correct it now and redeploy the web project.
It drives canonical URLs, `sitemap.xml`, `robots.txt`, and Open Graph tags.

## 5. Create the first admin user

The seed script reads `apps/web/.env.local` and writes to whatever `MONGODB_URI` points at —
so with Atlas configured there, running it locally seeds **production**:

```bash
npm run seed:admin
```

Log in at `https://primevista-admin.vercel.app/login` and **change the password immediately**
if you used the default `ChangeMe123!`.

---

## Moving to a real domain + `admin.` subdomain

`*.vercel.app` cannot host nested subdomains — `admin.primevista.vercel.app` is not
possible, which is why the two apps get separate `*.vercel.app` names for now. Once you
own a domain, a true subdomain is a settings change with **no code change**:

1. **web project** → Settings → Domains → add `primevista.com` (and `www`).
2. **admin project** → Settings → Domains → add `admin.primevista.com`.
3. At your registrar, add the DNS records Vercel shows — typically an `A` record
   `@ → 76.76.21.21` for the apex and a `CNAME` `admin → cname.vercel-dns.com`.
4. Update `NEXT_PUBLIC_SITE_URL` (web) and `WEB_API_URL` (admin) to the new domain,
   then redeploy both.

## Build skipping

Each app's `vercel.json` sets `ignoreCommand` to `turbo-ignore`, so a push that only touches
`apps/admin` won't rebuild the web site, and vice versa. Changes to `packages/shared`
correctly rebuild `web`, because turbo knows the dependency graph.

---

## Known limitation: media uploads over ~3 MB

`ImageUploader` sends files to `/api/proxy/media/upload` as a **base64 data URI inside a JSON
body**, and base64 inflates a file by ~33%. Vercel caps serverless function request bodies at
**4.5 MB**, so anything larger than roughly **3.3 MB** fails with a `413` in production, even
though `apps/admin/next.config.js` raises the local limit to 32 MB and `ImageUploader` accepts
files up to 10 MB (images) / 20 MB (video).

Locally everything works, so this only appears after deploying.

**The fix** is to stop routing file bytes through Vercel: upload directly from the browser to
Cloudinary and let the server only sign the request.

1. Add a `/api/media/signature` route on **web** (admin-guarded) returning a Cloudinary
   signature, timestamp, api_key, and folder.
2. Have `ImageUploader` `POST` a `FormData` with the raw `File` to
   `https://api.cloudinary.com/v1_1/<cloud_name>/<resource_type>/upload` plus the signature.
3. Send only the resulting `secure_url` / `public_id` back through the existing proxy.

This also removes the base64 memory overhead and makes large video uploads much faster.
`CLOUDINARY_API_SECRET` stays server-side throughout.
