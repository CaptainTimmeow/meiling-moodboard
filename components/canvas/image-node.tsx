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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
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
        wrapperRef.current.style.width = `${Math.max(80, resizeStart.current.w + dw)}px`;
        wrapperRef.current.style.height = `${Math.max(80, resizeStart.current.h + dh)}px`;
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
      <img
        src={element.url || ""}
        alt={element.content || ""}
        draggable={false}
        className="h-full w-full rounded-lg object-cover"
        style={{ opacity: element.style?.opacity ?? 1 }}
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
