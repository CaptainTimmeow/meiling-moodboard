import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/simple-auth";
import { createClient } from "@/lib/supabase/server";
import { BoardEditor } from "@/components/board-editor";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const supabase = await createClient();

  const [{ data: board }, { data: elements }] = await Promise.all([
    supabase.from("boards").select("*").eq("id", id).single(),
    supabase.from("elements").select("*").eq("board_id", id).order("z_index"),
  ]);

  if (!board) {
    notFound();
  }

  return (
    <BoardEditor
      board={board}
      initialElements={elements || []}
    />
  );
}
