"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import ServiceForm from "@/components/services/ServiceForm";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function EditServicePage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`services/${id}`, fetcher);

  return (
    <DashboardShell title="Edit Service">
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && <ServiceForm initial={data.service} serviceId={id} />}
    </DashboardShell>
  );
}
