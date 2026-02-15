import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ItemForm from "./ItemForm";
import ItemsList from "./ItemsList";

export default function ItemsPage({ systemId, systemLabel, onBack, onHome }) {
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [openItem, setOpenItem] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    const load = async () => {
      setErrorMsg("");

      if (!supabase) {
        setErrorMsg("Supabase לא מחובר (ENV חסר).");
        return;
      }

      if (!systemId || Number.isNaN(Number(systemId))) {
        setItems([]);
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("system_id", systemId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(error);
        setErrorMsg(error.message);
        setItems([]);
        return;
      }

      setItems(data || []);
    };

    load();
  }, [systemId]);

  const open = (it) => {
    setOpenItem(it);
    setEditTitle(it.title || "");
  };

  const saveTitle = async () => {
    if (!openItem) return;
    const clean = editTitle.trim();
    if (!clean) return;

    const { data, error } = await supabase
      .from("items")
      .update({ title: clean })
      .eq("id", openItem.id)
      .select("*")
      .single();

    if (error) {
      alert(error.message || "שגיאה בשמירה");
      return;
    }

    setItems((prev) => prev.map((x) => (x.id === data.id ? data : x)));
    setOpenItem(data);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>{systemLabel || "קטגוריה"}</h2>

      {errorMsg ? (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #f99" }}>
          ⚠️ {errorMsg}
        </div>
      ) : null}

      <ItemForm
        systemId={systemId}
        onAdd={(item) => setItems((p) => [item, ...p])}
      />

      {/* “כניסה למשימה” */}
      <ItemsList items={items} onOpen={open} />

      {/* פאנל פרטים/עריכה */}
      {openItem ? (
        <div
          style={{
            marginTop: 18,
            padding: 12,
            border: "1px solid #ddd",
            borderRadius: 10,
            maxWidth: 720,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 8 }}>פרטי משימה</div>
          <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 10 }}>
            id: {openItem.id} • נוצר: {openItem.created_at || "—"}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ padding: 10, flex: 1 }}
            />
            <button onClick={saveTitle} style={{ padding: 10 }}>
              שמור
            </button>
            <button onClick={() => setOpenItem(null)} style={{ padding: 10 }}>
              סגור
            </button>
          </div>
        </div>
      ) : null}

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button onClick={onBack}>החלף קטגוריה</button>
        <button onClick={onHome}>בית</button>
      </div>
    </div>
  );
}
