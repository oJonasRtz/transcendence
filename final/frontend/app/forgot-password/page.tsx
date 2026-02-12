'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AtSymbolIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import AcmeLogo from '@/app/ui/pong-logo';
import Starfield from '@/app/ui/starfield';
import { ButtonGlimmer } from '@/app/ui/button-glimmer';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send reset email');
        return;
      }

      // Redirect to verification page
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden font-sans">
      <Starfield />

      <header className="relative z-20 w-full border-b border-white/10 bg-black/60 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center justify-center bg-black p-2 rounded-md border border-white/20">
              <div className="w-20 text-white md:w-24">
                <AcmeLogo />
              </div>
            </div>
            <div className="hidden h-8 w-[1px] bg-white/20 md:block" />
            <div className="hidden md:flex flex-col">
              <h1 className="text-lg font-bold leading-none text-white">Password Recovery</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-1 font-bold">
                Account Access Restoration
              </p>
            </div>
          </div>
          
          <Link href="/login">
            <ButtonGlimmer 
              glow={false} 
              className="bg-transparent border border-white/20 hover:bg-white/5 h-10 px-6 text-xs uppercase tracking-widest flex items-center gap-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Login
            </ButtonGlimmer>
          </Link>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Space-themed glass card container */}
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
            {/* Ambient glow effect */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-indigo-500/20 blur-3xl rounded-full" />

            {/* Content */}
            <div className="relative space-y-6">
              {/* Header */}
              <div className="space-y-2 border-b border-white/10 pb-4">
                <h2 className="text-2xl font-black tracking-tight text-white">
                  PASSWORD RECOVERY
                </h2>
                <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                  // Account Access Restoration Protocol
                </p>
              </div>

              {/* Instructions */}
              <div className="space-y-2">
                <p className="text-sm text-slate-300">
                  Enter your email address to receive a verification code
                </p>
                <p className="text-xs text-slate-500">
                  We'll send you a secure reset link
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                      ACCESS DENIED
                    </p>
                  </div>
                  <p className="text-sm text-red-200 mt-1">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
                    htmlFor="email"
                  >
                    <span className="text-blue-400">01</span> // Email Address
                  </label>
                  <div className="relative group">
                    <input
                      className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@transcendence.com"
                      required
                      disabled={isLoading}
                    />
                    <AtSymbolIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
                    {/* Cyber grid effect on focus */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
                  </div>
                </div>

                {/* Submit Button */}
                <ButtonGlimmer
                  type="submit"
                  className="w-full h-12 text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      SENDING RECOVERY CODE...
                    </span>
                  ) : (
                    'SEND RECOVERY CODE →'
                  )}
                </ButtonGlimmer>
              </form>

              {/* Footer Actions */}
              <div className="pt-4 border-t border-white/10">
                <div className="text-center">
                  <Link 
                    href="/login"
                    className="text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    Remember your password? <span className="text-blue-400">Sign in</span>
                  </Link>
                </div>
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
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-20 p-8 text-center text-[10px] uppercase tracking-tighter text-slate-500">
        © 2025 42 PONG • Secure Recovery Portal
      </footer>
    </main>
  );
}