"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";

export function SignOutButton() {
  const router = useRouter();
  const { t } = useI18n();

  async function signOut() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <Button
      variant="outline"
      onClick={signOut}
      className="h-9 rounded-[50px] border-black/10 bg-white px-5 text-sm font-[330] tracking-[-0.14px] text-black hover:bg-black/5 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 focus-visible:ring-0"
    >
      {t("leave")}
    </Button>
  );
}
