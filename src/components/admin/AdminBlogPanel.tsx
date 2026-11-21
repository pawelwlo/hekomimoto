"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { slugify } from "@/lib/blog/sanitize";
import type { BlogPost, BlogPostStatus } from "@/lib/blog/types";

type Draft = {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  coverImageUrl: string;
  status: BlogPostStatus;
};

const emptyDraft = (): Draft => ({
  title: "",
  slug: "",
  excerpt: "",
  contentHtml: "",
  coverImageUrl: "",
  status: "published",
});

export function AdminBlogPanel() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const res = await fetch("/api/admin/posts");
    if (!res.ok) {
      setMessage("Nie udało się wczytać wpisów.");
      setLoading(false);
      return;
    }
    const data = (await res.json()) as { posts?: BlogPost[] };
    setPosts(data.posts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function saveDraft() {
    if (!draft) return;
    if (!draft.title.trim()) {
      setMessage("Tytuł jest wymagany.");
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const payload = {
        id: draft.id,
        title: draft.title.trim(),
        slug: draft.slug.trim() || slugify(draft.title),
        excerpt: draft.excerpt,
        contentHtml: draft.contentHtml,
        coverImageUrl: draft.coverImageUrl.trim() || null,
        status: draft.status,
      };

      const res = await fetch("/api/admin/posts", {
        method: draft.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Nie udało się zapisać wpisu.");
      } else {
        setMessage(draft.id ? "Wpis zaktualizowany." : "Wpis utworzony.");
        setDraft(null);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  async function removePost(id: string, title: string) {
    const ok = window.confirm(`Usunąć wpis „${title}”?`);
    if (!ok) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/posts?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Nie udało się usunąć.");
      } else {
        setMessage("Wpis usunięty.");
        if (draft?.id === id) setDraft(null);
        await refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  function startEdit(post: BlogPost) {
    setDraft({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      contentHtml: post.contentHtml,
      coverImageUrl: post.coverImageUrl ?? "",
      status: post.status,
    });
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Ładowanie bloga…
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Blog
          </h2>
          <p className="mt-1 text-sm text-muted">
            Twórz, edytuj i usuwaj wpisy na blogu.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            disabled={busy}
            onClick={() => setDraft(emptyDraft())}
          >
            <Plus className="h-4 w-4" />
            Nowy wpis
          </Button>
        </div>
      </div>

      {message ? <p className="mt-4 text-sm text-gold">{message}</p> : null}

      {draft ? (
        <div className="mt-6 space-y-4 rounded-xl border border-white/10 p-4">
          <h3 className="font-semibold text-white">
            {draft.id ? "Edycja wpisu" : "Nowy wpis"}
          </h3>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Tytuł</span>
            <input
              value={draft.title}
              onChange={(e) => {
                const title = e.target.value;
                setDraft((d) =>
                  d
                    ? {
                        ...d,
                        title,
                        slug: d.id ? d.slug : slugify(title),
                      }
                    : d,
                );
              }}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Slug (URL)</span>
            <input
              value={draft.slug}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, slug: e.target.value } : d))
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Zajawka</span>
            <textarea
              rows={2}
              value={draft.excerpt}
              onChange={(e) =>
                setDraft((d) => (d ? { ...d, excerpt: e.target.value } : d))
              }
              className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">
              Treść (HTML — możesz wkleić z WordPress)
            </span>
            <textarea
              rows={12}
              value={draft.contentHtml}
              onChange={(e) =>
                setDraft((d) =>
                  d ? { ...d, contentHtml: e.target.value } : d,
                )
              }
              className="w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">
              Okładka (URL obrazka)
            </span>
            <input
              value={draft.coverImageUrl}
              onChange={(e) =>
                setDraft((d) =>
                  d ? { ...d, coverImageUrl: e.target.value } : d,
                )
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent"
              placeholder="https://…"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted">Status</span>
            <select
              value={draft.status}
              onChange={(e) =>
                setDraft((d) =>
                  d
                    ? { ...d, status: e.target.value as BlogPostStatus }
                    : d,
                )
              }
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-accent"
            >
              <option value="published" className="bg-surface">
                Opublikowany
              </option>
              <option value="draft" className="bg-surface">
                Szkic
              </option>
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button disabled={busy} onClick={() => void saveDraft()}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Zapisz
            </Button>
            <Button
              variant="secondary"
              disabled={busy}
              onClick={() => setDraft(null)}
            >
              Anuluj
            </Button>
          </div>
        </div>
      ) : null}

      <ul className="mt-6 space-y-2">
        {posts.map((post) => (
          <li
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/10 px-3 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-white">{post.title}</p>
              <p className="text-xs text-muted">
                /blog/{post.slug} ·{" "}
                {post.status === "published" ? "opublikowany" : "szkic"}
                {post.wpId ? ` · WP #${post.wpId}` : ""}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg p-2 text-muted hover:bg-white/5 hover:text-white"
                onClick={() => startEdit(post)}
                aria-label="Edytuj"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-lg p-2 text-red-400 hover:bg-white/5 hover:text-red-300"
                onClick={() => void removePost(post.id, post.title)}
                aria-label="Usuń"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {!posts.length ? (
          <li className="text-sm text-muted">Brak wpisów. Dodaj nowy.</li>
        ) : null}
      </ul>
    </section>
  );
}
