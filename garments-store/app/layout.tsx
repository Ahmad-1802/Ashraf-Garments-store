import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Ashraf Garments | Kids & Teen Clothing",
  description:
    "Ready-made clothing for newborns to teens, up to 15 years old. Delivered across Pakistan."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body bg-cream text-ink">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-sand mt-20 py-10 text-center text-sm text-ink/60">
          <p>Ashraf Garments &mdash; ready-made kids &amp; teen clothing, newborn to 15 years.</p>
          <p className="mt-1">
            <a href="tel:+923017702970" className="hover:text-clay">
              +92 301 7702970
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
