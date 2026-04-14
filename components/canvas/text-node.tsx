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

  // Sync content from props only when NOT actively editing.
  // We use a ref for isEditing so the effect only re-runs when element.content
  // actually changes (e.g. from realtime or initial mount), not on every
  // isEditing toggle. This prevents React from clobbering the DOM with stale
  // props right after the user finishes typing.
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  useEffect(() => {
    if (!isEditingRef.current && nodeRef.current) {
      nodeRef.current.innerText = element.content || "";
    }
  }, [element.content]);

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

  function handleBlur() {
    setIsEditing(false);
    if (nodeRef.current) {
      onUpdate({ content: nodeRef.current.innerText });
    }
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setIsEditing(true);
    // Select all text for easy editing
    requestAnimationFrame(() => {
      const range = document.createRange();
      const sel = window.getSelection();
      if (nodeRef.current && sel) {
        range.selectNodeContents(nodeRef.current);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    });
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
      <div
        ref={nodeRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onDoubleClick={handleDoubleClick}
        onBlur={handleBlur}
        className="h-full w-full overflow-hidden px-3 py-2 outline-none"
        style={{
          fontSize: style.fontSize || 24,
          color: style.color || "#000000",
          fontWeight: style.fontWeight || 400,
          opacity: style.opacity ?? 1,
          background: style.background || "transparent",
          lineHeight: 1.3,
          cursor: isEditing ? "text" : dragging ? "grabbing" : "grab",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      />

      {isSelected && !isEditing && (
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
