# Garments Store — COD Production Build

A Next.js garments e-commerce store with a protected admin panel. This version is designed to launch with **Cash on Delivery first**. PayFast and automatic courier booking are intentionally disabled until their real merchant APIs are ready.

## Included

- Storefront, product pages, cart and checkout
- Cash on Delivery checkout
- Server-side price and stock validation
- Protected admin dashboard and admin APIs
- Product CRUD and stock per size
- Order management and manual tracking-number entry
- Supabase/Postgres production database support
- Local JSON fallback for development
- PayFast/courier integration points kept for a later phase

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Without Supabase environment variables, local development uses the JSON files in `data/`.

## Production database — required before going live

Create a Supabase project and run **`supabase_schema.sql`** in its SQL Editor.

Set these Vercel environment variables:

```text
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

The service-role key is server-only. Never expose it through `NEXT_PUBLIC_*` and never commit it to GitHub.

When both variables exist, the application automatically uses Supabase instead of the local JSON store.

### Product image uploads

The admin product form uploads images directly (JPG/PNG/WEBP/GIF, max 5MB) instead of requiring a pasted URL.

In production this needs a Supabase Storage bucket:

1. In the Supabase dashboard, go to **Storage → New bucket**.
2. Name it exactly `product-images`.
3. Turn **Public bucket** on (product photos need to be publicly viewable on the storefront).
4. Save. No further config needed — the app uses the same `SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` already set above.

In local development (no Supabase env vars set), uploaded images are written to `public/uploads/` instead — no setup required, but this folder isn't meant for production use, which is why the Supabase bucket above is required before going live.

## Launching without PayFast/courier APIs

Checkout is **COD only**. Online payment is intentionally hidden until PayFast is integrated.

Automatic courier booking is disabled. Admins can manually enter a courier tracking number and change an order to `shipped`.

This lets you launch the store first, manually arrange delivery, and add API automation later.

## Admin

Before deployment, set a strong `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and long random `ADMIN_SESSION_SECRET`. Admin-only API routes verify the admin session cookie.

## Deploy to Vercel

1. Put the project in a private GitHub repository.
2. Import it into Vercel.
3. Add the production environment variables.
4. Deploy.
5. Place a real COD test order.
6. Confirm the order appears in `/admin/orders` and stock decreases.
7. Test product management and manual tracking.
8. Add your custom domain.

## Later integrations

When ready, replace the disabled PayFast and courier routes with the current merchant API implementations. Verify sandbox behavior, signatures/webhooks and production credentials before enabling real payments or automatic booking.
