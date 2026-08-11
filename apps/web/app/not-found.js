"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-screen max-w-container flex-col justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="label text-accent">Error</p>
        <p className="display mt-6 text-display-lg leading-none text-ink">404</p>

        <div className="mt-10 grid gap-8 border-t border-rule pt-8 sm:grid-cols-2">
          <h1 className="display text-3xl text-ink">
            This page doesn&apos;t <em className="italic text-accent">exist.</em>
          </h1>
          <div>
            <p className="text-pretty text-ink-muted">
              It may have moved, or the link that brought you here might be out of date.
            </p>
            <Link
              href="/"
              data-cursor="hover"
              className="link-underline mt-6 inline-block text-sm text-ink hover:text-accent"
            >
              Back to home →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
