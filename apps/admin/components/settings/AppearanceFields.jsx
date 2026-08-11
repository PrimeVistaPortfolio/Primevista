"use client";

/**
 * Light/dark control for the public site.
 *
 * `baseTheme` is the ground everything sits on; each region can follow it
 * ("Auto") or override it. The region list comes from the API rather than being
 * hardcoded here, so adding a themeable region on the server surfaces it in this
 * form automatically.
 */

const MODE_OPTIONS = [
  { value: "inherit", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function Segmented({ options, value, onChange, name }) {
  return (
    <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            aria-label={`${name}: ${option.label}`}
            onClick={() => onChange(option.value)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              active
                ? "bg-accent text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

/** Shows what a region actually resolves to, so "Auto" isn't guesswork. */
function ResolvedSwatch({ theme }) {
  return (
    <span
      title={`Renders ${theme}`}
      className={`inline-block h-3 w-3 shrink-0 rounded-full border ${
        theme === "light" ? "border-slate-300 bg-slate-100" : "border-slate-700 bg-slate-900"
      }`}
    />
  );
}

export default function AppearanceFields({ baseTheme, sectionThemes, meta, onChange }) {
  const regions = meta?.regions || [];
  const defaults = meta?.defaults || {};

  // An empty map means "never configured", which the site renders using the
  // designed defaults — so that's what the form has to show too.
  const saved = sectionThemes && Object.keys(sectionThemes).length ? sectionThemes : defaults;
  const base = baseTheme === "light" ? "light" : "dark";

  function setRegion(key, mode) {
    // Always write the complete map, so a saved arrangement is unambiguous
    // rather than half-defaults.
    const next = {};
    regions.forEach((region) => {
      next[region.key] = saved[region.key] || "inherit";
    });
    next[key] = mode;
    onChange("sectionThemes", next);
  }

  function resetToDefaults() {
    const next = {};
    regions.forEach((region) => {
      next[region.key] = defaults[region.key] || "inherit";
    });
    onChange("sectionThemes", next);
  }

  const groups = regions.reduce((acc, region) => {
    (acc[region.group] = acc[region.group] || []).push(region);
    return acc;
  }, {});

  return (
    <div className="card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Appearance</h2>
        <button type="button" onClick={resetToDefaults} className="text-xs text-accent hover:underline">
          Reset to defaults
        </button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div>
          <p className="text-sm font-medium">Base theme</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The site-wide ground. Every region set to Auto follows it.
          </p>
        </div>
        <Segmented
          name="Base theme"
          options={[
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ]}
          value={base}
          onChange={(value) => onChange("baseTheme", value)}
        />
      </div>

      <div className="mt-6 space-y-6">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
            <div className="divide-y divide-slate-200 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-800">
              {items.map((region) => {
                const mode = saved[region.key] || "inherit";
                const resolved = mode === "inherit" ? base : mode;
                return (
                  <div key={region.key} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <span className="flex items-center gap-2 text-sm">
                      <ResolvedSwatch theme={resolved} />
                      {region.label}
                    </span>
                    <Segmented
                      name={region.label}
                      options={MODE_OPTIONS}
                      value={mode}
                      onChange={(value) => setRegion(region.key, value)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
