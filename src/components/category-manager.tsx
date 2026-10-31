"use client";

import { useMemo, useState } from "react";
import { Check, Loader2, Plus, Search, Tag, X } from "lucide-react";

export interface TopicItem {
  id: string;
  name: string;
  slug: string;
}

interface CategoryManagerProps {
  allTopics: TopicItem[];
  selectedTopicIds: string[];
  onChange: (ids: string[]) => void;
  maxSelect?: number;
  label?: string;
  description?: string;
}

export default function CategoryManager({
  allTopics,
  selectedTopicIds,
  onChange,
  maxSelect = 5,
  label = "Categories & Topics",
  description = "Organize your post with categories so learners and recruiters can discover it easily. Choose existing categories or create your own custom category.",
}: CategoryManagerProps) {
  const [topicsList, setTopicsList] = useState<TopicItem[]>(allTopics);
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync if parent allTopics changes
  useMemo(() => {
    setTopicsList((prev) => {
      const ids = new Set(prev.map((t) => t.id));
      const newItems = allTopics.filter((t) => !ids.has(t.id));
      return newItems.length > 0 ? [...prev, ...newItems] : prev;
    });
  }, [allTopics]);

  const cleanQuery = query.trim();

  // Filter topics based on search query
  const filteredTopics = useMemo(() => {
    if (!cleanQuery) return topicsList;
    return topicsList.filter((t) =>
      t.name.toLowerCase().includes(cleanQuery.toLowerCase())
    );
  }, [topicsList, cleanQuery]);

  // Check if query exactly matches an existing topic (case-insensitive)
  const exactMatch = useMemo(() => {
    if (!cleanQuery) return null;
    return topicsList.find(
      (t) => t.name.toLowerCase() === cleanQuery.toLowerCase()
    );
  }, [topicsList, cleanQuery]);

  function toggleTopic(id: string) {
    setError(null);
    if (selectedTopicIds.includes(id)) {
      onChange(selectedTopicIds.filter((x) => x !== id));
    } else {
      if (selectedTopicIds.length >= maxSelect) {
        setError(`You can select up to ${maxSelect} categories per post.`);
        return;
      }
      onChange([...selectedTopicIds, id]);
    }
  }

  async function handleCreateCustomCategory() {
    if (!cleanQuery || cleanQuery.length < 2) {
      setError("Category name must be at least 2 characters.");
      return;
    }
    if (selectedTopicIds.length >= maxSelect && !exactMatch) {
      setError(`You can select up to ${maxSelect} categories.`);
      return;
    }

    setCreating(true);
    setError(null);

    try {
      const res = await fetch("/api/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: cleanQuery }),
      });

      const json = await res.json();
      if (!res.ok || json.error) {
        throw new Error(json.error || "Failed to create category");
      }

      const newTopic: TopicItem = json.topic;

      // Add to list if not already present
      setTopicsList((prev) => {
        if (prev.some((t) => t.id === newTopic.id)) return prev;
        return [...prev, newTopic].sort((a, b) => a.name.localeCompare(b.name));
      });

      // Auto-select the newly created / matched category
      if (!selectedTopicIds.includes(newTopic.id)) {
        if (selectedTopicIds.length < maxSelect) {
          onChange([...selectedTopicIds, newTopic.id]);
        }
      }

      setQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create category.");
    } finally {
      setCreating(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (exactMatch) {
        toggleTopic(exactMatch.id);
        setQuery("");
      } else if (cleanQuery.length >= 2) {
        handleCreateCustomCategory();
      }
    }
  }

  const selectedTopics = topicsList.filter((t) => selectedTopicIds.includes(t.id));

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4.5 sm:p-5 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>{label}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {selectedTopicIds.length}/{maxSelect}
          </span>
        </label>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Pick or create categories
        </span>
      </div>

      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>

      {/* Selected Categories Display */}
      {selectedTopics.length > 0 && (
        <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Selected:
          </span>
          {selectedTopics.map((t) => (
            <span
              key={t.id}
              className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-2xs transition animate-in fade-in zoom-in-95"
            >
              <span>{t.name}</span>
              <button
                type="button"
                onClick={() => toggleTopic(t.id)}
                className="rounded-full p-0.5 hover:bg-emerald-700 active:scale-95"
                title={`Remove ${t.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search & Custom Category Input */}
      <div className="mt-3.5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search or type a new custom category (e.g. LangGraph, Next.js, System Design)..."
            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        {cleanQuery.length >= 2 && !exactMatch && (
          <button
            type="button"
            onClick={handleCreateCustomCategory}
            disabled={creating}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-emerald-700 disabled:opacity-60 shrink-0"
          >
            {creating ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Adding…</span>
              </>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>Create &quot;{cleanQuery}&quot;</span>
              </>
            )}
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs font-medium text-rose-500">{error}</p>}

      {/* Categories Pill Cloud */}
      <div className="mt-3 flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
        {filteredTopics.slice(0, 30).map((t) => {
          const isSelected = selectedTopicIds.includes(t.id);
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => toggleTopic(t.id)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer ${
                isSelected
                  ? "bg-emerald-600 text-white shadow-2xs font-semibold"
                  : "border border-slate-300 bg-white text-slate-700 hover:border-emerald-400 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:bg-slate-750"
              }`}
            >
              {isSelected ? <Check className="h-3 w-3" /> : <Tag className="h-3 w-3 opacity-50" />}
              <span>{t.name}</span>
            </button>
          );
        })}

        {filteredTopics.length === 0 && cleanQuery && (
          <p className="py-1 text-xs text-slate-500 dark:text-slate-400">
            No matching category. Press <strong>Enter</strong> or click above to create &quot;{cleanQuery}&quot;.
          </p>
        )}
      </div>
    </div>
  );
}
