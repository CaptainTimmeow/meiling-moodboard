"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Board } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function BoardGallery({
  boards: initialBoards,
}: {
  boards: Board[];
}) {
  const router = useRouter();
  const { t } = useI18n();
  const supabase = createClient();
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [newTitle, setNewTitle] = useState("");
  const [creating, setCreating] = useState(false);

  async function createBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    const { data, error } = await supabase
      .from("boards")
      .insert({
        title: newTitle.trim(),
        cover_color: generateSoftColor(),
      })
      .select()
      .single();

    if (!error && data) {
      setBoards([data, ...boards]);
      setNewTitle("");
    }
    setCreating(false);
  }

  function generateSoftColor() {
    const colors = [
      "linear-gradient(135deg, #a8e063 0%, #f4d03f 100%)",
      "linear-gradient(135deg, #f4d03f 0%, #9b59b6 100%)",
      "linear-gradient(135deg, #9b59b6 0%, #e91e63 100%)",
      "linear-gradient(135deg, #e91e63 0%, #ff9800 100%)",
      "linear-gradient(135deg, #ff9800 0%, #a8e063 100%)",
      "linear-gradient(135deg, #a8e063 0%, #e91e63 100%)",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const hasGradient = (cover?: string | null) => Boolean(cover);

  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-black/5 bg-white/95 px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-[26px] font-[540] leading-[1.35] tracking-[-0.26px] text-black">
            {t("moodBoard")}
          </h1>
          <p className="text-[18px] font-[320] leading-[1.45] tracking-[-0.26px] text-black/60">
            {t("sharedSpace")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <form
          onSubmit={createBoard}
          className="mb-10 flex flex-col gap-3 sm:flex-row"
        >
          <Input
            placeholder={t("newMoodscapePlaceholder")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-12 flex-1 rounded-lg border-black/10 bg-white px-5 text-base text-black placeholder:text-black/40 focus-visible:ring-black"
          />
          <Button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="h-12 gap-2 rounded-[50px] bg-black px-6 text-base text-white hover:bg-black/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {t("newEntry")}
          </Button>
        </form>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-black/10 py-24 text-center">
            <p className="text-[20px] font-[330] leading-[1.4] tracking-[-0.14px] text-black">
              {t("noEntriesYet")}
            </p>
            <p className="text-[16px] font-[320] leading-[1.45] tracking-[-0.14px] text-black/60">
              {t("createFirst")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => {
              const gradient = hasGradient(board.cover_color);
              return (
                <button
                  key={board.id}
                  onClick={() => router.push(`/board/${board.id}`)}
                  className={cn(
                    "group relative flex aspect-[4/3] flex-col items-start justify-end overflow-hidden rounded-lg p-6 text-left transition-all duration-200",
                    "shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:-translate-y-0.5",
                    !gradient && "bg-white"
                  )}
                  style={{
                    background: board.cover_color || undefined,
                  }}
                >
                  {gradient && (
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                  )}
                  <div className="relative z-10 w-full">
                    <h3
                      className={cn(
                        "text-[20px] font-[540] leading-[1.35] tracking-[-0.26px]",
                        gradient ? "text-white" : "text-black"
                      )}
                    >
                      {board.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-[14px] font-[330] leading-[1.4] tracking-[-0.14px]",
                        gradient ? "text-white/80" : "text-black/60"
                      )}
                    >
                      {new Date(board.created_at).toLocaleDateString(
                        undefined,
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
