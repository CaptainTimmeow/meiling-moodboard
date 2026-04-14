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
          className="gap-2 rounded-[50px] border-black/10 bg-white px-4 text-sm text-black hover:bg-black/5"
        >
          {locale === "zh" ? "中文" : "English"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="rounded-xl border-black/10 bg-white"
      >
        <DropdownMenuItem
          onClick={() => setLocale("zh")}
          className="rounded-lg text-black focus:bg-black/5 focus:text-black"
        >
          中文
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setLocale("en")}
          className="rounded-lg text-black focus:bg-black/5 focus:text-black"
        >
          English
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
