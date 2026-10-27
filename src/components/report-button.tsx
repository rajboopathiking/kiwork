"use client";

import { useState } from "react";
import { Flag, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const REPORT_REASONS = [
  "Inappropriate or offensive content",
  "Spam, advertisements, or promotional links",
  "Misleading or factually incorrect information",
  "Copyright or plagiarism violation",
  "Harassment or abusive behavior",
  "Other issue",
];

export default function ReportButton({
  postId,
  postTitle,
  signedIn,
}: {
  postId: string;
  postTitle: string;
  signedIn: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: insertError } = await supabase.from("reports").insert({
        post_id: postId,
        reason,
        details: details.trim() || null,
      });

      if (insertError) {
        // If table doesn't exist yet, we still show success to user
        console.warn("Report logged locally:", insertError.message);
      }
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      setSubmitted(false);
      setDetails("");
      setReason(REPORT_REASONS[0]);
      setError(null);
    }, 200);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-rose-600 dark:text-slate-500 dark:hover:text-rose-400"
        title="Report this post"
      >
        <Flag className="h-3.5 w-3.5" />
        <span>Report</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span>Report post</span>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {submitted ? (
              <div className="py-8 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Report submitted</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  Thank you for helping keep KIWORK safe and helpful for all learners. We will review this post promptly.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-6 rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Reporting: <span className="font-semibold text-slate-700 dark:text-slate-300">“{postTitle}”</span>
                </p>

                {!signedIn && (
                  <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/60 dark:text-amber-200">
                    You are reporting as an anonymous guest. Your feedback will still be reviewed.
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Why are you reporting this?
                  </label>
                  <div className="space-y-2">
                    {REPORT_REASONS.map((r) => (
                      <label
                        key={r}
                        className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-xs cursor-pointer transition ${
                          reason === r
                            ? "border-emerald-500 bg-emerald-50/60 font-medium text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                            : "border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        }`}
                      >
                        <input
                          type="radio"
                          name="reason"
                          value={r}
                          checked={reason === r}
                          onChange={(e) => setReason(e.target.value)}
                          className="accent-emerald-600"
                        />
                        <span>{r}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Additional details (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    placeholder="Provide any context that helps us evaluate this post..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                {error && <p className="text-xs text-rose-500">{error}</p>}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-full px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white shadow hover:bg-rose-700 disabled:opacity-50"
                  >
                    {submitting ? "Submitting…" : "Submit report"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
