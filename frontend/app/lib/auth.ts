import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required for frontend auth');
}

export interface User {
  user_id: string; // UUID from backend JWT payload
  email: string;
  username: string;
  nickname?: string | null;
  public_id: string;
  iat: number;
  exp: number;
}

export async function getUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('jwt');

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token.value, secret);
    return payload as unknown as User;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getUser();
  return user !== null;
}
