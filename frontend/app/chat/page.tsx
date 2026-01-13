"use client";

import { useEffect, useState, useRef, FormEvent } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

interface User {
  name: string;
  avatar: string;
  public_id: string;
}

interface Message {
  username?: string;
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

export default function ChatPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [inputValue, setInputValue] = useState("");
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // Temporary: use API gateway host so sockets work in dev on port 3042.
  const socketBaseUrl =
    process.env.NEXT_PUBLIC_API_GATEWAY_URL || window.location.origin;

  useEffect(() => {
    const socket = io(socketBaseUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join");
    });

    socket.on("updateUsers", (users: User[]) => {
      setUsers(users);
    });

    socket.on("updateMessages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("updateNotifications", (notifications: Notification[]) => {
      setNotifications(notifications);
    });

    socket.on("disconnect", () => {
    });

    socket.on("kicked", (reason: string) => {
      setNotifications([{ content: reason, isSystem: true }]);
    });

    // Handle page unload (URL change, tab close, refresh)
    const handleBeforeUnload = () => {
      socket.disconnect();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup function to disconnect socket on unmount
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      socket.off("connect");
      socket.off("updateUsers");
      socket.off("updateMessages");
      socket.off("updateNotifications");
      socket.off("disconnect");
      socket.off("kicked");
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const msg = inputValue.trim();
    if (!msg || !socketRef.current) return;
    socketRef.current.emit("sendMessage", msg);
    setInputValue("");
  };

  const handleSendInvite = (e: FormEvent) => {
    e.preventDefault();
    socketRef.current?.emit("sendInvite");
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

  return (
    <div className="flex flex-col gap-4 p-4">
      <Link href="/" className="text-blue-500 hover:underline w-fit">
        ← Home
      </Link>
      <div className="flex gap-4">
      {/* Users sidebar */}
      <div className="w-48 flex flex-col gap-2">
        <h3 className="font-bold">Users</h3>
        {users.map((user) => (
          <div key={user.public_id} className="flex items-center gap-2">
            <Link
              href={`/profile/${user.public_id}`}
              className="flex items-center gap-2"
            >
              <img
                src={`/public/uploads/${user.avatar}.png`}
                alt={user.name}
                className="w-[60px] h-[60px] rounded-full object-cover"
              />
              <span className="font-bold">{user.name}</span>
            </Link>
          </div>
        ))}
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {messages.map((msg, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2">
              <img
                src={
                  msg.isSystem
                    ? "/public/images/system.png"
                    : msg.avatar || "/app/public/images/default_avatar.png"
                }
                alt="avatar"
                className="w-[60px] h-[60px] rounded-full object-cover"
              />
              <div className="min-w-0 break-words">
                <strong className="block">
                  {msg.isSystem ? "SYSTEM" : msg.username || "Anonymous"}
                </strong>
                {renderMessageContent(msg)}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message form */}
        <form onSubmit={handleSendMessage} className="flex gap-2 mt-4">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded"
            autoComplete="off"
            suppressHydrationWarning
          />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
            Send
          </button>
        </form>

        {/* Invite button */}
        <form onSubmit={handleSendInvite} className="mt-2">
          <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
            Send Invite
          </button>
        </form>
      </div>

      {/* Notifications */}
      <div className="w-64">
        <h3 className="font-bold mb-2">Notifications</h3>
        {notifications.map((note, idx) => (
          <div key={idx} className="flex items-start gap-3 p-2">
            <img
              src="/public/images/system.png"
              alt="system"
              className="w-[60px] h-[60px] rounded-full object-cover"
            />
            <div className="min-w-0 break-words">
              <strong className="block">SYSTEM</strong>
              {renderMessageContent(note)}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}
