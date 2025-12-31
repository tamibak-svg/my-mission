import { useState, useEffect } from "react";

function App() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");

  // טעינה ראשונית מה־LocalStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // שמירה ל־LocalStorage בכל שינוי
  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const addTask = () => {
    if (input.trim() === "") return;
    setTasks([...tasks, input]);
    setInput("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>אפליקציית משימות</h1>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="כתוב משימה"
      />

      <button onClick={addTask}>הוסף</button>

      <ul>
        {tasks.map((task, index) => (
          <li key={index}>{task}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;