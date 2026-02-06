"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";
import { useParams } from "next/navigation";
import clsx from "clsx";
import {
  CardHeader,
  CardShell,
  EmptyState,
} from "@/app/ui/chat/chat-card-primitives";

interface User {
  name: string;
  avatar: string;
  public_id: string;
  user_id: string;
}

interface Message {
  sender_username?: string;
  avatar?: string;
  content: string;
  isSystem?: boolean;
  isLink?: boolean;
  isLimit?: boolean;
}

interface Notification {
  content: string;
  isSystem?: boolean;
  isLink?: boolean;
  isLimit?: boolean;
}

export default function DirectMessagePage() {
  const params = useParams<{ userId?: string | string[] }>();
  const rawTargetId = params?.userId;
  const targetId = Array.isArray(rawTargetId) ? rawTargetId[0] : rawTargetId;
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [hideSystemMessages, setHideSystemMessages] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"chat" | "users">("chat");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketBaseUrl = (() => {
    const origin = window.location.origin;
    const env =
      process.env.NEXT_PUBLIC_SOCKET_URL ||
      process.env.NEXT_PUBLIC_API_GATEWAY_URL;
    if (!env) return origin;
    try {
      const envUrl = new URL(env);
      const originUrl = new URL(origin);
      // If same hostname, prefer same-origin (nginx proxy) to avoid CORS issues.
      if (envUrl.hostname === originUrl.hostname) return origin;
      return env;
    } catch {
      return origin;
    }
  })();

  useEffect(() => {
    if (!targetId) return;

    const socket = io(socketBaseUrl, {
      transports: ["websocket", "polling"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinPrivate", { target_id: targetId });
    });

    socket.on("connect_error", (err) => {
      setNotifications((prev) => [
        { content: `Socket error: ${err.message}`, isSystem: true },
        ...prev,
      ]);
    });

    socket.on("updatePrivateUsers", (users: User[]) => {
      setUsers(users);
    });

    socket.on("updateDirectMessages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("updateNotifications", (incoming: Notification[]) => {
      if (!incoming || incoming.length === 0) return;
      setNotifications((prev) => [...incoming, ...prev]);
    });


    socket.on("kicked", (reason: string) => {
      setNotifications((prev) => [{ content: reason, isSystem: true }, ...prev]);
    });

    const handleBeforeUnload = () => {
      socket.disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.off("connect");
      socket.off("updatePrivateUsers");
      socket.off("updateDirectMessages");
      socket.off("updateNotifications");
      socket.off("disconnect");
      socket.off("kicked");
      socket.off("connect_error");
      socket.disconnect();
    };
  }, [targetId]);

  const visibleMessages = hideSystemMessages
    ? messages.filter((message) => !message.isSystem)
    : messages;

  useEffect(() => {
    const stored = window.localStorage.getItem("chat:hideSystem");
    if (stored === "true") {
      setHideSystemMessages(true);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "chat:hideSystem",
      hideSystemMessages ? "true" : "false"
    );
  }, [hideSystemMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages.length]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const msg = inputValue.trim();
    if (!msg || !socketRef.current) return;
    if (!targetId) {
      setNotifications((prev) => [
        { content: "Missing target user for direct message.", isSystem: true },
        ...prev,
      ]);
      return;
    }
    socketRef.current.emit("sendPrivateMessage", msg, targetId);
    setInputValue("");
  };

  const handleSendInvite = () => {
    if (!targetId) {
      setNotifications((prev) => [
        { content: "Missing target user for invite.", isSystem: true },
        ...prev,
      ]);
      return;
    }
    socketRef.current?.emit("sendPrivateInvite", targetId);
  };

  const handleDismissNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, idx) => idx !== index));
  };

  const renderMessageContent = (msg: Message | Notification) => {
    if (msg.isLink) {
      return (
        <a
          href={msg.content}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:underline"
        >
          Pong Invitation
        </a>
      );
    }

    if (msg.isSystem && !msg.content) {
      if (msg.isLimit) {
        return <span>System: You cannot send a message above 200 characters</span>;
      }
      return <span>System: Please wait before sending another invitation.</span>;
    }

    return <span>{msg.content}</span>;
  };

  if (!targetId) {
    return (
      <main className="min-h-screen bg-slate-950 text-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10">
          <p className="text-sm text-slate-300">
            No user specified for direct message.
          </p>
          <div className="flex gap-4 text-xs font-mono uppercase tracking-wider">
            <Link href="/dashboard" className="text-blue-400 hover:text-blue-300">
              Back to Dashboard
            </Link>
            <Link href="/chat" className="text-blue-400 hover:text-blue-300">
              Open Global Chat
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-blue-500/10 blur-[140px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-purple-500/10 blur-[160px]" />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
              <span className="text-blue-400">//</span> Direct Channel
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white">
              Private Signal
            </h1>
            <p className="mt-1 text-xs font-mono uppercase tracking-wider text-slate-500">
              Target ID: {targetId}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs font-mono uppercase tracking-wider">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-300 transition hover:border-blue-500/40 hover:text-white"
            >
              ← Back to Dashboard
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-slate-300 transition hover:border-purple-500/40 hover:text-white"
            >
              Global Chat
            </Link>
          </div>
        </div>

        <div className="flex w-full items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-1 text-xs font-mono uppercase tracking-wider text-slate-400 lg:hidden">
          {[
            { id: "chat", label: "Chat" },
            { id: "users", label: "Users" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobilePanel(tab.id as "chat" | "users")}
              className={clsx(
                "flex-1 rounded-md px-3 py-2 text-center transition",
                mobilePanel === tab.id
                  ? "bg-blue-500/20 text-blue-300"
                  : "text-slate-400 hover:text-slate-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
          <CardShell
            className={clsx(
              "h-[520px] flex-col lg:flex",
              mobilePanel === "users" ? "flex" : "hidden"
            )}
          >
            <CardHeader
              title="Participants"
              subtitle={`${users.length} connected`}
              accentClassName="text-green-400"
            />
            <div className="flex-1 divide-y divide-white/5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
              {users.length === 0 ? (
                <EmptyState
                  title="No participants"
                  message="Waiting for users to connect."
                />
              ) : (
                users.map((user) => (
                  <Link
                    key={user.public_id}
                    href={`/profile/${user.public_id}`}
                    className="flex items-center gap-3 p-4 transition hover:bg-white/5"
                  >
                    <img
                      src={`/public/uploads/${user.avatar}.png`}
                      alt={user.name}
                      className="h-10 w-10 rounded-full border border-white/10 object-cover"
                    />
                    <span className="truncate text-sm font-semibold text-slate-200">
                      {user.name}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </CardShell>

          <CardShell
            className={clsx(
              "h-[70vh] min-h-[420px] flex-col lg:h-[520px] lg:flex",
              mobilePanel === "chat" ? "flex" : "hidden"
            )}
          >
            <CardHeader
              title="Direct Messages"
              subtitle="Encrypted relay // private link"
              accentClassName="text-blue-400"
              action={
                <label className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                  <input
                    type="checkbox"
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500/40"
                    checked={hideSystemMessages}
                    onChange={(event) =>
                      setHideSystemMessages(event.target.checked)
                    }
                  />
                  Hide system
                </label>
              }
            />
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
              {visibleMessages.length === 0 ? (
                <EmptyState
                  title="No messages"
                  message="Start the conversation."
                />
              ) : (
                visibleMessages.map((msg, idx) => {
                  const isSystem = Boolean(msg.isSystem);
                  return (
                    <div
                      key={idx}
                      className={clsx(
                        "flex items-start gap-3 rounded-lg border p-3 transition",
                        isSystem
                          ? "border-red-500/30 bg-red-500/10"
                          : "border-white/10 bg-white/5 hover:bg-white/10"
                      )}
                    >
                      <img
                        src={
                          msg.isSystem
                            ? "/public/images/system.png"
                            : msg.avatar || "/images/default_avatar.png"
                        }
                        alt="avatar"
                        className="h-11 w-11 rounded-full border border-white/10 object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-mono uppercase tracking-wider text-slate-400">
                          {msg.isSystem
                            ? "System"
                            : msg.sender_username || "Anonymous"}
                        </p>
                        <div className="text-sm text-slate-200">
                          {renderMessageContent(msg)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-white/10 p-4">
              <form
                onSubmit={handleSendMessage}
                className="flex flex-col gap-3 md:flex-row"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Transmit a message..."
                  className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-500/30"
                  autoComplete="off"
                  suppressHydrationWarning
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/20 transition hover:from-blue-600 hover:to-indigo-600"
                >
                  Send
                </button>
                <button
                  type="button"
                  onClick={handleSendInvite}
                  className="inline-flex items-center justify-center rounded-lg border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-200 transition hover:border-emerald-400/40 hover:text-white"
                >
                  Invite
                </button>
              </form>
            </div>
          </CardShell>

        </div>
      </div>

      {notifications.length > 0 ? (
        <div className="pointer-events-none fixed left-1/2 top-8 z-50 flex w-[min(360px,90vw)] -translate-x-1/2 flex-col gap-3">
          {notifications.map((note, idx) => (
            <div
              key={`${idx}-${note.content}`}
              className="pointer-events-auto relative rounded-lg border border-red-500/40 bg-slate-950/90 p-4 shadow-xl shadow-red-500/10 backdrop-blur"
            >
              <button
                type="button"
                onClick={() => handleDismissNotification(idx)}
                className="absolute right-2 top-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-xs font-mono uppercase tracking-wider text-slate-300 transition hover:border-red-400/60 hover:text-white"
                aria-label="Dismiss notification"
              >
                Close
              </button>
              <div className="flex items-center gap-3">
                <img
                  src="/public/images/system.png"
                  alt="system"
                  className="h-9 w-9 rounded-full border border-red-500/40 object-cover"
                />
                <div className="min-w-0">
                  <p className="text-xs font-mono uppercase tracking-wider text-red-300">
                    System Alert
                  </p>
                  <div className="text-sm text-slate-100">
                    {renderMessageContent(note)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </main>
  );
}
