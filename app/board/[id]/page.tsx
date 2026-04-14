import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BoardEditor } from "@/components/board-editor";
import type { Profile } from "@/types";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: board }, { data: elements }, { data: profileRaw }] =
    await Promise.all([
      supabase.from("boards").select("*").eq("id", id).single(),
      supabase.from("elements").select("*").eq("board_id", id).order("z_index"),
      supabase
        .from("profiles")
        .select("display_name, avatar_color")
        .eq("id", user.id)
        .single(),
    ]);

  const profile: Profile = profileRaw
    ? { id: user.id, display_name: profileRaw.display_name, avatar_color: profileRaw.avatar_color }
    : { id: user.id, display_name: user.email || "You", avatar_color: "#000000" };

  if (!board) {
    notFound();
  }

  return (
    <BoardEditor
      board={board}
      initialElements={elements || []}
      userId={user.id}
      profile={profile}
    />
  );
}
