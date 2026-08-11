"use client";

import useSWR from "swr";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

function StatCard({ label, value }) {
  return (
    <div className="card p-6">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { data: inquiries } = useSWR("inquiries", fetcher);
  const { data: projects } = useSWR("projects?all=true", fetcher);
  const { data: services } = useSWR("services?all=true", fetcher);

  if (!inquiries || !projects || !services) {
    return (
      <DashboardShell title="Dashboard">
        <LoadingState />
      </DashboardShell>
    );
  }

  const newInquiries = inquiries.inquiries.filter((i) => i.status === "new").length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeek = inquiries.inquiries.filter((i) => new Date(i.createdAt).getTime() > weekAgo).length;

  return (
    <DashboardShell title="Dashboard">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total inquiries" value={inquiries.inquiries.length} />
        <StatCard label="New inquiries" value={newInquiries} />
        <StatCard label="Inquiries this week" value={thisWeek} />
        <StatCard label="Total projects" value={projects.projects.length} />
        <StatCard label="Total services" value={services.services.length} />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Recent inquiries</h2>
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {inquiries.inquiries.slice(0, 5).map((i) => (
            <div key={i._id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{i.name}</p>
                <p className="text-slate-500 dark:text-slate-400">{i.email}</p>
              </div>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">{i.status}</span>
            </div>
          ))}
          {inquiries.inquiries.length === 0 && (
            <p className="px-5 py-6 text-sm text-slate-500 dark:text-slate-400">No inquiries yet.</p>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
