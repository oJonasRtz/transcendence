'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileActionsProps {
  publicId: string;
}

export default function ProfileActions({ publicId }: ProfileActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleFriendInvite() {
    setLoading('friend');
    setMessage(null);
    try {
      const res = await fetch('/api/friendInvite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ public_id: publicId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to send friend request' });
    } finally {
      setLoading(null);
    }
  }

  async function handleBlock() {
    setLoading('block');
    setMessage(null);
    try {
      const res = await fetch('/api/blockUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ public_id: publicId }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to block/unblock user' });
    } finally {
      setLoading(null);
    }
  }

  function handleChat() {
    router.push(`/direct/${publicId}`);
  }

  return (
    <div className="mb-6">
      {/* Message feedback */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-center ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={handleFriendInvite}
          disabled={loading === 'friend'}
          className="cursor-pointer bg-green-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'friend' ? 'Sending...' : 'Add Friend'}
        </button>

        <button
          onClick={handleBlock}
          disabled={loading === 'block'}
          className="cursor-pointer bg-red-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading === 'block' ? 'Processing...' : 'Block/Unblock'}
        </button>

        <button
          onClick={handleChat}
          className="cursor-pointer bg-blue-600 text-white font-semibold px-5 py-2 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
        >
          Chat
        </button>
      </div>
    </div>
  );
}
