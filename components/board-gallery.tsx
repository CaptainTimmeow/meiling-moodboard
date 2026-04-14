"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Board } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Plus } from "lucide-react";

export function BoardGallery({
  boards: initialBoards,
  userId,
  displayName,
}: {
  boards: Board[];
  userId: string;
  displayName: string;
}) {
  const router = useRouter();
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
        created_by: userId,
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
      "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
      "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
      "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
      "linear-gradient(135deg, #fddb92 0%, #d1fdff 100%)",
      "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
      "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
      "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  return (
    <div className="min-h-full bg-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-white/80 px-6 py-4 backdrop-blur-sm">
        <div>
          <h1 className="text-xl font-medium tracking-tight text-black">
            Mood Board
          </h1>
          <p className="text-sm text-black/60">For {displayName}</p>
        </div>
        <SignOutButton />
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <form
          onSubmit={createBoard}
          className="mb-10 flex flex-col gap-3 sm:flex-row"
        >
          <Input
            placeholder="Name your new moodscape..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="h-12 flex-1 rounded-full border-black/10 bg-white px-5 text-black placeholder:text-black/40"
          />
          <Button
            type="submit"
            disabled={creating || !newTitle.trim()}
            className="h-12 gap-2 rounded-full bg-black px-6 text-white hover:bg-black/90 disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            New entry
          </Button>
        </form>

        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-black/10 py-24 text-center">
            <p className="text-lg font-medium text-black">No entries yet</p>
            <p className="text-sm text-black/60">
              Create your first moodscape above
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <button
                key={board.id}
                onClick={() => router.push(`/board/${board.id}`)}
                className="group relative flex aspect-[4/3] flex-col items-start justify-end overflow-hidden rounded-2xl border border-black/5 bg-white p-6 text-left transition-shadow hover:shadow-lg"
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
