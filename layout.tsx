import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Experience | Shoe Glitch",
  description: "A cinematic sneaker-cleaning landing page for Shoe Glitch.",
};

export default function ExperienceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-ink-950 text-bone-50 antialiased">
      {children}
    </div>
  );
}
