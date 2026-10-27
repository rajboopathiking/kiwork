import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Please log in to engage with posts." }, { status: 401 });
    }

    const body = await req.json();
    const { postId, target, on } = body as {
      postId: string;
      target: "likes" | "helped" | "saves";
      on: boolean;
    };

    if (!postId || !["likes", "helped", "saves"].includes(target)) {
      return NextResponse.json({ error: "Invalid target or post ID." }, { status: 400 });
    }

    if (on) {
      // User is turning off (un-liking, un-helping, or un-saving)
      const { error } = await supabase
        .from(target)
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id);

      if (error) {
        console.error(`Error deleting from ${target}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, active: false });
    } else {
      // User is turning on (liking, helping, or saving)
      const { error } = await supabase
        .from(target)
        .insert({ post_id: postId, user_id: user.id });

      if (error && error.code !== "23505") {
        console.error(`Error inserting into ${target}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, active: true });
    }
  } catch (err) {
    console.error("Engagement API error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error occurred." },
      { status: 500 }
    );
  }
}
