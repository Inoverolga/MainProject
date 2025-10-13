import useSWR from "swr";
import { fetchInventoriesPublic, fetchSearchAll } from "../service/api";
import { useContext } from "react";
import { SearchContext } from "../contexts/SearchContext";

const MainPage = () => {
  const { searchTerm } = useContext(SearchContext);

  const {
    data: inventoriesPublic,
    error,
    isLoading,
  } = useSWR(
    searchTerm ? `/api/search?q=${searchTerm}` : "/api/inventories/public",
    searchTerm ? fetchSearchAll : fetchInventoriesPublic
  );

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
          <tr key={item.id}>
            <td>{item.name}</td>
            <td>{item.description}</td>
            <td>{item.createdBy}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MainPage;
