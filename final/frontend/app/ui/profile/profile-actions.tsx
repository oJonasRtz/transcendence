"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlusIcon,
  NoSymbolIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";

interface ProfileActionsProps {
  publicId: string;
  isMine: boolean;
}

export default function ProfileActions({
  publicId,
  isMine,
}: ProfileActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // ⏱️ Auto-hide after 3 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage(null);
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  async function handleFriendInvite() {
    if (isMine) return;
    setLoading("friend");
    setMessage(null);
    try {
      const res = await fetch("/api/friendInvite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ public_id: publicId }),
      });
      const data = await res.json();
      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });
    } catch {
      setMessage({ type: "error", text: "Failed to send friend request" });
    } finally {
      setLoading(null);
    }
  }

  async function handleBlock() {
    if (isMine) return;
    setLoading("block");
    setMessage(null);
    try {
      const res = await fetch("/api/blockUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ public_id: publicId }),
      });
      const data = await res.json();
      setMessage({
        type: data.success ? "success" : "error",
        text: data.message,
      });
    } catch {
      setMessage({ type: "error", text: "Failed to block/unblock user" });
    } finally {
      setLoading(null);
    }
  }

  function handleChat() {
    router.push(`/direct/${publicId}`);
  }

  const disabledClass = "cursor-not-allowed border-gray-500 opacity-50";
  const iconDisabledClass = "text-gray-500";

  return (
    <div className="mb-6 flex flex-col justify-start items-center relative">
      {/* Action icons */}
      <div className="flex justify-start gap-2">
        {/* Add Friend */}
        <div className="relative group">
          <button
            onClick={handleFriendInvite}
            disabled={isMine || loading === "friend"}
            className={`h-8 w-8 rounded-full border flex items-center justify-center ${
              isMine
                ? disabledClass
                : "border-green-500 transition-transform hover:scale-110 hover:border-green-400"
            }`}
            aria-label="Add friend"
          >
            <UserPlusIcon
              className={`h-4 w-4 ${
                isMine ? iconDisabledClass : "text-green-500 group-hover:text-green-400"
              }`}
            />
          </button>
        </div>

        {/* Block */}
        <div className="relative group">
          <button
            onClick={handleBlock}
            disabled={isMine || loading === "block"}
            className={`h-8 w-8 rounded-full border flex items-center justify-center ${
              isMine
                ? disabledClass
                : "border-red-500 transition-transform hover:scale-110 hover:border-red-400"
            }`}
            aria-label="Block user"
          >
            <NoSymbolIcon
              className={`h-4 w-4 ${
                isMine ? iconDisabledClass : "text-red-500 group-hover:text-red-400"
              }`}
            />
          </button>
        </div>

        {/* Chat */}
        <div className="relative group">
          <button
            onClick={handleChat}
            className="h-8 w-8 rounded-full border border-blue-500 flex items-center justify-center transition-transform hover:scale-110 hover:border-blue-400"
            aria-label="Chat"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4 text-blue-500 group-hover:text-blue-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* Message feedback */}
      {message && (
        <div
          className={`absolute top-full left-0 mt-3 px-4 py-2 rounded-lg text-center
          transform transition-all duration-300 ease-out
          opacity-100 translate-y-0
          w-[320px] max-w-[90vw]
          ${
            message.type === "success"
              ? "bg-green-500/50 text-green-400"
              : "bg-red-500/50 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
