"use client";

import Link from "next/link";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function ClientsPage() {
  const { data, error, isLoading } = useSWR("clients?all=true", fetcher);

  async function handleDelete(id) {
    if (!confirm("Remove this client logo?")) return;
    try {
      await api.del(`clients/${id}`);
      toast.success("Client removed");
      mutate("clients?all=true");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <DashboardShell
      title="Clients"
      actions={
        <Link href="/clients/new" className="btn-primary">
          <Icon name="plus" className="h-4 w-4" /> New client
        </Link>
      }
    >
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.clients.length === 0 && (
        <EmptyState
          title="No client logos yet"
          description="Logos added here appear in the scrolling strip on the homepage."
          action={
            <Link href="/clients/new" className="btn-primary mt-2">
              Add client
            </Link>
          }
        />
      )}
      {data && data.clients.length > 0 && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {data.clients.map((c) => (
            <div key={c._id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-4">
                {c.logo?.url ? (
                  <img src={c.logo.url} alt="" className="h-8 w-24 object-contain" />
                ) : (
                  <div className="h-8 w-24 rounded bg-slate-100 dark:bg-slate-800" />
                )}
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    order {c.order} · {c.visible ? "visible" : "hidden"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/clients/${c._id}`} className="text-accent hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(c._id)} className="text-red-500 hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
