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
      className="h-9 rounded-[50px] border-black/10 px-5 text-sm text-black hover:bg-black/5"
    >
      {t("leave")}
    </Button>
  );
}
