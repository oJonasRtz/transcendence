'use client';

import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function LoginMessages() {
  const searchParams = useSearchParams();
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get('reset') === 'success') {
      setShowSuccess(true);
      // Hide message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    }
  }, [searchParams]);

  if (!showSuccess) return null;

  return (
    <div className="mb-6 p-3 rounded-lg border border-green-500/20 bg-green-500/10 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-2">
        <CheckCircleIcon className="h-5 w-5 text-green-400" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-green-300">
            PASSWORD UPDATED
          </p>
          <p className="text-sm text-green-200">
            Your password has been successfully reset. You can now log in.
          </p>
        </div>
      </div>
    </div>
  );
}