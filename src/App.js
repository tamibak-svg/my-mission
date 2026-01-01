import { useEffect, useState } from "react";

const DEFAULT_SYSTEMS = [
  { key: "tasks", label: "משימות" },
  { key: "reminders", label: "תזכורות" },
  { key: "shopping", label: "רכישות" },
  { key: "books", label: "ספרים" },
];

const SYSTEMS_KEY = "systemsList";
const SELECTED_KEY = "selectedSystem";
const ITEMS_KEY = "itemsList";

function safeJsonParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function App() {
  // מסכים: home / work / admin
  const [mode, setMode] = useState("home");

  // קטגוריות
  const [systems, setSystems] = useState(DEFAULT_SYSTEMS);

  // בחירת קטגוריה לעבודה
  const [system, setSystem] = useState(null);
  const [draft, setDraft] = useState("tasks");

  // ניהול קטגוריות
  const [newLabel, setNewLabel] = useState("");

  // פריטים
  const [items, setItems] = useState([]);
  const [itemTitle, setItemTitle] = useState("");

  const validKeys = systems.map((s) => s.key);

  // טעינה ראשונית
  useEffect(() => {
    // systems
    const rawSystems = localStorage.getItem(SYSTEMS_KEY);
    if (rawSystems) {
      const parsed = safeJsonParse(rawSystems, null);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setSystems(parsed);
        setDraft(parsed[0].key);
      }
    } else {
      setDraft(DEFAULT_SYSTEMS[0].key);
    }

    // selected system
    const savedSelected = localStorage.getItem(SELECTED_KEY);
    if (savedSelected) setSystem(savedSelected);

    // items
    const rawItems = localStorage.getItem(ITEMS_KEY);
    if (rawItems) {
      const parsed = safeJsonParse(rawItems, []);
      if (Array.isArray(parsed)) setItems(parsed);
    }
  }, []);

  // שמירת קטגוריות
  useEffect(() => {
    localStorage.setItem(SYSTEMS_KEY, JSON.stringify(systems));
  }, [systems]);

  // שמירת פריטים
  useEffect(() => {
    localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
  }, [items]);

  // שמירת קטגוריה נבחרת
  useEffect(() => {
    if (system && validKeys.includes(system)) {
      localStorage.setItem(SELECTED_KEY, system);
    }
  }, [system, validKeys]);

  // --- פעולות ---
  const goHome = () => {
    setMode("home");
    setItemTitle("");
    setNewLabel("");
  };

  const openWork = () => setMode("work");
  const openAdmin = () => setMode("admin");

  const enterSystem = () => {
    setSystem(draft);
  };

  const leaveSystem = () => {
    localStorage.removeItem(SELECTED_KEY);
    setSystem(null);
    setItemTitle("");
  };

  const addSystem = () => {
    const label = newLabel.trim();
    if (!label) return;

    const key = label
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-]/g, "");

    if (!key) return;
    if (systems.some((s) => s.key === key)) return;

    const updated = [...systems, { key, label }];
    setSystems(updated);
    setDraft(key);
    setNewLabel("");
  };

  const deleteSystem = (key) => {
    // לא מאפשרים למחוק אם זו הקטגוריה הנבחרת
    if (system === key) {
      alert("אי אפשר למחוק קטגוריה שנמצאת בשימוש. צא ממנה קודם.");
      return;
    }

    // מוחקים גם פריטים של אותה קטגוריה (כדי שלא יישאר “זבל”)
    setItems(items.filter((it) => it.systemKey !== key));
    setSystems(systems.filter((s) => s.key !== key));

    if (draft === key && systems.length > 1) {
      const next = systems.find((s) => s.key !== key);
      if (next) setDraft(next.key);
    }
  };

  const addItem = () => {
    const title = itemTitle.trim();
    if (!title || !system) return;

    const newItem = {
      id: Date.now(),
      systemKey: system,
      title,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setItems([newItem, ...items]);
    setItemTitle("");
  };

  const toggleItem = (id) => {
    setItems(
      items.map((it) =>
        it.id === id ? { ...it, completed: !it.completed } : it
      )
    );
  };

  const deleteItem = (id) => {
    setItems(items.filter((it) => it.id !== id));
  };

  const visibleItems = system ? items.filter((it) => it.systemKey === system) : [];

  const systemLabel = system
    ? systems.find((s) => s.key === system)?.label || system
    : null;

  // ✅ מסך 1: פתיחה
  if (mode === "home") {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 520 }}>
        <h1 style={{ marginBottom: 8 }}>My Mission</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          בחר לאן להיכנס
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={openWork} style={{ padding: 12 }}>
            כניסה / עבודה
          </button>
          <button onClick={openAdmin} style={{ padding: 12 }}>
            ניהול מערכת (קטגוריות ושדות)
          </button>
        </div>
      </div>
    );
  }

  // ✅ מסך 2: עבודה (בחירת קטגוריה + פריטים)
  if (mode === "work") {
    // אם שמור system לא תקין (נמחק), ננקה
    if (system && !validKeys.includes(system)) {
      localStorage.removeItem(SELECTED_KEY);
      setSystem(null);
    }

    // אם עדיין לא בחרנו קטגוריה -> מסך בחירה
    if (!system) {
      return (
        <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 520 }}>
          <h1 style={{ marginBottom: 8 }}>עבודה</h1>
          <p style={{ marginTop: 0, opacity: 0.8 }}>בחר קטגוריה</p>

          <select
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            style={{ padding: 10, width: "100%" }}
          >
            {systems.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          <button
            onClick={enterSystem}
            style={{ marginTop: 10, padding: 10, width: "100%" }}
          >
            כניסה לקטגוריה
          </button>

          <button onClick={goHome} style={{ marginTop: 16 }}>
            חזרה למסך פתיחה
          </button>
        </div>
      );
    }

    // מסך פריטים בתוך קטגוריה
    return (
      <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 680 }}>
        <h1 style={{ marginBottom: 6 }}>קטגוריה: {systemLabel}</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          הוסף פריטים, סמן בוצע, נשמר מקומית ✅
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
          <input
            value={itemTitle}
            onChange={(e) => setItemTitle(e.target.value)}
            placeholder={`הוסף פריט ל: ${systemLabel}`}
            style={{ padding: 10, flex: 1 }}
          />
          <button onClick={addItem} style={{ padding: 10 }}>
            הוסף
          </button>
        </div>

        <div style={{ marginTop: 18 }}>
          {visibleItems.length === 0 ? (
            <p style={{ opacity: 0.7 }}>אין פריטים עדיין.</p>
          ) : (
            <ul style={{ paddingLeft: 18 }}>
              {visibleItems.map((it) => (
                <li key={it.id} style={{ marginBottom: 10 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      type="checkbox"
                      checked={it.completed}
                      onChange={() => toggleItem(it.id)}
                    />
                    <span style={{ textDecoration: it.completed ? "line-through" : "none" }}>
                      {it.title}
                    </span>
                    <button onClick={() => deleteItem(it.id)} style={{ marginLeft: "auto" }}>
                      מחק
                    </button>
                  </label>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
          <button onClick={leaveSystem} style={{ padding: 10 }}>
            החלף קטגוריה
          </button>
          <button onClick={goHome} style={{ padding: 10 }}>
            מסך פתיחה
          </button>
        </div>
      </div>
    );
  }

  // ✅ מסך 3: ניהול מערכת (כרגע קטגוריות)
  if (mode === "admin") {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 680 }}>
        <h1 style={{ marginBottom: 6 }}>ניהול מערכת</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          כרגע: ניהול קטגוריות. בהמשך: ניהול שדות לכל קטגוריה.
        </p>

        <h3 style={{ marginTop: 18, marginBottom: 8 }}>הוסף קטגוריה</h3>
        <input
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder='למשל: "חובות" או "דוחות"'
          style={{ padding: 10, width: "100%", maxWidth: 420 }}
        />
        <div>
          <button onClick={addSystem} style={{ marginTop: 10, padding: 10 }}>
            הוסף
          </button>
        </div>

        <hr style={{ margin: "24px 0" }} />

        <h3 style={{ marginBottom: 10 }}>קטגוריות קיימות</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 520 }}>
          {systems.map((s) => (
            <div
              key={s.key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                border: "1px solid #ddd",
                padding: 10,
                borderRadius: 8,
              }}
            >
              <div style={{ flex: 1 }}>
                <div><b>{s.label}</b></div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>{s.key}</div>
              </div>
              <button onClick={() => deleteSystem(s.key)}>מחק</button>
            </div>
          ))}
        </div>

        <button onClick={goHome} style={{ marginTop: 18, padding: 10 }}>
          חזרה למסך פתיחה
        </button>
      </div>
    );
  }

  // fallback
  return null;
}

export default App;