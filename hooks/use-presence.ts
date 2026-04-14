"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { PresenceCursor, Profile } from "@/types";

export function usePresence(boardId: string, userId: string, profile: Profile) {
  const supabase = createClient();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const [cursors, setCursors] = useState<PresenceCursor[]>([]);
  const throttleRef = useRef<number>(0);

  useEffect(() => {
    const channel = supabase.channel(`presence:${boardId}`, {
      config: {
        presence: {
          key: userId,
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
            if (p.user_id !== userId) all.push(p);
          });
        });
        setCursors(all);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({
            user_id: userId,
            display_name: profile.display_name || "Anonymous",
            avatar_color: profile.avatar_color || "#000000",
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
  }, [boardId, userId, profile, supabase]);

  const broadcastCursor = useCallback(
    (x: number, y: number, selectedElementId: string | null) => {
      const now = Date.now();
      if (now - throttleRef.current < 50) return;
      throttleRef.current = now;
      channelRef.current?.send({
        type: "broadcast",
        event: "cursor",
        payload: {
          user_id: userId,
          display_name: profile.display_name || "Anonymous",
          avatar_color: profile.avatar_color || "#000000",
          x,
          y,
          board_id: boardId,
          selected_element_id: selectedElementId,
        },
      });
      channelRef.current?.track({
        user_id: userId,
        display_name: profile.display_name || "Anonymous",
        avatar_color: profile.avatar_color || "#000000",
        x,
        y,
        board_id: boardId,
        selected_element_id: selectedElementId,
      });
    },
    [boardId, userId, profile]
  );

  // Also listen to broadcast cursors as a fallback
  useEffect(() => {
    const channel = supabase.channel(`cursor-broadcast:${boardId}`);
    channel
      .on(
        "broadcast",
        { event: "cursor" },
        (payload: { payload: PresenceCursor }) => {
          if (payload.payload.user_id === userId) return;
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
  }, [boardId, userId, supabase]);

  return { cursors, broadcastCursor };
}
