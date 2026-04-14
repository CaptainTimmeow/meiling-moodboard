import { cookies } from "next/headers";

const COOKIE_NAME = "moodboard_session";

export async function getSession() {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

export async function setSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "1", {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function checkPassphrase(w1: string, w2: string, w3: string) {
  const combined = `${w1.trim().toLowerCase()}${w2.trim().toLowerCase()}${w3.trim().toLowerCase()}`;
  const expected = process.env.PASSPHRASE?.toLowerCase().replace(/\s+/g, "");
  // If no passphrase is set in env, any 3 words works
  if (!expected || expected.length === 0) return true;
  return combined === expected;
}
