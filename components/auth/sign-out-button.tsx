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
      className="h-10 rounded-full border-[rgba(61,58,54,0.08)] px-5 text-sm text-[#5c534b] hover:bg-[#f3ebe4] hover:text-[#3d3a36]"
    >
      {t("leave")}
    </Button>
  );
}
