import Link from "next/link";
import Image from "next/image";
import { Product } from "@/lib/types";

function totalStock(product: Product) {
  return product.variants.reduce((sum, v) => sum + v.stock, 0);
}

export default function ProductCard({ product }: { product: Product }) {
  const stock = totalStock(product);

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block rounded-lg border border-sand bg-white/60 p-2 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {stock === 0 && (
          <span className="absolute left-2 top-2 rounded bg-ink px-2 py-1 text-[10px] font-medium uppercase tracking-wide text-cream">
            Sold out
          </span>
        )}
      </div>
      <div className="px-2 py-3">
        <p className="text-[11px] uppercase tracking-wide text-clay">
          {product.section}
          {product.subCategory ? ` · ${product.subCategory}` : ""}
        </p>
        <h3 className="font-display text-lg font-semibold tracking-tight leading-snug text-ink">{product.name}</h3>
        <p className="mt-1 font-medium text-ink/80">Rs. {product.price.toLocaleString()}</p>
      </div>
    </Link>
  );
}
