export const dynamic = 'force-dynamic';

export default function ExperienceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {children}
    </div>
  );
}
