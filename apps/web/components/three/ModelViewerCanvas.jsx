"use client";

import dynamic from "next/dynamic";

// Reusable 3D model viewer for project case-study pages with an attached .glb.
// Lazy-loaded client-side only to keep the initial page bundle light.
const ModelViewer = dynamic(() => import("./ModelViewer"), {
  ssr: false,
  loading: () => <div className="h-[420px] animate-pulse rounded-2xl bg-surface" />,
});

export default function ModelViewerCanvas({ url }) {
  if (!url) return null;
  return <ModelViewer url={url} />;
}
