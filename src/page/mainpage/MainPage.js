import useSWR from "swr";
import { fetchInventoriesPublic, fetchTags } from "../../service/api";
import { useContext, useState, useEffect } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import { useGlobalSearch } from "../../hooks/search/useGlobalSearch.js";
import { AuthContext } from "../../contexts/AuthContext.js";
import { LoginForm } from "../../components/loginForm/LoginForm.js";
import Error from "../../components/error/Error.js";
import { useTranslation } from "react-i18next";

const InventoryTable = ({
  title,
  data,
  showItemCount = false,
  className = "",
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (!data?.length) return null;

  return (
    <div className={className}>
      <h5 className="mb-3">{title}</h5>
      <table className="table table-hover">
        <thead>
          <tr>
            <th style={{ width: "60px" }}>{t("image")}</th>
            <th>{t("inventoryName")}</th>
            <th>{t("description")}</th>
            <th>{t("creator")}</th>
            {showItemCount && (
              <th className="text-center">{t("itemsCount")}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              onClick={() => navigate(`/inventory/${item.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="img-thumbnail"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    className="bg-light rounded d-flex align-items-center justify-content-center text-muted"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <i className="bi bi-image"></i>
                  </div>
                )}
              </td>
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
  const { t } = useTranslation();
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
  if (error) return <Error message={`${t("loadingError")} ${error.message}`} />;

  return (
    <div className="container-fluid">
      <TagCloud tags={tags} onTagClick={setSearchTerm} />
      {!isAuthenticated && <LoginForm />}

      {isAuthenticated && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title text-center">
              {t("welcome")}, {authUser.name}!
              {authUser.isAdmin && (
                <span className="badge bg-danger ms-2">
                  {t("administrator")}
                </span>
              )}
            </h5>
            <p className="card-text text-center">{t("youAreOnMainPage")} </p>
          </div>
        </div>
      )}
      {searchTerm ? (
        <div>
          <InventoryTable data={searchResults} showItemCount={true} />

          {pagination && pagination.totalPages > 1 && (
            <div className="d-flex justify-content-center gap-3 mt-4">
              <button onClick={goToPrevPage} disabled={currentPage === 1}>
                ← {t("back")}
              </button>
              <span>
                {t("page")} {currentPage} {t("of")} {pagination.totalPages}
              </span>
              <button
                onClick={goToNextPage}
                disabled={currentPage >= pagination.totalPages}
              >
                {t("forward")} →
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          {popularInventories.length > 0 && (
            <InventoryTable
              title={t("mostPopularInventories")}
              data={popularInventories}
              showItemCount={true}
              className="mb-5"
            />
          )}

          <InventoryTable
            title={t("recentInventories")}
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
                ← {t("back")}
              </button>

              <span className="text-muted">
                {t("page")} {normalPage + 1} {t("of")} {totalPages}
              </span>

              <button
                className="btn btn-outline-primary btn-sm"
                disabled={normalPage >= totalPages - 1}
                onClick={() => setNormalPage((p) => p + 1)}
              >
                {t("forward")} →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MainPage;
