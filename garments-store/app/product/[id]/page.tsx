import Image from "next/image";
import { notFound } from "next/navigation";
import { getProduct } from "@/lib/db";
import AddToCartForm from "@/components/AddToCartForm";

export default async function ProductPage({
  params
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-5xl px-5 py-12">
      <div className="grid gap-10 sm:grid-cols-2">
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-sand">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-clay">
            {product.section}
            {product.subCategory ? ` · ${product.subCategory}` : ""}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-ink">{product.name}</h1>
          <p className="mt-3 text-xl font-medium text-ink">
            Rs. {product.price.toLocaleString()}
          </p>
          <p className="mt-4 text-ink/70">{product.description}</p>
          <AddToCartForm product={product} />
        </div>
      </div>
    </div>
  );
}
