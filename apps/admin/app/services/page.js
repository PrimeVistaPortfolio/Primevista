"use client";

import Link from "next/link";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function ServicesPage() {
  const { data, error, isLoading } = useSWR("services?all=true", fetcher);

  async function handleDelete(id) {
    if (!confirm("Delete this service?")) return;
    try {
      await api.del(`services/${id}`);
      toast.success("Service deleted");
      mutate("services?all=true");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function handleSeed() {
    try {
      const res = await api.post("seed-services", {});
      toast.success(`Seeded ${res.inserted} services (${res.skipped} already existed)`);
      mutate("services?all=true");
    } catch (err) {
      toast.error(err.message);
    }
  }

  const grouped = {};
  (data?.services || []).forEach((s) => {
    grouped[s.category] = grouped[s.category] || [];
    grouped[s.category].push(s);
  });

  return (
    <DashboardShell
      title="Services"
      actions={
        <div className="flex gap-2">
          <button onClick={handleSeed} className="btn-secondary">
            Seed default catalog
          </button>
          <Link href="/services/new" className="btn-primary">
            <Icon name="plus" className="h-4 w-4" /> New service
          </Link>
        </div>
      }
    >
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.services.length === 0 && (
        <EmptyState
          title="No services yet"
          description="Seed the default catalog or add services manually."
          action={
            <button onClick={handleSeed} className="btn-primary mt-2">
              Seed default catalog
            </button>
          }
        />
      )}
      {Object.entries(grouped).map(([category, services]) => (
        <div key={category} className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-500 dark:text-slate-400">{category}</h2>
          <div className="card divide-y divide-slate-100 dark:divide-slate-800">
            {services.map((s) => (
              <div key={s._id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="font-medium">{s.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    /services/{s.slug} · {s.status}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Link href={`/services/${s._id}`} className="text-accent hover:underline">
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </DashboardShell>
  );
}
