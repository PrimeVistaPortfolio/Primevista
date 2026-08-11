import ImageUploader from "@/components/ui/ImageUploader";

// Shared SEO tab used across Projects, Services, and (eventually) Pages.
// `keywordHint` surfaces the Service catalog's target keyword when present.
export default function SeoFields({ value, onChange, keywordHint }) {
  const seo = value || {};
  function set(field, v) {
    onChange({ ...seo, [field]: v });
  }

  return (
    <div className="space-y-4">
      {keywordHint && (
        <p className="rounded-lg bg-accent/10 px-3 py-2 text-xs text-accent">
          Target keyword: <span className="font-medium">{keywordHint}</span> — work it naturally into the title,
          description, and body copy without stuffing.
        </p>
      )}
      <div>
        <label className="label">Meta title</label>
        <input
          className="input"
          value={seo.metaTitle || ""}
          onChange={(e) => set("metaTitle", e.target.value)}
          placeholder="Auto-generated from name if left blank"
          maxLength={70}
        />
      </div>
      <div>
        <label className="label">Meta description</label>
        <textarea
          className="input"
          rows={3}
          value={seo.metaDescription || ""}
          onChange={(e) => set("metaDescription", e.target.value)}
          placeholder="Auto-generated if left blank"
          maxLength={200}
        />
      </div>
      <div>
        <label className="label">Canonical URL</label>
        <input className="input" value={seo.canonicalUrl || ""} onChange={(e) => set("canonicalUrl", e.target.value)} />
      </div>
      <div>
        <label className="label">OG image</label>
        <ImageUploader value={seo.ogImage} onChange={(media) => set("ogImage", media)} folder="primevista/seo" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={!!seo.noIndex} onChange={(e) => set("noIndex", e.target.checked)} />
        No-index this page
      </label>
    </div>
  );
}
