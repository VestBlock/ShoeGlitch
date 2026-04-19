import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

// Force dynamic rendering on all public pages.
// These pages read cookies (via Nav -> getSession), so they cannot be
// pre-rendered at build time. Without this, every route falls through
// to /_not-found and breaks.
export const dynamic = 'force-dynamic';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <main>{children}</main>
      <Footer />
    </>
  );
}
