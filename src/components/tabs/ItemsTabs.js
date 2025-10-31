import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "react-bootstrap";
import { useItemsOperations } from "../../hooks/itemsWithFields/useItemsOperations.js";
import { useItemColumns } from "../../hooks/itemsWithFields/useItemColumns.js";
import MyInventoriesTable from "../table/MyInventoriesTable.js";
import ItemToolbar from "../table/ToolbarForInventoryPage.js";
import Spinner from "../../components/spinner/Spinner.js";
import Error from "../../components/error/Error.js";

const ItemsTabs = ({
  inventory,
  data: items,
  fields,
  hasWriteAccess,
  mutateMyItems,
  itemsLoading,
  itemsError,
  isAuthenticated,
  ...props
}) => {
  const [selectedRows, setSelectedRows] = useState([]);
  const navigate = useNavigate();

  const { handleDelete, handleEdit, isCreating, isUpdating } =
    useItemsOperations(mutateMyItems, inventory?.id);

  const columns = useItemColumns(fields);

  if (itemsLoading) return <Spinner />;
  if (itemsError)
    return <Error message={`Ошибка загрузки: ${itemsError.message}`} />;

  return (
    <div>
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
          {hasWriteAccess && (
            <ItemToolbar
              selectedRows={selectedRows}
              hasWriteAccess={hasWriteAccess}
              inventoryId={inventory?.id}
              onEdit={() => handleEdit(selectedRows, navigate)}
              onDelete={() =>
                handleDelete(selectedRows, setSelectedRows, items)
              }
              isMutating={isCreating || isUpdating}
            />
          )}
          <div>
            <MyInventoriesTable
              selectedRows={selectedRows}
              data={items}
              columns={columns}
              loading={itemsLoading}
              height={400}
              hasWriteAccess={hasWriteAccess}
              enablePagination={true}
              pageSize={10}
              onSelectionChange={setSelectedRows}
              onEdit={() => {}}
            />
          </div>

          {items.length === 0 && (
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
    </div>
  );
};

export default ItemsTabs;
