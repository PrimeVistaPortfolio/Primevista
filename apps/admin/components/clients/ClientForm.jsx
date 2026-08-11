"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ui/ImageUploader";
import { api } from "@/lib/apiClient";

export default function ClientForm({ initial, clientId }) {
  const router = useRouter();
  const isEdit = !!clientId;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(
    initial || { name: "", logo: null, url: "", order: 0, visible: true }
  );

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`clients/${clientId}`, form);
        toast.success("Client updated");
      } else {
        await api.post("clients", form);
        toast.success("Client added");
      }
      router.push("/clients");
      router.refresh();
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card grid gap-4 p-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Logo</label>
          <ImageUploader value={form.logo} onChange={(m) => set("logo", m)} folder="primevista/clients" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Transparent PNG or SVG works best — logos are shown greyscale until hovered.
          </p>
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Website URL</label>
          <input className="input" value={form.url} onChange={(e) => set("url", e.target.value)} placeholder="https://" />
        </div>
        <div>
          <label className="label">Order</label>
          <input type="number" className="input" value={form.order} onChange={(e) => set("order", Number(e.target.value))} />
        </div>
        <label className="flex items-center gap-2 self-end text-sm">
          <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} />
          Visible on site
        </label>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="btn-secondary" onClick={() => router.push("/clients")}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add client"}
        </button>
      </div>
    </form>
  );
}
