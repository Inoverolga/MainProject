import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { fetchInventoryWithItems } from "../../service/api";
import Spinner from "../../components/spinner/Spinner";
import Error from "../../components/error/Error";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import ReactMarkdown from "react-markdown";
import { useItemColumns } from "../../hooks/useItemColumns";
import { useItemsOperations } from "../../hooks/useItemsOperations.js";
import MyInventoriesTable from "../../components/table/MyInventoriesTable.js";
import ItemToolbar from "../../components/table/ToolbarForInventoryPage";
import { Container, Card } from "react-bootstrap";

const InventoryPage = () => {
  const { id } = useParams();
  const { isAuthenticated, authUser } = useContext(AuthContext);
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();

  const {
    data: response,
    error,
    isLoading,
    mutate: mutateMyItems,
  } = useSWR(
    isAuthenticated
      ? `/users/inventories/${id}/items-with-access`
      : `/inventories/${id}`,
    fetchInventoryWithItems,
    {
      revalidateOnFocus: false,
    }
  );

  const { handleDelete, handleEdit, isCreating, isUpdating } =
    useItemsOperations(mutateMyItems, id);

  const columns = useItemColumns();
  const inventory = response?.data || null;
  const items = inventory?.items || [];
  const hasWriteAccess = inventory?.canWrite || false;

  if (isLoading) return <Spinner />;
  if (error) return <Error message={`Ошибка загрузки: ${error.message}`} />;
  if (!inventory) return <div>Инвентарь не найден</div>;

  return (
    <Container className="py-4">
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Назад
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-4 mb-0 text-dark fw-bold">{inventory.name}</h1>
        {hasWriteAccess && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/inventory-edit/${id}`)}
          >
            <i className="bi bi-pencil me-1"></i>
            Редактировать инвентарь
          </button>
        )}
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Card.Title className="text-muted mb-3 small text-uppercase fw-semibold">
            📋 Описание инвентаря
          </Card.Title>
          <div className="markdown-content" style={{ lineHeight: "1.6" }}>
            {inventory.description ? (
              <ReactMarkdown>{inventory.description}</ReactMarkdown>
            ) : (
              <p className="text-muted fst-italic mb-0">Описание отсутствует</p>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Информация об инвентаре */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center text-muted mb-2">
                <i className="bi bi-person-circle me-2 fs-5"></i>
                <span className="small">
                  <strong>Создатель:</strong>{" "}
                  <span className="text-dark">
                    {inventory.user?.name || "-"}
                  </span>
                </span>
              </div>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="d-flex align-items-center justify-content-md-end text-muted">
                <span className="small">
                  <strong>Товаров:</strong>{" "}
                  <span className="text-dark fw-semibold">{items.length}</span>
                </span>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fs-5 fw-semibold">🗃️ Товары</h5>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <ItemToolbar
            selectedRows={selectedRows}
            hasWriteAccess={hasWriteAccess}
            inventoryId={id}
            onEdit={() => handleEdit(selectedRows, navigate)}
            onDelete={() => handleDelete(selectedRows, setSelectedRows)}
            isMutating={isCreating || isUpdating}
          />

          <MyInventoriesTable
            data={items}
            columns={columns}
            loading={isLoading}
            height={500}
            enableSelection={hasWriteAccess}
            enablePagination={true}
            pageSize={10}
            onSelectionChange={setSelectedRows}
          />

          {items.length === 0 && !isLoading && (
            <div className="text-center text-muted py-5">
              <i className="bi bi-inbox fs-1 d-block mb-2 opacity-50"></i>
              <p className="mb-0">Товары отсутствуют</p>
              {hasWriteAccess && (
                <small className="text-muted">
                  Нажмите "Добавить товар" чтобы создать первый товар
                </small>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default InventoryPage;
