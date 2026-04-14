"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PresenceCursor } from "@/types";

const COLORS = ["#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#2196f3", "#009688", "#ff9800", "#ff5722"];

function getOrCreateIdentity() {
  if (typeof window === "undefined") {
    return { userId: "unknown", displayName: "Guest", color: COLORS[0] };
  }
  let id = localStorage.getItem("moodboard_user_id");
  let name = localStorage.getItem("moodboard_user_name");
  let color = localStorage.getItem("moodboard_user_color");
  if (!id) {
    id = Math.random().toString(36).slice(2);
    localStorage.setItem("moodboard_user_id", id);
  }
  if (!name) {
    name = "Guest " + Math.floor(Math.random() * 1000);
    localStorage.setItem("moodboard_user_name", name);
  }
  if (!color) {
    color = COLORS[Math.floor(Math.random() * COLORS.length)];
    localStorage.setItem("moodboard_user_color", color);
  }
  return { userId: id, displayName: name, color };
}

export function usePresence(boardId: string) {
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [cursors, setCursors] = useState<PresenceCursor[]>([]);
  const throttleRef = useRef<number>(0);
  const identity = useRef(getOrCreateIdentity());

  useEffect(() => {
    const channel = supabase.channel(`presence:${boardId}`, {
      config: {
        presence: {
          key: identity.current.userId,
        },
      },
    });
    channelRef.current = channel;

    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<PresenceCursor>();
        const all: PresenceCursor[] = [];
        Object.values(state).forEach((presences) => {
          presences.forEach((p) => {
            if (p.user_id !== identity.current.userId) all.push(p);
          });
        });
        setCursors(all);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: identity.current.userId,
            display_name: identity.current.displayName,
            avatar_color: identity.current.color,
            x: 0,
            y: 0,
            board_id: boardId,
            selected_element_id: null,
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, supabase]);

  const broadcastCursor = useCallback(
    (x: number, y: number, selectedElementId: string | null) => {
      const now = Date.now();
      if (now - throttleRef.current < 50) return;
      throttleRef.current = now;
      channelRef.current?.send({
        type: "broadcast",
        event: "cursor",
        payload: {
          user_id: identity.current.userId,
          display_name: identity.current.displayName,
          avatar_color: identity.current.color,
          x,
          y,
          board_id: boardId,
          selected_element_id: selectedElementId,
        },
      });
      channelRef.current?.track({
        user_id: identity.current.userId,
        display_name: identity.current.displayName,
        avatar_color: identity.current.color,
        x,
        y,
        board_id: boardId,
        selected_element_id: selectedElementId,
      });
    },
    [boardId]
  );

  // Also listen to broadcast cursors as a fallback
  useEffect(() => {
    const channel = supabase.channel(`cursor-broadcast:${boardId}`);
    channel
      .on(
        "broadcast",
        { event: "cursor" },
        (payload: { payload: PresenceCursor }) => {
          if (payload.payload.user_id === identity.current.userId) return;
          setCursors((prev) => {
            const next = prev.filter((c) => c.user_id !== payload.payload.user_id);
            return [...next, payload.payload];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, supabase]);

  return { cursors, broadcastCursor };
}
