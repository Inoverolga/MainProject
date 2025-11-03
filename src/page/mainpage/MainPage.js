import useSWR from "swr";
import {
  fetchInventoriesPublic,
  fetchSearchAll,
  fetchTags,
} from "../../service/api";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.js";
import { LoginForm } from "../../components/loginForm/LoginForm.js";
import Spinner from "../../components/spinner/Spinner.js";
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
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const { isAuthenticated, authUser } = useContext(AuthContext);
  const [page, setPage] = useState(0);

  // Запрос для популярных инвентарей
  const { data: popularInventories = [] } = useSWR(
    !searchTerm ? "/inventories/public?type=popular" : null,
    fetchInventoriesPublic,
    { revalidateOnFocus: false }
  );

  // Запрос для последних инвентарей
  const {
    data: recentInventories = [],
    error,
    isLoading,
  } = useSWR(
    searchTerm ? `/search?q=${searchTerm}` : "/inventories/public?type=recent",
    searchTerm ? fetchSearchAll : fetchInventoriesPublic,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  const { data: tags } = useSWR(`/tags`, fetchTags, {
    revalidateOnFocus: false,
  });

  // Пагинация только для последних инвентарей
  const itemsPerPage = 10;
  const startIndex = page * itemsPerPage;
  const paginatedInventories = recentInventories.slice(
    startIndex,
    startIndex + itemsPerPage
  );
  const totalPages = Math.ceil(recentInventories.length / itemsPerPage);

  // Сбрасываем на первую страницу при поиске
  useEffect(() => {
    setPage(0);
  }, [searchTerm]);

  if (error) return <Error message={`Ошибка загрузки: ${error.message}`} />;
  if (isLoading) return <Spinner />;

  return (
    <>
      <TagCloud tags={tags} onTagClick={setSearchTerm} />
      {!isAuthenticated && <LoginForm />}

      {isAuthenticated && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title text-center">
              Добро пожаловать, {authUser.name}!
            </h5>
            <p className="card-text text-center">
              Вы находитесь на главной странице системы
            </p>
          </div>
        </div>
      )}

      {!searchTerm && popularInventories.length > 0 && (
        <InventoryTable
          title="5 самых популярных инвентарей"
          data={popularInventories}
          showItemCount={true}
          className="mb-5"
        />
      )}

      <InventoryTable
        title={searchTerm ? "🔍 Результаты поиска" : "Последние инвентари"}
        data={paginatedInventories}
        showItemCount={!!searchTerm}
      />

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Назад
          </button>

          <span className="text-muted">
            Страница {page + 1} из {totalPages}
          </span>

          <button
            className="btn btn-outline-primary btn-sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперед →
          </button>
        </div>
      )}
    </>
  );
};

export default MainPage;
