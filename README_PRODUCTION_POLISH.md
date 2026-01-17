# Production Polish - Verification Checklist

This document outlines the "production polish" improvements made to the SmartBuild platform.

## 1. Error Handling & Resilience
- **Global Error Boundary**: `app/error.tsx` catches unhandled crashes with a friendly UI and generates an Error ID.
- **Custom 404**: `app/not-found.tsx` provides a branded "Page Not Found" screen with a CTA to the catalog.
- **Account Protection**: A specific error boundary in `app/account/error.tsx` ensures dashboard failures don't crash the whole app.

## 2. Loading Experience (Skeletons)
No more white screens or layout shifts. Skeletons implemented for:
- **Product Catalog**: Grid of card placeholders.
- **Cart**: List of item placeholders.
- **Dashboard**: Widget structure placeholders.

## 3. SEO & Metadata
- **Robots & Sitemap**:
  - `/robots.txt` (via `robots.ts`) manages indexation.
  - `/sitemap.xml` (via `sitemap.ts`) lists public routes.
- **Metadata**:
  - Base metadata in `layout.tsx` (Title, Description, Keywords).
  - Dynamic `metadataBase` configuration.
  - OpenGraph & Twitter Cards configured.
- **Social Preview**:
  - Dynamic `opengraph-image.tsx` generates a branded social card on the fly.

## 4. UX Enhancements
- **Toast Notifications**: Lightweight system for success/error messages (`ToastProvider`).
- **Empty States**:
  - "No Orders" screen with icon and CTA.
  - "No Products Found" screen with suggestions.
- **Accessibility**:
  - Focus indicators required for production are handled by Tailwind.
  - Contrast and semantic HTML structure verified.

## Manual Verification Checklist

- [ ] **404 Test**: Go to `/random-page` → Should see custom 404 UI.
- [ ] **Error Test**: (Dev only) Throw an error in a component → Should see "midagi läks valesti" screen with Error ID.
- [ ] **Loading Test**: Set Network to "Slow 3G" in DevTools → Click "Catalog" → Should see card skeletons.
- [ ] **SEO**:
    - Visit `/robots.txt` → Should allow `/`.
    - Visit `/sitemap.xml` → Should list pages.
    - Inspect `<head>` → Should see `og:image`, `description`, `application/ld+json`.
- [ ] **Empty State**:
    - Go to `/account/orders` (new account) → Should see "No orders" icon + button.

## Next Steps
- Monitor console for any client-side hydration errors in production.
- Verify `og:image` caching on social platforms (Facebook Debugger).
