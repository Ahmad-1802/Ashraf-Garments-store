export default function CheckoutSuccessPage({
  searchParams
}: {
  searchParams: { orderId?: string };
}) {
  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Order placed 🎉</h1>
      <p className="mt-3 text-ink/70">
        Thank you! We&apos;ve received your order and will contact you shortly to confirm
        delivery.
      </p>
      {searchParams.orderId && (
        <p className="mt-4 text-sm text-ink/50">
          Order reference: <span className="font-mono">{searchParams.orderId}</span>
        </p>
      )}
    </div>
  );
}
