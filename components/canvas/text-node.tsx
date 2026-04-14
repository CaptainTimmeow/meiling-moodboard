"use client";

import { useRef, useState, useEffect } from "react";
import type { CanvasElement } from "@/types";

export function TextNode({
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
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const dragStart = useRef<{ x: number; y: number; ex: number; ey: number } | null>(null);
  const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const style = element.style || {};

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
          width: Math.max(100, resizeStart.current.w + dw),
          height: Math.max(40, resizeStart.current.h + dh),
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
    if (isEditing) return;
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
      ref={nodeRef}
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
      <div
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={() => setIsEditing(true)}
        onBlur={() => setIsEditing(false)}
        onInput={(e) => onUpdate({ content: e.currentTarget.innerText })}
        className="h-full w-full overflow-hidden rounded-2xl px-4 py-3 outline-none"
        style={{
          fontSize: style.fontSize || 24,
          color: style.color || "#3d3a36",
          fontWeight: style.fontWeight || 400,
          opacity: style.opacity ?? 1,
          background: style.background || "transparent",
          lineHeight: 1.4,
          cursor: isEditing ? "text" : dragging ? "grabbing" : "grab",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {element.content || ""}
      </div>

      {isSelected && !isEditing && (
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
