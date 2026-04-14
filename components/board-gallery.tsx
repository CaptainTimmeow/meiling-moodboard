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

  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-[26px] font-medium leading-[1.35] tracking-[-0.26px] text-black">
            {t("moodBoard")}
          </h1>
          <p className="text-sm text-black/60">{t("sharedSpace")}</p>
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
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/10 py-24 text-center">
            <p className="text-[20px] font-normal leading-[1.4] tracking-[-0.14px] text-black">
              {t("noEntriesYet")}
            </p>
            <p className="text-sm text-black/60">{t("createFirst")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                className="group relative flex aspect-[4/3] flex-col items-start justify-end overflow-hidden rounded-xl border border-black/5 bg-white p-6 text-left transition-shadow hover:shadow-lg"
                style={{ background: board.cover_color || "#ffffff" }}
              >
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                <div className="relative z-10">
                  <h3 className="text-lg font-medium text-black">
                    {board.title}
                  </h3>
                  <p className="text-xs text-black/60">
                    {new Date(board.created_at).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
