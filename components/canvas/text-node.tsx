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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  const dragStart = useRef<{ x: number; y: number; ex: number; ey: number } | null>(null);
  const resizeStart = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const style = element.style || {};

  // Sync content from props only when NOT actively editing.
  const isEditingRef = useRef(isEditing);
  isEditingRef.current = isEditing;

  useEffect(() => {
    if (!isEditingRef.current && nodeRef.current) {
      nodeRef.current.innerText = element.content || "";
    }
  }, [element.content]);

  // Drag + Resize — update DOM directly for 60fps performance, save to DB only on mouseup
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
        wrapperRef.current.style.width = `${Math.max(100, resizeStart.current.w + dw)}px`;
        wrapperRef.current.style.height = `${Math.max(40, resizeStart.current.h + dh)}px`;
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
    if (isEditing) return;
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

  function handleBlur() {
    setIsEditing(false);
    if (nodeRef.current) {
      onUpdate({ content: nodeRef.current.innerText });
    }
  }

  function handleDoubleClick(e: React.MouseEvent) {
    e.stopPropagation();
    setIsEditing(true);
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
          cursor: isEditing ? "text" : isDragging ? "grabbing" : "grab",
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
