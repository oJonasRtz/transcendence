'use client';

import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

export default function EmailVerificationStatus() {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    // Fetch verification status
    const checkStatus = async () => {
      try {
        const response = await fetch('/api/user/verification-status');
        
        if (!response.ok) {
          console.error('Verification status API error:', response.status);
          setHasError(true);
          return;
        }
        
        const data = await response.json();
        // Handle both boolean and numeric (0/1) values from API
        setIsVerified(data.isEmailVerified === true || data.isEmailVerified === 1);
        setHasError(false);
      } catch (error) {
        console.error('Error fetching verification status:', error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
    
    // Re-check every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    // Listen for manual verification events
    const handleVerificationChange = () => {
      checkStatus();
    };
    
    window.addEventListener('emailVerificationChanged', handleVerificationChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('emailVerificationChanged', handleVerificationChange);
    };
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-[48px] w-full rounded-lg bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  // Show error state (don't show misleading "Not Verified" on error)
  if (hasError) {
    return (
      <div className="flex h-[48px] w-full items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold md:justify-start md:p-2 md:px-3 border bg-white/5 text-slate-600 border-white/10">
        <CheckBadgeIcon className="w-6" />
        <p className="hidden md:block uppercase tracking-wider font-mono text-xs">
          Status Unknown
        </p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex h-[48px] w-full items-center justify-center gap-2 rounded-lg p-3 text-sm font-semibold md:justify-start md:p-2 md:px-3 border",
        {
          'bg-yellow-500/10 text-yellow-500 border-yellow-500/30': isVerified,
          'bg-white/5 text-slate-500 border-white/10': !isVerified,
        }
      )}
    >
      <CheckBadgeIcon className="w-6" />
      <p className="hidden md:block uppercase tracking-wider font-mono text-xs">
        {isVerified ? 'Verified' : 'Not Verified'}
      </p>
    </div>
  );
}
