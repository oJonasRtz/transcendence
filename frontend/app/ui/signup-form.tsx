'use client';

import {
  AtSymbolIcon,
  KeyIcon,
  UserIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ButtonGlimmer } from './button-glimmer';
import { signup } from '@/app/actions/auth';
import Captcha from './captcha';
import { useState } from 'react';

export default function SignupForm() {
  const [error, setError] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [captchaRefreshKey, setCaptchaRefreshKey] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsPending(true);
    setError('');

    const result = await signup(formData);

    if (result?.error) {
      setError(result.error);
      if (result.resetCaptcha) setCaptchaRefreshKey((k) => k + 1);
      setIsPending(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6 font-sans">
      {/* Header - Space Terminal Style */}
      <div className="space-y-2 border-b border-white/10 pb-4">
        <h2 className="text-2xl font-black tracking-tight text-white">
          REGISTRATION TERMINAL
        </h2>
        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
          // New Agent Initialization Protocol
        </p>
      </div>

      {/* Form Fields */}
      <div className="w-full space-y-5">
        {/* Username Field */}
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
            htmlFor="username"
          >
            <span className="text-blue-400">01</span> // Username
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              id="username"
              type="text"
              name="username"
              placeholder="agent_identifier"
              required
              minLength={3}
              disabled={isPending}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
            <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
            {/* Cyber grid effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
            htmlFor="email"
          >
            <span className="text-blue-400">02</span> // Email Address
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              id="email"
              type="email"
              name="email"
              placeholder="agent@transcendence.net"
              required
              disabled={isPending}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <AtSymbolIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
            {/* Cyber grid effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
            htmlFor="password"
          >
            <span className="text-blue-400">03</span> // Secure Key
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••••••"
              required
              minLength={8}
              disabled={isPending}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
            {/* Cyber grid effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
            htmlFor="confirmPassword"
          >
            <span className="text-blue-400">04</span> // Confirm Key
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••••••"
              required
              minLength={8}
              disabled={isPending}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
            <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
            {/* Cyber grid effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* Nickname Field (Optional) */}
        <div>
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
            htmlFor="nickname"
          >
            <span className="text-blue-400">05</span> // NickName <span className="text-slate-500">(Optional)</span>
          </label>
          <div className="relative group">
            <input
              className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              id="nickname"
              type="text"
              name="nickname"
              placeholder="display_name"
              disabled={isPending}
              value={nickname}
              onChange={(event) => setNickname(event.target.value)}
            />
            <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
            {/* Cyber grid effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
          </div>
        </div>

        {/* CAPTCHA Section */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              <span className="text-blue-400">06</span> // Verification
            </span>
          </div>
          <Captcha refreshKey={captchaRefreshKey} />
        </div>

        {/* Terms Acceptance */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur-md">
          <div className="flex items-start gap-3">
            <input
              id="termsAccepted"
              name="termsAccepted"
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/50"
              checked={termsAccepted}
              onChange={(event) => setTermsAccepted(event.target.checked)}
              disabled={isPending}
              required
            />
            <label
              htmlFor="termsAccepted"
              className="text-xs text-slate-300 leading-relaxed"
            >
              I agree to the{' '}
              <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
                Privacy Policy
              </Link>
              .
            </label>
          </div>
        </div>
      </div>

      {/* Submit Button - Holographic Style */}
      <ButtonGlimmer
        type="submit"
        className="w-full h-12 text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20"
        disabled={isPending || !termsAccepted}
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            INITIALIZING AGENT...
          </span>
        ) : (
          'REGISTER NEW AGENT →'
        )}
      </ButtonGlimmer>

      {/* Error Message - Cyber Alert Style */}
      <div className="min-h-[2rem]" aria-live="polite" aria-atomic="true">
        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
            <ExclamationCircleIcon className="h-5 w-5 flex-shrink-0 text-red-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-red-300 mb-1">
                REGISTRATION FAILED
              </p>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-slate-500">System Online</span>
          </div>
          <span className="font-mono text-slate-600">v2.0.42</span>
        </div>
      </div>
    </form>
  );
}
