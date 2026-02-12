'use client';

import clsx from 'clsx';
import { useFormStatus } from 'react-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  glow?: boolean;
}

export function ButtonGlimmer({ children, className, glow = true, ...rest }: ButtonProps) {
  // useFormStatus automatically handles the 'pending' state when used inside a <form>
  const { pending } = useFormStatus();

  return (
    <>
      {/* This style block defines the animations locally so you don't need a global CSS file.
        The pulse matches the blue branding from your dashboard.
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(37, 99, 235, 0); }
          100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
        }
        .animate-glow-local {
          animation: pulse-glow 2.5s infinite;
        }
      `}} />

      <button
        {...rest}
        disabled={pending || rest.disabled}
        className={clsx(
          // Base Styles: Rounded-XL matches your modern dashboard identity
          'group relative flex h-12 items-center justify-center overflow-hidden rounded-xl bg-blue-600 px-8 text-sm font-bold text-white transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-70',
          
          // Apply the glow animation defined in the style block above
          { 'animate-glow-local': glow && !pending },
          
          className
        )}
      >
        {/* Shimmer Effect: Moves across the button on hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-1000 ease-in-out group-hover:translate-x-full" />

        <span className="relative z-10 flex items-center gap-3 tracking-wide">
          {pending ? (
            <>
              <Spinner />
              <span>Processing...</span>
            </>
          ) : (
            children
          )}
        </span>
      </button>
    </>
  );
}

// Minimalist Spinner for loading states
function Spinner() {
  return (
    <svg className="h-5 w-5 animate-spin text-white" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}