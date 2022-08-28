import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { nanoid } from "nanoid";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const id = self.crypto.randomUUID();
  console.log(id);

  const voterIdCookie = request.cookies.get("voter-token");
  console.log(voterIdCookie);

  const random = voterIdCookie ?? id;

  response.cookies.set("voter-token", random);

  return response;
}
