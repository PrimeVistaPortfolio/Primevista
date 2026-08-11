"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import DashboardShell from "@/components/layout/DashboardShell";
import AppearanceFields from "@/components/settings/AppearanceFields";
import ImageUploader from "@/components/ui/ImageUploader";
import { LoadingState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const SOCIAL_KEYS = ["website", "linkedin", "twitter", "github", "instagram", "facebook", "dribbble"];

export default function SettingsPage() {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  // The themeable-region registry is served alongside the settings.
  const [themeMeta, setThemeMeta] = useState(null);

  useEffect(() => {
    api.get("settings").then((data) => {
      setForm(data.settings);
      setThemeMeta(data.theme || null);
    });
  }, []);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setSocial(key, value) {
    setForm((f) => ({ ...f, socialLinks: { ...f.socialLinks, [key]: value } }));
  }
  function setDefaultSeo(key, value) {
    setForm((f) => ({ ...f, defaultSeo: { ...f.defaultSeo, [key]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const { settings } = await api.put("settings", form);
      setForm(settings);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!form) {
    return (
      <DashboardShell title="Site Settings">
        <LoadingState />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Site Settings">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2">Branding</h2>
          <div>
            <label className="label">Site name</label>
            <input className="input" value={form.siteName} onChange={(e) => set("siteName", e.target.value)} />
          </div>
          <div>
            <label className="label">Tagline</label>
            <input className="input" value={form.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </div>
          <div>
            <label className="label">Logo (light background)</label>
            <ImageUploader value={form.logoLight} onChange={(m) => set("logoLight", m)} folder="primevista/branding" />
          </div>
          <div>
            <label className="label">Logo (dark background)</label>
            <ImageUploader value={form.logoDark} onChange={(m) => set("logoDark", m)} folder="primevista/branding" />
          </div>
          <div>
            <label className="label">Favicon</label>
            <ImageUploader value={form.favicon} onChange={(m) => set("favicon", m)} folder="primevista/branding" />
          </div>
          <div>
            <label className="label">Theme accent color</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.themeColor} onChange={(e) => set("themeColor", e.target.value)} className="h-10 w-14 rounded" />
              <input className="input" value={form.themeColor} onChange={(e) => set("themeColor", e.target.value)} />
            </div>
          </div>
          <div>
            <label className="label">Font choice</label>
            <input className="input" value={form.fontChoice} onChange={(e) => set("fontChoice", e.target.value)} />
          </div>
        </div>

        {themeMeta && (
          <AppearanceFields
            baseTheme={form.baseTheme}
            sectionThemes={form.sectionThemes}
            meta={themeMeta}
            onChange={set}
          />
        )}

        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2">Contact</h2>
          <div>
            <label className="label">Contact email</label>
            <input className="input" value={form.contactEmail} onChange={(e) => set("contactEmail", e.target.value)} />
          </div>
          <div>
            <label className="label">Contact phone</label>
            <input className="input" value={form.contactPhone} onChange={(e) => set("contactPhone", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => set("address", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Map embed URL</label>
            <input className="input" value={form.mapEmbedUrl} onChange={(e) => set("mapEmbedUrl", e.target.value)} />
          </div>
        </div>

        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2">Social links</h2>
          {SOCIAL_KEYS.map((key) => (
            <div key={key}>
              <label className="label capitalize">{key}</label>
              <input className="input" value={form.socialLinks?.[key] || ""} onChange={(e) => setSocial(key, e.target.value)} />
            </div>
          ))}
        </div>

        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2">Default SEO</h2>
          <div className="sm:col-span-2">
            <label className="label">Meta title template</label>
            <input className="input" value={form.metaTitleTemplate} onChange={(e) => set("metaTitleTemplate", e.target.value)} />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use {"{name}"} as a placeholder.</p>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Default meta description</label>
            <textarea
              className="input"
              rows={2}
              value={form.defaultSeo?.metaDescription || ""}
              onChange={(e) => setDefaultSeo("metaDescription", e.target.value)}
            />
          </div>
        </div>

        <div className="card grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 sm:col-span-2">Inquiry form options</h2>
          <div>
            <label className="label">Service interest options (comma separated)</label>
            <input
              className="input"
              value={(form.serviceInterestOptions || []).join(", ")}
              onChange={(e) =>
                set(
                  "serviceInterestOptions",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
            />
          </div>
          <div>
            <label className="label">Budget range options (comma separated)</label>
            <input
              className="input"
              value={(form.budgetRangeOptions || []).join(", ")}
              onChange={(e) =>
                set(
                  "budgetRangeOptions",
                  e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                )
              }
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </form>
    </DashboardShell>
  );
}
