import { getProducts } from "@/lib/db";
import HomeSections from "@/components/HomeSections";
import ScrollReveal from "@/components/ScrollReveal";

export default async function HomePage() {
  const products = await getProducts();

  return (
    <div>
      <section className="relative overflow-hidden border-b border-sand bg-gradient-to-b from-sand/40 to-cream">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:py-28">
          <div className="fade-up max-w-2xl">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-clay">
              Newborn to 15 years
            </p>
            <h1 className="font-display text-4xl font-semibold tracking-tight leading-[1.05] text-ink sm:text-6xl">
              Ready-made kids &amp; teen wear, made for everyday life.
            </h1>
            <p className="mt-5 max-w-lg text-base text-ink/70 sm:text-lg">
              Boys, girls, and school uniforms &mdash; quality basics and everyday
              essentials, delivered to your door with Cash on Delivery anywhere in
              Pakistan.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#shop-tabs"
                className="rounded-md bg-ink px-6 py-3 text-sm font-medium text-cream transition hover:bg-clay"
              >
                Shop the collection
              </a>
              <a
                href="tel:+923017702970"
                className="rounded-md border border-ink/15 px-6 py-3 text-sm font-medium text-ink transition hover:border-clay hover:text-clay"
              >
                Call to order &mdash; +92 301 7702970
              </a>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-ink/60">
              <span>Cash on delivery</span>
              <span className="text-ink/25">&bull;</span>
              <span>Nationwide shipping</span>
              <span className="text-ink/25">&bull;</span>
              <span>Boys, girls &amp; uniforms</span>
            </div>
          </div>
        </div>
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-clay/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-indigo/10 blur-3xl"
        />
      </section>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        {products.length === 0 ? (
          <p className="text-ink/60">
            No products yet &mdash; add your first one from the admin panel.
          </p>
        ) : (
          <ScrollReveal>
            <HomeSections products={products} />
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
