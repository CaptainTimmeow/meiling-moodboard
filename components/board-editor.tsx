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
        color: "#3d3a36",
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
    <div className="relative flex h-screen flex-col overflow-hidden bg-[#faf8f5]">
      {/* Grain texture */}
      <div className="absolute inset-0 paper-grain pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center gap-3 border-b border-[rgba(61,58,54,0.06)] bg-[#faf8f5]/90 px-5 py-3 backdrop-blur-md">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          className="rounded-full hover:bg-[#f3ebe4]"
        >
          <ArrowLeft className="h-5 w-5 text-[#5c534b]" />
        </Button>
        <Input
          value={boardTitle}
          onChange={(e) => updateTitle(e.target.value)}
          className="h-10 w-auto min-w-[10rem] border-none bg-transparent text-xl font-medium text-[#3d3a36] focus-visible:ring-0"
        />
        <div className="flex-1" />
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Button
            variant="outline"
            size="sm"
            onClick={addText}
            className="gap-2 rounded-full border-[rgba(61,58,54,0.08)] bg-white text-[#5c534b] hover:bg-[#f3ebe4] hover:text-[#3d3a36]"
          >
            <Type className="h-4 w-4" />
            <span className="hidden sm:inline">{t("text")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 rounded-full border-[rgba(61,58,54,0.08)] bg-white text-[#5c534b] hover:bg-[#f3ebe4] hover:text-[#3d3a36]"
          >
            <ImageIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t("image")}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => audioInputRef.current?.click()}
            disabled={uploading}
            className="gap-2 rounded-full border-[rgba(61,58,54,0.08)] bg-white text-[#5c534b] hover:bg-[#f3ebe4] hover:text-[#3d3a36]"
          >
            <Music className="h-4 w-4" />
            <span className="hidden sm:inline">{t("audio")}</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full border-[rgba(61,58,54,0.08)] bg-white text-[#5c534b] hover:bg-[#f3ebe4] hover:text-[#3d3a36]"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">{t("background")}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-2xl border-[rgba(61,58,54,0.08)] bg-white"
            >
              {[
                { value: "#ffffff", label: t("white") },
                { value: "linear-gradient(135deg, #f9e4c9 0%, #f5d6c6 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #d4e8d4 0%, #e8f3e8 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #e8d5e8 0%, #f3e8f3 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #c9e4e8 0%, #d4e8e8 100%)", label: t("gradient") },
                { value: "#3d3a36", label: t("dark") },
              ].map((c, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={() => updateCover(c.value)}
                  className="gap-3 rounded-xl text-[#3d3a36] focus:bg-[#f3ebe4] focus:text-[#3d3a36]"
                >
                  <span
                    className="inline-block h-5 w-5 rounded-full border border-[rgba(61,58,54,0.12)]"
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
              className="gap-2 rounded-full border-[#c45d3e]/20 bg-white text-[#c45d3e] hover:bg-[#c45d3e]/10"
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
