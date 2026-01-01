import { useEffect, useState } from "react";

const SYSTEMS = [
  { key: "tasks", label: "משימות" },
  { key: "reminders", label: "תזכורות" },
  { key: "shopping", label: "רכישות" },
  { key: "books", label: "ספרים" },
];

const STORAGE_KEY = "selectedSystem";

function App() {
  const [system, setSystem] = useState(null);
  const validKeys = SYSTEMS.map((s) => s.key);

  // טעינה פעם אחת
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && validKeys.includes(saved)) {
      setSystem(saved);
    }
  }, []);

  // שמירה רק אם הערך תקין
  useEffect(() => {
    if (system && validKeys.includes(system)) {
      localStorage.setItem(STORAGE_KEY, system);
    }
  }, [system]);

  const goBack = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSystem(null);
  };

  if (!system) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial" }}>
        <h1>My Mission</h1>
        <p>בחר מערכת:</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 240 }}>
          {SYSTEMS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSystem(s.key)}
              style={{ padding: 10 }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>
      <h1>מערכת: {system}</h1>
      <p>רענון דף אמור להשאיר אותך פה ✅</p>

      <button onClick={goBack} style={{ padding: 10 }}>
        חזרה
      </button>
    </div>
  );
}

export default App;