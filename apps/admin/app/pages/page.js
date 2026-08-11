"use client";

import Link from "next/link";
import DashboardShell from "@/components/layout/DashboardShell";

// Fixed set of CMS-managed pages. Each is a flexible, block-based document
// (created on first save) editable without a redeploy.
const PAGES = [
  { slug: "home", label: "Home" },
  { slug: "about", label: "About" },
  { slug: "contact", label: "Contact" },
];

export default function PagesListPage() {
  return (
    <DashboardShell title="Pages">
      <div className="card divide-y divide-slate-100 dark:divide-slate-800">
        {PAGES.map((p) => (
          <Link key={p.slug} href={`/pages/${p.slug}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div>
              <p className="font-medium">{p.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">/{p.slug === "home" ? "" : p.slug}</p>
            </div>
            <span className="text-accent">Edit →</span>
          </Link>
        ))}
      </div>
    </DashboardShell>
  );
}
