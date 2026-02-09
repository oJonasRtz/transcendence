import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const API_GATEWAY_URL =
  process.env.API_GATEWAY_URL ||
  process.env.NEXT_PUBLIC_API_GATEWAY_URL ||
  "https://localhost:3000";

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const jwt = cookieStore.get("jwt");
    if (!jwt) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    const public_id = body?.public_id;
    if (!public_id || typeof public_id !== "string") {
      return NextResponse.json(
        { success: false, message: "public_id is required" },
        { status: 400 }
      );
    }

    const response = await fetch(`${API_GATEWAY_URL}/api/friends/accept`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: `jwt=${jwt.value}`,
      },
      body: JSON.stringify({ public_id }),
      redirect: "manual",
    });

    if (response.status >= 300 && response.status < 400) {
      return NextResponse.json(
        { success: false, message: "Session expired" },
        { status: 401 }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : null;

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data?.message || data?.error || "Failed to accept request",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      { success: true, message: data?.message || "Friend added" },
      { status: 200 }
    );
  } catch (error) {
    console.error("[API] friends/accept proxy error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

