"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import TeamMemberForm from "@/components/team/TeamMemberForm";

export default function NewTeamMemberPage() {
  return (
    <DashboardShell title="New Team Member">
      <TeamMemberForm />
    </DashboardShell>
  );
}
