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
      "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
      "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
      "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  const hasGradient = (cover?: string | null) => Boolean(cover);

  return (
    <div className="min-h-full bg-white page-transition">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b border-black/5 bg-white/95 px-8 py-5 backdrop-blur-sm">
        <div>
          <h1 className="text-[24px] font-[540] leading-[1.1] tracking-[-0.26px] text-black">
            {t("moodBoard")}
          </h1>
          <p className="text-[14px] font-[330] leading-[1.4] tracking-[-0.14px] text-black/50">
            {t("sharedSpace")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-8 py-12">
        <form
          onSubmit={createBoard}
          className="mb-12 flex flex-col gap-3 sm:flex-row"
        >
          <Input
            placeholder={t("newMoodscapePlaceholder")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-12 flex-1 rounded-lg border-black/8 bg-white px-5 text-base text-black placeholder:text-black/35"
          />
          <Button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="h-12 gap-2 rounded-[50px] bg-black px-6 text-base text-white hover:bg-black/85 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            {t("newEntry")}
          </Button>
        </form>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-black/8 py-28 text-center">
            <p className="text-[22px] font-[330] leading-[1.35] tracking-[-0.14px] text-black">
              {t("noEntriesYet")}
            </p>
            <p className="mt-1 text-[15px] font-[320] leading-[1.45] tracking-[-0.14px] text-black/50">
              {t("createFirst")}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => {
              const gradient = hasGradient(board.cover_color);
              return (
                <button
                  key={board.id}
                  onClick={() => router.push(`/board/${board.id}`)}
                  className={cn(
                    "group relative flex aspect-[4/3] flex-col items-start justify-end overflow-hidden rounded-[8px] p-7 text-left card-lift",
                    "shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]",
                    !gradient && "bg-white border border-black/5"
                  )}
                  style={{
                    background: board.cover_color || undefined,
                  }}
                >
                  {gradient && (
                    <div className="absolute inset-0 rounded-[8px] bg-gradient-to-t from-black/40 via-black/5 to-transparent" />
                  )}
                  <div className="relative z-10 w-full">
                    <h3
                      className={cn(
                        "text-[22px] font-[540] leading-[1.2] tracking-[-0.26px]",
                        gradient ? "text-white" : "text-black"
                      )}
                    >
                      {board.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-1 text-[13px] font-[330] leading-[1.4] tracking-[-0.1px]",
                        gradient ? "text-white/75" : "text-black/50"
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
