import { useContext } from "react";
import { SearchContext } from "../../contexts/SearchContext";

const Header = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value.toLowerCase());
  };

  return (
    <nav className="navbar bg-body-tertiary">
      <div className="container-fluid">
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
