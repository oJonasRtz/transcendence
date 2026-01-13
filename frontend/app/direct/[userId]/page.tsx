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

interface PageProps {
  params: { userId: string };
}

export default function DirectMessagePage({ params }: PageProps) {
  const { userId: targetId } = params;
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
    if (!targetId) return;

    const socket = io(socketBaseUrl, {
      transports: ["websocket"],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("joinPrivate", { target_id: targetId });
    });

    socket.on("updatePrivateUsers", (users: User[]) => {
      setUsers(users);
    });

    socket.on("updateDirectMessages", (msgs: Message[]) => {
      setMessages(msgs);
    });

    socket.on("updateNotifications", (notifications: Notification[]) => {
      setNotifications(notifications);
    });


    socket.on("kicked", (reason: string) => {
      setNotifications([{ content: reason, isSystem: true }]);
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
      socket.disconnect();
    };
  }, [targetId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    const msg = inputValue.trim();
    if (!msg || !socketRef.current) return;
    socketRef.current.emit("sendPrivateMessage", msg, targetId);
    setInputValue("");
  };

  const handleSendInvite = (e: FormEvent) => {
    e.preventDefault();
    socketRef.current?.emit("sendPrivateInvite", targetId);
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
      <div className="p-4">
        <p>No user specified for direct message.</p>
        <Link href="/chat" className="text-blue-500 hover:underline">
          Go to public chat
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex gap-4">
        <Link href="/" className="text-blue-500 hover:underline">
          Home
        </Link>
        <Link href="/chat" className="text-blue-500 hover:underline">
          Public Chat
        </Link>
      </div>
      <h1 className="text-xl font-bold">Direct Message</h1>
      <div className="flex gap-4">
        {/* Users sidebar */}
        <div className="w-48 flex flex-col gap-2">
          <h3 className="font-bold">Participants</h3>
          {users.map((user) => (
            <div key={user.public_id} className="flex items-center gap-2">
              <Link
                href={`/profile/${user.public_id}`}
                className="flex items-center gap-2 font-bold"
              >
                <img
                  src={`/public/uploads/${user.avatar}.png`}
                  alt={user.name}
                  className="w-[60px] h-[60px] rounded-full object-cover"
                />
                <span>{user.name}</span>
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
                      : msg.avatar || "/public/images/default_avatar.png"
                  }
                  alt="avatar"
                  className="w-[60px] h-[60px] rounded-full object-cover"
                />
                <div className="min-w-0 break-words">
                  <strong className="block">
                    {msg.isSystem ? "SYSTEM" : msg.sender_username || "Anonymous"}
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
              // suppressHydrationWarning is used to avoid hydration mismatches caused by autoComplete="off"
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
