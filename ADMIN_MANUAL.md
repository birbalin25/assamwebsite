# Assam in Dallas — Admin Instruction Manual

A complete guide for administrators to install, configure, deploy, and maintain the **Assam in Dallas** community website.

---

## Table of Contents

1. [Technology Stack Overview](#1-technology-stack-overview)
2. [End-to-End Website Setup and Deployment Guide](#2-end-to-end-website-setup-and-deployment-guide)
   - 2a. [Clone the Project from GitHub](#2a-clone-the-project-from-github)
   - 2b. [Create a Vercel Account](#2b-create-a-vercel-account)
   - 2c. [Create a Firebase Project](#2c-create-a-firebase-project)
   - 2d. [Configure Vercel and Firebase Credentials](#2d-configure-vercel-and-firebase-credentials)
   - 2e. [Create and Configure a Resend Account](#2e-create-and-configure-a-resend-account)
   - 2f. [Configure Donations / Payments (PayPal)](#2f-configure-donations--payments-paypal)
   - 2g. [Admin Portal Overview](#2g-admin-portal-overview)
   - 2h. [Deployment Workflow](#2h-deployment-workflow)
   - 2i. [Local Development and Testing](#2i-local-development-and-testing)
3. [Environment Variables and Secrets](#3-environment-variables-and-secrets)
4. [Production Maintenance Guide](#4-production-maintenance-guide)
5. [Troubleshooting](#5-troubleshooting)
6. [Security Best Practices](#6-security-best-practices)
7. [Appendix](#7-appendix)

---

## 1. Technology Stack Overview

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.6 | React-based web framework (App Router). Handles routing, server-side rendering, static generation, and API routes. |
| **React** | 19.2.4 | UI component library for building interactive interfaces. |
| **TypeScript** | 5.x | Type-safe JavaScript. All source code is written in TypeScript with strict mode enabled. |
| **Tailwind CSS** | 4 | Utility-first CSS framework. Custom theme with Assamese cultural color palettes (`gamosa`, `muga`, `tea`, `earth`) defined in `src/app/globals.css`. |
| **Firebase Auth** | 10.14.1 | User authentication via email/password. Admin access controlled by custom claims (`admin: true`). |
| **Cloud Firestore** | (via Firebase) | NoSQL database storing all website data: events, members, media, donations, site configuration, and more. |
| **Firebase Storage** | (via Firebase) | File storage for uploaded images and videos (banners, gallery, member photos). |
| **Firebase Admin SDK** | 13.9.0 | Server-side Firebase access for API routes and webhook handlers. |
| **PayPal** | (external redirect) | Donation processing. The website redirects donors to PayPal's hosted donation page using the configured PayPal business email. |
| **Stripe** | 22.1.1 | Payment infrastructure (API routes and webhook available for future Stripe checkout integration). |
| **Resend** | 6.12.3 | Transactional email service for delivering contact form submissions to the admin's inbox. |
| **Vercel** | (hosting) | Cloud hosting platform. Handles builds, deployments, preview URLs, and production hosting. |
| **Vercel OG** | 0.11.1 | Dynamic Open Graph image generation for social media sharing previews. |
| **TipTap** | 3.23.x | Rich text editor used in admin portal for editing announcements, about page content, and banner descriptions. |
| **Framer Motion** | 12.38.0 | Animation library for page transitions and interactive UI effects. |
| **Swiper** | 12.1.4 | Touch-enabled carousel/slider for the homepage banner rotation and gallery views. |
| **Zod** | 4.4.3 | Schema validation for contact forms, donation forms, and event forms. |
| **React Hook Form** | 7.75.0 | Form state management and validation handling. |
| **Lucide React** | 1.14.0 | Icon library used throughout the website and admin portal. |
| **Sonner** | 2.0.7 | Toast notification system for success/error messages in the admin portal. |
| **ESLint** | 9.x | Code linting and style enforcement. |

---

## 2. End-to-End Website Setup and Deployment Guide

> **Note:** Throughout this manual, we use `admin@example.com` as a sample email address. Replace it with your actual administrator email wherever it appears. Use the **same email** for all services (GitHub, Vercel, Firebase, Resend, PayPal) to simplify account management.

---

### 2a. Clone the Project from GitHub

**Prerequisites:** Install [Git](https://git-scm.com/downloads) and [Node.js](https://nodejs.org/) (version 18 or later).

1. Open a terminal.

2. Clone the repository:
   ```bash
   git clone https://github.com/birbalin25/assamwebsite.git
   ```

3. Navigate into the project:
   ```bash
   cd assamwebsite
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Verify the project structure:
   ```bash
   ls src/
   ```
   You should see folders: `app/`, `components/`, `lib/`, `providers/`, `types/`.

---

### 2b. Create a Vercel Account

Vercel hosts the website and automatically builds/deploys when code is pushed to GitHub.

1. Go to [https://vercel.com](https://vercel.com) and click **Sign Up**.

2. Select **Continue with GitHub** and sign in with your GitHub account (the one that has access to the repository).

3. After signing up, click **Add New Project**.

4. Select the **assamwebsite** repository from the list.

5. Vercel will auto-detect that it is a Next.js project. Accept the default settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** auto-detected

6. **Do not deploy yet** — you need to configure environment variables first (see [Section 2d](#2d-configure-vercel-and-firebase-credentials)).

7. Note your project URL. Vercel assigns a URL like `https://your-project-name.vercel.app`. You can add a custom domain later under **Project Settings > Domains**.

---

### 2c. Create a Firebase Project

Firebase provides authentication, database (Firestore), and file storage for the website.

#### Step 1: Create the Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/) and sign in with `admin@example.com`.

2. Click **Create a project** (or **Add project**).

3. Enter a project name, e.g., `assam-in-dallas`.

4. Disable Google Analytics (optional, not used by the website) and click **Create project**.

#### Step 2: Enable Authentication

1. In the Firebase Console, go to **Build > Authentication**.

2. Click **Get started**.

3. Under **Sign-in method**, enable **Email/Password**.

4. Go to the **Users** tab and click **Add user**.

5. Enter the admin email (`admin@example.com`) and a strong password. Click **Add user**.

6. Copy the **User UID** — you will need it to set the admin custom claim.

#### Step 3: Set the Admin Custom Claim

The website checks for a custom claim `admin: true` on the Firebase user token. You must set this using the Firebase Admin SDK or the Google Cloud CLI.

**Option A — Using the Firebase Admin SDK (Node.js script):**

Create a temporary file called `set-admin.js`:

```javascript
const admin = require('firebase-admin');

// Download your service account key from Firebase Console
// (Project Settings > Service accounts > Generate new private key)
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = 'PASTE_USER_UID_HERE'; // From step 2.6 above

admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log('Admin claim set successfully for user:', uid);
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error setting admin claim:', error);
    process.exit(1);
  });
```

Run it:
```bash
node set-admin.js
```

Delete the script and service account key file after use.

**Option B — Using the Google Cloud CLI:**

```bash
# Install gcloud CLI if not already installed
# https://cloud.google.com/sdk/docs/install

gcloud auth login
gcloud config set project YOUR_FIREBASE_PROJECT_ID

# Set custom claims via the Identity Platform REST API
curl -X POST \
  "https://identitytoolkit.googleapis.com/v1/accounts:update?key=YOUR_FIREBASE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"localId":"PASTE_USER_UID_HERE","customAttributes":"{\"admin\":true}"}'
```

#### Step 4: Enable Cloud Firestore

1. In the Firebase Console, go to **Build > Firestore Database**.

2. Click **Create database**.

3. Choose a location closest to your users (e.g., `us-central1` for Dallas).

4. Start in **Production mode**.

5. Set Firestore security rules (see [Section 6: Security Best Practices](#6-security-best-practices) for recommended rules).

#### Step 5: Enable Firebase Storage

1. In the Firebase Console, go to **Build > Storage**.

2. Click **Get started**.

3. Accept the default security rules for now (you should tighten them later — see [Section 6](#6-security-best-practices)).

#### Step 6: Register a Web App and Get Client Credentials

1. In the Firebase Console, go to **Project Settings** (gear icon at the top).

2. Scroll down to **Your apps** and click **Add app** > **Web** (the `</>` icon).

3. Enter an app nickname (e.g., `assam-website`) and click **Register app**.

4. Firebase displays your configuration values. Copy these — you will need them for environment variables:

   ```
   apiKey: "AIza..."
   authDomain: "assam-in-dallas.firebaseapp.com"
   projectId: "assam-in-dallas"
   storageBucket: "assam-in-dallas.firebasestorage.app"
   messagingSenderId: "123456789"
   appId: "1:123456789:web:abc123"
   ```

#### Step 7: Generate a Service Account Key (for Admin SDK)

1. In **Project Settings > Service accounts**, click **Generate new private key**.

2. Download the JSON file. You will need three values from it:
   - `project_id`
   - `client_email`
   - `private_key`

3. **Store this file securely.** Never commit it to the repository.

---

### 2d. Configure Vercel and Firebase Credentials

All credentials are stored as **environment variables** — never in source code.

#### For Local Development

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in the values using your Firebase and other credentials:

   ```env
   # Firebase Client (from Step 2c.6)
   NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=assam-in-dallas.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=assam-in-dallas
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=assam-in-dallas.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

   # Firebase Admin (from Step 2c.7)
   FIREBASE_ADMIN_PROJECT_ID=assam-in-dallas
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@assam-in-dallas.iam.gserviceaccount.com
   FIREBASE_ADMIN_PRIVATE_KEY="<paste-your-full-private-key-here>"

   # Stripe (optional — only if using Stripe checkout instead of PayPal)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Application
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   REVALIDATION_SECRET=any-random-secret-string
   ```

   > **Important:** Wrap `FIREBASE_ADMIN_PRIVATE_KEY` in double quotes and keep the `\n` characters as-is. The application converts them to actual newlines at runtime.

#### For Vercel (Production)

1. In the Vercel dashboard, go to your project > **Settings > Environment Variables**.

2. Add each variable from the list above, one by one.

3. For **`NEXT_PUBLIC_BASE_URL`**, set it to your production URL (e.g., `https://assam-in-dallas.vercel.app` or your custom domain).

4. For **`FIREBASE_ADMIN_PRIVATE_KEY`**, paste the entire private key string from the service account JSON file, including the BEGIN and END markers.

5. After adding all variables, trigger a redeployment:
   - Go to **Deployments** tab > find the latest deployment > click **Redeploy**.

---

### 2e. Create and Configure a Resend Account

Resend is used to deliver contact form submissions from the website to your inbox as emails.

#### How Email Integration Works

1. A visitor fills out the contact form on the `/contact` page.
2. The form submits to the `/api/contact` API route.
3. The API route sends the message as an email via the Resend service.
4. If Resend is not configured, the message is saved directly to Firestore (you can view it in the admin portal under **Messages**).
5. Either way, the message always appears in the admin portal's **Messages** section.

#### Step 1: Create a Resend Account

1. Go to [https://resend.com](https://resend.com) and sign up with `admin@example.com`.

2. Verify your email address.

#### Step 2: Generate an API Key

1. In the Resend dashboard, go to **API Keys**.

2. Click **Create API Key**.

3. Give it a name (e.g., `assam-website`) and select **Sending access** permission.

4. Copy the API key (starts with `re_...`).

#### Step 3: Configure the API Key

You have two options for where to store the Resend API key:

**Option A — Via Environment Variable (recommended for production):**

Add to your `.env.local` (local) or Vercel environment variables (production):
```env
RESEND_API_KEY=re_...
```

**Option B — Via Admin Portal:**

1. Log in to the admin portal at `/admin`.
2. Go to **Email Configuration**.
3. Paste the API key in the **Resend API Key** field.
4. Click **Save**.

> The API route checks the environment variable first, then falls back to the key stored in Firestore via the admin portal.

#### Who Receives the Emails?

The recipient email is determined in this order:

1. **Admin Portal setting:** In **Email Configuration**, the **Recipient Email** field.
2. **Environment variable:** `CONTACT_EMAIL` (not in `.env.example` by default but can be added).
3. **Hardcoded fallback:** The default email in the codebase.

#### How to Change the Recipient Email

1. Log in to the admin portal.
2. Go to **Email Configuration**.
3. Update the **Recipient Email** field to the desired email address.
4. Click **Save**.

#### Free Tier Limitations

- **100 emails per day**, 3,000 per month.
- On the free tier, the recipient email must match the email you used to sign up for Resend.
- To send to a different recipient, you need to verify a custom domain in Resend or upgrade your plan.

---

### 2f. Configure Donations / Payments (PayPal)

The website uses **PayPal** for processing donations. When a donor clicks "Donate with PayPal," they are redirected to PayPal's secure donation page. No payment data is handled by the website itself.

#### How Donations Work

1. An admin creates a **Donation Event** (campaign) in the admin portal with a title, description, goal amount, and suggested donation amounts.
2. On the public `/donate` page, visitors choose an amount and click **Donate with PayPal**.
3. The website constructs a PayPal donation URL using the configured PayPal business email and redirects the donor to PayPal.
4. PayPal processes the payment and deposits funds into the PayPal account linked to the configured email.
5. After donating, the donor is redirected back to the `/donate/thank-you` page.

#### Step 1: Set Up a PayPal Account

1. Go to [https://www.paypal.com](https://www.paypal.com) and sign up with `admin@example.com` (or use an existing PayPal Business account).

2. A **Business** account is recommended for receiving donations (it allows you to accept payments under an organization name).

3. Verify your PayPal account and link a bank account to receive funds.

#### Step 2: Configure PayPal in the Admin Portal

1. Log in to the admin portal at `/admin`.

2. Go to **Donations**.

3. In the **Settings** section:
   - **Enable/Disable Donations:** Toggle donations on or off site-wide.
   - **PayPal Email:** Enter the PayPal business email where donations should be sent (e.g., `admin@example.com`).
   - Click **Save Settings**.

4. The PayPal email is stored in Firestore (`siteConfig.paypalEmail`). If no PayPal email is configured, the donate page will show a "Donations are being set up" message.

#### Step 3: Create a Donation Event (Campaign)

1. In the **Donations** section, click **New Donation Event**.

2. Fill in:
   - **Title:** e.g., "Annual Community Fund"
   - **Description:** Explain what the funds will be used for.
   - **Goal Amount ($):** e.g., 10000
   - **Donation Amounts:** Comma-separated suggested amounts, e.g., `25, 50, 100, 250`
   - **Active:** Check this box to make it the active campaign.

3. Click **Save**. Only one donation event can be active at a time.

#### Where Do Donated Funds Go?

Funds go directly to the PayPal account associated with the PayPal email configured in step 2. The website never touches the money — it only redirects donors to PayPal.

#### Changing the Donation Recipient

To change where donations go, simply update the **PayPal Email** field in the admin portal under **Donations > Settings**.

---

### 2g. Admin Portal Overview

Access the admin portal at `/admin`. You must be logged in with a Firebase user that has the `admin: true` custom claim.

| Section | Route | Description |
|---|---|---|
| **Dashboard** | `/admin` | Overview with quick stats (events count, members count, media count, total donations). Links to all sections. |
| **Events** | `/admin/events` | Create, edit, and delete community events. Filter by type (Rongali Bihu, Bohag Bihu, Magh Bihu, Cultural Program) and year. Toggle draft/published status. |
| **Performances** | `/admin/performances` | Manage performance records linked to events. Filter by event, category, type, and year. |
| **Members** | `/admin/members` | Manage community member profiles with roles, location, and photos. Toggle draft/published. |
| **Gallery (Albums)** | `/admin/albums` | Create albums, upload photos and videos, organize media into hierarchical folders. Filter by year. |
| **News** | `/admin/announcements` | Publish news and announcements. Pin important items. Filter by category. |
| **About Page** | `/admin/about` | Edit the About page content: Our Story, Mission statement, and core values. Uses a rich text editor. |
| **Community Page** | `/admin/community` | Configure the Community page header image, title, description, and highlights section. |
| **Messages** | `/admin/messages` | View contact form submissions. Reply via email or delete messages. |
| **Banners** | `/admin/banners` | Manage homepage banner carousel. Configure slide transition interval, homepage animation (7 options), and per-banner settings (image, text, position, CTA). |
| **Donations** | `/admin/donations` | Enable/disable donations, configure PayPal email, and manage donation events (campaigns) with goals and suggested amounts. |
| **Email Config** | `/admin/email-config` | Configure the Resend API key, enable/disable the contact form, and set the recipient email address. |
| **Settings** | `/admin/settings` | Configure site identity (name, tagline, contact info, logo) and social media links (Facebook, Instagram, YouTube). |

---

### 2h. Deployment Workflow

#### How GitHub + Vercel Integration Works

When you connect your GitHub repository to Vercel:

- **Every push to `main`** triggers an automatic **production deployment**. The new version goes live at your production URL.
- **Every push to a non-main branch** (or every pull request) triggers a **preview deployment**. Vercel provides a unique URL for testing.

#### Preview Deployments (Testing Before Production)

1. Create a new branch for your changes:
   ```bash
   git checkout -b feature/my-change
   ```

2. Make changes, commit, and push:
   ```bash
   git add .
   git commit -m "Description of change"
   git push origin feature/my-change
   ```

3. Vercel automatically builds a preview deployment. Find the preview URL:
   - In the Vercel dashboard under **Deployments**.
   - Or in the GitHub pull request (Vercel posts a comment with the preview link).

4. Test the preview deployment thoroughly.

#### Promoting to Production

Once you are satisfied with the preview:

1. Create a pull request on GitHub from your branch to `main`.

2. Review and merge the pull request.

3. Vercel automatically deploys the merged code to production.

Alternatively, deploy directly from your local machine:
```bash
vercel --prod
```

#### Deploying from Local (Without GitHub)

If you need to deploy without pushing to GitHub:

```bash
# Install Vercel CLI (one-time)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

---

### 2i. Local Development and Testing

#### Prerequisites

- **Node.js** 18 or later
- **npm** (comes with Node.js)
- **Git**

#### Setup

1. Clone and install (if not already done):
   ```bash
   git clone https://github.com/birbalin25/assamwebsite.git
   cd assamwebsite
   npm install
   ```

2. Create your local environment file:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in `.env.local` with your Firebase credentials, Stripe keys (if applicable), and other configuration. See [Section 3](#3-environment-variables-and-secrets) for details.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

6. Access the admin portal at [http://localhost:3000/admin](http://localhost:3000/admin).

#### Local Firebase Configuration

The local development environment connects to the **same** Firebase project as production. All changes you make via the admin portal locally will affect the same Firestore database.

If you want a separate development database:
1. Create a second Firebase project (e.g., `assam-in-dallas-dev`).
2. Use that project's credentials in your `.env.local`.

#### Useful Commands

```bash
npm run dev          # Start dev server with hot reload
npm run build        # Run a production build locally (checks for errors)
npm run lint         # Run ESLint to check code style
npm run start        # Start the production build locally (run after `npm run build`)
```

---

## 3. Environment Variables and Secrets

| Variable | Required | Where to Configure | Description |
|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | `.env.local` + Vercel | Firebase Web API key. Found in Firebase Console > Project Settings > Your apps. |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Yes | `.env.local` + Vercel | Firebase Auth domain (e.g., `project-id.firebaseapp.com`). Found in same location. |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | `.env.local` + Vercel | Firebase project ID. Found in Firebase Console > Project Settings. |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Yes | `.env.local` + Vercel | Firebase Storage bucket URL. Found in Firebase Console > Storage. |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Yes | `.env.local` + Vercel | Firebase Cloud Messaging sender ID. Found in Project Settings > Your apps. |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Yes | `.env.local` + Vercel | Firebase app ID. Found in Project Settings > Your apps. |
| `FIREBASE_ADMIN_PROJECT_ID` | Yes | `.env.local` + Vercel | Same as the client project ID. Found in the service account JSON (`project_id`). |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Yes | `.env.local` + Vercel | Service account email. Found in the service account JSON (`client_email`). |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Yes | `.env.local` + Vercel | Service account private key. Found in the service account JSON (`private_key`). Must be wrapped in double quotes. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Optional | `.env.local` + Vercel | Stripe publishable key (starts with `pk_`). Only needed if using Stripe checkout. Found in Stripe Dashboard > Developers > API keys. |
| `STRIPE_SECRET_KEY` | Optional | `.env.local` + Vercel | Stripe secret key (starts with `sk_`). Server-side only. Found in same location. |
| `STRIPE_WEBHOOK_SECRET` | Optional | `.env.local` + Vercel | Stripe webhook signing secret (starts with `whsec_`). Generated when creating a webhook endpoint in Stripe Dashboard. |
| `RESEND_API_KEY` | Optional | `.env.local` + Vercel **or** Admin Portal | Resend API key for sending contact form emails. Can also be configured in admin portal under Email Configuration. If not set, contact messages are saved to Firestore only. |
| `NEXT_PUBLIC_BASE_URL` | Yes | `.env.local` + Vercel | The website's base URL. Set to `http://localhost:3000` locally or your production URL (e.g., `https://assam-in-dallas.vercel.app`) on Vercel. |
| `REVALIDATION_SECRET` | Yes | `.env.local` + Vercel | A random secret string used to authenticate on-demand ISR (Incremental Static Regeneration) revalidation requests. Generate any random string. |

> **Variables prefixed with `NEXT_PUBLIC_`** are exposed to the browser. All other variables are server-side only and never sent to the client.

---

## 4. Production Maintenance Guide

### Updating the Website

1. Pull the latest code:
   ```bash
   git pull origin main
   ```

2. Install any new dependencies:
   ```bash
   npm install
   ```

3. Test locally:
   ```bash
   npm run build
   npm run dev
   ```

4. Push changes to GitHub (triggers auto-deploy via Vercel):
   ```bash
   git add <files>
   git commit -m "Description of changes"
   git push origin main
   ```

   Or deploy directly:
   ```bash
   vercel --prod
   ```

### Deploying New Features

1. Create a feature branch:
   ```bash
   git checkout -b feature/new-feature
   ```

2. Develop and test locally.

3. Push to GitHub and create a pull request.

4. Vercel creates a preview deployment — test using the preview URL.

5. Merge the PR to `main` — Vercel auto-deploys to production.

### Rotating API Keys and Secrets

When you rotate a key (Firebase, Resend, Stripe, etc.):

1. Generate the new key in the respective service's dashboard.

2. Update the environment variable in **Vercel**:
   - Go to Project Settings > Environment Variables.
   - Edit the variable and paste the new value.

3. Update your local `.env.local` as well.

4. Trigger a redeployment in Vercel for the change to take effect:
   - Go to Deployments > latest deployment > click **Redeploy**.

5. **Revoke the old key** in the service's dashboard after confirming the new one works.

### Monitoring Logs and Deployment Errors

- **Vercel Logs:** In the Vercel dashboard, go to your project > **Logs** tab to view real-time runtime logs and errors.
- **Build Logs:** Click on any deployment in the **Deployments** tab to see the full build output.
- **Firebase Console:** Monitor Firestore reads/writes, Storage usage, and Auth activity from the Firebase Console.
- **Browser Console:** For client-side errors, open Chrome DevTools (F12) on the live site.

### Backing Up Firebase Data

#### Manual Export via Firebase Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Select your Firebase project.
3. Go to **Firestore > Import/Export**.
4. Click **Export** and select a Cloud Storage bucket for the backup.

#### Scheduled Backups via gcloud CLI

```bash
# Export all Firestore data to a Cloud Storage bucket
gcloud firestore export gs://your-backup-bucket/backups/$(date +%Y-%m-%d) \
  --project=assam-in-dallas
```

You can automate this with a cron job or Cloud Scheduler.

#### Storage Backup

Firebase Storage files can be synced to a local directory:
```bash
gsutil -m rsync -r gs://assam-in-dallas.firebasestorage.app ./storage-backup
```

### Adding a New Admin User

1. Create a new user in Firebase Console > Authentication > Users > Add user.
2. Set the `admin: true` custom claim on the new user (follow the same process as in [Section 2c, Step 3](#step-3-set-the-admin-custom-claim)).
3. The new admin can now log in at `/admin/login`.

### Removing Admin Access

To revoke admin access without deleting the user:
```javascript
admin.auth().setCustomUserClaims(uid, { admin: false });
```

Or delete the user entirely from Firebase Console > Authentication > Users.

---

## 5. Troubleshooting

### Build / Deployment Issues

| Problem | Cause | Solution |
|---|---|---|
| Build fails with "Module not found" | Missing dependency | Run `npm install` then retry the build |
| Build fails with TypeScript errors | Type errors in code | Run `npx tsc --noEmit` locally to see errors. Fix them before pushing. |
| Vercel deploy fails | Missing environment variables | Check Vercel > Project Settings > Environment Variables. Ensure all required vars are set. |
| Images not loading in production | Firebase Storage URL not allowed | Verify `next.config.ts` has `firebasestorage.googleapis.com` in `remotePatterns`. |

### Authentication Issues

| Problem | Cause | Solution |
|---|---|---|
| Cannot log in to admin portal | User does not have `admin: true` claim | Set the custom claim using the script in Section 2c, Step 3 |
| "Not authorized" after login | Custom claim not yet propagated | Sign out and sign back in. Firebase tokens cache claims for up to 1 hour. |
| Firebase Auth not initialized | Missing `NEXT_PUBLIC_FIREBASE_*` env vars | Check that all 6 Firebase client env vars are set |

### Email Issues

| Problem | Cause | Solution |
|---|---|---|
| Contact form emails not received | Resend API key not configured | Add `RESEND_API_KEY` to env vars or configure in Admin > Email Configuration |
| Emails going to spam | Sending from `onboarding@resend.dev` | Verify a custom domain in Resend for branded sender addresses |
| "Recipient must match signup email" | Resend free tier restriction | Upgrade Resend plan or use the same email for Resend signup and recipient |
| Messages not appearing in admin | Firestore connection issue | Check Firebase client credentials and Firestore rules |

### Donation Issues

| Problem | Cause | Solution |
|---|---|---|
| Donate page shows "being set up" | PayPal email not configured | Go to Admin > Donations and enter a PayPal business email |
| Donate page shows "not accepted" | Donations disabled | Go to Admin > Donations and toggle donations on |
| PayPal redirect not working | Invalid PayPal email | Verify the PayPal email is correct and the account is active |

### General Issues

| Problem | Cause | Solution |
|---|---|---|
| Blank page / white screen | JavaScript error | Check the browser console (F12) for errors |
| Stale content after update | ISR cache | Hit the revalidation endpoint: `POST /api/revalidate?secret=YOUR_REVALIDATION_SECRET&path=/page-to-refresh` |
| Styles not applying | Tailwind build cache | Delete `.next/` folder and rebuild: `rm -rf .next && npm run build` |
| `npm run dev` port in use | Port 3000 occupied | Use a different port: `npm run dev -- --port 3001` |

---

## 6. Security Best Practices

### Protecting API Keys

- **Never commit `.env.local`** to the repository. The `.gitignore` file already excludes `.env*` files.
- **Never expose server-side keys** (those without `NEXT_PUBLIC_` prefix) in client-side code.
- **Rotate keys periodically** (at least annually) for Firebase Admin, Resend, and Stripe.
- **Use Vercel environment variables** for production — never hardcode secrets in source code.

### Managing Admin Access

- Grant `admin: true` custom claims only to trusted individuals.
- Keep the number of admin users to a minimum.
- Regularly audit the Firebase Authentication users list and remove inactive admins.
- Use strong, unique passwords for admin accounts.
- Consider enabling multi-factor authentication in Firebase Auth for admin users.

### Securing Firestore Rules

Recommended Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Public read access for published content
    match /events/{doc} { allow read: if true; }
    match /performances/{doc} { allow read: if true; }
    match /members/{doc} { allow read: if true; }
    match /media/{doc} { allow read: if true; }
    match /albums/{doc} { allow read: if true; }
    match /announcements/{doc} { allow read: if true; }
    match /banners/{doc} { allow read: if true; }
    match /donationEvents/{doc} { allow read: if true; }
    match /siteConfig/{doc} { allow read: if true; }

    // Write access only for authenticated admin users
    match /{collection}/{doc} {
      allow write: if request.auth != null
                   && request.auth.token.admin == true;
    }

    // Contact messages: anyone can create, only admins can read/delete
    match /contactMessages/{doc} {
      allow create: if true;
      allow read, delete: if request.auth != null
                          && request.auth.token.admin == true;
    }

    // Donations: webhook writes (server-side via Admin SDK bypasses rules)
    match /donations/{doc} {
      allow read: if request.auth != null
                  && request.auth.token.admin == true;
    }
  }
}
```

### Securing Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Anyone can read (images are public on the website)
    match /{allPaths=**} {
      allow read: if true;
      // Only authenticated admins can upload/delete
      allow write: if request.auth != null
                   && request.auth.token.admin == true;
    }
  }
}
```

### Restricting Production Deployments

- **Protect the `main` branch** on GitHub:
  - Go to Repository Settings > Branches > Add rule.
  - Enable "Require a pull request before merging."
  - Enable "Require approvals" (at least 1).
  - This prevents accidental pushes directly to production.

- **Limit Vercel deployment access:** Only team members with Vercel access can trigger manual deployments.

### Safely Handling Payment Integration

- PayPal donations are processed entirely on PayPal's servers. The website never handles credit card data.
- The Stripe webhook endpoint (`/api/stripe/webhook`) validates signatures before processing events. Never disable this validation.
- Regularly review your PayPal transaction history for unauthorized activity.

---

## 7. Appendix

### Useful Commands

```bash
# Development
npm run dev                    # Start local dev server (hot reload)
npm run build                  # Production build (catches errors)
npm run lint                   # Run ESLint
npm run start                  # Start production server locally

# Deployment
vercel                         # Deploy preview build
vercel --prod                  # Deploy to production

# Git
git status                     # Check current changes
git pull origin main           # Pull latest from main
git push origin main           # Push to main (triggers deploy)

# Firebase (gcloud CLI)
gcloud firestore export gs://bucket/path    # Export Firestore data
gsutil ls gs://your-bucket                  # List Storage files

# Type checking
npx tsc --noEmit               # Check for TypeScript errors without building
```

### Folder Structure Overview

```
assamwebsite/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (public)/               # Public-facing pages
│   │   │   ├── about/              # About page
│   │   │   ├── artists/            # Artists listing + detail pages
│   │   │   ├── community/          # Community members + profiles
│   │   │   ├── contact/            # Contact form
│   │   │   ├── donate/             # Donation page + thank-you
│   │   │   ├── events/             # Events listing + detail pages
│   │   │   ├── gallery/            # Photos, videos, album pages
│   │   │   ├── news/               # News/announcements
│   │   │   └── performances/       # Performances listing + detail
│   │   ├── admin/                  # Admin portal (all protected except login)
│   │   │   ├── login/              # Admin login page
│   │   │   ├── about/              # Edit About page content
│   │   │   ├── albums/             # Manage photo/video albums
│   │   │   ├── announcements/      # Manage news items
│   │   │   ├── banners/            # Homepage banners + animations
│   │   │   ├── community/          # Community page settings
│   │   │   ├── donations/          # PayPal + donation events
│   │   │   ├── email-config/       # Resend email settings
│   │   │   ├── events/             # Manage events
│   │   │   ├── members/            # Manage members
│   │   │   ├── messages/           # View contact form submissions
│   │   │   ├── performances/       # Manage performances
│   │   │   └── settings/           # Site identity + social links
│   │   └── api/                    # Backend API routes
│   │       ├── contact/            # Contact form email handler
│   │       ├── og/                 # Open Graph image generation
│   │       ├── revalidate/         # ISR revalidation endpoint
│   │       └── stripe/             # Stripe checkout + webhook
│   ├── components/                 # React components
│   │   ├── ui/                     # Reusable UI components
│   │   ├── admin/                  # Admin-specific components
│   │   ├── home/                   # Homepage sections
│   │   │   └── animations/         # Homepage animation effects
│   │   ├── layout/                 # Header, Footer, Sidebar
│   │   └── [domain]/              # Domain-specific components
│   ├── lib/                        # Shared libraries
│   │   ├── firebase/               # Firebase client + admin init
│   │   ├── services/               # Firestore CRUD services
│   │   ├── stripe/                 # Stripe server init
│   │   ├── hooks/                  # Custom React hooks
│   │   ├── utils/                  # Utilities (cn, dates, slugify, validation)
│   │   └── constants/              # Navigation, SEO constants
│   ├── providers/                  # React context providers (Auth, Toast)
│   └── types/                      # TypeScript type definitions
├── public/                         # Static assets
├── .env.example                    # Template for environment variables
├── next.config.ts                  # Next.js configuration
├── package.json                    # Dependencies and scripts
└── CLAUDE.md                       # AI assistant instructions
```

### Recommended Workflows

**Adding a New Page:**
1. Create a new folder under `src/app/(public)/your-page/`.
2. Add a `page.tsx` file.
3. Create any needed components in `src/components/your-page/`.
4. Add the route to the navigation in `src/lib/constants/navigation.ts`.

**Adding a New Admin Section:**
1. Create a new folder under `src/app/admin/your-section/`.
2. Add a `page.tsx` file with `'use client'` directive.
3. Create a Firestore service module in `src/lib/services/`.
4. Add the section to `adminNavLinks` in `src/lib/constants/navigation.ts`.

**Updating Site Configuration:**
1. Add new fields to the `SiteConfig` interface in `src/lib/services/siteConfig.ts`.
2. Add defaults in `DEFAULT_SITE_CONFIG`.
3. Add the admin UI controls in the appropriate admin page.

### Official Documentation Links

| Service | URL |
|---|---|
| **Next.js** | [https://nextjs.org/docs](https://nextjs.org/docs) |
| **Vercel** | [https://vercel.com/docs](https://vercel.com/docs) |
| **Firebase** | [https://firebase.google.com/docs](https://firebase.google.com/docs) |
| **Cloud Firestore** | [https://firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore) |
| **Firebase Auth** | [https://firebase.google.com/docs/auth](https://firebase.google.com/docs/auth) |
| **Firebase Storage** | [https://firebase.google.com/docs/storage](https://firebase.google.com/docs/storage) |
| **Resend** | [https://resend.com/docs](https://resend.com/docs) |
| **PayPal Donate** | [https://developer.paypal.com/docs/donate/](https://developer.paypal.com/docs/donate/) |
| **Stripe** | [https://docs.stripe.com](https://docs.stripe.com) |
| **Tailwind CSS** | [https://tailwindcss.com/docs](https://tailwindcss.com/docs) |
| **React** | [https://react.dev](https://react.dev) |
| **TypeScript** | [https://www.typescriptlang.org/docs](https://www.typescriptlang.org/docs) |
| **GitHub** | [https://docs.github.com](https://docs.github.com) |

---

*This manual was created for the Assam in Dallas community website. For questions or issues, contact the site administrator or refer to the links above.*
