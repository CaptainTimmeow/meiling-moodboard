"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { Board, CanvasElement } from "@/types";
import { TextNode } from "./text-node";
import { ImageNode } from "./image-node";
import { AudioNode } from "./audio-node";
import { RemoteCursors } from "./remote-cursors";
import { useRealtime } from "@/hooks/use-realtime";
import { usePresence } from "@/hooks/use-presence";

interface StageState {
  x: number;
  y: number;
  scale: number;
}

export function CanvasStage({
  board,
  elements,
  setElements,
  selectedId,
  setSelectedId,
  updateElement,
}: {
  board: Board;
  elements: CanvasElement[];
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => Promise<void>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState<StageState>({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{ x: number; y: number; sx: number; sy: number } | null>(null);

  // Realtime hooks
  useRealtime(board.id, setElements);
  const { cursors, broadcastCursor } = usePresence(board.id);

  // Pan handlers
  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
        setStage((prev) => ({
          ...prev,
          scale: Math.min(Math.max(prev.scale * scaleFactor, 0.2), 3),
        }));
      } else {
        setStage((prev) => ({
          ...prev,
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY,
        }));
      }
    },
    []
  );

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        setIsPanning(true);
        panStart.current = {
          x: e.clientX,
          y: e.clientY,
          sx: stage.x,
          sy: stage.y,
        };
        e.preventDefault();
      } else if (e.target === containerRef.current || (e.target as HTMLElement).dataset?.stage) {
        setSelectedId(null);
      }
    },
    [stage.x, stage.y, setSelectedId]
  );

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning && panStart.current) {
        setStage((prev) => ({
          ...prev,
          x: panStart.current!.sx + (e.clientX - panStart.current!.x),
          y: panStart.current!.sy + (e.clientY - panStart.current!.y),
        }));
      }

      // Broadcast cursor position in stage coordinates
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - stage.x) / stage.scale;
        const y = (e.clientY - rect.top - stage.y) / stage.scale;
        broadcastCursor(x, y, selectedId);
      }
    },
    [isPanning, stage.x, stage.y, stage.scale, broadcastCursor, selectedId]
  );

  const onMouseUp = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  useEffect(() => {
    const handleGlobalMouseUp = () => onMouseUp();
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => window.removeEventListener("mouseup", handleGlobalMouseUp);
  }, [onMouseUp]);

  return (
    <div
      ref={containerRef}
      data-stage
      className="relative h-full w-full cursor-grab overflow-hidden active:cursor-grabbing"
      style={{ background: board.cover_color || "#ffffff" }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
    >
      <div
        className="absolute left-0 top-0 origin-top-left will-change-transform"
        style={{
          transform: `translate(${stage.x}px, ${stage.y}px) scale(${stage.scale})`,
        }}
      >
        <div className="relative h-[2000px] w-[3000px]">
          {elements.map((el) => {
            const common = {
              element: el,
              isSelected: selectedId === el.id,
              onSelect: () => setSelectedId(el.id),
              onUpdate: (updates: Partial<CanvasElement>) => updateElement(el.id, updates),
              stageScale: stage.scale,
            };
            if (el.type === "text") return <TextNode key={el.id} {...common} />;
            if (el.type === "image") return <ImageNode key={el.id} {...common} />;
            if (el.type === "audio") return <AudioNode key={el.id} {...common} />;
            return null;
          })}
          <RemoteCursors cursors={cursors} />
        </div>
      </div>

      {/* Zoom controls — clean white pill strip */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-[50px] border border-black/10 bg-white/95 px-2 py-1.5 text-sm text-black shadow-sm backdrop-blur-sm">
        <button
          onClick={() => setStage((s) => ({ ...s, scale: Math.max(s.scale * 0.9, 0.2) }))}
          className="flex h-7 w-7 items-center justify-center rounded-[50%] text-black hover:bg-black/[0.08]"
          aria-label="Zoom out"
        >
          −
        </button>
        <span className="min-w-[4ch] select-none text-center text-sm font-normal">
          {Math.round(stage.scale * 100)}%
        </span>
        <button
          onClick={() => setStage((s) => ({ ...s, scale: Math.min(s.scale * 1.1, 3) }))}
          className="flex h-7 w-7 items-center justify-center rounded-[50%] text-black hover:bg-black/[0.08]"
          aria-label="Zoom in"
        >
          +
        </button>
      </div>
    </div>
  );
}
