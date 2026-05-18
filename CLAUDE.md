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

**Assam in Dallas** — a community website for the Assamese diaspora in Dallas. Next.js 16.2.6 (React 19) app router with Firebase backend and Stripe donations, deployed on Vercel.

### Routing

- `src/app/(public)/` — Public pages (homepage, events, gallery, community, news, donate, contact, about, performances, artists)
- `src/app/admin/` — Admin dashboard (protected by `AdminAuthGuard` component, not middleware)
- `src/app/admin/login/` — Only unprotected admin route
- `src/app/api/` — API routes: contact (Resend email), Stripe checkout/webhook, OG image generation (`/api/og`), ISR revalidation (`/api/revalidate`)

### Public Page Pattern: Server Wrapper + Client Component

All public pages use a two-file pattern to enable server-side metadata on client-interactive pages:

```
src/app/(public)/events/page.tsx           → Server Component: exports metadata, renders client
src/app/(public)/events/EventsPageClient.tsx → 'use client' component with state/hooks/effects
```

- `page.tsx` calls `generatePageMeta()` from `src/lib/constants/seo.ts` for static metadata, or `generateMetadata()` for dynamic pages that fetch from Firestore via Admin SDK.
- `*Client.tsx` contains the original page UI with `'use client'`, `useState`, `useEffect`, etc.
- Detail pages (e.g., `events/[year]/[eventSlug]/page.tsx`) use `generateMetadata()` with async params (`params: Promise<{ ... }>` — Next.js 16 API).

### Data Layer

All data lives in **Firestore**. Each domain has a service module in `src/lib/services/` that handles CRUD. Collection refs and doc helpers are in `src/lib/firebase/collections.ts`.

Key Firestore collections: `events`, `performances`, `members`, `media`, `albums`, `announcements`, `donations`, `banners`, `donationEvents`, `contactMessages`, `siteConfig`.

Site-wide configuration is a single Firestore document at `siteConfig/main`, managed by `src/lib/services/siteConfig.ts`. This controls animations, quick stats, donation settings, contact form, social links, about page content, and more.

### Firebase SDK: Client vs Admin

- **Client SDK** (`src/lib/firebase/client.ts`): Lazy-initialized via `getFirebaseAuth()`, `getFirebaseDb()`, `getFirebaseStorage()`. Used by all service modules in `src/lib/services/` and client components.
- **Admin SDK** (`src/lib/firebase/admin.ts`): Uses service account credentials from env vars. Provides `getAdminAuth()`, `getAdminDb()`, `getAdminStorage()`. Used in server-only contexts: `sitemap.ts`, `generateMetadata()` functions, API routes (`/api/stripe/webhook`).
- **Collections** (`src/lib/firebase/collections.ts`): Central collection ref and doc helper exports (e.g., `getEventsRef()`, `eventDoc(id)`). These use the client SDK.

### Authentication

Firebase Auth with email/password. Admin access requires a Firebase custom claim `admin: true` on the user's token. Auth state is provided globally via `src/providers/AuthProvider.tsx` which exports the `useAuth()` hook (`{ user, loading, isAdmin }`). Admin routes are guarded at the layout level by `src/components/admin/AdminAuthGuard.tsx`.

### Storage

Firebase Storage for all uploaded images/videos. `next.config.ts` allows remote images from `firebasestorage.googleapis.com`.

### SEO

- `src/lib/constants/seo.ts` exports `siteConfig` (name, URL, description, contactEmail, keywords), `generatePageMeta(title, description?, options?)` for building Next.js metadata objects, plus `stripHtml()` and `truncate()` helpers for cleaning Firestore HTML content.
- Root layout (`src/app/layout.tsx`) defines `title.template: '%s | Assam in Dallas, USA'` — page metadata should set `title` to the raw value only (no suffix).
- `src/app/sitemap.ts` is async, queries Firestore via Admin SDK for all published content, and generates dynamic routes alongside static ones.
- `/api/og` is an Edge route that generates dynamic OG images. Accepts `title` and `subtitle` query params.
- `src/components/shared/JsonLd.tsx` renders `<script type="application/ld+json">` for structured data.

## Key Conventions

### Tailwind CSS v4

Uses the new `@theme inline` directive in `src/app/globals.css` — not a `tailwind.config.ts` file. Custom color palettes: `gamosa` (red), `muga` (gold), `tea` (green), `earth` (brown neutrals). Custom font families: `font-heading` (Playfair Display), `font-body` (Inter), `font-assamese` (Noto Sans Assamese).

### Component Organization

- `src/components/ui/` — Custom component library (Button, Card, Input, Modal, Select, Badge, etc.). Not shadcn.
- `src/components/admin/` — Admin-specific components (DataTable, RichTextEditor via TipTap, FileUploadField, MediaUploader, AdminAuthGuard)
- `src/components/home/` — Homepage sections (HeroSection, FeaturedEvents, QuickStats, etc.)
- `src/components/home/animations/` — 7 homepage animation effects (FlyingBirds, FloatingLanterns, Fireflies, FallingTeaLeaves, FlowingRiver, ConfettiBurst, TwinklingStars), orchestrated by `HomepageAnimation` wrapper. Config-driven via `siteConfig.homepageAnimation`.
- `src/components/layout/` — Header, Footer, Sidebar
- `src/components/shared/` — Cross-cutting: AnimatedSection, FilterBar, JsonLd, OptimizedImage, SearchBar, SiteLogo, BackButton
- Domain-specific folders: `events/`, `gallery/`, `community/`, `artists/`, `performances/`, `donate/`, `contact/`

### Types

Shared types in `src/types/` exported via barrel `index.ts`. `WithId<T>` wraps Firestore documents with their `id`. All types are defined per domain (event.ts, member.ts, media.ts, etc.).

### Constants

- `src/lib/constants/seo.ts` — Site metadata, SEO helpers
- `src/lib/constants/categories.ts` — performanceCategories, performanceTypes, eventTypes, memberRoles, announcementCategories, donationTiers

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
- **Stripe**: Donation checkout sessions and webhooks (`src/lib/stripe/server.ts` — lazy singleton). `/api/stripe/checkout` creates sessions; `/api/stripe/webhook` handles `checkout.session.completed` and stores donations in Firestore.
- **Resend**: Transactional email for contact form. Falls back to Firestore-only storage if no API key — `/api/contact` still returns success.
- **Vercel**: Hosting, OG image generation (`@vercel/og`), on-demand ISR via `/api/revalidate` (POST with secret + path).
