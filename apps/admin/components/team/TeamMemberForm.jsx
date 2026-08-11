"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ImageUploader from "@/components/ui/ImageUploader";
import { api } from "@/lib/apiClient";

export default function TeamMemberForm({ initial, memberId }) {
  const router = useRouter();
  const isEdit = !!memberId;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(
    initial || {
      name: "",
      role: "",
      photo: null,
      bio: "",
      socials: { website: "", linkedin: "", twitter: "", github: "", instagram: "" },
      order: 0,
      visible: true,
    }
  );

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setSocial(field, value) {
    setForm((f) => ({ ...f, socials: { ...f.socials, [field]: value } }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`team/${memberId}`, form);
        toast.success("Team member updated");
      } else {
        await api.post("team", form);
        toast.success("Team member added");
      }
      router.push("/team");
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
          <label className="label">Photo</label>
          <ImageUploader value={form.photo} onChange={(m) => set("photo", m)} folder="primevista/team" />
        </div>
        <div>
          <label className="label">Name</label>
          <input className="input" required value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <label className="label">Role</label>
          <input className="input" value={form.role} onChange={(e) => set("role", e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Bio</label>
          <textarea className="input" rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </div>
        {["website", "linkedin", "twitter", "github", "instagram"].map((key) => (
          <div key={key}>
            <label className="label capitalize">{key}</label>
            <input className="input" value={form.socials[key] || ""} onChange={(e) => setSocial(key, e.target.value)} />
          </div>
        ))}
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
        <button type="button" className="btn-secondary" onClick={() => router.push("/team")}>
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? "Saving..." : isEdit ? "Save changes" : "Add member"}
        </button>
      </div>
    </form>
  );
}
