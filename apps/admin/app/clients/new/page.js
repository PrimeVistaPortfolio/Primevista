"use client";

import DashboardShell from "@/components/layout/DashboardShell";
import ClientForm from "@/components/clients/ClientForm";

export default function NewClientPage() {
  return (
    <DashboardShell title="New Client">
      <ClientForm />
    </DashboardShell>
  );
}
