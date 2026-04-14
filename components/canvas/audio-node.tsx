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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [playing, setPlaying] = useState(false);
  const { t } = useI18n();
  const dragStart = useRef<{ x: number; y: number; ex: number; ey: number } | null>(null);
  const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (isDragging && dragStart.current && wrapperRef.current) {
        const dx = (e.clientX - dragStart.current.x) / stageScale;
        const dy = (e.clientY - dragStart.current.y) / stageScale;
        wrapperRef.current.style.left = `${dragStart.current.ex + dx}px`;
        wrapperRef.current.style.top = `${dragStart.current.ey + dy}px`;
      }
      if (isResizing && resizeStart.current && wrapperRef.current) {
        const dw = (e.clientX - resizeStart.current.x) / stageScale;
        const dh = (e.clientY - resizeStart.current.y) / stageScale;
        wrapperRef.current.style.width = `${Math.max(160, resizeStart.current.w + dw)}px`;
        wrapperRef.current.style.height = `${Math.max(64, resizeStart.current.h + dh)}px`;
      }
    }
    function onMouseUp() {
      if (isDragging && dragStart.current && wrapperRef.current) {
        const finalX = parseFloat(wrapperRef.current.style.left);
        const finalY = parseFloat(wrapperRef.current.style.top);
        onUpdate({ x: finalX, y: finalY });
      }
      if (isResizing && resizeStart.current && wrapperRef.current) {
        const finalW = parseFloat(wrapperRef.current.style.width);
        const finalH = parseFloat(wrapperRef.current.style.height);
        onUpdate({ width: finalW, height: finalH });
      }
      setIsDragging(false);
      setIsResizing(false);
      dragStart.current = null;
      resizeStart.current = null;
    }
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isDragging, isResizing, stageScale, onUpdate]);

  function startDrag(e: React.MouseEvent) {
    if ((e.target as HTMLElement).closest("button")) return;
    e.stopPropagation();
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY, ex: element.x, ey: element.y };
  }

  function startResize(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
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
      ref={wrapperRef}
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
      <div className="flex h-full w-full items-center gap-3 rounded-xl border border-black/10 bg-white px-3 shadow-sm">
        <button
          onClick={togglePlay}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white hover:bg-black/90"
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-black">
            {element.content || t("untitledAudio")}
          </p>
          <div className="mt-1 h-1 w-full rounded-full bg-black/10">
            <div className="h-1 w-1/3 rounded-full bg-black" />
          </div>
        </div>
        <Music className="h-5 w-5 shrink-0 text-black/40" />
      </div>

      <audio
        ref={audioRef}
        src={element.url || ""}
        onEnded={() => setPlaying(false)}
        className="hidden"
      />

      {isSelected && (
        <div
          className="absolute bottom-0 right-0 h-3 w-3 cursor-se-resize"
          onMouseDown={startResize}
          style={{
            background: "#000",
            transform: "translate(50%, 50%)",
            borderRadius: "50%",
          }}
        />
      )}
    </div>
  );
}
