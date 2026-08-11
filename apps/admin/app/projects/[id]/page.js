"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import ProjectForm from "@/components/projects/ProjectForm";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function EditProjectPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`projects/${id}`, fetcher);

  return (
    <DashboardShell title="Edit Project">
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && <ProjectForm initial={data.project} projectId={id} />}
    </DashboardShell>
  );
}
