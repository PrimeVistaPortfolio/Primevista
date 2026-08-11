"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);
const STATUSES = ["new", "contacted", "in-progress", "closed"];

function statusColor(status) {
  return {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    contacted: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    "in-progress": "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    closed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  }[status];
}

function exportCsv(inquiries) {
  const headers = ["Name", "Email", "Phone", "Company", "Budget", "Service", "Status", "Created"];
  const rows = inquiries.map((i) => [
    i.name,
    i.email,
    i.phone,
    i.company,
    i.budgetRange,
    i.serviceInterest,
    i.status,
    new Date(i.createdAt).toISOString(),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v || "").replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "inquiries.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function InquiriesPage() {
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const query = new URLSearchParams({ ...(status && { status }), ...(q && { q }) }).toString();
  const { data, error, isLoading } = useSWR(`inquiries${query ? `?${query}` : ""}`, fetcher);

  return (
    <DashboardShell
      title="Inquiries"
      actions={
        data && (
          <button className="btn-secondary" onClick={() => exportCsv(data.inquiries)}>
            Export CSV
          </button>
        )
      }
    >
      <div className="mb-4 flex flex-wrap gap-3">
        <select className="input w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input className="input w-auto flex-1" placeholder="Search name, email, company..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.inquiries.length === 0 && <EmptyState title="No inquiries found" />}
      {data && data.inquiries.length > 0 && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {data.inquiries.map((i) => (
            <Link key={i._id} href={`/inquiries/${i._id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div>
                <p className="font-medium">
                  {i.name} <span className="font-normal text-slate-500 dark:text-slate-400">— {i.email}</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {i.serviceInterest || "General inquiry"} · {new Date(i.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusColor(i.status)}`}>{i.status}</span>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
