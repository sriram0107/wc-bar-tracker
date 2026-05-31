import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getClientIp, rateLimit } from "@/lib/rateLimit";

const RATE_LIMITED_PATHS = ["/api/bars"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!RATE_LIMITED_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const ip = getClientIp(request);
  const result = rateLimit(`api:${ip}`);

  if (!result.success) {
    return NextResponse.json(
      { error: "Too many requests" },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((result.resetAt - Date.now()) / 1000)
          ),
          "X-RateLimit-Limit": String(result.limit),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = NextResponse.next();
  response.headers.set("X-RateLimit-Limit", String(result.limit));
  response.headers.set("X-RateLimit-Remaining", String(result.remaining));
  return response;
}

export const config = {
  matcher: ["/api/bars", "/api/bars/:path*"],
};
