'use client';

import { useFormStatus } from 'react-dom';
import { useEffect, useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { changeAvatar } from '@/app/actions/profile';
import { PhotoIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface AvatarUploadFormProps {
  user: {
    id: number;
    username: string;
    email: string;
    avatar?: string | null;
  };
}

function SubmitButton() {
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
      {pending ? 'Uploading...' : 'Update Avatar'}

      {/* Cyber glow effect */}
      <div className="absolute inset-0 rounded-lg bg-blue-500/0 group-hover:bg-blue-500/10
                      transition-all duration-300 -z-10 blur-xl" />
    </button>
  );
}

export default function AvatarUploadForm({ user }: AvatarUploadFormProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(changeAvatar, undefined);
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(
    user.avatar || '/public/images/default.jpg'
  );

  // Handle file preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return;
      }

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Show success message and refresh data
  useEffect(() => {
    if (state?.success) {
      setShowSuccess(true);

      // Instantly update current avatar with preview for instant feedback
      if (previewUrl) {
        setCurrentAvatarUrl(previewUrl);
      }

      // Clear preview after moving it to current
      setPreviewUrl(null);

      // Delay router.refresh() slightly to ensure state is visible
      const refreshTimer = setTimeout(() => {
        router.refresh();
      }, 100);

      const hideTimer = setTimeout(() => {
        setShowSuccess(false);
      }, 5000);

      return () => {
        clearTimeout(refreshTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [state?.success, router, previewUrl]);

  // Cleanup preview URL on unmount (but not currentAvatarUrl since it might be from preview)
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl !== currentAvatarUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, currentAvatarUrl]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-xl font-bold text-white mb-2">Change Profile Picture</h2>
        <p className="text-sm text-slate-400">
          Upload a new avatar image. Accepted formats: PNG, JPG, JPEG, WEBP. Max size: 5MB.
        </p>
      </div>

      {/* Form */}
      <form action={formAction} className="space-y-6">
        {/* Current Avatar Preview */}
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Current Avatar
          </label>
          <div className="relative group w-40 h-40">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
            <img
              src={currentAvatarUrl || '/public/images/default.jpg'}
              alt="Current Avatar"
              className="relative h-40 w-40 rounded-full border-4 border-white/20 shadow-2xl object-cover transition-all duration-300"
            />
          </div>
        </div>

        {/* File Input */}
        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-slate-300 mb-2">
            <span className="text-blue-400">01</span> // Select New Image
          </label>
          <input
            type="file"
            id="avatar"
            name="avatar"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleFileChange}
            required
            className="block w-full text-sm text-slate-400
                       file:mr-4 file:py-3 file:px-4
                       file:rounded-lg file:border-0
                       file:text-sm file:font-medium
                       file:bg-blue-500/20 file:text-blue-400
                       file:border file:border-blue-500/50
                       hover:file:bg-blue-500/30 hover:file:border-blue-500/70
                       file:cursor-pointer file:transition-all file:duration-300
                       cursor-pointer"
          />
          <p className="mt-2 text-xs text-slate-500 font-mono">
            PNG, JPG, JPEG, or WEBP (MAX. 5MB). Image will be automatically cropped to circle.
          </p>
        </div>

        {/* Preview New Image */}
        {previewUrl && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Preview
            </label>
            <div className="relative group w-40 h-40">
              <div className="absolute -inset-1 bg-gradient-to-r from-green-500 to-blue-500 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition duration-300"></div>
              <img
                src={previewUrl}
                alt="Preview"
                className="relative h-40 w-40 rounded-full border-4 border-white/20 shadow-2xl object-cover"
              />
            </div>
          </div>
        )}

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
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
