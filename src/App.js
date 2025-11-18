import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useContext } from "react";
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
import AdminPage from "./page/adminpage/AdminPage.js";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "./contexts/ThemeContext.js";
import SupportModal from "./components/powerautomate/SupportModal.js";
import { AuthContext } from "./contexts/AuthContext.js";
import "./i18n.js";

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
      <Router>
        <ThemeProvider>
          <AuthProvider>
            <SearchProvider>
              <div className="container-lg mt-4">
                <Routes>
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute>
                        <WithHeaderLayout>
                          <AdminPage />
                        </WithHeaderLayout>
                      </ProtectedRoute>
                    }
                  />
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
                  <Route
                    path="/"
                    element={
                      <WithHeaderLayout>
                        <MainPage />
                      </WithHeaderLayout>
                    }
                  />

                  <Route
                    path="/inventory/:id"
                    element={
                      <WithHeaderLayout>
                        <InventoryPage />
                      </WithHeaderLayout>
                    }
                  />

                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <WithHeaderLayout>
                          <ProfilePage />
                        </WithHeaderLayout>
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </div>
            </SearchProvider>
          </AuthProvider>
        </ThemeProvider>
      </Router>
    </>
  );
}

function WithHeaderLayout({ children }) {
  const [showSupport, setShowSupport] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);
  const { t } = useTranslation();

  return (
    <>
      <Header />
      {children}

      {isAuthenticated && (
        <div className="position-fixed bottom-0 end-0 m-3">
          <button
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
            onClick={() => setShowSupport(true)}
            style={{
              borderRadius: "20px",
              padding: "8px 16px",
              fontSize: "14px",
            }}
          >
            <span>❓</span>
            {t("createSupportRequest")}
          </button>
        </div>
      )}

      <SupportModal
        show={showSupport}
        onHide={() => setShowSupport(false)}
        currentPage={window.location.pathname}
      />
    </>
  );
}

export default App;
