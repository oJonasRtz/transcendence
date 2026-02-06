'use server';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

export interface CaptchaData {
  code: string;
  image: string;
}

/**
 * Fetch a new CAPTCHA from the backend
 * Note: The backend returns { code, data } but stores code in session.
 * For Next.js stateless frontend, we'll need to handle this differently.
 */
export async function getCaptcha(): Promise<CaptchaData | null> {
  try {
    const response = await fetch(`${API_GATEWAY_URL}/getCaptcha`, {
      method: 'GET',
      credentials: 'include', // Important: include cookies for session
      cache: 'no-store', // Don't cache CAPTCHA
    });

    if (!response.ok) {
      console.error('Failed to fetch CAPTCHA');
      return null;
    }

    const data = await response.json();

    // Backend returns { code, data }
    // 'code' is the answer, 'data' is the base64 SVG image
    return {
      code: data.code,
      image: data.data,
    };
  } catch (error) {
    console.error('Error fetching CAPTCHA');
    return null;
  }
}
