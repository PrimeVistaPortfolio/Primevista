"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import ProjectForm from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  return (
    <DashboardShell title="New Project">
      <ProjectForm />
    </DashboardShell>
  );
}
