import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./page/mainPage/MainPage.js";
import InventoryPage from "./page/inventoryPage/InventoryPage.js";
import Header from "./components/Header/Header.js";
import { SearchProvider } from "./contexts/SearchContext";
import { AuthProvider } from "./contexts/AuthContext.js";
import RegistrationPage from "./page/registrationPage/RegistrationPage.js";
//import ProtectedRoute from "./components/protectedRoute/ProtectedRoute.js";

function App() {
  return (
    <AuthProvider>
      <SearchProvider>
        <Router>
          <div className="container-lg mt-4">
            <Routes>
              <Route path="/auth/register" element={<RegistrationPage />} />
              <Route path="*" element={<WithHeaderLayout />} />
            </Routes>
          </div>
        </Router>
      </SearchProvider>
    </AuthProvider>
  );
}

function WithHeaderLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/inventory/:id" element={<InventoryPage />} />
        {/* <Route
          path="/create-inventory"
          element={
            <ProtectedRoute>
              <CreateInventoryPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        /> */}
      </Routes>
    </>
  );
}

export default App;
