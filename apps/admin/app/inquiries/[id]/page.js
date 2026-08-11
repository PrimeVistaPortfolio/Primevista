"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import toast from "react-hot-toast";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);
const STATUSES = ["new", "contacted", "in-progress", "closed"];

export default function InquiryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, error, isLoading, mutate } = useSWR(`inquiries/${id}`, fetcher);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  async function updateStatus(status) {
    try {
      const res = await api.put(`inquiries/${id}`, { status });
      mutate(res);
      toast.success("Status updated");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function addNote(e) {
    e.preventDefault();
    if (!note.trim()) return;
    setSaving(true);
    try {
      const res = await api.put(`inquiries/${id}`, { note });
      mutate(res);
      setNote("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this inquiry?")) return;
    await api.del(`inquiries/${id}`);
    router.push("/inquiries");
  }

  return (
    <DashboardShell title="Inquiry Detail">
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="card space-y-3 p-6 lg:col-span-2">
            <h2 className="text-lg font-semibold">{data.inquiry.name}</h2>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Email</dt>
                <dd>{data.inquiry.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Phone</dt>
                <dd>{data.inquiry.phone || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Company</dt>
                <dd>{data.inquiry.company || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Budget</dt>
                <dd>{data.inquiry.budgetRange || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Service interest</dt>
                <dd>{data.inquiry.serviceInterest || "-"}</dd>
              </div>
              <div>
                <dt className="text-slate-500 dark:text-slate-400">Submitted</dt>
                <dd>{new Date(data.inquiry.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
            <div>
              <dt className="mb-1 text-sm text-slate-500 dark:text-slate-400">Message</dt>
              <p className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-800">{data.inquiry.message}</p>
            </div>
            <button onClick={handleDelete} className="text-sm text-red-500 hover:underline">
              Delete inquiry
            </button>
          </div>

          <div className="space-y-6">
            <div className="card p-6">
              <h3 className="mb-3 text-sm font-semibold">Status</h3>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      data.inquiry.status === s ? "bg-accent text-white" : "bg-slate-100 dark:bg-slate-800"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <h3 className="mb-3 text-sm font-semibold">Internal notes</h3>
              <div className="mb-3 space-y-2">
                {(data.inquiry.notes || []).map((n, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-3 text-xs dark:bg-slate-800">
                    <p>{n.text}</p>
                    <p className="mt-1 text-slate-400">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                ))}
                {(!data.inquiry.notes || data.inquiry.notes.length === 0) && (
                  <p className="text-xs text-slate-400">No notes yet.</p>
                )}
              </div>
              <form onSubmit={addNote} className="flex gap-2">
                <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note..." />
                <button type="submit" disabled={saving} className="btn-primary">
                  Add
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
