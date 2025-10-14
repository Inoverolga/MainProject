import { HashRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./page/mainpage/MainPage.js";
import InventoryPage from "./page/inventorypage/InventoryPage.js";
import RegistrationPage from "./page/registrationpage/RegistrationPage.js";
import Header from "./components/header/Header.js";
import { SearchProvider } from "./contexts/SearchContext";

function App() {
  return (
    <SearchProvider>
      <Router>
        <div className="container-lg mt-4">
          <Routes>
            <Route path="/auth/register" element={<RegistrationPage />} />
            <Route
              path="/"
              element={
                <>
                  <Header />
                  <MainPage />
                </>
              }
            />

            <Route
              path="/inventory/:id"
              element={
                <>
                  <Header />
                  <InventoryPage />
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
