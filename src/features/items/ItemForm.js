import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ItemForm({ systemId, onAdd }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    const clean = title.trim();
    if (!clean) return;

    if (!supabase) {
      alert("Supabase לא מחובר (ENV חסר).");
      return;
    }

    if (!systemId || Number.isNaN(Number(systemId))) {
      alert("אין קטגוריה פעילה (systemId חסר).");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("items")
      .insert([{ system_id: systemId, title: clean }])
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      console.error("insert item error:", error);
      alert(error.message || "שגיאה בהוספת פריט");
      return;
    }

    onAdd?.(data);
    setTitle("");
  };

  return (
    <div style={{ display: "flex", gap: 10, margin: "12px 0" }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`הוסף פריט ל: ${systemId}`}
        style={{ padding: 10, flex: 1 }}
      />
      <button onClick={add} disabled={saving} style={{ padding: 10 }}>
        {saving ? "שומר..." : "הוסף"}
      </button>
    </div>
  );
}
