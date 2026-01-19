import { useMemo, useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import WorkScreen from "./screens/WorkScreen";
import AdminScreen from "./screens/AdminScreen";
import ItemsPage from "./features/items/ItemsPage";
import { DEFAULT_SYSTEMS } from "./lib/systems";
console.log({ HomeScreen, WorkScreen, AdminScreen, ItemsPage });

export default function App() {
  const [mode, setMode] = useState("home"); // home | work | admin | items
  const [systems, setSystems] = useState(DEFAULT_SYSTEMS);
  const [systemKey, setSystemKey] = useState(null);

  const systemLabel = useMemo(
    () => systems.find((s) => s.key === systemKey)?.label || "",
    [systems, systemKey]
  );

  if (mode === "home") {
    return (
      <HomeScreen
        onWork={() => setMode("work")}
        onAdmin={() => setMode("admin")}
      />
    );
  }

  if (mode === "admin") {
    return (
      <AdminScreen
        systems={systems}
        setSystems={setSystems}
        onBack={() => setMode("home")}
      />
    );
  }

  if (mode === "work") {
    return (
      <WorkScreen
        systems={systems}
        onBack={() => setMode("home")}
        onEnter={(key) => {
          setSystemKey(key);
          setMode("items");
        }}
      />
    );
  }

  return (
    <ItemsPage
      systemKey={systemKey}
      systemLabel={systemLabel}
      onBack={() => setMode("work")}
      onHome={() => setMode("home")}
    />
  );
}
