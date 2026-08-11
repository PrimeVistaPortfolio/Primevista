"use client";

import Link from "next/link";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function TeamPage() {
  const { data, error, isLoading } = useSWR("team?all=true", fetcher);

  async function handleDelete(id) {
    if (!confirm("Remove this team member?")) return;
    try {
      await api.del(`team/${id}`);
      toast.success("Team member removed");
      mutate("team?all=true");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <DashboardShell
      title="Team"
      actions={
        <Link href="/team/new" className="btn-primary">
          <Icon name="plus" className="h-4 w-4" /> New member
        </Link>
      }
    >
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.members.length === 0 && <EmptyState title="No team members yet" />}
      {data && data.members.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.members.map((m) => (
            <div key={m._id} className="card flex flex-col items-center gap-3 p-6 text-center">
              {m.photo?.url ? (
                <img src={m.photo.url} alt="" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-slate-200 dark:bg-slate-800" />
              )}
              <div>
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{m.role}</p>
              </div>
              <div className="flex gap-3 text-sm">
                <Link href={`/team/${m._id}`} className="text-accent hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(m._id)} className="text-red-500 hover:underline">
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
