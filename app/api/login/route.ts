import { NextResponse } from "next/server";
import { setSession, checkPassphrase } from "@/lib/simple-auth";

export async function POST(request: Request) {
  const { w1, w2, w3 } = await request.json();

  if (!checkPassphrase(w1, w2, w3)) {
    return NextResponse.json({ error: "Invalid passphrase" }, { status: 401 });
  }

  await setSession();
  return NextResponse.json({ success: true });
}
