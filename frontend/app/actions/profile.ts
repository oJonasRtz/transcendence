'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import {
  changeEmailSchema,
  changePasswordSchema,
  changeNicknameSchema,
  changeDescriptionSchema,
  changeUsernameSchema,
} from '@/app/lib/validations';
import { getUser } from '@/app/lib/auth';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:3000';

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

    // Call backend API
    const response = await fetch(`${API_GATEWAY_URL}/setAuthUsername`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ username }),
      credentials: 'include',
    });

    const data = await response.json();

    // Check for errors
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    // Sync to Prisma - fetch fresh data from backend and sync
    try {
      const authUser = await getUser();
      if (authUser && authUser.public_id) {
        const { getUserProfile } = await import('@/app/lib/backend-api');
        const { syncUserToPrisma } = await import('@/app/lib/sync');
        
        const backendUser = await getUserProfile(authUser.public_id);
        if (backendUser) {
          // Sync with updated username
          await syncUserToPrisma(backendUser, authUser.email);
          console.log('[changeUsername] User re-synced to Prisma after username change');
        }
      }
    } catch (prismaError) {
      console.error('Failed to sync username to Prisma:', prismaError);
    }

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

    // Call backend API
    const response = await fetch(`${API_GATEWAY_URL}/setAuthEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    const data = await response.json();

    // Check for errors
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

    // Sync to Prisma - fetch fresh data from backend and sync
    try {
      const authUser = await getUser();
      if (authUser && authUser.public_id) {
        const { getUserProfile } = await import('@/app/lib/backend-api');
        const { syncUserToPrisma } = await import('@/app/lib/sync');
        
        const backendUser = await getUserProfile(authUser.public_id);
        if (backendUser) {
          // Sync with updated email
          await syncUserToPrisma(backendUser, email);
          console.log('[changeEmail] User re-synced to Prisma after email change');
        }
      }
    } catch (prismaError) {
      console.error('Failed to sync email to Prisma:', prismaError);
    }

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
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({
        currentPassword,
        password: newPassword,  // Backend expects 'password', not 'newPassword'
        confirmPassword: newPassword,
      }),
      credentials: 'include',
    });

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

    // Call backend API
    const response = await fetch(`${API_GATEWAY_URL}/setAuthNickname`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ nickname }),
      credentials: 'include',
    });

    const data = await response.json();

    // Check for errors
    if (data?.error && data.error.length > 0) {
      return { error: data.error[0] };
    }

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
        Cookie: `jwt=${token.value}`,
      },
      body: JSON.stringify({ description }),
      credentials: 'include',
    });

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
