import { useContext } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { AuthContext } from "../../contexts/AuthContext";
import { useLocation } from "react-router-dom";

const Header = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const { isAuthenticated, authUser, loading } = useContext(AuthContext);
  const location = useLocation();

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value.toLowerCase());
  };

  const isHomePage = location.pathname === "/";

  return (
    <nav className="navbar bg-body-tertiary sticky-top">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">
          🗃️ Система управления запасами
        </span>

        {isAuthenticated && !isHomePage ? (
          <div className="text-muted">Здравствуйте, {authUser?.name}</div>
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
              placeholder="Поиск..."
              aria-label="Search"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </form>
      </div>
    </nav>
  );
};

export default Header;
