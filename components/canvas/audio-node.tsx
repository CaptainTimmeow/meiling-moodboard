"use client";

import { useRef, useState, useEffect } from "react";
import type { CanvasElement } from "@/types";
import { Play, Pause, Music } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function AudioNode({
  element,
  isSelected,
  onSelect,
  onUpdate,
  stageScale,
}: {
  element: CanvasElement;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<CanvasElement>) => void;
  stageScale: number;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { t } = useI18n();
  const dragStart = useRef<{ x: number; y: number; ex: number; ey: number } | null>(null);
  const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (dragging && dragStart.current) {
        const dx = (e.clientX - dragStart.current.x) / stageScale;
        const dy = (e.clientY - dragStart.current.y) / stageScale;
        onUpdate({ x: dragStart.current.ex + dx, y: dragStart.current.ey + dy });
      }
      if (resizing && resizeStart.current) {
        const dw = (e.clientX - resizeStart.current.x) / stageScale;
        const dh = (e.clientY - resizeStart.current.y) / stageScale;
        onUpdate({
          width: Math.max(160, resizeStart.current.w + dw),
          height: Math.max(64, resizeStart.current.h + dh),
        });
      }
    }
    function onMouseUp() {
      setDragging(false);
      setResizing(false);
      dragStart.current = null;
      resizeStart.current = null;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [dragging, resizing, stageScale, onUpdate]);

  function startDrag(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.stopPropagation();
    setDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ex: element.x, ey: element.y };
  }

  function startResize(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setResizing(true);
    resizeStart.current = { x: e.clientX, y: e.clientY, w: element.width, h: element.height };
  }

  function togglePlay() {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  }

  return (
    <div
      className={`canvas-element absolute ${isSelected ? "selected" : ""}`}
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation || 0}deg)`,
        zIndex: element.z_index,
      }}
      onMouseDown={startDrag}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      <div className="flex h-full w-full items-center gap-4 rounded-2xl border border-[rgba(61,58,54,0.08)] bg-white px-4 shadow-sm">
        <button
          onClick={togglePlay}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c45d3e] text-white transition-transform hover:scale-105 hover:bg-[#a84d32]"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-[#3d3a36]">
            {element.content || t("untitledAudio")}
          </p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-[#f3ebe4]">
            <div className="h-1.5 w-1/3 rounded-full bg-[#c45d3e]" />
          </div>
        </div>
        <Music className="h-5 w-5 shrink-0 text-[#8a7f74]" />
      </div>

      <audio
        ref={audioRef}
        src={element.url || ""}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />

      {isSelected && (
        <div
          className="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize"
          onMouseDown={startResize}
          style={{
            background: "#c45d3e",
            transform: "translate(40%, 40%)",
            borderRadius: "50%",
            border: "2px solid white",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          }}
        />
      )}
    </div>
  );
}
