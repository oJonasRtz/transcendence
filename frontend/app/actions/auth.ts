'use server';

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { loginSchema, signupSchema } from '@/app/lib/validations';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const captchaInput = formData.get('captcha') as string;

  // Validate input
  const validation = loginSchema.safeParse({ email, password });
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return { error: errors.email?.[0] || errors.password?.[0] || 'Invalid input' };
  }

  // Validate CAPTCHA
  if (!captchaInput) {
    return { error: 'Please enter the CAPTCHA code' };
  }

  // Get stored CAPTCHA code from cookie
  const cookieStore = await cookies();
  const storedCaptcha = cookieStore.get('captcha_code');

  if (!storedCaptcha) {
    return { error: 'CAPTCHA expired. Please refresh and try again.' };
  }

  // Verify CAPTCHA (case-insensitive)
  if (captchaInput.toLowerCase() !== storedCaptcha.value.toLowerCase()) {
    return { error: 'Invalid code' };
  }

  try {
    const response = await fetch(`${API_GATEWAY_URL}/checkLogin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email, // auth-service expects 'email' field
        password: password,
        captchaInput: storedCaptcha.value, // Send validated CAPTCHA
      }),
      credentials: 'include',
      redirect: 'manual', // Don't follow redirects, we want to handle them
    });

    // Backend redirects (302) mean validation errors occurred
    if (response.type === 'opaqueredirect' || response.status === 302) {
      return { error: 'Invalid credentials' };
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      return { error: 'Invalid credentials' };
    }

    // Check if response contains error array (from auth-service)
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    // Check for successful login with token
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

      // Clear CAPTCHA cookie after successful login
      cookieStore.delete('captcha_code');
    }

    // Successful login
    redirect('/dashboard');
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    // SECURITY: Don't log error details that might contain sensitive data
    console.error('Login error occurred');
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function signup(formData: FormData) {
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const nickname = formData.get('nickname') as string;
  const captchaInput = formData.get('captcha') as string;

  // Validate input
  const validation = signupSchema.safeParse({ username, email, password, nickname });
  if (!validation.success) {
    const errors = validation.error.flatten().fieldErrors;
    return {
      error: errors.username?.[0] || errors.email?.[0] || errors.password?.[0] || errors.nickname?.[0] || 'Invalid input'
    };
  }

  // Validate CAPTCHA
  if (!captchaInput) {
    return { error: 'Please enter the CAPTCHA code' };
  }

  // Get stored CAPTCHA code from cookie
  const cookieStore = await cookies();
  const storedCaptcha = cookieStore.get('captcha_code');

  if (!storedCaptcha) {
    return { error: 'CAPTCHA expired. Please refresh and try again.' };
  }

  // Verify CAPTCHA (case-insensitive)
  if (captchaInput.toLowerCase() !== storedCaptcha.value.toLowerCase()) {
    return { error: 'Invalid code' };
  }

  // Generate a UUID for the new user
  const user_id = crypto.randomUUID();

  try {
    const response = await fetch(`${API_GATEWAY_URL}/checkRegister`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id, // Required by auth-service
        username,
        email,
        password,
        confirmPassword: password, // Required by auth-service
        nickname: nickname || username, // Use username if nickname is empty
      }),
      credentials: 'include',
      redirect: 'manual', // Don't follow redirects
    });

    // Backend redirects (302) mean validation errors occurred
    if (response.type === 'opaqueredirect' || response.status === 302) {
      return { error: 'Registration failed. Please check your input.' };
    }

    // Parse JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      return { error: 'Registration failed. Please try again.' };
    }

    // Check if response contains error array (from auth-service)
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    // Clear CAPTCHA cookie after successful registration
    const cookieStore = await cookies();
    cookieStore.delete('captcha_code');

    // After successful registration, log the user in
    // Registration doesn't return a token, so we need to login
    // Note: login() will generate a new CAPTCHA requirement
    return await login(formData);
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
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (token) {
      // Call backend logout endpoint
      await fetch(`${API_GATEWAY_URL}/logout`, {
        method: 'GET',
        headers: {
          Cookie: `jwt=${token.value}`,
        },
        credentials: 'include',
      });
    }

    // Clear the cookie
    cookieStore.delete('jwt');

    redirect('/login');
  } catch (error) {
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error; // Re-throw redirect errors
    }
    // SECURITY: Don't log error details
    console.error('Logout error occurred');
    return { error: 'Logout failed. Please try again.' };
  }
}
