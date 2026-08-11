"use client";

import Link from "next/link";
import useSWR, { mutate } from "swr";
import toast from "react-hot-toast";
import DashboardShell from "@/components/layout/DashboardShell";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/States";
import Icon from "@/components/ui/Icon";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function ProjectsPage() {
  const { data, error, isLoading } = useSWR("projects?all=true", fetcher);

  async function handleDelete(id) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    try {
      await api.del(`projects/${id}`);
      toast.success("Project deleted");
      mutate("projects?all=true");
    } catch (err) {
      toast.error(err.message);
    }
  }

  return (
    <DashboardShell
      title="Projects"
      actions={
        <Link href="/projects/new" className="btn-primary">
          <Icon name="plus" className="h-4 w-4" /> New project
        </Link>
      }
    >
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && data.projects.length === 0 && (
        <EmptyState
          title="No projects yet"
          description="Add your first portfolio project to feature it on the site."
          action={
            <Link href="/projects/new" className="btn-primary mt-2">
              New project
            </Link>
          }
        />
      )}
      {data && data.projects.length > 0 && (
        <div className="card divide-y divide-slate-100 dark:divide-slate-800">
          {data.projects.map((p) => (
            <div key={p._id} className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-3">
                {p.coverImage?.url && <img src={p.coverImage.url} alt="" className="h-10 w-10 rounded-md object-cover" />}
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    /{p.slug} · {p.status} {p.featured && "· featured"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/projects/${p._id}`} className="text-accent hover:underline">
                  Edit
                </Link>
                <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:underline">
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
