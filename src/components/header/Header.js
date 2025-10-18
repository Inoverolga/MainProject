import { useContext } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { AuthContext } from "../../contexts/AuthContext";

const Header = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const { isAuthenticated, authUser } = useContext(AuthContext);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value.toLowerCase());
  };

  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container-fluid">
        <span className="navbar-brand fw-bold">
          <i className="bi bi-inboxes me-2"></i>
          Система управления запасами
        </span>

        {isAuthenticated ? (
          <div className="text-muted">Здравствуйте, {authUser?.name}</div>
        ) : null}

        <form
          className="d-flex"
          role="search"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="form-control me-2"
            type="search"
            placeholder="Поиск..."
            aria-label="Search"
            value={searchTerm}
            onChange={handleSearch}
          />
        </form>
      </div>
    </nav>
  );
};

export default Header;
