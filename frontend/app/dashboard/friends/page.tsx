'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CardHeader, CardShell, EmptyState } from '@/app/ui/dashboard/card-primitives';

type FriendRow = {
  id?: number;
  username: string;
  avatar: string;
  public_id: string;
  isOnline: boolean | number;
};

export default function FriendsPage() {
  const [friends, setFriends] = useState<FriendRow[]>([]);
  const [pendings, setPendings] = useState<FriendRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/friends', { credentials: 'include' });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to load friends');
      }
      setFriends(Array.isArray(data?.friends) ? data.friends : []);
      setPendings(Array.isArray(data?.pendings) ? data.pendings : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friends');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const incoming = useMemo(() => pendings, [pendings]);

  async function accept(public_id: string) {
    setBusyId(public_id);
    try {
      const res = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ public_id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to accept');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept');
    } finally {
      setBusyId(null);
    }
  }

  async function remove(public_id: string) {
    setBusyId(public_id);
    try {
      const res = await fetch('/api/friends/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ public_id }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.message || 'Failed to remove');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove');
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <CardShell>
        <CardHeader
          title="Friends"
          accentClassName="text-green-400"
          subtitle="Manage requests and friends"
          action={
            <button
              type="button"
              onClick={load}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono uppercase tracking-wider text-slate-300 transition hover:border-green-400/40 hover:text-white"
            >
              Refresh
            </button>
          }
        />

        {error ? (
          <div className="p-4 text-sm text-red-400">{error}</div>
        ) : null}

        {loading ? (
          <div className="p-6 text-sm text-slate-400 font-mono">Loading…</div>
        ) : (
          <div className="divide-y divide-white/5">
            <div className="p-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                Incoming Requests
              </h3>
              {incoming.length === 0 ? (
                <p className="mt-2 text-sm font-mono text-slate-500">
                  No pending requests.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {incoming.map((u) => (
                    <div
                      key={u.public_id}
                      className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Image
                          src={u.avatar || '/images/default_avatar.png'}
                          alt={u.username}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full border border-white/10 object-cover"
                        />
                        <Link
                          href={`/profile/${u.public_id}`}
                          className="truncate text-sm font-semibold text-white hover:text-blue-300"
                        >
                          {u.username}
                        </Link>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={busyId === u.public_id}
                          onClick={() => accept(u.public_id)}
                          className="rounded-lg bg-green-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          disabled={busyId === u.public_id}
                          onClick={() => remove(u.public_id)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-red-400/40 hover:text-white disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                Friends
              </h3>
              {friends.length === 0 ? (
                <EmptyState
                  title="No friends yet"
                  message="Send a friend request from a profile to get started."
                />
              ) : (
                <div className="mt-4 space-y-3">
                  {friends.map((u) => (
                    <div
                      key={`${u.public_id}-${u.id ?? u.public_id}`}
                      className="flex items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Image
                          src={u.avatar || '/images/default_avatar.png'}
                          alt={u.username}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full border border-white/10 object-cover"
                        />
                        <div className="min-w-0">
                          <Link
                            href={`/profile/${u.public_id}`}
                            className="block truncate text-sm font-semibold text-white hover:text-blue-300"
                          >
                            {u.username}
                          </Link>
                          <p className="text-xs font-mono text-slate-500">
                            {u.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={`/direct/${u.public_id}`}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-blue-700"
                        >
                          Chat
                        </Link>
                        <button
                          type="button"
                          disabled={busyId === u.public_id}
                          onClick={() => remove(u.public_id)}
                          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-red-400/40 hover:text-white disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </CardShell>
    </div>
  );
}
