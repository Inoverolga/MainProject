import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetchInventoryItem } from "../../service/api";
import Spinner from "../../components/spinner/Spinner";
import Error from "../../components/error/Error";

const InventoryPage = () => {
  const { id } = useParams();
  const {
    data: inventoryItem,
    error,
    isLoading,
  } = useSWR(id ? `/inventories/${id}` : null, fetchInventoryItem, {
    keepPreviousData: true, // ← СОХРАНЯЕМ ДАННЫЕ
    revalidateOnFocus: false, // ← ОТКЛЮЧАЕМ ПЕРЕЗАГРУЗКУ);
  });

  if (isLoading && !inventoryItem) return <Spinner />;
  if (error) return <Error message={`Ошибка загрузки: ${error.message}`} />;
  if (!inventoryItem) return <div>Инвентарь не найден</div>;

  return (
    <div className="container mt-4">
      {/* <i className="bi bi-list-ul me-2"></i> */}
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
