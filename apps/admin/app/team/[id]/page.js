"use client";

import useSWR from "swr";
import { useParams } from "next/navigation";
import DashboardShell from "@/components/layout/DashboardShell";
import TeamMemberForm from "@/components/team/TeamMemberForm";
import { LoadingState, ErrorState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const fetcher = (path) => api.get(path);

export default function EditTeamMemberPage() {
  const { id } = useParams();
  const { data, error, isLoading } = useSWR(`team/${id}`, fetcher);

  return (
    <DashboardShell title="Edit Team Member">
      {isLoading && <LoadingState />}
      {error && <ErrorState message={error.message} />}
      {data && <TeamMemberForm initial={data.member} memberId={id} />}
    </DashboardShell>
  );
}
