import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://api-gateway:3000';

/**
 * POST /api/match-service
 * Handles joinParty and leaveParty actions.
 * Requires a valid JWT cookie.
 */
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) {
      return NextResponse.json(
        { error: ['Unauthorized'] },
        { status: 401 }
      );
    }

    const { action, id, game_type, token } = await req.json();

    if (!action || !id) {
      return NextResponse.json(
        { error: ['Invalid request format'] },
        { status: 400 }
      );
    }

    let url = '';
    let body: any = { id };

    switch (action) {
      case 'joinParty':
        if (!game_type)
          return NextResponse.json(
            { error: ['Game type required'] },
            { status: 400 }
          );
        // if (!token)
        //   return NextResponse.json(
        //     { error: ['Party token required'] },
        //     { status: 400 }
        //   );
        url = `${API_GATEWAY_URL}/joinParty/${encodeURIComponent(token)}`;
        body.game_type = game_type;
        break;

      case 'leaveParty':
        url = `${API_GATEWAY_URL}/leaveParty`;
        break;

      default:
        return NextResponse.json(
          { error: ['Unknown action'] },
          { status: 400 }
        );
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
      return NextResponse.json(
        { error: 'Unexpected response from backend.' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const backendError = Array.isArray(data?.error)
        ? data.error[0]
        : data?.error;
      return NextResponse.json(
        { error: backendError || 'Failed to perform action' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('match-service POST error:', err);
    return NextResponse.json(
      { error: [err.message] },
      { status: 500 }
    );
  }
}

/**
 * GET /api/match-service
 * Fetches party info for a user.
 * Requires a valid JWT cookie.
 */
export async function GET(req: NextRequest) {
  try {
    const user_id = req.nextUrl.searchParams.get('user_id');
    if (!user_id) return NextResponse.json({ error: ['User ID is required'] }, { status: 400 });

    const cookieStore = await cookies();
    const jwt = cookieStore.get('jwt')?.value;
    if (!jwt) return NextResponse.json({ error: ['Unauthorized'] }, { status: 401 });

    // encaminha para o serviço real
    const url = `${API_GATEWAY_URL}/partyInfo/${encodeURIComponent(user_id)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Cookie: `jwt=${jwt}` },
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) return NextResponse.json({ error: data.error || 'Failed to fetch party info' }, { status: response.status });

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('partyInfo GET error:', err);
    return NextResponse.json({ error: [err.message] }, { status: 500 });
  }
}

