import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./page/mainPage/MainPage.js";
import Header from "./components/Header/Header.js";
import { SearchProvider } from "./contexts/SearchContext";
import InventoryPage from "./page/InventoryPage/InventoryPage.js";

function App() {
  return (
    <SearchProvider>
      <Router>
        <div className="container-lg mt-4">
          <Header />
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/inventory/:id" element={<InventoryPage />} />
          </Routes>
        </div>
      </Router>
    </SearchProvider>
  );
}

export default App;
