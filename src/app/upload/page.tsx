import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import UploadWizard from "./upload-wizard";
import { LogIn } from "lucide-react";

export const metadata = { title: "Share" };

interface Topic {
  id: string;
  name: string;
  slug: string;
}

export default async function UploadPage() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <LogIn className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log in to share</h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Create your free account first — then share what you learned in any
          format.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/login"
            className="rounded-full border border-slate-300 px-6 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Sign up free
          </Link>
        </div>
      </div>
    );
  }

  let topics: Topic[] = [];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("topics")
      .select("id, name, slug")
      .order("name", { ascending: true });
    topics = data ?? [];
  } catch {
    topics = [];
  }

  return (
    <UploadWizard
      author={profile.username}
      topics={topics}
    />
  );
}
