export function LoadingState({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-slate-500 dark:text-slate-400">
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="card flex flex-col items-center justify-center gap-2 p-12 text-center">
      <p className="font-medium">{title}</p>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
      {message || "Something went wrong."}
    </div>
  );
}
