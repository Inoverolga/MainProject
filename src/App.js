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
import UniversalItemForm from "./components/form/UniversalItemForm.js";
import UniversalInventoryForm from "./components/form/UniversalInventoryForm.js";

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
                <Route
                  path="/inventory-create"
                  element={
                    <ProtectedRoute>
                      <UniversalInventoryForm mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/inventory-edit/:id"
                  element={
                    <ProtectedRoute>
                      <UniversalInventoryForm mode="edit" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/create-item/:id"
                  element={
                    <ProtectedRoute>
                      <UniversalItemForm mode="create" />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/edit-item/:itemId"
                  element={
                    <ProtectedRoute>
                      <UniversalItemForm mode="edit" />
                    </ProtectedRoute>
                  }
                />
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
      </Routes>
    </>
  );
}

export default App;
