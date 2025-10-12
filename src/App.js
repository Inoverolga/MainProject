import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";

function App() {
  const [serverStatus, setServerStatus] = useState(
    "Checking server connection..."
  );

  useEffect(() => {
    // Запрос к вашему работающему бэкенду
    fetch("https://mainproject-back.onrender.com/")
      .then((response) => response.json())
      .then((data) => {
        setServerStatus(`✅ Server connected: ${data.message}`);
      })
      .catch((error) => {
        setServerStatus(`❌ Server error: ${error.message}`);
      });
  }, []);
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <div>Hello World!</div>
              <p>{serverStatus}</p>
            </>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
