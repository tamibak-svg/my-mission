import { useState } from "react";

export default function WorkScreen({ systems, onEnter, onBack }) {
  const [draft, setDraft] = useState(systems[0]?.key);

  return (
    <div style={{ padding: 40 }}>
      <h2>בחר קטגוריה</h2>

      <select value={draft} onChange={(e) => setDraft(e.target.value)}>
        {systems.map((s) => (
          <option key={s.key} value={s.key}>
            {s.label}
          </option>
        ))}
      </select>

      <br /><br />
      <button onClick={() => onEnter(draft)}>כניסה</button>
      <br /><br />
      <button onClick={onBack}>חזרה</button>
    </div>
  );
}
