import { useEffect, useState } from "react";

const SYSTEMS = [
  { key: "tasks", label: "משימות" },
  { key: "reminders", label: "תזכורות" },
  { key: "shopping", label: "רכישות" },
  { key: "books", label: "ספרים" },
];

const STORAGE_KEY = "selectedSystem";

function App() {
  const validKeys = SYSTEMS.map((s) => s.key);

  const [system, setSystem] = useState(null);        // המערכת שנכנסנו אליה
  const [draft, setDraft] = useState("tasks");       // הבחירה בדרופדאון לפני כניסה

  // טעינה מה־LocalStorage (אם כבר נכנסנו בעבר)
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && validKeys.includes(saved)) {
      setSystem(saved);
    }
  }, []);

  // שמירה ל־LocalStorage כשנכנסים
  useEffect(() => {
    if (system && validKeys.includes(system)) {
      localStorage.setItem(STORAGE_KEY, system);
    }
  }, [system]);

  const enterSystem = () => {
    setSystem(draft);
  };

  const goBack = () => {
    localStorage.removeItem(STORAGE_KEY);
    setSystem(null);
  };

  // מסך בחירה (לפני כניסה)
  if (!system) {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 420 }}>
        <h1 style={{ marginBottom: 8 }}>My Mission</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>בחר מערכת וכניסה</p>

        <label style={{ display: "block", marginTop: 20, marginBottom: 8 }}>
          מערכת:
        </label>

        <select
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          style={{ padding: 10, width: "100%" }}
        >
          {SYSTEMS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>

        <button
          onClick={enterSystem}
          style={{ marginTop: 14, padding: 10, width: "100%" }}
        >
          כניסה
        </button>
      </div>
    );
  }

  // מסך מערכת (אחרי כניסה)
  const systemLabel = SYSTEMS.find((s) => s.key === system)?.label || system;

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 520 }}>
      <h1 style={{ marginBottom: 8 }}>מערכת: {systemLabel}</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        כאן נבנה את המערכת בהמשך (משימות/רכישות וכו)
      </p>

      <button onClick={goBack} style={{ padding: 10 }}>
        חזרה
      </button>
    </div>
  );
}

export default App;