'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, KeyIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { ButtonGlimmer } from '@/app/ui/button-glimmer';

export default function EmailVerificationPage() {
  const [step, setStep] = useState<'loading' | 'initial' | 'code-sent' | 'verified'>('loading');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();

  // Check verification status on mount
  useEffect(() => {
    checkVerificationStatus();
  }, []);

  const checkVerificationStatus = async () => {
    try {
      const response = await fetch('/api/user/verification-status');
      const data = await response.json();
      
      if (data.isEmailVerified) {
        setIsVerified(true);
        setStep('verified');
        setSuccess('Your email is already verified!');
      } else {
        setStep('initial');
      }
    } catch (err) {
      console.error('Error checking verification status:', err);
      setStep('initial');
    }
  };

  const sendCode = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/email/send-verification', {
        method: 'POST',
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to send verification code');
        return;
      }

      if (data.alreadyVerified) {
        setIsVerified(true);
        setStep('verified');
        setSuccess('Your email is already verified!');
        return;
      }

      setSuccess('Verification code sent to your email');
      setStep('code-sent');
    } catch (err) {
      setError('Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/email/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Invalid verification code');
        return;
      }

      if (data.alreadyVerified) {
        setIsVerified(true);
        setStep('verified');
        setSuccess('Your email is already verified!');
        return;
      }

      setSuccess('Email verified successfully!');
      setStep('verified');
      setIsVerified(true);
      
      // Dispatch custom event to trigger sidebar status refresh
      window.dispatchEvent(new Event('emailVerificationChanged'));
      
      // Also refresh the router state
      router.refresh();
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      verifyCode();
    }
  };

  if (step === 'loading') {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-white/10 rounded w-2/3 mb-8"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 font-mono">
          <span className="text-blue-400">01</span> // Email Verification
        </h1>
        <p className="text-slate-400">
          Verify your email address to enable Two-Factor Authentication and enhance your account security.
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
        
        {/* Already Verified State */}
        {(step === 'verified' || isVerified) && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 mb-4">
              <CheckCircleIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verified!</h2>
            <p className="text-slate-400 mb-6">
              Your email address has been successfully verified.
            </p>
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
              <p className="text-yellow-300 text-sm">
                ✓ You can now enable Two-Factor Authentication for enhanced security.
              </p>
            </div>
          </div>
        )}

        {/* Initial State - Send Code (Only show if NOT verified) */}
        {step === 'initial' && !isVerified && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Step 1: Send Verification Code
            </h2>
            <p className="text-slate-400 mb-6">
              Click the button below to receive a verification code at your registered email address. 
              The code will expire in 5 minutes.
            </p>
            
            <button
              onClick={sendCode}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg
                       bg-blue-600 hover:bg-blue-700
                       text-white font-semibold
                       border border-blue-500/50
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-lg hover:shadow-blue-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Verification Code'
              )}
            </button>
          </div>
        )}

        {/* Code Sent State - Enter Code */}
        {step === 'code-sent' && !isVerified && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Step 2: Enter Verification Code
            </h2>
            <p className="text-slate-400 mb-6">
              We've sent a 6-digit code to your email. Please enter it below to verify your email address.
            </p>
            
            <div className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/10 backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                    <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                      VERIFICATION FAILED
                    </p>
                  </div>
                  <p className="text-sm text-red-200 mt-1">{error}</p>
                </div>
              )}

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  verifyCode();
                }}
                className="space-y-4"
              >
                <div>
                  <label
                    className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-300"
                    htmlFor="code"
                  >
                    <span className="text-blue-400">01</span> // Verification Code
                  </label>
                  <div className="relative group">
                    <input
                      className="peer block w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-md transition-all focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed font-mono tracking-wider"
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="ENTER CODE HERE"
                      required
                      disabled={loading}
                    />
                    <KeyIcon className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-500 transition-colors peer-focus:text-blue-400" />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 transition-opacity peer-focus:opacity-100 pointer-events-none" />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Check your email inbox and spam folder.
                  </p>
                </div>

                <ButtonGlimmer
                  type="submit"
                  className="w-full h-12 text-sm font-bold uppercase tracking-wider shadow-lg shadow-blue-500/20"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      VERIFYING CODE...
                    </span>
                  ) : (
                    'VERIFY CODE →'
                  )}
                </ButtonGlimmer>
              </form>

              <div className="pt-4 border-t border-white/10">
                <div className="text-center space-y-2">
                  <p className="text-xs text-slate-500">
                    Didn't receive the code?
                  </p>
                  <button
                    onClick={sendCode}
                    disabled={loading}
                    className="text-sm text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider font-semibold disabled:opacity-50"
                  >
                    Resend Code
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                    <span className="font-mono text-slate-500">Awaiting Verification</span>
                  </div>
                  <span className="font-mono text-slate-600">v2.0.42</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && step !== 'code-sent' && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-3">
            <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && step !== 'verified' && (
          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-blue-300 text-sm">
          <strong>Tip:</strong> Can't find the email? Check your spam folder. 
          The verification code expires after 5 minutes.
        </p>
      </div>
    </div>
  );
}
