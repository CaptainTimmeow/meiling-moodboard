"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Board, CanvasElement } from "@/types";
import { CanvasStage } from "@/components/canvas/stage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LanguageSwitcher } from "@/components/language-switcher";
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
import { useI18n } from "@/lib/i18n";

export function BoardEditor({
  board,
  initialElements,
}: {
  board: Board;
  initialElements: CanvasElement[];
}) {
  const router = useRouter();
  const { t } = useI18n();
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
      content: t("doubleClickEdit"),
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
      {/* Header — clean white strip with black text, pill/circular buttons only */}
      <header className="flex items-center gap-3 border-b border-black/5 bg-white px-4 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          aria-label={t("back")}
          className="h-10 w-10 rounded-[50%] text-black hover:bg-black/[0.08]"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>

        <Input
          value={boardTitle}
          onChange={(e) => updateTitle(e.target.value)}
          className="h-9 w-auto min-w-[10rem] border-none bg-transparent text-[20px] font-normal text-black focus-visible:ring-0"
        />

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <LanguageSwitcher />

          <Button
            variant="outline"
            size="sm"
            onClick={addText}
            disabled={uploading}
            className="gap-2 rounded-[50px] border-black/10 bg-white px-4 text-black hover:bg-black/[0.08]"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">{t("text")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 rounded-[50px] border-black/10 bg-white px-4 text-black hover:bg-black/[0.08]"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t("image")}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => audioInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 rounded-[50px] border-black/10 bg-white px-4 text-black hover:bg-black/[0.08]"
          >
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">{t("audio")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-[50px] border-black/10 bg-white px-4 text-black hover:bg-black/[0.08]"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">{t("background")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-black/10 bg-white">
              {[
                { value: "#ffffff", label: t("white") },
                { value: "linear-gradient(135deg, #a8e063 0%, #f4d03f 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #f4d03f 0%, #9b59b6 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #9b59b6 0%, #e91e63 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #e91e63 0%, #ff9800 100%)", label: t("gradient") },
                { value: "#000000", label: t("dark") },
              ].map((c, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={() => updateCover(c.value)}
                  className="gap-2 rounded-lg text-black focus:bg-black/5 focus:text-black"
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-black/10"
                    style={{ background: c.value }}
                  />
                  <span>{c.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedId && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteElement(selectedId)}
              className="gap-2 rounded-[50px] border-black/10 bg-white px-4 text-black hover:bg-black/[0.08]"
            >
              <Trash2 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("delete")}</span>
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
