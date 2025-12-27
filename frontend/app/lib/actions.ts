'use server';

import { signIn } from '@/auth';
import { AuthError } from 'next-auth';

export async function createMatch(formData: FormData) {
  const rawFormData = {
    userId: formData.get('userId'),
    message: formData.get('message'),
    status: formData.get('status'),
  }
  console.log('Creating match with data:', rawFormData);
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    throw error;
  }
}