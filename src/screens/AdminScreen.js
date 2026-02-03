import { useState } from "react";
import { supabase } from "../supabaseClient";

export default function AdminScreen({ systems, setSystems, onBack }) {
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const addSystem = async () => {
    const clean = label.trim();
    if (!clean) return;

    if (!supabase) {
      alert("Supabase לא מוגדר (ENV חסר).");
      return;
    }

    // מניעת כפילות לפי שם (תואם ל-unique index ב-DB)
    const exists = systems.some(
      (s) => (s.label || "").trim().toLowerCase() === clean.toLowerCase()
    );
    if (exists) {
      alert("קטגוריה כזו כבר קיימת.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("systems")
      .insert([{ label: clean }])
      .select("id,label,created_at")
      .single();

    setSaving(false);

    if (error) {
      alert(error.message || "שגיאה ביצירת קטגוריה");
      return;
    }

    setSystems([...systems, data]);
    setLabel("");
  };

  const deleteSystem = async (id) => {
    if (!supabase) {
      alert("Supabase לא מוגדר (ENV חסר).");
      return;
    }

    const ok = window.confirm(
      "למחוק קטגוריה? אם יש פריטים משויכים – המחיקה תיכשל."
    );
    if (!ok) return;

    const { error } = await supabase.from("systems").delete().eq("id", id);

    if (error) {
      alert(error.message || "שגיאה במחיקת קטגוריה");
      return;
    }

    setSystems(systems.filter((s) => s.id !== id));
  };

  return (
    <div style={{ padding: 40, maxWidth: 720 }}>
      <h2 style={{ marginTop: 0 }}>ניהול קטגוריות</h2>

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder='למשל: "גינון"'
          style={{ padding: 10, flex: 1 }}
        />
        <button onClick={addSystem} disabled={saving} style={{ padding: 10 }}>
          {saving ? "שומר..." : "הוסף"}
        </button>
      </div>

      <hr style={{ margin: "20px 0" }} />

      <h3 style={{ marginTop: 0 }}>קטגוריות קיימות</h3>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {systems.map((s) => (
          <div
            key={s.id}
            style={{
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{s.label}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>id: {s.id}</div>
            </div>

            <button
              onClick={() => deleteSystem(s.id)}
              style={{ padding: "8px 10px" }}
            >
              מחק
            </button>
          </div>
        ))}
      </div>

      <button onClick={onBack} style={{ marginTop: 18, padding: 10 }}>
        חזרה
      </button>
    </div>
  );
}