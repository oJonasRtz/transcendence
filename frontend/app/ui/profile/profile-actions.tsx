"use client";

import { useState } from "react";
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
      if (data.success) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.message });
      }
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
      if (data.success) {
        setMessage({ type: "success", text: data.message });
      } else {
        setMessage({ type: "error", text: data.message });
      }
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
  const enabledScaleClass = "transition-transform hover:scale-110";
  const enabledBorderHover = "hover:border-green-400";
  const enabledRedHover = "hover:border-red-400";

  const bgSize: number = 8;
  const iconSize: number = bgSize / 2;

  return (
    <div className="mb-6">
      {/* Message feedback */}
      {message && (
        <div
          className={`mb-4 p-3 rounded-lg text-center ${
            message.type === "success"
              ? "bg-green-500/20 text-green-400"
              : "bg-red-500/20 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Action icons */}
      <div className="flex justify-center gap-2">
        {/* Add Friend */}
        <div className="relative group">
          <button
            onClick={handleFriendInvite}
            disabled={isMine || loading === "friend"}
            className={`h-${bgSize} w-${bgSize} rounded-full border flex items-center justify-center ${
              isMine
                ? disabledClass
                : "border-green-500 " + enabledScaleClass + " " + enabledBorderHover
            }`}
            aria-label="Add friend"
          >
            <UserPlusIcon
              className={`h-${iconSize} w-${iconSize} ${
                isMine ? iconDisabledClass : "text-green-500 group-hover:text-green-400"
              }`}
            />
          </button>

          {!isMine && (
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
              Add friend
            </span>
          )}
        </div>

        {/* Block */}
        <div className="relative group">
          <button
            onClick={handleBlock}
            disabled={isMine || loading === "block"}
            className={`h-${bgSize} w-${bgSize} rounded-full border flex items-center justify-center ${
              isMine
                ? disabledClass
                : "border-red-500 " + enabledScaleClass + " " + enabledRedHover
            }`}
            aria-label="Block user"
          >
            <NoSymbolIcon
              className={`h-${iconSize} w-${iconSize} ${
                isMine ? iconDisabledClass : "text-red-500 group-hover:text-red-400"
              }`}
            />
          </button>

          {!isMine && (
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
              Block / Unblock
            </span>
          )}
        </div>

        {/* Chat */}
        <div className="relative group">
          <button
            onClick={handleChat}
            className={`h-${bgSize} w-${bgSize} rounded-full border border-blue-500 flex items-center justify-center transition-transform hover:scale-110 hover:border-blue-400`}
            aria-label="Chat"
          >
            <ChatBubbleLeftRightIcon className={`h-${iconSize} w-${iconSize} text-blue-500 group-hover:text-blue-400 transition-colors`} />
          </button>
          <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity">
            Chat
          </span>
        </div>
      </div>
    </div>
  );
}
