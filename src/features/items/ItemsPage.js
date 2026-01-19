import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import ItemForm from "./ItemForm";
import ItemsList from "./ItemsList";

export default function ItemsPage({ systemKey, systemLabel, onBack, onHome }) {
  const [items, setItems] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setErrorMsg("");
      if (!supabase) {
        setErrorMsg("Supabase לא מחובר (ENV חסר).");
        return;
      }
      if (!systemKey) return;

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .eq("system_key", systemKey)
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
  }, [systemKey]);

  return (
    <div style={{ padding: 40 }}>
      <h2>{systemLabel || "קטגוריה"}</h2>

      {errorMsg ? (
        <div style={{ marginTop: 10, padding: 10, border: "1px solid #f99" }}>
          ⚠️ {errorMsg}
        </div>
        
      ) : null}
<div style={{ fontSize: 12, opacity: 0.7 }}>
  debug: systemKey = {String(systemKey)}
</div>

      <ItemForm systemKey={systemKey} onAdd={(item) => setItems((p) => [item, ...p])} />
      <ItemsList items={items} />

      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button onClick={onBack}>החלף קטגוריה</button>
        <button onClick={onHome}>בית</button>
      </div>
    </div>
  );
}
