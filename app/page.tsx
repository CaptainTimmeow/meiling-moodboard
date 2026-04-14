import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoardGallery } from "@/components/board-gallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <BoardGallery
      boards={boards || []}
      userId={user.id}
      displayName={profile?.display_name || user.email || "Friend"}
    />
  );
}
