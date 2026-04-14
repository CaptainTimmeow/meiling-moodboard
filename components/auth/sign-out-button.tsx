"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      onClick={signOut}
      className="h-9 rounded-full border-black/10 px-4 text-sm text-black hover:bg-black/5"
    >
      Sign out
    </Button>
  );
}
