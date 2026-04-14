import { redirect } from "next/navigation";
import { getSession } from "@/lib/simple-auth";
import { createClient } from "@/lib/supabase/server";
import { BoardGallery } from "@/components/board-gallery";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: boards } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  return <BoardGallery boards={boards || []} />;
}
