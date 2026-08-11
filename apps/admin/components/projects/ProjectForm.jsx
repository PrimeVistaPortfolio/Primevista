"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ui/ImageUploader";
import SeoFields from "@/components/forms/SeoFields";
import { api } from "@/lib/apiClient";
import { slugify, csvToArray } from "@/lib/slugify";

const TABS = ["Content", "Media", "SEO"];

export default function ProjectForm({ initial, projectId }) {
  const router = useRouter();
  const isEdit = !!projectId;
  const [tab, setTab] = useState("Content");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(
    initial || {
      title: "",
      slug: "",
      coverImage: null,
      gallery: [],
      description: "",
      content: "",
      tags: [],
      techStack: [],
      client: "",
      liveUrl: "",
      model3dUrl: "",
      featured: false,
      order: 0,
      status: "published",
      seo: {},
    }
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`projects/${projectId}`, form);
        toast.success("Project updated");
      } else {
        await api.post("projects", form);
        toast.success("Project created");
      }
      router.push("/projects");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium ${
              tab === t ? "border-b-2 border-accent text-accent" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Content" && (
        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Title</label>
            <input
              className="input"
              required
              value={form.title}
              onChange={(e) => {
                set("title", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Slug</label>
            <input
              className="input"
              required
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value);
              }}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description</label>
            <textarea className="input" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Case study content</label>
            <textarea className="input" rows={6} value={form.content} onChange={(e) => set("content", e.target.value)} />
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags.join(", ")} onChange={(e) => set("tags", csvToArray(e.target.value))} />
          </div>
          <div>
            <label className="label">Tech stack (comma separated)</label>
            <input className="input" value={form.techStack.join(", ")} onChange={(e) => set("techStack", csvToArray(e.target.value))} />
          </div>
          <div>
            <label className="label">Client</label>
            <input className="input" value={form.client} onChange={(e) => set("client", e.target.value)} />
          </div>
          <div>
            <label className="label">Live URL</label>
            <input className="input" value={form.liveUrl} onChange={(e) => set("liveUrl", e.target.value)} />
          </div>
          <div>
            <label className="label">Order</label>
            <input type="number" className="input" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured on homepage
          </label>
        </div>
      )}

      {tab === "Media" && (
        <div className="card space-y-6 p-6">
          <div>
            <label className="label">Cover image</label>
            <ImageUploader value={form.coverImage} onChange={(m) => set("coverImage", m)} folder="primevista/projects" />
          </div>
          <div>
            <label className="label">Gallery</label>
            <div className="mb-3 flex flex-wrap gap-3">
              {form.gallery.map((item, i) => (
                <div key={i} className="relative">
                  {item.type === "video" ? (
                    <video src={item.url} className="h-20 w-20 rounded-lg object-cover" muted />
                  ) : (
                    <img src={item.url} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => set("gallery", form.gallery.filter((_, idx) => idx !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-red-500 px-1.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <ImageUploader
              value={null}
              onChange={(m) => m && set("gallery", [...form.gallery, m])}
              folder="primevista/projects/gallery"
            />
          </div>
          <div>
            <label className="label">3D model (.glb) — optional</label>
            <ImageUploader
              value={form.model3dUrl ? { url: form.model3dUrl } : null}
              onChange={(m) => set("model3dUrl", m?.url || "")}
              folder="primevista/projects/models"
              resourceType="raw"
            />
          </div>
        </div>
      )}

      {tab === "SEO" && (
        <div className="card p-6">
          <SeoFields value={form.seo} onChange={(seo) => set("seo", seo)} />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.push("/projects")}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create project"}
        </button>
      </div>
    </form>
  );
}
