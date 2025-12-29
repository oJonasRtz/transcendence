'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';

export default function LoginForm() {
  const router = useRouter();
  const [captcha, setCaptcha] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string[]>([]);
  const [isPending, setIsPending] = useState(false);

  const fetchCaptcha = async () => {
    try {
      const res = await fetch('/api/captcha');
      const data = await res.json();
      setCaptcha(data.image);
    } catch (error) {
      console.error('Failed to fetch captcha:', error);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);
    setErrors([]);
    setSuccess([]);

    const formData = new FormData(e.currentTarget);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      setSuccess(['Login successful!']);
      router.push(data.redirectTo || '/dashboard');
    } else {
      setErrors(data.error || ['Login failed']);
      fetchCaptcha(); // Refresh captcha on error
    }

    setIsPending(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Navigation links */}
      <nav className="flex justify-end gap-4 text-sm">
        <Link href="/forgot-password" className="text-blue-500 hover:underline">
          Forgot Password
        </Link>
        <Link href="/register" className="text-blue-500 hover:underline">
          Sign Up
        </Link>
      </nav>

      <div className="flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8">
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>
          Please log in to continue.
        </h1>

        {/* Success messages */}
        {success.length > 0 && (
          <div className="mb-4 flex flex-col space-y-1">
            {success.map((msg, i) => (
              <div key={i} className="flex items-center gap-1">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <p className="text-sm text-green-600">{msg}</p>
              </div>
            ))}
          </div>
        )}

        {/* Error messages */}
        {errors.length > 0 && (
          <div className="mb-4 flex flex-col space-y-1">
            {errors.map((msg, i) => (
              <div key={i} className="flex items-center gap-1">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-500">{msg}</p>
              </div>
            ))}
          </div>
        )}

        <div className="w-full">
          {/* Email field */}
          <div>
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          {/* Password field */}
          <div className="mt-4">
            <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <KeyIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>

          {/* Captcha section */}
          <div className="mt-4">
            <label className="mb-2 block text-xs font-medium text-gray-900">
              Captcha
            </label>
            <div className="flex items-center gap-2 mb-2">
              {captcha && (
                <img src={captcha} alt="captcha" className="h-10" />
              )}
              <button
                type="button"
                onClick={fetchCaptcha}
                className="text-sm text-blue-500 hover:underline"
              >
                Refresh
              </button>
            </div>
            <input
              type="text"
              name="captchaInput"
              placeholder="Enter the code above"
              required
              className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-3 text-sm outline-2 placeholder:text-gray-500"
            />
          </div>
        </div>

        <Button className="mt-4 w-full" aria-disabled={isPending}>
          Log in <ArrowRightIcon className="ml-auto h-5 w-5 text-gray-50" />
        </Button>
      </div>
    </form>
  );
}
