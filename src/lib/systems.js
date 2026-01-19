export const DEFAULT_SYSTEMS = [
  { key: "tasks", label: "משימות" },
  { key: "reminders", label: "תזכורות" },
  { key: "shopping", label: "רכישות" },
  { key: "books", label: "ספרים" },
];

export function makeKeyFromLabel(label) {
  const key = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return key || `cat-${Date.now()}`;
}
