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
      "linear-gradient(135deg, #f9e4c9 0%, #f5d6c6 100%)",
      "linear-gradient(135deg, #d4e8d4 0%, #e8f3e8 100%)",
      "linear-gradient(135deg, #e8d5e8 0%, #f3e8f3 100%)",
      "linear-gradient(135deg, #c9e4e8 0%, #d4e8e8 100%)",
      "linear-gradient(135deg, #f5d6c6 0%, #f9e4c9 100%)",
      "linear-gradient(135deg, #e8e8d4 0%, #f3f3e8 100%)",
      "linear-gradient(135deg, #d6d6f5 0%, #e8e8f9 100%)",
      "linear-gradient(135deg, #f5e8d6 0%, #f9f3e8 100%)",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return (
    <div className="relative min-h-full bg-[#faf8f5]">
      {/* Grain texture */}
      <div className="absolute inset-0 paper-grain" />

      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[rgba(61,58,54,0.06)] bg-[#faf8f5]/85 px-6 py-4 backdrop-blur-md">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[#3d3a36]">
            {t("moodBoard")}
          </h1>
          <p className="text-sm text-[#8a7f74]">{t("sharedSpace")}</p>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <SignOutButton />
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 py-12">
        <form
          onSubmit={createBoard}
          className="mb-12 flex flex-col gap-4 sm:flex-row"
        >
          <Input
            placeholder={t("newMoodscapePlaceholder")}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-14 flex-1 rounded-full border-[rgba(61,58,54,0.08)] bg-white px-6 text-lg text-[#3d3a36] placeholder:text-[#8a7f74]/60 focus-visible:ring-[#c45d3e]"
          />
          <Button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="h-14 gap-2 rounded-full bg-[#c45d3e] px-8 text-lg text-white hover:bg-[#a84d32] disabled:opacity-50 btn-warm"
          >
            <Plus className="h-5 w-5" />
            {t("newEntry")}
          </Button>
        </form>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-[rgba(61,58,54,0.08)] bg-white/50 py-28 text-center card-warm">
            <p className="text-xl font-medium text-[#3d3a36]">{t("noEntriesYet")}</p>
            <p className="mt-2 text-[#8a7f74]">{t("createFirst")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                className="group relative flex aspect-[4/3] flex-col items-start justify-end overflow-hidden rounded-[2rem] border border-[rgba(61,58,54,0.06)] bg-white p-8 text-left card-warm"
                style={{ background: board.cover_color || "#ffffff" }}
              >
                <div className="absolute inset-0 rounded-[2rem] bg-white/0 transition-colors group-hover:bg-white/10" />
                <div className="relative z-10">
                  <h3 className="text-xl font-medium text-[#3d3a36]">
                    {board.title}
                  </h3>
                  <p className="mt-1 text-sm text-[#5c534b]/80">
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
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
