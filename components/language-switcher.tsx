"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const { locale, setLocale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 rounded-[50px] border-black/10 bg-white px-4 text-sm font-[330] tracking-[-0.14px] text-black hover:bg-black/5 focus-visible:outline-dashed focus-visible:outline-2 focus-visible:outline-black focus-visible:outline-offset-2 focus-visible:ring-0"
        >
          {locale === "zh" ? "中文" : "English"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-[8px] border-black/10 bg-white"
      >
        <DropdownMenuItem
          onClick={() => setLocale("zh")}
          className="rounded-[6px] font-[330] tracking-[-0.14px] text-black focus:bg-black/5 focus:text-black"
        >
          中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className="rounded-[6px] font-[330] tracking-[-0.14px] text-black focus:bg-black/5 focus:text-black"
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
