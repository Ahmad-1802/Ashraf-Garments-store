import { notFound } from "next/navigation";
import { getProduct } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params
}: {
  params: { id: string };
}) {
  const product = await getProduct(params.id);
  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Edit product</h1>
      <ProductForm product={product} />
    </div>
  );
}
