'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import {
  changeEmailSchema,
  changePasswordSchema,
  changeNicknameSchema,
  changeDescriptionSchema,
  changeUsernameSchema,
} from '@/app/lib/validations';
import { getUser } from '@/app/lib/auth';

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  'https://localhost:3000';

export async function changeUsername(_state: { error?: string; success?: string } | undefined, formData: FormData) {
  try {
    const username = formData.get('username') as string;

    // Validate input
    const validation = changeUsernameSchema.safeParse({ username });
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return { error: errors.username?.[0] || 'Invalid username' };
    }

    // Get JWT cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    // Call backend API with credentials: 'include' to receive new JWT cookie
    const response = await fetch(`${API_GATEWAY_URL}/setAuthUsername`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ username }),
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[changeUsername] Expected JSON but got:', text.substring(0, 200));
      return { error: 'Server returned HTML instead of JSON. Please check api-gateway logs.' };
    }

    const data = await response.json();

    // Check for errors
    if (!response.ok) {
      const backendError = Array.isArray(data?.error)
        ? data.error[0]
        : data?.error;
      return { error: backendError || 'Username update failed' };
    }

    // Extract new JWT from Set-Cookie header and update Next.js cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const jwtMatch = setCookieHeader.match(/jwt=([^;]+)/);
      if (jwtMatch) {
        const newJwtToken = jwtMatch[1];
        cookieStore.set('jwt', newJwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1 hour
        });
      }
    }

    // Revalidate all relevant paths to show updated username
    revalidatePath('/dashboard/settings/username');
    revalidatePath('/dashboard');

    return { success: 'Username updated successfully!' };
  } catch (error) {
    console.error('Change username error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function changeEmail(_state: { error?: string; success?: string } | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string;

    // Validate input
    const validation = changeEmailSchema.safeParse({ email });
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return { error: errors.email?.[0] || 'Invalid email' };
    }

    // Get JWT cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    // Call backend API with credentials: 'include' to receive new JWT cookie
    const response = await fetch(`${API_GATEWAY_URL}/setAuthEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[changeEmail] Expected JSON but got:', text.substring(0, 200));
      return { error: 'Server returned HTML instead of JSON. Please check api-gateway logs.' };
    }

    const data = await response.json();

    // Check for errors
    if (!response.ok) {
      const backendError = Array.isArray(data?.error)
        ? data.error[0]
        : data?.error;
      return { error: backendError || 'Email update failed' };
    }

    // Extract new JWT from Set-Cookie header and update Next.js cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const jwtMatch = setCookieHeader.match(/jwt=([^;]+)/);
      if (jwtMatch) {
        const newJwtToken = jwtMatch[1];
        cookieStore.set('jwt', newJwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1 hour
        });
      }
    }

    // Revalidate all relevant paths to show updated email and verification status
    revalidatePath('/dashboard/settings/email');
    revalidatePath('/dashboard/settings/email-verification');
    revalidatePath('/dashboard');

    return { success: 'Email updated successfully!' };
  } catch (error) {
    console.error('Change email error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function changePassword(_state: { error?: string; success?: string } | undefined, formData: FormData) {
  try {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Validate input
    const validation = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return {
        error: errors.currentPassword?.[0] || errors.newPassword?.[0] || errors.confirmPassword?.[0] || 'Invalid input'
      };
    }

    // Get JWT cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    // Call backend API
    const response = await fetch(`${API_GATEWAY_URL}/setAuthPassword`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({
        currentPassword,
        password: newPassword,  // Backend expects 'password', not 'newPassword'
        confirmPassword: newPassword,
      }),
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[changePassword] Expected JSON but got:', text.substring(0, 200));
      return { error: 'Server returned HTML instead of JSON. Please check api-gateway logs.' };
    }

    const data = await response.json();

    // Check for errors
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    return { success: 'Password updated successfully!' };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function changeNickname(_state: { error?: string; success?: string } | undefined, formData: FormData) {
  try {
    const nickname = formData.get('nickname') as string;

    // Validate input
    const validation = changeNicknameSchema.safeParse({ nickname });
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return { error: errors.nickname?.[0] || 'Invalid nickname' };
    }

    // Get JWT cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    // Call backend API with credentials: 'include' to receive new JWT cookie
    const response = await fetch(`${API_GATEWAY_URL}/setAuthNickname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ nickname }),
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[changeNickname] Expected JSON but got:', text.substring(0, 200));
      return { error: 'Server returned HTML instead of JSON. Please check api-gateway logs.' };
    }

    const data = await response.json();

    // Check for errors
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    // Extract new JWT from Set-Cookie header and update Next.js cookie
    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const jwtMatch = setCookieHeader.match(/jwt=([^;]+)/);
      if (jwtMatch) {
        const newJwtToken = jwtMatch[1];
        cookieStore.set('jwt', newJwtToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict',
          maxAge: 60 * 60, // 1 hour
        });
      }
    }

    // Revalidate all relevant paths to show updated nickname
    revalidatePath('/dashboard/settings/nickname');
    revalidatePath('/dashboard');

    return { success: 'Nickname updated successfully!' };
  } catch (error) {
    console.error('Change nickname error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function changeDescription(_state: { error?: string; success?: string } | undefined, formData: FormData) {
  try {
    const description = formData.get('description') as string;

    // Validate input
    const validation = changeDescriptionSchema.safeParse({ description });
    if (!validation.success) {
      const errors = validation.error.flatten().fieldErrors;
      return { error: errors.description?.[0] || 'Invalid description' };
    }

    // Get JWT cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    // Call backend API
    const response = await fetch(`${API_GATEWAY_URL}/setUserDescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ description }),
      credentials: 'include',
    });

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[changeDescription] Expected JSON but got:', text.substring(0, 200));
      return { error: 'Server returned HTML instead of JSON. Please check api-gateway logs.' };
    }

    const data = await response.json();

    // Check for errors
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    return { success: 'Description updated successfully!' };
  } catch (error) {
    console.error('Change description error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}

export async function changeAvatar(_state: { error?: string; success?: string } | undefined, formData: FormData) {
  try {
    const avatarFile = formData.get('avatar') as File;

    // Validate file exists
    if (!avatarFile || avatarFile.size === 0) {
      return { error: 'Please select an image file' };
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedTypes.includes(avatarFile.type)) {
      return { error: 'Invalid file type. Please upload PNG, JPG, JPEG, or WEBP' };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (avatarFile.size > maxSize) {
      return { error: 'File size too large. Maximum size is 5MB' };
    }

    // Get JWT cookie
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt');

    if (!token) {
      redirect('/login');
    }

    // Create FormData for multipart upload
    const uploadFormData = new FormData();
    uploadFormData.append('avatar', avatarFile);

    // Call backend API with multipart/form-data
    // Add Accept: application/json and X-Requested-With headers to trigger isApiRequest
    const response = await fetch(`${API_GATEWAY_URL}/upload`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        Cookie: `jwt=${token.value}`,
      },
      body: uploadFormData,
      credentials: 'include',
    });

    // Parse JSON response
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const text = await response.text();
      console.error('[changeAvatar] Expected JSON but got:', text.substring(0, 200));
      return { error: 'Server returned unexpected response format.' };
    }

    const data = await response.json();

    // Check for errors
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    // Revalidate paths
    revalidatePath('/dashboard/settings/avatar');
    revalidatePath('/dashboard');

    return { success: 'Avatar updated successfully!' };
  } catch (error) {
    console.error('Change avatar error:', error);
    return { error: 'An unexpected error occurred. Please try again.' };
  }
}
