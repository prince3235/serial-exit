# Deploying Serial Exit — Firebase Hosting + Cloud Run

**Architecture**

```
Visitor ─► Firebase Hosting (global CDN, free SSL, custom domain)
              └─ rewrite "**" ─► Cloud Run service `serial-exit` (Next.js standalone, Mumbai)
                                    ├─ /api/contact ─► Firestore (collection `enquiries`) + optional Resend email
                                    └─ /api/portal  ─► signed-cookie gate (PORTAL_ACCESS_KEY from Secret Manager)
```

Hosting caches HTML for 5 minutes and all hashed assets for a year, so most visits never touch Cloud Run.

> **Honest status:** the application, API routes, headers and Docker/Firebase configs were written and the app was
> verified locally (production build, headless-Chrome checks, API tests). The deploy script and `firebase.json`
> could **not** be run against a real Google Cloud project in the environment they were built in — expect to
> fix small, project-specific things (billing, API enablement, org policies) on the first deploy.

---

## 1. One-time setup

1. Create (or pick) a Google Cloud project with **billing enabled**, and add Firebase to it at <https://console.firebase.google.com> ("Add project" → choose the existing project).
2. Install the CLIs and log in:
   ```bash
   npm i -g firebase-tools
   gcloud auth login && firebase login
   ```
3. Put your project id in `.firebaserc` (replace `YOUR_FIREBASE_PROJECT_ID`).
4. *(Optional but recommended)* create secrets:
   ```bash
   # the key partners type into the Partner Portal — long and random
   printf '%s' 'CHOOSE-A-LONG-RANDOM-KEY' | gcloud secrets create portal-access-key --data-file=-
   # only if you want enquiries emailed as well as stored (https://resend.com)
   printf '%s' 're_xxxxxxxx' | gcloud secrets create resend-api-key --data-file=-
   ```
   Without `portal-access-key` the portal **cannot be unlocked** (it fails closed).

## 2. Deploy

```bash
PROJECT_ID=your-project-id \
SITE_URL=https://www.your-domain.com \
npm run deploy
```

The script enables APIs, creates the Artifact Registry repo and Firestore database, builds the image with Cloud Build
(baking `SITE_URL` into canonical/OG/sitemap), deploys Cloud Run in `asia-south1`, grants the service account
Firestore access, and deploys Firebase Hosting + Firestore rules.

Useful overrides: `REGION`, `SERVICE`, `MIN_INSTANCES=1` (removes cold starts, small monthly cost),
`CONTACT_NOTIFY_EMAIL`, `NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`.

## 3. Custom domain + SSL

1. Firebase Console → **Hosting** → **Add custom domain** → enter `www.your-domain.com`.
2. Add the DNS records Firebase shows (a `TXT` for verification, then `A`/`AAAA` or `CNAME`) at your registrar.
3. Wait for verification — an SSL certificate is provisioned and renewed automatically (can take up to a few hours).
4. Decide on apex vs `www`: add both and set one to **redirect** to the other.
5. Make sure `SITE_URL` used at build time is the final canonical URL. If you change domains, re-run `npm run deploy`.
6. Submit `https://your-domain/sitemap.xml` in Google Search Console.

## 4. Verify after deploy

```bash
curl -sI https://your-domain/ | grep -iE "cache-control|strict-transport|content-security|x-cache"
curl -s  https://your-domain/api/health
curl -s  https://your-domain/robots.txt
```
* `x-cache: HIT` on a second request to `/` means the CDN is serving HTML without waking Cloud Run. If you never
  see `HIT`, check that the response has no `Set-Cookie` and that Cloud Run is the rewrite target.
* Submit the form once and confirm a document appears in Firestore → `enquiries`.
* Run PageSpeed Insights / Lighthouse on the live URL (mobile).

## 5. Reading enquiries

Firebase Console → Firestore → collection **`enquiries`** (fields: name, company, email, phone, role, message, tab,
createdAt, ipHash). Browser clients cannot read this collection (`firestore.rules` denies all client access).

## 6. Local development

```bash
cp .env.example .env.local
npm install
npm run dev                 # http://localhost:3000
npm run build && npm start  # production mode locally
npx playwright install chromium && npm run test:e2e
```
Contact form locally: run `firebase emulators:start --only firestore` and set `FIRESTORE_EMULATOR_HOST=127.0.0.1:8080`,
or just set `RESEND_API_KEY`. With neither, the form correctly reports an error (it never pretends a lead was saved).

## 7. Cloud Run only (no Firebase Hosting)

You can skip Hosting entirely: deploy with the same `gcloud run deploy` and map a domain with
`gcloud beta run domain-mappings create --service serial-exit --domain your-domain --region asia-south1`.
You lose the global CDN, so consider `MIN_INSTANCES=1`.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Hosting returns 404 / "service not found" | `serviceId`/`region` in `firebase.json` must match the Cloud Run service. |
| Form returns "couldn't submit" | Check Cloud Run logs; usually the service account lacks `roles/datastore.user` or Firestore isn't created. |
| Portal says "not open for sign-in" | `portal-access-key` secret missing or not mapped to the service. |
| Old HTML after a Cloud-Run-only redeploy | HTML edge cache is 5 min; run `firebase deploy --only hosting` to purge immediately. |
| Wrong canonical / OG URLs | `SITE_URL` was wrong at **build** time — redeploy with the right value. |

## ⚠ Before launch — replace placeholders

* `src/content/site.ts` → `contact.email`, `contact.phone` (`+91 00000 00000`) and the `linkedin` URL are still **placeholders**. Set the real values.
* Set `CONTACT_NOTIFY_EMAIL` to a monitored inbox.
* The Partner Portal case studies (`src/content/portal-cases.ts`) are **illustrative** — replace with real anonymised mandates or keep the disclaimer.
* Confirm legal copy (privacy/terms) with counsel; analytics is cookieless but that is not legal advice.
