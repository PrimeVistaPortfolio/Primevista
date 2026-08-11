"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import ServiceForm from "@/components/services/ServiceForm";

export default function NewServicePage() {
  return (
    <DashboardShell title="New Service">
      <ServiceForm />
    </DashboardShell>
  );
}
