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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const toolButton = (
    icon: React.ReactNode,
    label: string,
    onClick: () => void,
    disabled?: boolean
  ) => (
    <Tooltip>
      <TooltipTrigger>
        <Button
          variant="outline"
          size="icon"
          onClick={onClick}
          disabled={disabled}
          className="h-9 w-9 rounded-[50%] border-black/10 bg-white text-black hover:bg-black/[0.08]"
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="rounded-[50px] border-black/10 bg-black px-3 py-1 text-xs text-white"
      >
        {label}
      </TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-white">
      {/* Header */}
      <header className="flex items-center gap-3 border-b border-black/5 bg-white px-5 py-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/")}
          aria-label={t("back")}
          className="h-9 w-9 rounded-[50%] text-black hover:bg-black/[0.08]"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Input
          value={boardTitle}
          onChange={(e) => updateTitle(e.target.value)}
          className="h-9 w-auto min-w-[8rem] border-none bg-transparent text-[18px] font-normal text-black focus-visible:ring-0"
        />

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <LanguageSwitcher />

          {toolButton(<Type className="h-4 w-4" />, t("text"), addText, uploading)}
          {toolButton(
            <ImageIcon className="h-4 w-4" />,
            t("image"),
            () => fileInputRef.current?.click(),
            uploading
          )}
          {toolButton(
            <Music className="h-4 w-4" />,
            t("audio"),
            () => audioInputRef.current?.click(),
            uploading
          )}

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 rounded-[50%] border-black/10 bg-white text-black hover:bg-black/[0.08]"
              >
                <Palette className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="rounded-[8px] border-black/10 bg-white"
            >
              {[
                { value: "#ffffff", label: t("white") },
                { value: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)", label: t("gradient") },
                { value: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)", label: t("gradient") },
                { value: "#0f0f0f", label: t("dark") },
              ].map((c, idx) => (
                <DropdownMenuItem
                  key={idx}
                  onClick={() => updateCover(c.value)}
                  className="gap-3 rounded-[6px] text-black focus:bg-black/5 focus:text-black"
                >
                  <span
                    className="inline-block h-4 w-4 rounded-full border border-black/10"
                    style={{ background: c.value }}
                  />
                  <span className="text-sm">{c.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {selectedId &&
            toolButton(
              <Trash2 className="h-4 w-4" />,
              t("delete"),
              () => deleteElement(selectedId)
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
