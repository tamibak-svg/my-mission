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

      <p>
     ENV URL: {String(process.env.REACT_APP_SUPABASE_URL ? true : false)} | ENV KEY:{" "}
      {String(process.env.REACT_APP_SUPABASE_ANON_KEY ? true : false)}
    </p>
<p>
  VERCEL_ENV: {process.env.VERCEL_ENV || "n/a"} | VERCEL_URL:{" "}
  {process.env.VERCEL_URL || "n/a"}
</p>

<p>
  HAS_ANON_KEY: {String(Boolean(process.env.REACT_APP_SUPABASE_ANON_KEY))}
</p>

      <pre>{JSON.stringify(rows, null, 2)}</pre>
    </div>

    
  );
}
