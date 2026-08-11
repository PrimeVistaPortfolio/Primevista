"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import ClientForm from "@/components/clients/ClientForm";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function EditClientPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`clients/${id}`, fetcher);

  return (
    <DashboardShell title="Edit Client">
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && <ClientForm initial={data.client} clientId={id} />}
    </DashboardShell>
  );
}
