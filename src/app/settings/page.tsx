import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import SettingsForm from "./settings-form";
import { LogIn } from "lucide-react";

export const metadata = { title: "Edit profile" };

export default async function SettingsPage() {
  const { user, profile } = await getCurrentUser();

  if (!user || !profile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white">
          <LogIn className="h-5 w-5" />
        </span>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Log in to edit your profile</h1>
        <Link
          href="/login"
          className="mt-6 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Log in
        </Link>
      </div>
    );
  }

  return <SettingsForm profile={profile} />;
}
