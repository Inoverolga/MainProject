import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetchInventoryItem } from "../../service/api";

const InventoryPage = () => {
  const { id } = useParams();
  const {
    data: inventoryItem,
    error,
    isLoading,
  } = useSWR(id ? `/inventories/${id}` : null, fetchInventoryItem);

  if (error)
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          Ошибка загрузки инвентаря: {error.message}
        </div>
      </div>
    );

  if (isLoading)
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );

  if (!inventoryItem) return <div>Инвентарь не найден</div>;

  return (
    <div className="container mt-4">
      <h2>{inventoryItem.name}</h2>
      <p className="text-muted">Краткое описание:{inventoryItem.description}</p>
      <p>
        <small>Создатель: {inventoryItem.createdBy}</small>
      </p>
      <h5>Товары ({inventoryItem.items?.length || 0}):</h5>
      {/* Таблица товаров будет здесь для библиотеки */}
      <table className="table table-hover">
        <thead>
          <tr>
            <th scope="col">ID</th>
            <th scope="col">Наименование</th>
            <th scope="col">Автор</th>
            <th scope="col">Жанр</th>
            <th scope="col">Год</th>
          </tr>
        </thead>
        <tbody>
          {inventoryItem.items && inventoryItem.items.length > 0 ? (
            inventoryItem.items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.name}</td>
                <td>{item.customFields?.author || "-"}</td>
                <td>{item.customFields?.genre || "-"}</td>
                <td>{item.customFields?.year || "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                Товары отсутствуют
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryPage;
