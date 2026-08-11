"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV_ITEMS } from "./NAV_ITEMS";
import Icon from "@/components/ui/Icon";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";

export default function DashboardShell({ title, actions, children }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <div className="mb-8 px-2 text-lg font-semibold">
          PrimeVista <span className="text-accent">Admin</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-accent/10 text-accent"
                    : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon name={item.icon} className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          <Icon name="logout" className="h-4 w-4" />
          Log out
        </button>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="flex items-center gap-3">
            {actions}
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} className="h-4 w-4" />
            </button>
            {user && (
              <div className="hidden text-right text-sm sm:block">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
              </div>
            )}
          </div>
        </header>

        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="flex-1 p-6"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
