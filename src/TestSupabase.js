import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

export default function TestSupabase() {
  const [status, setStatus] = useState("בודק...");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    const test = async () => {
      if (!supabase) {
        setStatus("❌ Supabase לא מאותחל");
        return;
      }

      const { data, error } = await supabase
        .from("items")
        .select("*")
        .limit(3);

      if (error) {
        setStatus("❌ שגיאה: " + error.message);
      } else {
        setStatus("✅ מחובר לענן");
        setRows(data || []);
      }
    };

    test();
  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h2>בדיקת Supabase</h2>
      <p>{status}</p>
      <pre>{JSON.stringify(rows, null, 2)}</pre>
    </div>
  );
}
