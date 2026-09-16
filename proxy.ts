import { NextRequest, NextResponse } from "next/server";

const SEARCH_ENGINE_REFERERS = ["google.", "bing.", "duckduckgo.", "yahoo."];

export function proxy(request: NextRequest) {
  const referer = request.headers.get("referer") ?? "";
  const cameFromSearchEngine = SEARCH_ENGINE_REFERERS.some((domain) => referer.includes(domain));

  if (cameFromSearchEngine) {
    return NextResponse.redirect(new URL("/bienvenida", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/",
};
