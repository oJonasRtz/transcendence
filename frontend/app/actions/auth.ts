'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loginSchema, signupSchema } from '@/app/lib/validations';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const captchaInput = formData.get('captcha') as string;

  // Validate input
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const formErrors = validation.error.flatten().formErrors;
    const allErrors = [
      ...Object.values(errors).flat(),
      ...formErrors,
    ].filter(Boolean);
    return { error: allErrors.length ? allErrors.join(' • ') : 'Invalid input' };
  }

  const cookieStore = await cookies();
  const captchaId = cookieStore.get('captcha_id');

  if (!captchaInput) {
    return { error: 'Please enter the CAPTCHA code' };
  }

  if (!captchaId) {
    return { error: 'CAPTCHA expired. Please refresh and try again.' };
  }

  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: password,
        captchaId: captchaId.value,
        captchaInput,
      }),
      credentials: 'include',
    });

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      return { error: 'Invalid credentials' };
    }

    if (!response.ok) {
      const backendError = Array.isArray(data?.error)
        ? data.error[0]
        : data?.error;
      const normalizedError =
        backendError === 'Invalid code'
          ? 'CAPTCHA code is incorrect. Please try again.'
          : backendError;
      return { error: normalizedError || 'Invalid credentials' };
    }

    // Check if 2FA is required
    if (data?.requires2FA && data?.tempToken) {
      // Store the temp token in a cookie for the 2FA verification page
      const cookieStore = await cookies();
      cookieStore.set('pending_2fa_token', data.tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 5 * 60, // 5 minutes to complete 2FA
      });

      // Clear CAPTCHA id cookie
      cookieStore.delete('captcha_id');
      
      // Return indicator that 2FA is needed
      return { requires2FA: true };
    }

    // Check for successful login with token (no 2FA required)
    const token = data?.token;

    if (token) {
      const cookieStore = await cookies();

      // Set the cookie as 'jwt' (matching backend)
      cookieStore.set('jwt', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict', // SECURITY: Match backend's strict setting
        path: '/',
        maxAge: 60 * 60 * 1000, // 1 hour in milliseconds (matching backend)
      });

      // Clear CAPTCHA id cookie after successful login
      cookieStore.delete('captcha_id');

      // Return success to indicate redirect should happen
      return { success: true };
    }

    // No token received
    return { error: 'Invalid credentials' };
  } catch (error) {
    // SECURITY: Don't log error details that might contain sensitive data
    console.error('Login error occurred:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signup(formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const confirmPassword = formData.get('confirmPassword') as string;
  const nickname = formData.get('nickname') as string;
  const captchaInput = formData.get('captcha') as string;

  // Validate input
  const validation = signupSchema.safeParse({
    username,
    email,
    password,
    confirmPassword,
    nickname,
  });
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    const formErrors = validation.error.flatten().formErrors;
    const allErrors = [
      ...Object.values(errors).flat(),
      ...formErrors,
    ].filter(Boolean);
    return {
      error: allErrors.length ? allErrors.join(' • ') : 'Invalid input'
    };
  }

  // Validate CAPTCHA
  if (!captchaInput) {
    return { error: 'Please enter the CAPTCHA code' };
  }

  const cookieStore = await cookies();
  const captchaId = cookieStore.get('captcha_id');
  if (!captchaId) {
    return { error: 'CAPTCHA expired. Please refresh and try again.' };
  }

  // Generate a UUID for the new user
  try {
    const response = await fetch(`${API_GATEWAY_URL}/api/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
        confirmPassword,
        nickname: nickname || username,
        captchaId: captchaId.value,
        captchaInput,
      }),
      credentials: 'include',
    });

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      return { error: 'Registration failed. Please try again.' };
    }

    if (!response.ok) {
      const backendError = Array.isArray(data?.error)
        ? data.error[0]
        : data?.error;
      return { error: backendError || 'Registration failed. Please try again.' };
    }

    if (data?.requires2FA && data?.tempToken) {
      const cookieStore = await cookies();
      cookieStore.set('pending_2fa_token', data.tempToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 5 * 60,
      });
      cookieStore.delete('captcha_id');
      redirect('/login/2fa');
    }

    if (data?.token) {
      const cookieStore = await cookies();

      // Clear CAPTCHA id cookie
      cookieStore.delete('captcha_id');

      // Set JWT cookie
      cookieStore.set('jwt', data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 1000,
      });
      redirect('/dashboard');
    }

    // If auto-login fails, redirect to login page
    const cookieStore = await cookies();
    cookieStore.delete('captcha_id');
    redirect('/login?registered=true');
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    // SECURITY: Don't log error details that might contain sensitive data
    console.error('Signup error occurred');
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  
  try {
    const token = cookieStore.get('jwt');

    if (token) {
      // Call backend logout endpoint - use redirect: 'manual' to prevent following redirects
      await fetch(`${API_GATEWAY_URL}/logout`, {
        method: 'GET',
        headers: {
          Cookie: `jwt=${token.value}`,
        },
        credentials: 'include',
        redirect: 'manual', // Don't follow redirects from backend
      });
    }
  } catch (error) {
    // Log but continue with logout - clearing cookies is more important
    console.error('Backend logout call failed:', error);
  }

  // Clear cookies regardless of backend response
  cookieStore.delete('jwt');
  cookieStore.delete('pending_2fa_token');
  cookieStore.delete('session');
  cookieStore.delete('captcha_id');

  // redirect() must be called outside try-catch in Next.js 15
  redirect('/login');
}
