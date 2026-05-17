# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build (Turbopack)
npm run lint         # ESLint v9
vercel --prod        # Deploy to production from local
```

No test framework is configured. Playwright is a devDependency but has no test scripts.

## Architecture

**Assam in Dallas** — a community website for the Assamese diaspora in Dallas. Next.js 16 app router with Firebase backend and Stripe donations, deployed on Vercel.

### Routing

- `src/app/(public)/` — Public pages (homepage, events, gallery, community, news, donate, contact, about, performances, artists)
- `src/app/admin/` — Admin dashboard (protected by `AdminAuthGuard` component, not middleware)
- `src/app/admin/login/` — Only unprotected admin route
- `src/app/api/` — API routes: contact (Resend email), Stripe checkout/webhook, OG image generation, ISR revalidation

### Data Layer

All data lives in **Firestore**. Each domain has a service module in `src/lib/services/` that handles CRUD. Collection refs and doc helpers are in `src/lib/firebase/collections.ts`.

Key Firestore collections: `events`, `performances`, `members`, `media`, `albums`, `announcements`, `donations`, `banners`, `donationEvents`, `contactMessages`, `siteConfig`.

Site-wide configuration is a single Firestore document at `siteConfig/main`, managed by `src/lib/services/siteConfig.ts`. This controls animations, quick stats, donation settings, contact form, social links, about page content, and more.

### Authentication

Firebase Auth with email/password. Admin access requires a Firebase custom claim `admin: true` on the user's token. Auth state is provided globally via `src/providers/AuthProvider.tsx` which exports the `useAuth()` hook (`{ user, loading, isAdmin }`). Admin routes are guarded at the layout level by `src/components/admin/AdminAuthGuard.tsx`.

### Storage

Firebase Storage for all uploaded images/videos. `next.config.ts` allows remote images from `firebasestorage.googleapis.com`.

## Key Conventions

### Tailwind CSS v4

Uses the new `@theme inline` directive in `src/app/globals.css` — not a `tailwind.config.ts` file. Custom color palettes: `gamosa` (red), `muga` (gold), `tea` (green), `earth` (brown neutrals). Custom font families: `font-heading` (Playfair Display), `font-body` (Inter), `font-assamese` (Noto Sans Assamese).

### Component Organization

- `src/components/ui/` — Custom component library (Button, Card, Input, Modal, Select, Badge, etc.). Not shadcn.
- `src/components/admin/` — Admin-specific components (DataTable, RichTextEditor via TipTap, FileUploadField, AdminAuthGuard)
- `src/components/home/` — Homepage sections (HeroSection, FeaturedEvents, QuickStats, etc.)
- `src/components/home/animations/` — Homepage animation effects, rendered by `HomepageAnimation` wrapper
- `src/components/layout/` — Header, Footer, Sidebar
- `src/components/shared/` — Cross-cutting components (SiteLogo)
- Domain-specific folders: `events/`, `gallery/`, `community/`, `artists/`, `performances/`, `donate/`, `contact/`

### Types

Shared types in `src/types/` exported via barrel `index.ts`. `WithId<T>` wraps Firestore documents with their `id`. All types are defined per domain (event.ts, member.ts, media.ts, etc.).

### Utilities

- `src/lib/utils/cn.ts` — tailwind-merge class name helper
- `src/lib/utils/validation.ts` — Zod schemas for contact, donation, event forms
- `src/lib/utils/dates.ts` — Date formatting
- `src/lib/utils/slugify.ts` — URL slug generation
- Path alias: `@/*` maps to `./src/*`

## Environment Variables

See `.env.example`. Requires Firebase client keys (`NEXT_PUBLIC_FIREBASE_*`), Firebase Admin credentials (`FIREBASE_ADMIN_*`), Stripe keys (`STRIPE_*`, `NEXT_PUBLIC_STRIPE_*`), `NEXT_PUBLIC_BASE_URL`, and `REVALIDATION_SECRET`.

## External Services

- **Firebase**: Auth, Firestore, Storage
- **Stripe**: Donation checkout sessions and webhooks
- **Resend**: Transactional email for contact form (falls back to Firestore storage if no API key)
- **Vercel**: Hosting, OG image generation (`@vercel/og`)
