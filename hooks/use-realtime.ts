"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { CanvasElement } from "@/types";

export function useRealtime(
  boardId: string,
  setElements: React.Dispatch<React.SetStateAction<CanvasElement[]>>
) {
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel(`elements:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "elements",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setElements((prev) => {
              if (prev.find((e) => e.id === payload.new.id)) return prev;
              return [...prev, payload.new as CanvasElement];
            });
          } else if (payload.eventType === "UPDATE") {
            setElements((prev) =>
              prev.map((el) =>
                el.id === payload.new.id ? (payload.new as CanvasElement) : el
              )
            );
          } else if (payload.eventType === "DELETE") {
            setElements((prev) => prev.filter((el) => el.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [boardId, setElements, supabase]);
}
