"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Product, Section, Variant } from "@/lib/types";

const SECTIONS: Section[] = ["Boys", "Girls", "Uniforms"];
const SUBCATEGORY_SUGGESTIONS = ["Shirts", "Pants", "Shorts", "Traditional"];

export default function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [section, setSection] = useState<Section>(product?.section ?? "Boys");
  const [subCategory, setSubCategory] = useState(product?.subCategory ?? "");
  const [image, setImage] = useState(product?.image ?? "");
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants ?? [{ size: "", stock: 0 }]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData
    });

    setUploading(false);
    e.target.value = "";

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setUploadError(data.error ?? "Upload failed.");
      return;
    }

    const data = await res.json();
    setImage(data.url);
  }

  function updateVariant(index: number, field: keyof Variant, value: string) {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === index
          ? { ...v, [field]: field === "stock" ? Number(value) : value }
          : v
      )
    );
  }

  function addVariant() {
    setVariants((prev) => [...prev, { size: "", stock: 0 }]);
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (variants.some((v) => !v.size)) {
      setError("Every size row needs a size name.");
      return;
    }

    setSaving(true);
    const payload = {
      name,
      description,
      price: Number(price),
      section,
      subCategory,
      image: image || undefined,
      variants
    };

    const res = await fetch(
      isEdit ? `/api/products/${product!.id}` : "/api/products",
      {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    setSaving(false);

    if (!res.ok) {
      setError("Something went wrong saving this product.");
      return;
    }

    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 max-w-xl space-y-5">
      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Product name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Price (Rs.)</label>
          <input
            required
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">Section</label>
          <select
            value={section}
            onChange={(e) => setSection(e.target.value as Section)}
            className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
          >
            {SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Sub-category</label>
        <input
          list="subcategory-suggestions"
          value={subCategory}
          onChange={(e) => setSubCategory(e.target.value)}
          placeholder="Shirts, Pants, Shorts, Traditional…"
          className="w-full rounded-md border border-sand bg-white px-3 py-2 outline-none focus:border-clay"
        />
        <datalist id="subcategory-suggestions">
          {SUBCATEGORY_SUGGESTIONS.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-ink/50">
          Pick a suggestion or type your own — this becomes a filter on the storefront
          within its section.
        </p>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-ink">Product image</label>

        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt="Product preview"
            className="mb-2 h-32 w-32 rounded-md border border-sand object-cover"
          />
        )}

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileUpload}
          disabled={uploading}
          className="block w-full text-sm text-ink/80 file:mr-3 file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-medium file:text-cream hover:file:bg-clay disabled:opacity-50"
        />
        {uploading && <p className="mt-1 text-xs text-ink/60">Uploading…</p>}
        {uploadError && <p className="mt-1 text-xs text-clay">{uploadError}</p>}

        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Or paste an image URL…"
          className="mt-2 w-full rounded-md border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-clay"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-ink">Sizes &amp; stock</label>
          <button
            type="button"
            onClick={addVariant}
            className="text-sm text-clay hover:underline"
          >
            + Add size
          </button>
        </div>
        <div className="space-y-2">
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                required
                placeholder="Size (e.g. M, 40, Free Size)"
                value={v.size}
                onChange={(e) => updateVariant(i, "size", e.target.value)}
                className="flex-1 rounded-md border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-clay"
              />
              <input
                required
                type="number"
                min="0"
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", e.target.value)}
                className="w-24 rounded-md border border-sand bg-white px-3 py-2 text-sm outline-none focus:border-clay"
              />
              {variants.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeVariant(i)}
                  className="text-clay hover:underline"
                  aria-label="Remove size"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-clay">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-ink px-5 py-3 text-sm font-medium text-cream hover:bg-clay disabled:opacity-50"
      >
        {saving ? "Saving…" : isEdit ? "Save changes" : "Add product"}
      </button>
    </form>
  );
}
