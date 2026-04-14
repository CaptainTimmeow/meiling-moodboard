"use client";

import { useRef, useState, useEffect } from "react";
import type { CanvasElement } from "@/types";

export function ImageNode({
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
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
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
          width: Math.max(80, resizeStart.current.w + dw),
          height: Math.max(80, resizeStart.current.h + dh),
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
      <img
        src={element.url || ""}
        alt={element.content || ""}
        draggable={false}
        className="h-full w-full rounded-lg object-cover"
        style={{ opacity: element.style?.opacity ?? 1 }}
      />
      {isSelected && (
        <div
          className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
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
