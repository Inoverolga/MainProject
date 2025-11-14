import { useContext } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { AuthContext } from "../../contexts/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import AdminPanel from "../admin/AdminPanel.js";
import LanguageToggle from "../../components/ui/LanguageToggle.js";
import ThemeToggle from "../ui/ThemeToggle";

const Header = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const { isAuthenticated, authUser, logout, isAdmin } =
    useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const isHomePage = location.pathname === "/";
  const isAdminPage = location.pathname === "/admin";
  const isInventoryPage = location.pathname.startsWith("/inventory/");
  const isProfilePage = location.pathname === "/profile";

  const handleAdminClick = () => {
    if (!isAdmin) {
      toast.error(t("noAdminRights"));
      return;
    }
    navigate("/");
  };

  return (
    <nav className="navbar bg-body-tertiary sticky-top">
      <div className="container-fluid ">
        <div
          className="d-flex align-items-center "
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/")}
        >
          <img
            src="/logo.png"
            data-tooltip={t("toMainPage")}
            alt="Логотип системы управления запасами"
            style={{
              height: "40px",
              width: "auto",
              maxWidth: "120px",
              objectFit: "contain",
              marginRight: "2px",
            }}
          />
          <span className="navbar-brand  fs-6">{t("appName")}</span>
        </div>

        {isAuthenticated && !isHomePage ? (
          <div className="text-muted">
            {t("hello")}, {authUser?.name}
          </div>
        ) : null}

        <form
          className="d-flex"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="input-group">
            <span className="input-group-text">🔍</span>
            <input
              className="form-control me-2"
              type="search"
              placeholder={t("search")}
              aria-label="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </form>
        <LanguageToggle />
        <ThemeToggle />
        <div className="d-flex gap-2">
          {isAuthenticated &&
            !isAdminPage &&
            !isInventoryPage &&
            !isProfilePage &&
            !isAdmin && (
              <button
                className="btn btn-outline-secondary"
                onClick={() => navigate("/profile")}
                style={{ cursor: "pointer" }}
              >
                {t("enterPersonalAccount")}
              </button>
            )}
          {isAuthenticated && isAdmin && !isAdminPage && (
            <>
              {isHomePage ? (
                <AdminPanel currentInventoryId={null} />
              ) : isProfilePage || isInventoryPage ? (
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => navigate(-1)}
                >
                  ← {t("back")}
                </button>
              ) : (
                <div className="custom-tooltip-container">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={handleAdminClick}
                  >
                    🛡️ {t("enterAsAdmin")}
                  </button>
                </div>
              )}
            </>
          )}

          {isAdminPage && (
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => navigate(-1)}
            >
              ← {t("back")}
            </button>
          )}

          {isAuthenticated && !isAdmin && isProfilePage && (
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/")}
            >
              ←{t("back")}
            </button>
          )}

          {isAuthenticated ? (
            <button className="btn btn-outline-secondary" onClick={logout}>
              <i className="bi bi-box-arrow-right me-2"></i>
              {t("logout")}
            </button>
          ) : null}
        </div>
      </div>
    </nav>
  );
};

export default Header;
