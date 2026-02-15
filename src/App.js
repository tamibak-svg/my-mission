import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import HomeScreen from "./screens/HomeScreen";
import WorkScreen from "./screens/WorkScreen";
import ItemsPage from "./features/items/ItemsPage";

export default function App() {
  const [mode, setMode] = useState("home"); // home | work | items
  const [systems, setSystems] = useState([]);
  const [countsBySystemId, setCountsBySystemId] = useState({});
  const [currentSystemId, setCurrentSystemId] = useState(null);
  const [currentSystemLabel, setCurrentSystemLabel] = useState("");

  useEffect(() => {
    loadSystems();
  }, []);

  async function loadSystems() {
    if (!supabase) return;

    // 1️⃣ טען systems
    const { data, error } = await supabase
      .from("systems")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Systems load error:", error);
      return;
    }

    setSystems(data || []);

    // 2️⃣ טען ספירת משימות פתוחות לכל system
    const { data: itemsData, error: itemsErr } = await supabase
      .from("items")
      .select("system_id, completed, is_deleted");

    if (itemsErr) {
      console.error("Items count error:", itemsErr);
      return;
    }

    const map = {};
    for (const row of itemsData || []) {
      if (row.is_deleted) continue;
      if (row.completed) continue;
      map[row.system_id] = (map[row.system_id] || 0) + 1;
    }

    setCountsBySystemId(map);
  }

  function goHome() {
    setMode("home");
  }

  function goWork() {
    setMode("work");
  }

  function openItems(systemId) {
    const system = systems.find((s) => s.id === systemId);
    setCurrentSystemId(systemId);
    setCurrentSystemLabel(system?.label || "");
    setMode("items");
  }

  if (mode === "home") {
    return <HomeScreen onWork={goWork} />;
  }

  if (mode === "work") {
    return (
      <WorkScreen
        systems={systems}
        countsBySystemId={countsBySystemId}
        onSelect={openItems}
        onBack={goHome}
      />
    );
  }

  if (mode === "items") {
    return (
      <ItemsPage
        systemId={currentSystemId}
        systemLabel={currentSystemLabel}
        onBack={goWork}
        onHome={goHome}
      />
    );
  }

  return null;
}
