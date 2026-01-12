'use client';

import { useState, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export default function Captcha() {
  const [captchaImage, setCaptchaImage] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCaptcha = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/captcha', {
        method: 'GET',
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Failed to load CAPTCHA');
      }

      const data = await response.json();
      setCaptchaImage(data.image);
    } catch (err) {
      setError('Failed to load CAPTCHA. Please try again.');
      console.error('CAPTCHA fetch error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCaptcha();
  }, []);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <label
          className="block text-xs font-medium text-slate-300"
          htmlFor="captcha"
        >
          CAPTCHA Code
        </label>
        <button
          type="button"
          onClick={fetchCaptcha}
          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
          title="Refresh CAPTCHA"
        >
          <ArrowPathIcon className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* CAPTCHA Image */}
      <div className="relative mb-2 rounded-md border border-white/10 p-2 bg-transparent min-h-[60px] flex items-center justify-center">
        {loading && (
          <div className="text-sm text-slate-400">Loading CAPTCHA...</div>
        )}
        {error && (
          <div className="text-sm text-red-300">{error}</div>
        )}
        {!loading && !error && captchaImage && (
          <img
            src={captchaImage}
            alt="CAPTCHA"
            className="max-h-[50px]"
          />
        )}
      </div>

      {/* CAPTCHA Input */}
      <div className="relative">
        <input
          className="peer block w-full rounded-md border border-white/10 bg-white/5 py-[9px] px-3 text-sm text-white outline-2 placeholder:text-slate-500 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20"
          id="captcha"
          type="text"
          name="captcha"
          placeholder="Enter the code above"
          required
          autoComplete="off"
        />
      </div>
    </div>
  );
}
