import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
      <Router>
        <AuthProvider>
          <SearchProvider>
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
      </Router>
    </>
  );
}

function WithHeaderLayout({ children }) {
  return (
    <>
      <Header />
      {children}
    </>
  );
}

export default App;
