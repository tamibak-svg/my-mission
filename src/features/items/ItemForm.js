import { useState } from "react";
import { supabase } from "../../supabaseClient";

export default function ItemForm({ systemKey, onAdd }) {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    const clean = title.trim();
    if (!clean) return;

    if (!systemKey) {
      alert("אין קטגוריה (systemKey). צא ובחר קטגוריה מחדש.");
      return;
    }

    if (!supabase) {
      alert("Supabase לא מחובר (ENV חסר).");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("items")
      .insert([{ title: clean, system_key: systemKey, completed: false }])
      .select("*")
      .single();

    setSaving(false);

    if (error) {
      console.error("insert error:", error);
      alert(error.message || "שגיאה בשמירה לענן");
      return;
    }

    onAdd?.(data);
    setTitle("");
  };

  return (
    <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="משימה חדשה"
        style={{ padding: 10, flex: 1 }}
      />
      <button onClick={submit} disabled={saving} style={{ padding: 10 }}>
        {saving ? "שומר..." : "הוסף"}
      </button>
    </div>
  );
}