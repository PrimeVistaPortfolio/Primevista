"use client";

import { motion } from "framer-motion";

// template.js re-mounts on every navigation (unlike layout.js), which is what
// makes it the right place for route transitions.
export default function Template({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
