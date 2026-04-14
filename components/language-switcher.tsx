"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 rounded-full text-[#8a7f74] hover:bg-[#f3ebe4] hover:text-[#5c534b]"
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{locale === "zh" ? "中文" : "English"}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-2xl border-[rgba(61,58,54,0.08)] bg-white"
      >
        <DropdownMenuItem
          onClick={() => setLocale("zh")}
          className="rounded-xl text-[#3d3a36] focus:bg-[#f3ebe4] focus:text-[#3d3a36]"
        >
          中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className="rounded-xl text-[#3d3a36] focus:bg-[#f3ebe4] focus:text-[#3d3a36]"
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
