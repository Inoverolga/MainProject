import { Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import MyInventoriesTable from "./MyInventoriesTable";

const Toolbar = ({
  selectedRows,
  onEdit,
  onExport,
  onDelete,
  showDelete = true,
}) => {
  if (selectedRows.length === 0) return null;

  const buttonStyle = {
    color: "#000",
    backgroundColor: "transparent",
  };

  return (
    <div className="mb-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
      <span className="text-muted">Выбрано: {selectedRows.length}</span>
      <div className="d-flex gap-2">
        {selectedRows.length === 1 && (
          <Button
            variant="outline-secondary"
            style={buttonStyle}
            size="sm"
            onClick={onEdit}
          >
            ✏️ Редактировать
          </Button>
        )}
        <Button
          variant="outline-secondary"
          style={buttonStyle}
          size="sm"
          onClick={onExport}
        >
          📤 Экспорт
        </Button>
        {showDelete && (
          <Button
            variant="outline-secondary"
            style={buttonStyle}
            size="sm"
            onClick={onDelete}
          >
            🗑️ Удалить
          </Button>
        )}
      </div>
    </div>
  );
};

const CreateButton = () => (
  <Button as={Link} to="/inventory/create" variant="secondary" size="sm">
    ＋ Создать инвентарь
  </Button>
);

export const InventorySection = ({
  title,
  data,
  columns,
  loading,
  selectedRows,
  onSelectionChange,
  onEdit,
  onExport,
  onDelete,
  showDelete = true,
}) => (
  <Card className="mb-5">
    <Card.Header className="d-flex justify-content-between align-items-center">
      <h5 className="mb-0">{title}</h5>
      <CreateButton />
    </Card.Header>
    <Card.Body>
      <Toolbar
        selectedRows={selectedRows}
        onEdit={onEdit}
        onExport={onExport}
        onDelete={onDelete}
        showDelete={showDelete}
      />

      <MyInventoriesTable
        data={data}
        columns={columns}
        loading={loading}
        height={400}
        enableSelection={true}
        enablePagination={true}
        pageSize={10}
        onSelectionChange={onSelectionChange}
      />

      {data.length === 0 && !loading && (
        <p className="text-muted text-center py-4">Нет инвентарей</p>
      )}
    </Card.Body>
  </Card>
);
