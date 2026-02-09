import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "https://localhost:3000";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt");
    if (!jwt) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${API_GATEWAY_URL}/api/friends`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Cookie: `jwt=${jwt.value}`,
      },
      cache: "no-store",
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        { error: "Unexpected response from backend" },
        { status: 502 }
      );
    }

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch friends" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("[API] friends proxy error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

