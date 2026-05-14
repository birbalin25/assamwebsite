import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title') || 'Assamese Community USA';
  const subtitle = searchParams.get('subtitle') || 'Preserving Culture, Celebrating Community';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#342A20',
          fontFamily: 'serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 80px',
          }}
        >
          <div
            style={{
              width: '80px',
              height: '80px',
              backgroundColor: '#C41E3A',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '40px',
              fontWeight: 'bold',
              marginBottom: '30px',
            }}
          >
            A
          </div>
          <div
            style={{
              fontSize: '52px',
              fontWeight: 'bold',
              color: '#FDFBF7',
              textAlign: 'center',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#D4A017',
              textAlign: 'center',
            }}
          >
            {subtitle}
          </div>
          <div
            style={{
              marginTop: '30px',
              height: '4px',
              width: '200px',
              background: 'linear-gradient(90deg, #C41E3A 0%, #D4A017 50%, #C41E3A 100%)',
            }}
          />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
