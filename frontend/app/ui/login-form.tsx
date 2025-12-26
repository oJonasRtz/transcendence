'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import { ButtonGlimmer } from './button-glimmer'; //
import { login } from '@/app/actions/auth';
import Captcha from './captcha';
import { useState } from 'react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError('');

    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 font-sans">
      {/* Container adjusted to be transparent. 
        The white card background is now handled by the parent Page.tsx 
      */}
      <div className="w-full">
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700"
            htmlFor="email"
          >
            Email Address
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-slate-200 py-[12px] pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email address"
              required
              disabled={isPending}
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 peer-focus:text-blue-600" />
          </div>
        </div>

        <div className="mt-4">
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="peer block w-full rounded-md border border-slate-200 py-[12px] pl-10 text-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50"
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              required
              minLength={6}
              disabled={isPending}
            />
            <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 peer-focus:text-blue-600" />
          </div>
        </div>
        
        <div className="mt-6 border-t border-slate-100 pt-6">
          <Captcha />
        </div>
      </div>

      {/* Implementation of the High-Performance ButtonGlimmer.
      */}
      <ButtonGlimmer type="submit" className="w-full mt-2" disabled={isPending}>
        Log in →
      </ButtonGlimmer>

      {/* Error Message Section aligned with Dashboard style */}
      <div className="flex h-8 items-end space-x-1" aria-live="polite" aria-atomic="true">
        {error && (
          <>
            <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
            <p className="text-sm font-medium text-red-500">{error}</p>
          </>
        )}
      </div>
    </form>
  );
}