"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";
import DashboardShell from "@/components/layout/DashboardShell";
import ImageUploader from "@/components/ui/ImageUploader";
import { LoadingState } from "@/components/ui/States";
import { api } from "@/lib/apiClient";

const BLOCK_TYPES = ["hero", "aboutStrip", "servicesGrid", "featuredProjects", "processTimeline", "teamPreview", "testimonials", "cta"];

// Blocks whose section renders <SectionVideo> behind its content. Adding a
// type here is only half the job — the section component has to render it too.
const VIDEO_BLOCKS = ["hero", "aboutStrip", "cta"];

const DEFAULT_SCRIM = 0.62;

export default function PageEditorPage() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`pages/${slug}`)
      .catch(() => ({ page: { slug, title: slug, blocks: [], seo: {} } }))
      .then((data) => setPage(data.page));
  }, [slug]);

  function setBlock(index, patch) {
    setPage((p) => {
      const blocks = [...p.blocks];
      blocks[index] = { ...blocks[index], ...patch };
      return { ...p, blocks };
    });
  }

  // Merges into a block's `data` rather than replacing it, so the fields below
  // and the raw JSON editor can coexist without clobbering each other.
  function setBlockData(index, patch) {
    setPage((p) => {
      const blocks = [...p.blocks];
      blocks[index] = { ...blocks[index], data: { ...blocks[index].data, ...patch } };
      return { ...p, blocks };
    });
  }

  function addBlock() {
    setPage((p) => ({
      ...p,
      blocks: [...p.blocks, { type: BLOCK_TYPES[0], order: p.blocks.length, visible: true, data: {} }],
    }));
  }

  function removeBlock(index) {
    setPage((p) => ({ ...p, blocks: p.blocks.filter((_, i) => i !== index) }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await api.put(`pages/${slug}`, {
        title: page.title,
        blocks: page.blocks,
        seo: page.seo,
      });
      setPage(res.page);
      toast.success("Page saved");
    } catch (err) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (!page) {
    return (
      <DashboardShell title="Edit Page">
        <LoadingState />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title={`Edit Page — ${page.title || slug}`} actions={<button onClick={handleSave} disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save"}</button>}>
      <div className="space-y-6">
        <div className="card p-6">
          <label className="label">Page title</label>
          <input className="input" value={page.title || ""} onChange={(e) => setPage((p) => ({ ...p, title: e.target.value }))} />
        </div>

        <div className="space-y-4">
          {page.blocks.map((block, i) => (
            <div key={block._id || i} className="card p-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <select className="input w-auto" value={block.type} onChange={(e) => setBlock(i, { type: e.target.value })}>
                    {BLOCK_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={block.visible} onChange={(e) => setBlock(i, { visible: e.target.checked })} />
                    Visible
                  </label>
                </div>
                <button type="button" onClick={() => removeBlock(i)} className="text-sm text-red-500 hover:underline">
                  Remove block
                </button>
              </div>
              {VIDEO_BLOCKS.includes(block.type) && (
                <div className="mb-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
                  <label className="label">Background video</label>
                  <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                    Plays muted and looping behind this section. Leave empty for no video.
                  </p>

                  <ImageUploader
                    value={block.data?.backgroundVideo || null}
                    onChange={(media) =>
                      setBlockData(i, {
                        backgroundVideo: media
                          ? { ...media, scrim: block.data?.backgroundVideo?.scrim ?? DEFAULT_SCRIM }
                          : null,
                      })
                    }
                    folder="primevista/backgrounds"
                    resourceType="video"
                  />

                  {block.data?.backgroundVideo?.url && (
                    <label className="mt-4 block">
                      <span className="label">
                        Overlay strength — {Math.round((block.data.backgroundVideo.scrim ?? DEFAULT_SCRIM) * 100)}%
                      </span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.02"
                        value={block.data.backgroundVideo.scrim ?? DEFAULT_SCRIM}
                        onChange={(e) =>
                          setBlockData(i, {
                            backgroundVideo: {
                              ...block.data.backgroundVideo,
                              scrim: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full"
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Higher hides more of the video and keeps the text readable.
                      </span>
                    </label>
                  )}
                </div>
              )}

              <label className="label">Block data (JSON)</label>
              <textarea
                className="input font-mono text-xs"
                rows={6}
                value={JSON.stringify(block.data, null, 2)}
                onChange={(e) => {
                  try {
                    setBlock(i, { data: JSON.parse(e.target.value) });
                  } catch {
                    // ignore invalid JSON until it parses again
                  }
                }}
              />
            </div>
          ))}
        </div>

        <button type="button" onClick={addBlock} className="btn-secondary">
          + Add block
        </button>

        <div className="card p-6">
          <h3 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">SEO</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Meta title</label>
              <input
                className="input"
                value={page.seo?.metaTitle || ""}
                onChange={(e) => setPage((p) => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Meta description</label>
              <textarea
                className="input"
                rows={2}
                value={page.seo?.metaDescription || ""}
                onChange={(e) => setPage((p) => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
