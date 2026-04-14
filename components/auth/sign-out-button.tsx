"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      onClick={signOut}
      className="h-9 rounded-full border-black/10 px-4 text-sm text-black hover:bg-black/5"
    >
      Leave
    </Button>
  );
}
