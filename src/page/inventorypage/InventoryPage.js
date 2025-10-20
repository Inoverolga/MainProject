import { useParams } from "react-router-dom";
import useSWR from "swr";
import { fetchInventoryItem } from "../../service/api";
import Spinner from "../../components/spinner/Spinner";
import Error from "../../components/error/Error";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import ReactMarkdown from "react-markdown";

const InventoryPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useContext(AuthContext);

  const {
    data: response,
    error,
    isLoading,
  } = useSWR(id ? `/inventories/${id}` : null, fetchInventoryItem, {
    revalidateOnFocus: false,
  });

  const inventoryItem = response?.data || null;

  if (isLoading && !response) return <Spinner />;
  if (error) return <Error message={`Ошибка загрузки: ${error.message}`} />;
  if (!inventoryItem) return <div>Инвентарь не найден</div>;

  return (
    <div className="container mt-4">
      <div className="d-flex align-items-center mb-3">
        <h1 className="h3 mb-0 text-dark">{inventoryItem.name}</h1>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="card-title text-muted mb-2">Описание инвентаря</h6>
          <div
            style={{
              lineHeight: "1.6",
              fontSize: "1rem",
            }}
          ></div>
          <div className="markdown-content">
            <ReactMarkdown>{inventoryItem.description}</ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-md-6">
          <div className="d-flex align-items-center text-muted mb-2">
            <i className="bi bi-person-circle me-2"></i>
            <span>
              <strong>Создатель:</strong>{" "}
              {inventoryItem.user?.name || inventoryItem.createdBy}
            </span>
          </div>
        </div>
        <div className="col-md-6">
          <div className="d-flex align-items-center text-muted">
            <i className="bi bi-box-seam me-2"></i>
            <span>
              <strong>Товаров:</strong> {inventoryItem.items?.length || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-header bg-light border-0">
          <h5 className="card-title mb-0">
            Товары
            {inventoryItem.items?.length > 0 && (
              <span className="badge bg-primary ms-2">
                {inventoryItem.items.length}
              </span>
            )}
          </h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-4">
                    ID
                  </th>
                  <th scope="col">Наименование</th>
                  <th scope="col">Автор</th>
                  <th scope="col">Жанр</th>
                  <th scope="col" className="pe-4">
                    Год
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryItem.items && inventoryItem.items.length > 0 ? (
                  inventoryItem.items.map((item, index) => (
                    <tr
                      key={item.id}
                      className={index % 2 === 0 ? "table-default" : ""}
                    >
                      <td className="ps-4 fw-semibold text-muted">{item.id}</td>
                      <td className="fw-medium">{item.name}</td>
                      <td>{item.customFields?.author || "-"}</td>
                      <td>{item.customFields?.genre || "-"}</td>
                      <td className="pe-4">{item.customFields?.year || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      <i className="bi bi-inbox fs-1 d-block mb-2"></i>
                      Товары отсутствуют
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* {isAuthenticated && (
        <div className="mt-3">
          <button className="btn btn-success me-2">
            <i className="bi bi-plus-circle me-1"></i>
            Добавить товар
          </button>
          <button className="btn btn-outline-primary">
            <i className="bi bi-pencil me-1"></i>
            Редактировать инвентарь
          </button>
        </div>
      )} */}
    </div>
  );
};

export default InventoryPage;
