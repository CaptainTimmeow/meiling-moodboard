"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Board, CanvasElement } from "@/types";
import { CanvasStage } from "@/components/canvas/stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Type,
  Image as ImageIcon,
  Music,
  Trash2,
  ArrowLeft,
  Palette,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function BoardEditor({
  board,
  initialElements,
}: {
  board: Board;
  initialElements: CanvasElement[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [elements, setElements] = useState<CanvasElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [boardTitle, setBoardTitle] = useState(board.title);
  const [uploading, setUploading] = useState(false);

  const updateElement = useCallback(
    async (id: string, updates: Partial<CanvasElement>) => {
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
      await supabase.from("elements").update(updates).eq("id", id);
    },
    [supabase]
  );

  const deleteElement = useCallback(
    async (id: string) => {
      setElements((prev) => prev.filter((el) => el.id !== id));
      setSelectedId(null);
      await supabase.from("elements").delete().eq("id", id);
    },
    [supabase]
  );

  async function addText() {
    const newEl: Partial<CanvasElement> = {
      board_id: board.id,
      type: "text",
      content: "Double click to edit",
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      width: 240,
      height: 60,
      rotation: 0,
      style: {
        fontSize: 24,
        color: "#000000",
        opacity: 1,
        fontWeight: 400,
      },
      z_index: elements.length,
    };
    const { data } = await supabase.from("elements").insert(newEl).select().single();
    if (data) {
      setElements((prev) => [...prev, data]);
      setSelectedId(data.id);
    }
  }

  async function handleFileUpload(file: File, type: "image" | "audio") {
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${board.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file);

    if (uploadError) {
      setUploading(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("media").getPublicUrl(path);

    const newEl: Partial<CanvasElement> = {
      board_id: board.id,
      type,
      url: publicUrl,
      content: file.name,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      width: type === "image" ? 320 : 280,
      height: type === "image" ? 240 : 80,
      rotation: 0,
      style: { opacity: 1 },
      z_index: elements.length,
    };

    const { data } = await supabase.from("elements").insert(newEl).select().single();
    if (data) {
      setElements((prev) => [...prev, data]);
      setSelectedId(data.id);
    }
    setUploading(false);
  }

  async function updateTitle(newTitle: string) {
    setBoardTitle(newTitle);
    await supabase.from("boards").update({ title: newTitle }).eq("id", board.id);
  }

  async function updateCover(color: string) {
    await supabase.from("boards").update({ cover_color: color }).eq("id", board.id);
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-black/5 px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="rounded-full hover:bg-black/5"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </Button>
        <Input
          value={boardTitle}
          onChange={(e) => updateTitle(e.target.value)}
          className="h-9 w-auto min-w-[12rem] border-none bg-transparent text-lg font-medium text-black focus-visible:ring-0"
        />
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addText}
            className="gap-2 rounded-full border-black/10 text-black hover:bg-black/5"
          >
            <Type className="h-4 w-4" />
            Text
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 rounded-full border-black/10 text-black hover:bg-black/5"
          >
            <ImageIcon className="h-4 w-4" />
            Image
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => audioInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 rounded-full border-black/10 text-black hover:bg-black/5"
          >
            <Music className="h-4 w-4" />
            Audio
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-black/10 text-black hover:bg-black/5"
              >
                <Palette className="h-4 w-4" />
                Background
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-black/10">
              {[
                "#ffffff",
                "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
                "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
                "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
                "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
                "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
                "#0f0f0f",
              ].map((c) => (
                <DropdownMenuItem key={c} onClick={() => updateCover(c)} className="gap-2">
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-black/10"
                    style={{ background: c }}
                  />
                  <span className="text-black">{c === "#ffffff" ? "White" : c === "#0f0f0f" ? "Dark" : "Gradient"}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteElement(selectedId)}
              className="gap-2 rounded-full border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </header>

      {/* Canvas */}
      <div className="relative flex-1 overflow-hidden">
        <CanvasStage
          board={board}
          elements={elements}
          setElements={setElements}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          updateElement={updateElement}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, "image");
          e.target.value = "";
        }}
      />
      <input
        ref={audioInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file, "audio");
          e.target.value = "";
        }}
      />
    </div>
  );
}
