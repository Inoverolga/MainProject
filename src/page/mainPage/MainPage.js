import useSWR from "swr";
import {
  fetchInventoriesPublic,
  fetchSearchAll,
  fetchTags,
} from "../../service/api";
import { useContext } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { useNavigate } from "react-router-dom";

const MainPage = () => {
  const { searchTerm, setSearchTerm, clearSearch } = useContext(SearchContext);
  const navigate = useNavigate();

  const {
    data: inventoriesPublic,
    error,
    isLoading,
  } = useSWR(
    searchTerm ? `/search?q=${searchTerm}` : "/inventories/public",
    searchTerm ? fetchSearchAll : fetchInventoriesPublic
  );
  const { data: tags } = useSWR(`/tags`, fetchTags);

  if (error)
    return (
      <div className="alert alert-danger">Ошибка загрузки: {error.message}</div>
    );

  if (isLoading)
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );

  return (
    <>
      <div className="mt-4 mb-4">
        <div className="d-flex align-items-baseline gap-3">
          <small className="text-muted fw-bold">Облако тегов:</small>
          <div className="d-flex flex-wrap gap-2">
            {tags &&
              tags.map((tag) => (
                <span
                  key={tag}
                  className="badge bg-secondary text-decoration-none cursor-pointer rounded-pill px-3"
                  onClick={(e) => {
                    e.preventDefault();
                    setSearchTerm(tag);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">Наименование инвентаря</th>
            <th scope="col">Описание</th>
            <th scope="col">Создатель</th>
          </tr>
        </thead>
        <tbody>
          {inventoriesPublic.map((item) => (
            <tr
              key={item.id}
              onClick={() => navigate(`/inventory/${item.id}`)}
              style={{ cursor: "pointer" }}
            >
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.createdBy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default MainPage;
