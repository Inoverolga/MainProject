import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SearchProvider } from "./contexts/SearchContext";
import { AuthProvider } from "./contexts/AuthContext.js";
import { ToastContainer } from "react-toastify";
import MainPage from "./page/mainpage/MainPage.js";
import InventoryPage from "./page/inventorypage/InventoryPage.js";
import RegistrationPage from "./page/registrationpage/RegistrationPage.js";
import Header from "./components/header/Header.js";
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute.js";
import ProfilePage from "./page/profilePage/ProfilePage.js";
import CreateInventoryPage from "./page/createinventorypage/CreateInventoryPage.js";
import EditInventoryPage from "./page/createinventorypage/EditInventoryPage.js";

function App() {
  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={true}
        draggable
        pauseOnHover
      />
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
    </>
  );
}

function WithHeaderLayout() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route path="/inventory/:id" element={<InventoryPage />} />
        <Route
          path="/inventories-create"
          element={
            <ProtectedRoute>
              <CreateInventoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-inventory/:id"
          element={
            <ProtectedRoute>
              <EditInventoryPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
