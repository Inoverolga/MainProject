import useSWR from "swr";
import { fetchInventoriesPublic, fetchTags } from "../../service/api";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "../../hooks/search/useGlobalSearch.js";
import { AuthContext } from "../../contexts/AuthContext.js";
import { LoginForm } from "../../components/loginForm/LoginForm.js";
import Error from "../../components/error/Error.js";

const InventoryTable = ({
  title,
  data,
  showItemCount = false,
  className = "",
}) => {
  const navigate = useNavigate();

  if (!data?.length) return null;

  return (
    <div className={className}>
      <h5 className="mb-3">{title}</h5>
      <table className="table table-hover">
        <thead>
          <tr>
            <th>Наименование инвентаря</th>
            <th>Описание</th>
            <th>Создатель</th>
            {showItemCount && <th className="text-center">Товаров</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => navigate(`/inventory/${item.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td className="fw-semibold">{item.name}</td>
              <td>{item.description || "-"}</td>
              <td>{item.user?.name || "-"}</td>
              {showItemCount && (
                <td className="text-center">
                  <span>{item._count?.items || 0}</span>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TagCloud = ({ tags, onTagClick }) => {
  if (!tags?.length) return null;

  return (
    <div className="mt-4 mb-4">
      <div className="d-flex align-items-baseline gap-3">
        <div className="d-flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="badge bg-secondary rounded-pill px-3"
              onClick={() => onTagClick(tag)}
              style={{ cursor: "pointer" }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

const MainPage = () => {
  const { isAuthenticated, authUser } = useContext(AuthContext);
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const [normalPage, setNormalPage] = useState(0);

  const { data: popularInventories = [], error: popularError } = useSWR(
    !searchTerm ? "/inventories/public?type=popular" : null,
    fetchInventoriesPublic,
    { revalidateOnFocus: false }
  );

  const { data: recentInventories = [], error: recentError } = useSWR(
    !searchTerm ? "/inventories/public?type=recent" : null,
    fetchInventoriesPublic,
    { revalidateOnFocus: false }
  );

  const { data: tags, error: tagsError } = useSWR(`/tags`, fetchTags, {
    revalidateOnFocus: false,
  });

  const { searchResults, pagination, currentPage, goToNextPage, goToPrevPage } =
    useGlobalSearch("global");

  const itemsPerPage = 10;
  const startIndex = normalPage * itemsPerPage;
  const paginatedInventories = recentInventories.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(recentInventories.length / itemsPerPage);

  useEffect(() => {
    setNormalPage(0);
  }, [searchTerm]);

  const error = popularError || recentError || tagsError;
  if (error) return <Error message={`Ошибка загрузки: ${error.message}`} />;

  return (
    <div className="container-fluid">
      <TagCloud tags={tags} onTagClick={setSearchTerm} />
      {!isAuthenticated && <LoginForm />}

      {isAuthenticated && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title text-center">
              Добро пожаловать, {authUser.name}!
              {authUser.isAdmin && (
                <span className="badge bg-danger ms-2">Администратор</span>
              )}
            </h5>
            <p className="card-text text-center">
              Вы находитесь на главной странице системы
            </p>
          </div>
        </div>
      )}
      {searchTerm ? (
        <div>
          <InventoryTable data={searchResults} showItemCount={true} />

          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button onClick={goToPrevPage} disabled={currentPage === 1}>
                ← Назад
              </button>
              <span>
                Страница {currentPage} из {pagination.totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= pagination.totalPages}
              >
                Вперед →
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {popularInventories.length > 0 && (
            <InventoryTable
              title="5 самых популярных инвентарей"
              data={popularInventories}
              showItemCount={true}
              className="mb-5"
            />
          )}

          <InventoryTable
            title={"Последние инвентари"}
            data={paginatedInventories}
            showItemCount={true}
          />

          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
              <button
                className="btn btn-outline-primary btn-sm"
                disabled={normalPage === 0}
                onClick={() => setNormalPage((p) => p - 1)}
              >
                ← Назад
              </button>

              <span className="text-muted">
                Страница {normalPage + 1} из {totalPages}
              </span>

              <button
                className="btn btn-outline-primary btn-sm"
                disabled={normalPage >= totalPages - 1}
                onClick={() => setNormalPage((p) => p + 1)}
              >
                Вперед →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MainPage;
