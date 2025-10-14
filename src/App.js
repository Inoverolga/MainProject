import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./page/mainPage/MainPage.js";
import InventoryPage from "./page/inventoryPage/InventoryPage.js";
import Header from "./components/Header/Header.js";
import { SearchProvider } from "./contexts/SearchContext";
import RegistrationPage from "./page/registrationPage/RegistrationPage.js";

function App() {
  return (
    <SearchProvider>
      <Router>
        <div className="container-lg mt-4">
          <Routes>
            <Route path="/auth/register" element={<RegistrationPage />} />
            <Route
              path="*"
              element={
                <>
                  <Header />
                  <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/inventory/:id" element={<InventoryPage />} />
                  </Routes>
                </>
              }
            />
          </Routes>
        </div>
      </Router>
    </SearchProvider>
  );
}

export default App;
