// app/api/flappy-service/route.ts
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://api-gateway:3000';

/**
 * POST /api/flappy-service
 * Handles setFlappyHighScore and getFlappyHighScore.
 * Requires a valid JWT cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) {
      return NextResponse.json({ error: ['Unauthorized'] }, { status: 401 });
    }

    const { action, user_id, score } = await req.json();

    if (!action || !user_id) {
      return NextResponse.json({ error: ['Invalid request format'] }, { status: 400 });
    }

    let url = '';
    let body: any = { user_id };

    switch (action) {
      case 'setFlappyHighScore':
        if (score === undefined) {
          return NextResponse.json({ error: ['Score is required'] }, { status: 400 });
        }
        url = `${API_GATEWAY_URL}/setFlappyHighScore`;
        body.score = score;
        break;

      case 'getFlappyHighScore':
        url = `${API_GATEWAY_URL}/getFlappyHighScore`;
        break;

      default:
        return NextResponse.json({ error: ['Unknown action'] }, { status: 400 });
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwt=${jwt}`,
      },
      body: JSON.stringify(body),
      credentials: 'include',
      redirect: 'manual',
    });

    const contentType = response.headers.get('content-type') || '';
    let data: any = null;
    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      return NextResponse.json({ error: 'Unexpected response from backend.' }, { status: 502 });
    }

    if (!response.ok) {
      const backendError = Array.isArray(data?.error) ? data.error[0] : data?.error;
      return NextResponse.json({ error: backendError || 'Failed to perform action' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('flappy-service POST error:', err);
    return NextResponse.json({ error: [err.message] }, { status: 500 });
  }
}