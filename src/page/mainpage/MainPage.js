import useSWR from "swr";
import {
  fetchInventoriesPublic,
  fetchSearchAll,
  fetchTags,
} from "../../service/api";
import { useContext } from "react";
import { SearchContext } from "../../contexts/SearchContext";
import { useNavigate } from "react-router-dom";
import LoginForm from "../../components/loginForm/LoginForm.js";
import Spinner from "../../components/spinner/Spinner.js";
import Error from "../../components/error/Error.js";

const MainPage = () => {
  const { searchTerm, setSearchTerm } = useContext(SearchContext);
  const navigate = useNavigate();

  const {
    data: inventoriesPublic = [],
    error,
    isLoading,
  } = useSWR(
    searchTerm ? `/search?q=${searchTerm}` : "/inventories/public",
    searchTerm ? fetchSearchAll : fetchInventoriesPublic,
    {
      keepPreviousData: true, // ← Сохраняет предыдущие данные
      revalidateOnFocus: false, // ← Не перезагружать при фокусе
    }
  );
  const { data: tags } = useSWR(`/tags`, fetchTags, {
    keepPreviousData: true,
    revalidateOnFocus: false,
  });

  if (error) return <Error message={`Ошибка загрузки: ${error.message}`} />;
  if (isLoading && !inventoriesPublic) return <Spinner />;

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

      <LoginForm />

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
