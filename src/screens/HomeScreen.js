import { supabase, envStatus } from "../supabaseClient";

export default function HomeScreen({ onWork, onAdmin }) {
  return (
    <div style={{ padding: 40 }}>
      <h1>My Mission</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 260 }}>
        <button onClick={onWork} style={{ padding: 12 }}>
          כניסה / עבודה
        </button>

        <button onClick={onAdmin} style={{ padding: 12 }}>
          ניהול קטגוריות
        </button>
      </div>

      <div style={{ marginTop: 20, fontSize: 12, opacity: 0.8 }}>
        Cloud: {supabase ? "מחובר" : "לא מחובר"} <br />
        ENV URL: {String(envStatus.hasUrl)} | ENV KEY: {String(envStatus.hasKey)}
      </div>
    </div>
  );
}
