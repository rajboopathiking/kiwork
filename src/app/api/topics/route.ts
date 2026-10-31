import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: topics, error } = await supabase
      .from("topics")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ topics: topics ?? [] });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load categories." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Please log in to add custom categories." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const rawName = typeof body.name === "string" ? body.name.trim() : "";

    if (!rawName || rawName.length < 2) {
      return NextResponse.json(
        { error: "Category name must be at least 2 characters." },
        { status: 400 }
      );
    }

    const name = rawName.slice(0, 40);
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!slug) {
      slug = `category-${Math.random().toString(36).substring(2, 8)}`;
    }

    // 1. Check if category already exists by slug or exact name
    const { data: existing } = await supabase
      .from("topics")
      .select("id, name, slug")
      .or(`slug.eq.${slug},name.ilike.${name}`)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json({ success: true, topic: existing, isNew: false });
    }

    // 2. Insert new custom category
    const { data: newTopic, error: insertError } = await supabase
      .from("topics")
      .insert({ name, slug })
      .select("id, name, slug")
      .single();

    if (insertError) {
      // In case of unique constraint race, fallback to querying existing
      const { data: fallback } = await supabase
        .from("topics")
        .select("id, name, slug")
        .eq("slug", slug)
        .maybeSingle();

      if (fallback) {
        return NextResponse.json({ success: true, topic: fallback, isNew: false });
      }

      console.error("Topic insertion error:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, topic: newTopic, isNew: true });
  } catch (err) {
    console.error("Category creation error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to create category." },
      { status: 500 }
    );
  }
}
