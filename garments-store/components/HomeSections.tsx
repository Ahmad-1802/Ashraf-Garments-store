"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Product, Section } from "@/lib/types";
import ProductCard from "@/components/ProductCard";

const SECTIONS: Section[] = ["Boys", "Girls", "Uniforms"];
const SECTION_TAGLINES: Record<Section, string> = {
  Boys: "Shirts, shorts, pants & more",
  Girls: "Frocks, traditional wear, pants & more",
  Uniforms: "School shirts, trousers & more"
};

export default function HomeSections({ products }: { products: Product[] }) {
  const [activeSection, setActiveSection] = useState<Section>("Boys");
  const [activeSub, setActiveSub] = useState<string>("All");

  function selectSection(section: Section) {
    setActiveSection(section);
    setActiveSub("All");
    document.getElementById("shop-tabs")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const sectionCounts = useMemo(() => {
    const counts: Record<Section, number> = { Boys: 0, Girls: 0, Uniforms: 0 };
    for (const p of products) counts[p.section] = (counts[p.section] ?? 0) + 1;
    return counts;
  }, [products]);

  const sectionImage = useMemo(() => {
    const map: Partial<Record<Section, string>> = {};
    for (const p of products) if (!map[p.section]) map[p.section] = p.image;
    return map;
  }, [products]);

  const subCategories = useMemo(() => {
    const set = new Set<string>();
    for (const p of products) {
      if (p.section === activeSection && p.subCategory) set.add(p.subCategory);
    }
    return ["All", ...Array.from(set)];
  }, [products, activeSection]);

  const filtered = useMemo(() => {
    return products.filter(
      (p) =>
        p.section === activeSection &&
        (activeSub === "All" || p.subCategory === activeSub)
    );
  }, [products, activeSection, activeSub]);

  return (
    <section id="shop" className="scroll-mt-20">
      <div className="mb-14 grid gap-4 sm:grid-cols-3">
        {SECTIONS.map((section) => (
          <button
            key={section}
            onClick={() => selectSection(section)}
            className="group relative overflow-hidden rounded-xl border border-sand text-left"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand">
              {sectionImage[section] && (
                <Image
                  src={sectionImage[section]!}
                  alt={section}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="font-display text-xl font-semibold tracking-tight text-cream">
                {section}
              </p>
              <p className="mt-0.5 text-xs text-cream/80">{SECTION_TAGLINES[section]}</p>
            </div>
            <span className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-cream/90 text-ink transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              →
            </span>
          </button>
        ))}
      </div>

      <div id="shop-tabs" className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-sand scroll-mt-20">
        <div className="flex gap-8">
          {SECTIONS.map((section) => (
            <button
              key={section}
              onClick={() => selectSection(section)}
              className={`relative pb-4 text-lg font-medium transition-colors duration-300 ${
                activeSection === section ? "text-ink" : "text-ink/40 hover:text-ink/70"
              }`}
            >
              {section}
              <span className="ml-2 text-xs font-normal text-ink/40">
                {sectionCounts[section]}
              </span>
              <span
                className={`absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-clay transition-transform duration-300 ${
                  activeSection === section ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {subCategories.length > 1 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSub(sub)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-colors duration-200 ${
                activeSub === sub
                  ? "border-ink bg-ink text-cream"
                  : "border-sand text-ink/70 hover:border-ink/40"
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-ink/50">
          No products in this section yet &mdash; add some from the admin panel.
        </p>
      ) : (
        <div
          key={`${activeSection}-${activeSub}`}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="grid-item-in"
              style={{ ["--stagger-delay" as string]: `${Math.min(i, 8) * 60}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
