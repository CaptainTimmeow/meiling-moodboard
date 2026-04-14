"use client";

import type { PresenceCursor } from "@/types";

export function RemoteCursors({ cursors }: { cursors: PresenceCursor[] }) {
  return (
    <>
      {cursors.map((cursor) => (
        <div
          key={cursor.user_id}
          className="pointer-events-none absolute z-[9999] transition-transform duration-100"
          style={{
            left: cursor.x,
            top: cursor.y,
            transform: "translate(-2px, -2px)",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3 3L10.07 19.97L12.58 12.58L19.97 10.07L3 3Z"
              fill={cursor.avatar_color || "#000000"}
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
          <span
            className="absolute left-4 top-4 whitespace-nowrap rounded-[50px] px-2 py-0.5 text-[11px] font-normal text-white shadow-sm"
            style={{ backgroundColor: cursor.avatar_color || "#000000" }}
          >
            {cursor.display_name}
          </span>
        </div>
      ))}
    </>
  );
}
