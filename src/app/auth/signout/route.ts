import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const origin = new URL(request.url).origin;
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // env not configured yet
  }
  const response = NextResponse.redirect(`${origin}/`, { status: 302 });
  return response;
}
