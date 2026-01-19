import { useState } from "react";
import { makeKeyFromLabel } from "../lib/systems";

export default function AdminScreen({ systems, setSystems, onBack }) {
  const [label, setLabel] = useState("");

  const addSystem = () => {
    const clean = label.trim();
    if (!clean) return;

    const key = makeKeyFromLabel(clean);

    // מניעת כפילות
    if (systems.some((s) => s.key === key)) {
      alert("קטגוריה כזו כבר קיימת");
      return;
    }

    setSystems([...systems, { key, label: clean }]);
    setLabel("");
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>ניהול קטגוריות</h2>

      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="שם קטגוריה"
      />
      <button onClick={addSystem}>הוסף</button>

      <ul>
        {systems.map((s) => (
          <li key={s.key}>{s.label}</li>
        ))}
      </ul>

      <button onClick={onBack}>חזרה</button>
    </div>
  );
}
