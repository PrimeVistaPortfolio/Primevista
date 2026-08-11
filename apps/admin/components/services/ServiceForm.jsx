"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SeoFields from "@/components/forms/SeoFields";
import { api } from "@/lib/apiClient";
import { slugify, csvToArray } from "@/lib/slugify";

const CATEGORIES = [
  "Web & App Development",
  "Business Software",
  "E-commerce & Marketplace",
  "Booking & Mobility",
  "Industry Software",
  "AI, Cloud & Support",
];

const TABS = ["Content", "SEO"];

export default function ServiceForm({ initial, serviceId }) {
  const router = useRouter();
  const isEdit = !!serviceId;
  const [tab, setTab] = useState("Content");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(
    initial || {
      title: "",
      slug: "",
      category: CATEGORIES[0],
      icon: "code",
      shortDescription: "",
      longDescription: "",
      keywordFocus: "",
      relatedProjectTags: [],
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
        await api.put(`services/${serviceId}`, form);
        toast.success("Service updated");
      } else {
        await api.post("services", form);
        toast.success("Service created");
      }
      router.push("/services");
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
          <div>
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
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Short description (used on listing cards)</label>
            <textarea
              className="input"
              rows={2}
              value={form.shortDescription}
              onChange={(e) => set("shortDescription", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Long description (dedicated service page body)</label>
            <textarea
              className="input"
              rows={8}
              value={form.longDescription}
              onChange={(e) => set("longDescription", e.target.value)}
            />
          </div>
          <div>
            <label className="label">Keyword focus</label>
            <input className="input" value={form.keywordFocus} onChange={(e) => set("keywordFocus", e.target.value)} />
          </div>
          <div>
            <label className="label">Icon key</label>
            <input className="input" value={form.icon} onChange={(e) => set("icon", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Related project tags (comma separated)</label>
            <input
              className="input"
              value={form.relatedProjectTags.join(", ")}
              onChange={(e) => set("relatedProjectTags", csvToArray(e.target.value))}
            />
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

      {tab === "SEO" && (
        <div className="card p-6">
          <SeoFields value={form.seo} onChange={(seo) => set("seo", seo)} keywordHint={form.keywordFocus} />
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.push("/services")}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create service"}
        </button>
      </div>
    </form>
  );
}
