import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

// ===== Storage keys =====
const SYSTEMS_KEY = "systemsList";
const SELECTED_KEY = "selectedSystem";

// ===== Defaults =====
const DEFAULT_SYSTEMS = [
  { key: "tasks", label: "משימות" },
  { key: "reminders", label: "תזכורות" },
  { key: "shopping", label: "רכישות" },
  { key: "books", label: "ספרים" },
];

// ===== Helpers =====
function safeJsonParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function makeKeyFromLabel(label) {
  // מתאים בעיקר לאנגלית; בעברית ייצא ריק -> נטפל בזה ע"י fallback
  const key = label
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return key;
}

export default function App() {
  // screens: home / work / admin
  const [mode, setMode] = useState("home");

  // systems (categories)
  const [systems, setSystems] = useState(DEFAULT_SYSTEMS);
  const validKeys = useMemo(() => systems.map((s) => s.key), [systems]);

  // work selection
  const [system, setSystem] = useState(null);
  const [draft, setDraft] = useState(DEFAULT_SYSTEMS[0].key);

  // admin add system
  const [newLabel, setNewLabel] = useState("");

  // items (cloud)
  const [items, setItems] = useState([]);
  const [itemTitle, setItemTitle] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);
  const [cloudError, setCloudError] = useState("");

  const systemLabel =
    system ? systems.find((s) => s.key === system)?.label || system : "";

  // ===== Load systems + selected =====
  useEffect(() => {
    const rawSystems = localStorage.getItem(SYSTEMS_KEY);
    const loadedSystems = rawSystems
      ? safeJsonParse(rawSystems, DEFAULT_SYSTEMS)
      : DEFAULT_SYSTEMS;

    if (Array.isArray(loadedSystems) && loadedSystems.length > 0) {
      setSystems(loadedSystems);
      setDraft(loadedSystems[0].key);
    } else {
      setSystems(DEFAULT_SYSTEMS);
      setDraft(DEFAULT_SYSTEMS[0].key);
    }

    const savedSelected = localStorage.getItem(SELECTED_KEY);
    if (savedSelected) setSystem(savedSelected);
  }, []);

  // save systems list locally
  useEffect(() => {
    localStorage.setItem(SYSTEMS_KEY, JSON.stringify(systems));
  }, [systems]);

  // save selected system locally
  useEffect(() => {
    if (system && validKeys.includes(system)) {
      localStorage.setItem(SELECTED_KEY, system);
    }
  }, [system, validKeys]);

  // ===== Cloud: load items for a system =====
  const loadItemsFromCloud = async (systemKey) => {
    if (!supabase) {
      setCloudError("Supabase לא מוגדר עדיין (ENV חסר).");
      setItems([]);
      return;
    }
    setCloudError("");
    setLoadingItems(true);

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("system_key", systemKey)
      .order("created_at", { ascending: false });

    setLoadingItems(false);

    if (error) {
      console.error("load items error:", error);
      setCloudError(error.message || "שגיאה בטעינת פריטים מהענן");
      setItems([]);
      return;
    }

    setItems(data || []);
  };

  // whenever system changes, load items from cloud
  useEffect(() => {
    if (!system) return;
    if (!validKeys.includes(system)) {
      // selected system became invalid (e.g. category deleted)
      localStorage.removeItem(SELECTED_KEY);
      setSystem(null);
      setItems([]);
      return;
    }
    loadItemsFromCloud(system);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [system]);

  // ===== Actions: navigation =====
  const goHome = () => {
    setMode("home");
    setItemTitle("");
    setNewLabel("");
  };

  const openWork = () => setMode("work");
  const openAdmin = () => setMode("admin");

  // ===== Actions: work =====
  const enterSystem = () => setSystem(draft);

  const leaveSystem = () => {
    localStorage.removeItem(SELECTED_KEY);
    setSystem(null);
    setItems([]);
    setItemTitle("");
  };

  // ===== Actions: admin (systems) =====
  const addSystem = () => {
    const label = newLabel.trim();
    if (!label) return;

    // key from label (if Hebrew -> fallback key)
    let key = makeKeyFromLabel(label);
    if (!key) key = `cat-${Date.now()}`; // fallback for Hebrew names

    if (systems.some((s) => s.key === key)) {
      alert("קטגוריה כזו כבר קיימת.");
      return;
    }

    const updated = [...systems, { key, label }];
    setSystems(updated);
    setDraft(key);
    setNewLabel("");
  };

  const deleteSystem = (key) => {
    if (system === key) {
      alert("אי אפשר למחוק קטגוריה שנמצאת בשימוש. צא ממנה קודם.");
      return;
    }
    setSystems(systems.filter((s) => s.key !== key));
    if (draft === key && systems.length > 1) {
      const next = systems.find((s) => s.key !== key);
      if (next) setDraft(next.key);
    }
  };

  // ===== Actions: cloud items =====
  const addItem = async () => {
    const title = itemTitle.trim();
    if (!title || !system) return;

    if (!supabase) {
      alert("Supabase לא מוגדר עדיין (ENV חסר).");
      return;
    }

    const { data, error } = await supabase
      .from("items")
      .insert([{ system_key: system, title, completed: false }])
      .select("*")
      .single();

    if (error) {
      console.error("add item error:", error);
      alert(error.message || "שגיאה בהוספת פריט לענן");
      return;
    }

    setItems([data, ...items]);
    setItemTitle("");
  };

  const toggleItem = async (id) => {
    if (!supabase) return;

    const current = items.find((it) => it.id === id);
    if (!current) return;

    const { data, error } = await supabase
      .from("items")
      .update({ completed: !current.completed })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      console.error("toggle error:", error);
      alert(error.message || "שגיאה בעדכון פריט");
      return;
    }

    setItems(items.map((it) => (it.id === id ? data : it)));
  };

  const deleteItem = async (id) => {
    if (!supabase) return;

    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) {
      console.error("delete error:", error);
      alert(error.message || "שגיאה במחיקת פריט");
      return;
    }
    setItems(items.filter((it) => it.id !== id));
  };

  // ===== UI =====
  if (mode === "home") {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 520 }}>
        <h1 style={{ marginBottom: 8 }}>My Mission</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>בחר לאן להיכנס</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button onClick={openWork} style={{ padding: 12 }}>
            כניסה / עבודה
          </button>
          <button onClick={openAdmin} style={{ padding: 12 }}>
            ניהול מערכת (קטגוריות)
          </button>
        </div>

        <div style={{ marginTop: 18, fontSize: 12, opacity: 0.75 }}>
          Cloud: {supabase ? "מחובר (Supabase)" : "לא מוגדר עדיין (ENV חסר)"}
        </div>
      </div>
    );
  }

  if (mode === "admin") {
    return (
      <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 680 }}>
        <h1 style={{ marginBottom: 6 }}>ניהול מערכת</h1>
        <p style={{ marginTop: 0, opacity: 0.8 }}>
          כרגע: ניהול קטגוריות (נשמר מקומית). פריטים נשמרים בענן.
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

  // mode === "work"
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

  return (
    <div style={{ padding: 40, fontFamily: "Arial", maxWidth: 720 }}>
      <h1 style={{ marginBottom: 6 }}>קטגוריה: {systemLabel}</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        פריטים נטענים ונשמרים בענן (Supabase) ✅
      </p>

      {cloudError ? (
        <div style={{ padding: 10, border: "1px solid #f99", marginTop: 10 }}>
          ⚠️ {cloudError}
        </div>
      ) : null}

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
        {loadingItems ? (
          <p style={{ opacity: 0.7 }}>טוען פריטים מהענן...</p>
        ) : items.length === 0 ? (
          <p style={{ opacity: 0.7 }}>אין פריטים עדיין.</p>
        ) : (
          <ul style={{ paddingLeft: 18 }}>
            {items.map((it) => (
              <li key={it.id} style={{ marginBottom: 10 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    checked={!!it.completed}
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