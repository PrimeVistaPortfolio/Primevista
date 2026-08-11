// Line icons keyed by the Service model's `icon` field (admin-editable).
// Falls back to a neutral mark so an unknown key never renders empty.
const PATHS = {
  code: "M8 6 2 12l6 6M16 6l6 6-6 6",
  browser: "M3 5h18v14H3zM3 9h18",
  mobile: "M7 2h10v20H7zM11 18h2",
  cart: "M3 4h2l2.4 11h10.2L20 7H6M9 20a1 1 0 100-2 1 1 0 000 2zM18 20a1 1 0 100-2 1 1 0 000 2z",
  cloud: "M17 18a4 4 0 000-8 6 6 0 00-11.6 2A3.5 3.5 0 006 18z",
  spark: "M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3",
  chart: "M3 21h18M7 17V9M12 17V5M17 17v-6",
  shield: "M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z",
  layers: "M12 2 2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  pen: "M12 19l7-7-4-4-7 7-1 5zM16 4l4 4",
};

export default function ServiceIcon({ name, className = "h-6 w-6" }) {
  const d = PATHS[name] || PATHS.layers;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}
