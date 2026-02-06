import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/app/lib/auth";
import { cookies } from "next/headers";

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "https://localhost:3000";

async function fetchInbox(jwtValue: string) {
  const response = await fetch(`${API_GATEWAY_URL}/api/messages?limit=50`, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Cookie: `jwt=${jwtValue}`,
    },
    cache: "no-store",
  });
  if (!response.ok) return { messages: [], unreadCount: 0 };
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json"))
    return { messages: [], unreadCount: 0 };
  return response.json();
}

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const cookieStore = await cookies();
  const jwtValue = cookieStore.get("jwt")?.value ?? "";

  const inbox = await fetchInbox(jwtValue);
  const messages: any[] = Array.isArray(inbox?.messages) ? inbox.messages : [];

  return (
    <main className="p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-slate-400">
            <span className="text-purple-400">//</span> Inbox
          </p>
          <h1 className="text-3xl font-black tracking-tight text-white">
            Messages
          </h1>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-mono uppercase tracking-wider text-slate-300 transition hover:border-blue-500/40 hover:text-white"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5 divide-y divide-white/5 overflow-hidden">
        {messages.length === 0 ? (
          <div className="p-6 text-sm text-slate-300">
            No messages yet. Start a chat from a profile or your friends list.
          </div>
        ) : (
          messages.map((row: any, index: number) => (
            <Link
              key={row?.id ?? index}
              href={`/direct/${row?.public_id ?? ""}`}
              className="block p-4 transition hover:bg-white/10"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">
                    {row?.username ?? "Unknown"}
                  </p>
                  <p className="text-sm text-slate-400 font-mono truncate">
                    {row?.isLink ? "Pong Invitation" : (row?.preview ?? "")}
                  </p>
                </div>
                <p className="text-xs text-slate-500 font-mono whitespace-nowrap">
                  {row?.createdAt
                    ? new Date(row.createdAt).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
