'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { useEffect, useState } from 'react';

interface SettingsFormProps {
  title: string;
  description: string;
  action: (state: { error?: string; success?: string } | undefined, formData: FormData) => Promise<{ error?: string; success?: string }>;
  children: React.ReactNode;
  submitText?: string;
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative px-6 py-3 rounded-lg
                 bg-blue-500/20 hover:bg-blue-500/30
                 border border-blue-500/50 hover:border-blue-500/70
                 text-blue-400 hover:text-blue-300
                 transition-all duration-300
                 disabled:opacity-50 disabled:cursor-not-allowed
                 font-medium"
    >
      {pending ? 'Updating...' : text}

      {/* Cyber glow effect */}
      <div className="absolute inset-0 rounded-lg bg-blue-500/0 group-hover:bg-blue-500/10
                      transition-all duration-300 -z-10 blur-xl" />
    </button>
  );
}

export default function SettingsForm({
  title,
  description,
  action,
  children,
  submitText = 'Update',
}: SettingsFormProps) {
  const [state, formAction] = useFormState(action, undefined);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state?.success]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-slate-400">{description}</p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Form Fields (passed as children) */}
        {children}

        {/* Error Message */}
        {state?.error && (
          <div className="p-4 rounded-lg border border-red-500/50 bg-red-500/10">
            <p className="text-sm text-red-400 font-mono">
              ERROR: {state.error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {state?.success && showSuccess && (
          <div className="p-4 rounded-lg border border-green-500/50 bg-green-500/10
                          animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-sm text-green-400 font-mono">
              SUCCESS: {state.success}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <SubmitButton text={submitText} />
        </div>
      </form>
    </div>
  );
}
