# Deploy Smart Football on Vercel

## 1. Prerequisites

- [Vercel account](https://vercel.com/signup)
- Code in a Git repo (GitHub, GitLab, or Bitbucket)
- Firebase project with Firestore and Authentication enabled

---

## 2. Push your code to Git

If not already done:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

## 3. Import project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. **Import** your repository (e.g. `your-username/SmartFootball`).
3. **Framework Preset**: Vercel should detect **Next.js**.
4. **Root Directory**: leave as `.` (or set if your app is in a subfolder).
5. **Build Command**: `npm run build` (default).
6. **Output Directory**: leave default (Next.js).
7. Do **not** deploy yet — add environment variables first.

---

## 4. Add environment variables in Vercel

In your project on Vercel: **Settings → Environment Variables**.

Add these for **Production** (and optionally Preview/Development).

### Required – Firebase Admin (server/API)

Use **one** of the two options.

**Option A – Single JSON (recommended for Vercel)**

| Name | Value | Notes |
|------|--------|------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | `{"type":"service_account","project_id":"...", ...}` | Paste the **entire** contents of your Firebase service account JSON file as one line. Get it from Firebase Console → Project Settings → Service accounts → Generate new private key. |

**Option B – Separate variables**

| Name | Value |
|------|--------|
| `FIREBASE_PROJECT_ID` | Your Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Full private key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`. In Vercel you can use multiline; replace real newlines with `\n` if needed. |

### Required – Firebase Client (frontend auth)

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | From Firebase Console → Project settings → General → Your apps |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Same as Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `your-project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Numeric sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | e.g. `1:123456789:web:xxxxx` |

### Required – Federation admin

| Name | Value |
|------|--------|
| `FEDERATION_ADMIN_SECRET_CODE` | A secret string; only requests with this code can register a federation admin. |

### Optional

| Name | Value |
|------|--------|
| `NEXT_PUBLIC_APP_URL` | Your production URL, e.g. `https://your-app.vercel.app` or `https://yourdomain.com`. Used for Player ID card QR links. If not set, the app uses Vercel’s URL. |
| `BASEPATH` | Only if you use a base path (e.g. `/app`). |

Save each variable and choose the right environment (Production / Preview / Development).

---

## 5. Deploy

1. Click **Deploy** (or trigger a new deployment from the **Deployments** tab).
2. Wait for the build. If it fails, check the build logs and that all required env vars are set.
3. Open the generated URL (e.g. `https://smart-football-xxx.vercel.app`).

---

## 6. After deployment

- **Custom domain**: Project → **Settings → Domains** → add your domain.
- **Player ID card QR**: If you use a custom domain, set `NEXT_PUBLIC_APP_URL` to that domain (e.g. `https://yourdomain.com`) so QR codes point to the correct URL.
- **Firebase Auth authorized domains**: In Firebase Console → Authentication → Settings → Authorized domains, add:
  - `your-app.vercel.app`
  - Your custom domain (e.g. `yourdomain.com`)

---

## 7. Troubleshooting

| Issue | What to check |
|-------|----------------|
| Build fails on `pdfkit` / font path | `serverExternalPackages: ['pdfkit']` is already in `next.config.js`. Ensure you didn’t remove it. |
| Firebase / API errors in production | Confirm all Firebase env vars are set in Vercel and that the service account has access to Firestore and Auth. |
| Auth redirect or “unauthorized domain” | Add your Vercel URL and custom domain to Firebase **Authorized domains**. |
| ID card QR opens wrong URL | Set `NEXT_PUBLIC_APP_URL` to your production URL (with `https://`, no trailing slash). |

---

## Quick reference – minimal .env for Vercel

Copy the variable **names** (not secrets) from `.env.vercel.example` in this repo and paste the **values** in Vercel’s Environment Variables UI.
