import { ImageResponse } from 'next/og';

export const runtime = 'edge';

function getParam(searchParams: URLSearchParams, key: string, fallback: string) {
  const value = searchParams.get(key)?.trim();
  return value?.length ? value.slice(0, 120) : fallback;
}

function accentFor(kind: string) {
  switch (kind) {
    case 'shoe-restoration':
      return '#00d4ff';
    case 'pickup-dropoff':
      return '#9fe870';
    case 'locations':
      return '#6ea8ff';
    default:
      return '#4b93ff';
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = getParam(searchParams, 'title', 'Shoe Glitch');
  const eyebrow = getParam(searchParams, 'eyebrow', 'Shoe care');
  const location = getParam(searchParams, 'location', 'Live market');
  const kind = getParam(searchParams, 'kind', 'sneaker-cleaning');
  const accent = accentFor(kind);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px',
          background:
            'linear-gradient(145deg, #f6f8fc 0%, #eef3fb 35%, #ffffff 100%)',
          color: '#111827',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '999px',
                background: accent,
                boxShadow: `0 0 0 10px ${accent}22`,
              }}
            />
            <div
              style={{
                fontSize: '28px',
                letterSpacing: '0.35em',
                textTransform: 'uppercase',
                color: '#4b5563',
              }}
            >
              {eyebrow}
            </div>
          </div>
          <div
            style={{
              border: '1px solid #d6deeb',
              borderRadius: '999px',
              padding: '10px 18px',
              fontSize: '24px',
              color: '#374151',
              background: '#ffffffcc',
            }}
          >
            ShoeGlitch
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
          <div
            style={{
              fontSize: '34px',
              color: accent,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
            }}
          >
            {location}
          </div>
          <div
            style={{
              fontSize: '88px',
              lineHeight: 0.95,
              fontWeight: 700,
              maxWidth: '1000px',
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '18px',
              fontSize: '28px',
              color: '#374151',
            }}
          >
            <span>Book cleaning</span>
            <span>Restore pairs</span>
            <span>Track releases</span>
          </div>
          <div
            style={{
              borderRadius: '999px',
              background: accent,
              color: '#0b1220',
              padding: '18px 28px',
              fontSize: '28px',
              fontWeight: 700,
            }}
          >
            Intelligence
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
    },
  );
}
