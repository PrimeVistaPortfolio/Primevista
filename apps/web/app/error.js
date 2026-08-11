"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-screen max-w-container flex-col justify-center px-6">
      <p className="label text-accent">Error</p>
      <h1 className="display mt-6 text-display-md text-ink">
        Something went <em className="italic text-accent">wrong.</em>
      </h1>
      <p className="mt-8 max-w-md text-pretty text-ink-muted">
        This page failed to load. Try again, or head back to the homepage.
      </p>

      {process.env.NODE_ENV === "development" && (
        <pre className="mt-8 max-w-3xl overflow-auto whitespace-pre-wrap border border-rule p-4 text-left font-mono text-xs text-red-300">
          {error?.message}
          {"\n\n"}
          {error?.stack}
        </pre>
      )}

      <button
        onClick={reset}
        className="mt-10 self-start rounded-full bg-ink px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-white"
        data-cursor="hover"
      >
        Try again
      </button>
    </div>
  );
}
