# Email / Ownership Migration Instructions

A step-by-step guide for transferring the Assam in Dallas website from one owner email (`OLD_EMAIL`) to a new community email (`NEW_EMAIL`). This guide is written generically so it works for any future email change.

---

## Table of Contents

1. [Pre-Migration Checklist](#1-pre-migration-checklist)
2. [Firebase — Transfer Project Ownership](#2-firebase--transfer-project-ownership)
3. [Firebase Auth — Create New Admin User](#3-firebase-auth--create-new-admin-user)
4. [Vercel — Transfer Project Ownership](#4-vercel--transfer-project-ownership)
5. [GitHub — New Account and Repository](#5-github--new-account-and-repository)
6. [Stripe — New Account](#6-stripe--new-account)
7. [Resend — New Account](#7-resend--new-account)
8. [Code Changes](#8-code-changes)
9. [Environment Variables](#9-environment-variables)
10. [Firestore siteConfig — Admin Dashboard Updates](#10-firestore-siteconfig--admin-dashboard-updates)
11. [DNS / Domain Configuration](#11-dns--domain-configuration)
12. [Verification Checklist](#12-verification-checklist)
13. [Post-Migration Cleanup](#13-post-migration-cleanup)

---

## 1. Pre-Migration Checklist

Before starting the migration, gather the following:

- [ ] Access to the current owner's accounts (Firebase, Vercel, GitHub, Stripe, Resend)
- [ ] The new email address (`NEW_EMAIL`) and its password
- [ ] A Google account for `NEW_EMAIL` (required for Firebase)
- [ ] The Firebase service account JSON key (download from Firebase Console > Project Settings > Service accounts)
- [ ] Access to the domain registrar (if using a custom domain like `assamindallas.org`)
- [ ] A copy of the current `.env.local` or Vercel environment variables

---

## 2. Firebase — Transfer Project Ownership

Firebase project ownership transfer preserves all data (Firestore, Auth users, Storage files) with zero downtime.

### Step 1: Add the new owner

1. Go to [Firebase Console](https://console.firebase.google.com/) and select the project.
2. Click the **gear icon** (Settings) > **Users and permissions**.
3. Click **Add member**.
4. Enter `NEW_EMAIL` and set the role to **Owner**.
5. Click **Add**.

### Step 2: Accept the invitation

1. The new owner (`NEW_EMAIL`) will receive an email invitation.
2. Open the email and click **Accept invitation**.
3. Log in to the Firebase Console with `NEW_EMAIL` and verify you can see the project.

### Step 3: Verify access

1. As `NEW_EMAIL`, navigate to each Firebase service (Auth, Firestore, Storage) to confirm full access.
2. Go to **Project Settings > Service accounts** and verify you can generate a new private key.

### Step 4: Remove the old owner

1. As the new owner, go to **Settings > Users and permissions**.
2. Find `OLD_EMAIL` and click the **three dots** menu > **Remove member**.
3. Confirm removal.

> **Important:** Do NOT remove the old owner until the new owner has verified full access.

---

## 3. Firebase Auth — Create New Admin User

### Step 1: Create the user

**Option A — Via Firebase Console:**

1. Go to Firebase Console > **Authentication > Users**.
2. Click **Add user**.
3. Enter `NEW_EMAIL` and a strong password.
4. Click **Add user** and note the **User UID**.

**Option B — Via the setup script:**

```bash
# Place your Firebase service account key at /tmp/firebase-admin-key.json
npx tsx scripts/setup-admin.ts NEW_EMAIL YOUR_PASSWORD
```

### Step 2: Set the admin custom claim

**Option A — Via the claim script:**

```bash
npx tsx scripts/set-admin-claim.ts NEW_EMAIL
```

**Option B — Via a one-off Node.js script:**

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-service-account-key.json');

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const uid = 'PASTE_NEW_USER_UID_HERE';
admin.auth().setCustomUserClaims(uid, { admin: true })
  .then(() => { console.log('Done'); process.exit(0); })
  .catch(console.error);
```

### Step 3: Verify admin login

1. Open the website and go to `/admin/login`.
2. Log in with `NEW_EMAIL` and the password you set.
3. Verify you can access all admin sections.

### Step 4: (Optional) Remove old admin user

1. In Firebase Console > **Authentication > Users**, find `OLD_EMAIL`.
2. Click the three dots > **Delete account**.

---

## 4. Vercel — Transfer Project Ownership

### Step 1: Create a Vercel account for `NEW_EMAIL`

Before transferring the project, the new owner needs a Vercel account.

1. Open a **private/incognito browser window** (so you're not logged into the old account).
2. Go to [vercel.com/signup](https://vercel.com/signup).
3. Click **Continue with GitHub** and sign in with the **new GitHub account** (created in [Section 5](#5-github--new-account-and-repository)). This links your Vercel and GitHub accounts, which is needed for automatic deployments.
   - Alternatively, click **Continue with Email**, enter `NEW_EMAIL`, and verify via the confirmation email. You can connect GitHub later.
4. Complete the onboarding steps (team name, etc.). The free **Hobby** plan is sufficient.
5. Note the **Vercel username** — the old owner will need it for the transfer. To find it: click your **avatar** (bottom-left corner of the dashboard) > **Settings** > your username is shown under **"Your Name"** or in the URL as `vercel.com/<username>`.

> **Important:** If you plan to use **Continue with GitHub**, complete [Section 5](#5-github--new-account-and-repository) (GitHub account creation) first.

### Step 2: Transfer the project

1. Log in to [Vercel](https://vercel.com) with the **current owner** account (`OLD_EMAIL`).
2. Go to the project > **Settings > General**.
3. Scroll down to **Transfer Project**.
4. Enter the new owner's **Vercel username** (from Step 1) and click **Transfer**. Vercel usernames are globally unique, so it will locate the correct account automatically.
5. The new owner logs in to their Vercel dashboard and **accepts** the transfer.

### Step 3: Connect the new GitHub repository

After the transfer, the project may still be linked to the old GitHub repository. Update it:

1. Log in to Vercel as the **new owner**.
2. Go to the transferred project > **Settings > Git**.
3. If prompted, click **Disconnect** to unlink the old repository.
4. Click **Connect Git Repository** and select the new repository (from [Section 5](#5-github--new-account-and-repository)).
5. Verify the **Production Branch** is set to `main`.

### Step 4: Verify after transfer

1. Go to **Settings > Environment Variables** and verify all variables are intact. If any are missing, re-add them (see [Section 9](#9-environment-variables)).
2. Trigger a redeployment: go to **Deployments** > latest deployment > click **Redeploy**.
3. Verify the production site loads correctly.
4. If using a custom domain (e.g., `assamindallas.org`), go to **Settings > Domains** and verify it's still connected.

---

## 5. GitHub — New Account and Repository

### Step 1: Create a GitHub account

1. Go to [github.com/signup](https://github.com/signup).
2. Sign up with `NEW_EMAIL`.
3. Choose a username (e.g., `dfwassamese`).

### Step 2: Create a new repository

1. Log in to GitHub with the new account.
2. Click **New repository**.
3. Name it `assamwebsite` (or your preferred name).
4. Set visibility to **Private** (recommended) or Public.
5. Do NOT initialize with README, .gitignore, or license.

### Step 3: Push the code

From your local clone of the project:

```bash
# Add the new remote
git remote add new-origin https://github.com/NEW_GITHUB_USERNAME/assamwebsite.git

# Push all branches and tags
git push new-origin --all
git push new-origin --tags

# (Optional) Replace the old origin
git remote remove origin
git remote rename new-origin origin
```

### Step 4: Reconnect Vercel to the new repository

1. In the Vercel dashboard, go to project **Settings > Git**.
2. Disconnect the old repository.
3. Connect the new repository from the new GitHub account.
4. Verify that pushing to `main` triggers a deployment.

### Step 5: Update ADMIN_MANUAL.md

Update the git clone URL in `ADMIN_MANUAL.md` to point to the new repository:

```
https://github.com/NEW_GITHUB_USERNAME/assamwebsite.git
```

---

## 6. Stripe — New Account

### Step 1: Create a Stripe account

1. Go to [stripe.com](https://stripe.com) and sign up with `NEW_EMAIL`.
2. Complete business verification (name, address, bank account).
3. Activate your account.

### Step 2: Get API keys

1. In the Stripe Dashboard, go to **Developers > API keys**.
2. Copy the **Publishable key** (`pk_live_...`) and **Secret key** (`sk_live_...`).

### Step 3: Create webhook endpoint

1. Go to **Developers > Webhooks** > **Add endpoint**.
2. Set the endpoint URL to: `https://YOUR_DOMAIN/api/stripe/webhook`
3. Select event: `checkout.session.completed`.
4. Click **Add endpoint**.
5. Copy the **Signing secret** (`whsec_...`).

### Step 4: Update environment variables

Update the following in Vercel (and `.env.local` for local dev):

| Variable | New Value |
|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | New `pk_live_...` key |
| `STRIPE_SECRET_KEY` | New `sk_live_...` key |
| `STRIPE_WEBHOOK_SECRET` | New `whsec_...` signing secret |

---

## 7. Resend — New Account

### Step 1: Create a Resend account

1. Go to [resend.com](https://resend.com) and sign up with `NEW_EMAIL`.
2. Verify your email address.

### Step 2: Generate an API key

1. In the Resend dashboard, go to **API Keys**.
2. Click **Create API Key**, name it (e.g., `assam-website`), set permission to **Sending access**.
3. Copy the key (starts with `re_...`).

### Step 3: Update the API key

**Option A — Environment variable:**

Update `RESEND_API_KEY` in Vercel and `.env.local`.

**Option B — Admin dashboard:**

1. Log in to the admin portal.
2. Go to **Email Configuration**.
3. Paste the new Resend API key.
4. Update the **Recipient Email** to `NEW_EMAIL`.
5. Click **Save**.

> **Note:** On Resend's free tier, the recipient email must match the Resend signup email. If you need a different recipient, verify a custom domain in Resend.

---

## 8. Code Changes

The following files contain hardcoded email addresses that should be updated. Replace `OLD_EMAIL` / old emails with `NEW_EMAIL`.

### File 1: `scripts/setup-admin.ts`

This script now accepts email and password as CLI arguments — no hardcoded emails to change.

```bash
npx tsx scripts/setup-admin.ts NEW_EMAIL YOUR_PASSWORD
```

### File 2: `scripts/set-admin-claim.ts`

This script now accepts email as a CLI argument — no hardcoded emails to change.

```bash
npx tsx scripts/set-admin-claim.ts NEW_EMAIL
```

### File 3: `src/lib/services/siteConfig.ts`

Update the `DEFAULT_SITE_CONFIG` object:

| Line | Field | Change to |
|---|---|---|
| ~80 | `contactEmail` | `NEW_EMAIL` |
| ~96 | `contactFormRecipient` | `NEW_EMAIL` |

### File 4: `src/lib/constants/seo.ts`

| Line | Field | Change to |
|---|---|---|
| ~7 | `contactEmail` | `NEW_EMAIL` |

### File 5: `src/app/api/contact/route.ts`

| Line | Description | Change to |
|---|---|---|
| ~21 | Fallback recipient email | `NEW_EMAIL` |

### File 6: `src/app/admin/email-config/page.tsx`

| Line | Description | Change to |
|---|---|---|
| ~25 | Default in `loadConfig` | `NEW_EMAIL` |
| ~41 | Fallback in `handleSave` | `NEW_EMAIL` |
| ~111 | Input placeholder | `NEW_EMAIL` |
| ~112 | Helper text | `"Default: NEW_EMAIL"` |

### File 7: `ADMIN_MANUAL.md`

Update the GitHub clone URL to the new repository URL (appears twice, around lines 70 and 526).

---

## 9. Environment Variables

After creating new accounts for each service, update these variables in **Vercel** (Project Settings > Environment Variables) and your local **`.env.local`**:

| Variable | When to Update | Source |
|---|---|---|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | New Stripe account | Stripe Dashboard > Developers > API keys |
| `STRIPE_SECRET_KEY` | New Stripe account | Stripe Dashboard > Developers > API keys |
| `STRIPE_WEBHOOK_SECRET` | New Stripe webhook | Stripe Dashboard > Developers > Webhooks |
| `RESEND_API_KEY` | New Resend account | Resend Dashboard > API Keys |
| `FIREBASE_ADMIN_PROJECT_ID` | Only if Firebase project changes | Service account JSON |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Only if Firebase project changes | Service account JSON |
| `FIREBASE_ADMIN_PRIVATE_KEY` | If you regenerate the service account key | Service account JSON |
| `NEXT_PUBLIC_FIREBASE_*` | Only if Firebase project changes | Firebase Console > Project Settings |
| `NEXT_PUBLIC_BASE_URL` | Only if domain changes | Your production URL |
| `REVALIDATION_SECRET` | Recommended to rotate | Generate a new random string |

After updating, **redeploy** in Vercel for changes to take effect.

---

## 10. Firestore siteConfig — Admin Dashboard Updates

Some email addresses are stored in Firestore (the `siteConfig/main` document) and are editable via the admin dashboard. Update these after the migration:

1. **Admin > Settings**: Update the **Contact Email** field to `NEW_EMAIL`.
2. **Admin > Email Configuration**: Update the **Recipient Email** to `NEW_EMAIL`.
3. **Admin > Email Configuration**: Update the **Resend API Key** to the new key.
4. **Admin > Donations**: Update the **PayPal Email** to the new PayPal account email (if applicable).

> These Firestore values override the hardcoded defaults in the code. Even if you update the code, you should also update Firestore to ensure consistency.

---

## 11. DNS / Domain Configuration

### If keeping the same domain (e.g., `assamindallas.org`)

No DNS changes are needed if:
- The domain registrar account remains accessible.
- Vercel project ownership was transferred (not recreated).

### If the domain registrar account needs to transfer

1. Log in to the current domain registrar.
2. Unlock the domain and obtain the **authorization/transfer code**.
3. Initiate a domain transfer from the new registrar account.
4. Approve the transfer via email confirmation.
5. After transfer completes, verify DNS records still point to Vercel:
   - `A` record: `76.76.21.21`
   - `CNAME` for `www`: `cname.vercel-dns.com`

### If changing to a new domain

1. Register the new domain.
2. In Vercel, go to Project Settings > Domains > Add your new domain.
3. Configure DNS as Vercel instructs.
4. Update `NEXT_PUBLIC_BASE_URL` in environment variables.
5. Update `src/lib/constants/seo.ts` if the `url` field needs to change.
6. Update the sitemap and OG image URLs accordingly.

---

## 12. Verification Checklist

After completing the migration, verify each of the following:

### Authentication
- [ ] New admin can log in at `/admin/login`
- [ ] Old admin credentials no longer work (if removed)
- [ ] All admin dashboard sections are accessible

### Contact Form
- [ ] Submit a test message via the `/contact` page
- [ ] Verify the email arrives at `NEW_EMAIL`
- [ ] Verify the message appears in Admin > Messages

### Donations
- [ ] Donation page loads correctly at `/donate`
- [ ] PayPal redirect uses the correct PayPal email
- [ ] (If using Stripe) Test a donation in Stripe test mode

### Email Delivery
- [ ] Resend API key is valid (check Resend dashboard for delivery logs)
- [ ] Emails are delivered (not bouncing or going to spam)

### Deployment
- [ ] Pushing to `main` on the new GitHub repo triggers a Vercel deployment
- [ ] Preview deployments work on branches
- [ ] The production site loads without errors

### SEO & Metadata
- [ ] Contact email on public pages shows `NEW_EMAIL`
- [ ] OG images generate correctly (`/api/og?title=Test`)
- [ ] Sitemap is accessible at `/sitemap.xml`

### Code Verification
Run these commands to confirm no old emails remain in the codebase:

```bash
# Should return zero results
grep -r "OLD_EMAIL" --include="*.ts" --include="*.tsx" --include="*.md" src/ scripts/
grep -r "info@assameseassociationofdallas.org" --include="*.ts" --include="*.tsx" src/
grep -r "vijay.in09@gmail.com" --include="*.ts" --include="*.tsx" src/
grep -r "birbal.in@gmail.com" --include="*.ts" --include="*.tsx" src/ scripts/
```

---

## 13. Post-Migration Cleanup

### Remove old accounts (after verification)

- [ ] Remove `OLD_EMAIL` from Firebase project members
- [ ] Delete the old admin user from Firebase Auth
- [ ] Revoke/delete old Stripe API keys (deactivate old Stripe account if applicable)
- [ ] Delete old Resend API keys
- [ ] Archive or delete the old GitHub repository (after confirming the new repo has all code)

### Rotate secrets

- [ ] Generate a new `REVALIDATION_SECRET` and update in Vercel
- [ ] Generate a new Firebase Admin service account key if the old one was shared with the previous owner
- [ ] Update all rotated values in both Vercel and `.env.local`

### Document the change

- [ ] Record the date of migration
- [ ] Note which accounts were transferred vs. newly created
- [ ] Store new credentials securely (use a password manager)
- [ ] Share access with other authorized community administrators

### Clean up local files

- [ ] Delete any service account JSON files from your local machine
- [ ] Remove `/tmp/firebase-admin-key.json` if it exists
- [ ] Verify `.env.local` has the new credentials

---

*This guide was created for the Assam in Dallas community website. For any future ownership transfer, follow these same steps with the appropriate `OLD_EMAIL` and `NEW_EMAIL` values.*
