'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import AcmeLogo from '@/app/ui/pong-logo';
import Starfield from '@/app/ui/starfield';
import { ButtonGlimmer } from '@/app/ui/button-glimmer';
import Link from 'next/link';

export default function TwoFactorAuthPage() {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1); // Only take last character
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === 6) {
      handleSubmit(newCode.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedData[i] || '';
      }
      setCode(newCode);
      
      // Focus last filled input or first empty one
      const lastIndex = Math.min(pastedData.length, 5);
      inputRefs.current[lastIndex]?.focus();
      
      // Auto-submit if complete
      if (pastedData.length === 6) {
        handleSubmit(pastedData);
      }
    }
  };

  const handleSubmit = async (codeStr?: string) => {
    const verificationCode = codeStr || code.join('');
    
    if (verificationCode.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/verify-2fa-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid verification code');
        setCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        return;
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('An error occurred. Please try again.');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = () => {
    // Clear the pending token and redirect to login
    fetch('/api/auth/cancel-2fa', { method: 'POST' })
      .finally(() => {
        router.push('/login');
      });
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
              <h1 className="text-lg font-bold leading-none text-white">Two-Factor Authentication</h1>
              <p className="text-[10px] uppercase tracking-widest text-blue-400 mt-1 font-bold">
                Security Verification Required
              </p>
            </div>
          </div>
          
          <button
            onClick={handleCancel}
            className="text-xs uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            ← Return to Login
          </button>
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
                <div className="flex items-center gap-3">
                  <ShieldCheckIcon className="h-8 w-8 text-blue-400" />
                  <div>
                    <h2 className="text-xl font-black tracking-tight text-white">
                      SECURITY SCAN
                    </h2>
                    <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                      // Two-Factor Authentication
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="text-center space-y-2">
                <p className="text-sm text-slate-300">
                  Enter the 6-digit verification code
                </p>
                <p className="text-xs text-slate-500">
                  From your authenticator app
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

              {/* Code Input */}
              <div className="space-y-4">
                <div className="flex justify-center gap-2" onPaste={handlePaste}>
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { inputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
                      disabled={isVerifying}
                      autoComplete="off"
                    />
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <ButtonGlimmer
                onClick={() => handleSubmit()}
                disabled={isVerifying || code.some(d => d === '')}
                className="w-full h-12 text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20"
              >
                {isVerifying ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    VERIFYING ACCESS...
                  </span>
                ) : (
                  'AUTHENTICATE →'
                )}
              </ButtonGlimmer>

              {/* Alternative Actions */}
              <div className="pt-4 border-t border-white/10">
                <button
                  onClick={handleCancel}
                  className="w-full py-2 px-4 text-slate-400 hover:text-white font-medium text-sm uppercase tracking-wider transition-colors"
                >
                  Cancel Authentication
                </button>
              </div>

              {/* Footer Stats */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                    <span className="font-mono text-slate-500">Security Active</span>
                  </div>
                  <span className="font-mono text-slate-600">v2.0.42</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-20 p-8 text-center text-[10px] uppercase tracking-tighter text-slate-500">
        © 2025 42 PONG • Secure Authentication Portal
      </footer>
    </main>
  );
}
