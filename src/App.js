import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

import HomeScreen from "./screens/HomeScreen";
import WorkScreen from "./screens/WorkScreen";
import AdminScreen from "./screens/AdminScreen";
import ItemsPage from "./features/items/ItemsPage";

export default function App() {
  // home | work | admin | items
  const [mode, setMode] = useState("home");

  // systems from DB: { id, label, created_at }
  const [systems, setSystems] = useState([]);

  // selected system id
  const [selectedSystemId, setSelectedSystemId] = useState(null);

  const selectedSystem = useMemo(
    () => systems.find((s) => s.id === selectedSystemId) || null,
    [systems, selectedSystemId]
  );

  useEffect(() => {
    const loadSystems = async () => {
      if (!supabase) {
        console.error("Supabase client missing (ENV?)");
        setSystems([]);
        return;
      }

      const { data, error } = await supabase
        .from("systems")
        .select("id,label,created_at")
        .order("id", { ascending: true });

      if (error) {
        console.error("load systems error:", error);
        setSystems([]);
        return;
      }

      setSystems(data || []);
    };

    loadSystems();
  }, []);

  const goHome = () => {
    setMode("home");
    setSelectedSystemId(null);
  };

  const openWork = () => setMode("work");
  const openAdmin = () => setMode("admin");

  const openItems = (systemId) => {
    setSelectedSystemId(systemId);
    setMode("items");
  };

  if (mode === "home") {
    return <HomeScreen onWork={openWork} onAdmin={openAdmin} />;
  }

  if (mode === "admin") {
    return (
      <AdminScreen systems={systems} setSystems={setSystems} onBack={goHome} />
    );
  }

  if (mode === "work") {
    return <WorkScreen systems={systems} onSelect={openItems} onBack={goHome} />;
  }

  if (mode === "items" && selectedSystem) {
    return (
      <ItemsPage
        systemId={selectedSystem.id}
        systemLabel={selectedSystem.label}
        onBack={() => setMode("work")}
        onHome={goHome}
      />
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h2>שגיאה בניווט</h2>
      <button onClick={goHome}>חזרה למסך פתיחה</button>
    </div>
  );
}
