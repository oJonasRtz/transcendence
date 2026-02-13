'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircleIcon, XCircleIcon, ShieldCheckIcon, QrCodeIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

export default function TwoFactorAuthPage() {
  const [step, setStep] = useState<'loading' | 'check-email' | 'disabled' | 'setup-qr' | 'verify-totp' | 'enabled'>('loading');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const router = useRouter();

  // Check verification status on mount
  useEffect(() => {
    checkStatus();
    
    // Listen for email verification changes
    const handleVerificationChange = () => {
      checkStatus();
    };
    
    window.addEventListener('emailVerificationChanged', handleVerificationChange);
    
    return () => {
      window.removeEventListener('emailVerificationChanged', handleVerificationChange);
    };
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/user/verification-status');
      const data = await response.json();
      
      setIsEmailVerified(data.isEmailVerified);
      setIs2FAEnabled(data.has2FA);

      if (!data.isEmailVerified) {
        setStep('check-email');
      } else if (data.has2FA) {
        setStep('enabled');
        setSuccess('Two-Factor Authentication is currently enabled');
      } else {
        setStep('disabled');
      }
    } catch (err) {
      console.error('Error checking status:', err);
      setError('Failed to load verification status');
      setStep('disabled');
    }
  };

  const toggle2FA = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/2fa/toggle', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.error && data.error.length > 0) {
        setError(data.error[0]);
      } else {
        setIs2FAEnabled(data.enabled);
        
        if (data.enabled) {
          // 2FA was enabled, now get QR code
          await getQRCode();
        } else {
          // 2FA was disabled
          setSuccess(data.success?.[0] || '2FA disabled successfully');
          setStep('disabled');
          setQrCode(null);
        }
      }
    } catch (err) {
      setError('Failed to toggle 2FA. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getQRCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/2fa/qr-code');
      const data = await response.json();
      
      if (data.error && data.error.length > 0) {
        setError(data.error[0]);
      } else {
        setQrCode(data.qrCodeDataURL || data.image);
        setStep('setup-qr');
        setSuccess('Scan this QR code with your authenticator app');
      }
    } catch (err) {
      setError('Failed to generate QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyTOTP = async () => {
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      
      const data = await response.json();
      
      if (data.error && data.error.length > 0) {
        setError(data.error[0]);
      } else {
        setSuccess(data.success?.[0] || '2FA verified successfully!');
        setStep('enabled');
        
        // Refresh after 2 seconds
        setTimeout(() => {
          router.refresh();
        }, 2000);
      }
    } catch (err) {
      setError('Failed to verify code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      verifyTOTP();
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
          <span className="text-blue-400">02</span> // Two-Factor Authentication
        </h1>
        <p className="text-slate-400">
          Add an extra layer of security to your account with Two-Factor Authentication (2FA).
        </p>
      </div>

      {/* Content Card */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-8">
        
        {/* Email Not Verified State */}
        {step === 'check-email' && (
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 border-2 border-yellow-500 mb-4">
              <XCircleIcon className="w-8 h-8 text-yellow-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Email Verification Required</h2>
            <p className="text-slate-400 mb-6">
              You must verify your email address before enabling Two-Factor Authentication.
            </p>
            <button
              onClick={() => router.push('/dashboard/settings/email-verification')}
              className="px-6 py-3 rounded-lg
                       bg-blue-600 hover:bg-blue-700
                       text-white font-semibold
                       border border-blue-500/50
                       transition-all duration-300
                       hover:shadow-lg hover:shadow-blue-500/20"
            >
              Verify Email Now
            </button>
          </div>
        )}

        {/* 2FA Disabled State */}
        {step === 'disabled' && (
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-500/20 border border-slate-500/50 flex-shrink-0">
                <ShieldCheckIcon className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  2FA is Currently Disabled
                </h2>
                <p className="text-slate-400">
                  Enable Two-Factor Authentication to protect your account with an additional security layer.
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                <h3 className="text-white font-medium mb-2">How it works:</h3>
                <ol className="text-slate-400 text-sm space-y-2 list-decimal list-inside">
                  <li>Enable 2FA and scan the QR code with your authenticator app</li>
                  <li>Enter the 6-digit code from your app to verify setup</li>
                  <li>Each time you log in, you'll need both your password and a code from your app</li>
                </ol>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                <p className="text-blue-300 text-sm">
                  <strong>Recommended Apps:</strong> Google Authenticator, Authy, Microsoft Authenticator
                </p>
              </div>
            </div>

            <button
              onClick={toggle2FA}
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
                  Enabling...
                </span>
              ) : (
                'Enable Two-Factor Authentication'
              )}
            </button>
          </div>
        )}

        {/* Setup QR Code State */}
        {step === 'setup-qr' && qrCode && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Step 1: Scan QR Code
            </h2>
            <p className="text-slate-400 mb-6">
              Open your authenticator app and scan this QR code to link your account.
            </p>

            <div className="flex justify-center mb-6">
              <div className="p-4 rounded-lg bg-white">
                <img 
                  src={qrCode} 
                  alt="2FA QR Code" 
                  className="w-64 h-64"
                />
              </div>
            </div>

            <button
              onClick={() => setStep('verify-totp')}
              className="w-full px-6 py-3 rounded-lg
                       bg-blue-600 hover:bg-blue-700
                       text-white font-semibold
                       border border-blue-500/50
                       transition-all duration-300
                       hover:shadow-lg hover:shadow-blue-500/20"
            >
              I've Scanned the QR Code
            </button>
          </div>
        )}

        {/* Verify TOTP Code State */}
        {step === 'verify-totp' && (
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Step 2: Verify Setup
            </h2>
            <p className="text-slate-400 mb-6">
              Enter the 6-digit code from your authenticator app to complete the setup.
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="totp-code" className="block text-sm font-medium text-slate-300 mb-2">
                  Authentication Code
                </label>
                <input
                  type="text"
                  id="totp-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="000000"
                  maxLength={6}
                  className="w-full px-4 py-3 rounded-lg
                           bg-white/5 border border-white/10
                           text-white text-center text-2xl tracking-widest font-mono
                           placeholder-slate-500
                           focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50
                           transition-all duration-300"
                />
              </div>

              <button
                onClick={verifyTOTP}
                disabled={loading || !code.trim()}
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
                    Verifying...
                  </span>
                ) : (
                  'Verify and Complete Setup'
                )}
              </button>

              <button
                onClick={() => setStep('setup-qr')}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg
                         bg-white/5 hover:bg-white/10
                         text-slate-400 hover:text-white
                         border border-white/10
                         transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed
                         text-sm"
              >
                Back to QR Code
              </button>
            </div>
          </div>
        )}

        {/* 2FA Enabled State */}
        {step === 'enabled' && (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 mb-4">
                <CheckCircleIcon className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">2FA is Enabled</h2>
              <p className="text-slate-400">
                Your account is protected with Two-Factor Authentication.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 mb-6">
              <p className="text-green-300 text-sm">
                Each time you log in, you'll need to enter a code from your authenticator app.
              </p>
            </div>

            <button
              onClick={toggle2FA}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg
                       bg-red-600 hover:bg-red-700
                       text-white font-semibold
                       border border-red-500/50
                       transition-all duration-300
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:shadow-lg hover:shadow-red-500/20"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Disabling...
                </span>
              ) : (
                'Disable Two-Factor Authentication'
              )}
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/50 flex items-start gap-3">
            <XCircleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && step !== 'enabled' && (
          <div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/50 flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}
      </div>

      {/* Help Text */}
      {(step === 'disabled' || step === 'setup-qr' || step === 'verify-totp') && (
        <div className="mt-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
          <p className="text-blue-300 text-sm">
            <strong>Need help?</strong> Make sure you have an authenticator app installed before enabling 2FA. 
            We recommend Google Authenticator or Authy.
          </p>
        </div>
      )}
    </div>
  );
}
