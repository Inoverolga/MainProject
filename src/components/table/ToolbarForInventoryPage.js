import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

const ItemToolbar = ({
  selectedRows,
  onDelete,
  onEdit,
  hasWriteAccess,
  inventoryId,
}) => {
  return (
    <div className="mb-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
      <span className="text-muted">Выбрано: {selectedRows.length}</span>
      <div className="d-flex gap-2">
        <Button
          variant="outline-secondary"
          className="btn-toolbar-style"
          size="sm"
          onClick={onEdit}
          disabled={selectedRows.length === 0 || !hasWriteAccess}
        >
          ✏️ Редактировать
        </Button>
        <Button
          variant="outline-secondary"
          className="btn-toolbar-style"
          size="sm"
          onClick={() => onDelete(selectedRows)}
          disabled={selectedRows.length === 0 || !hasWriteAccess}
        >
          🗑️ Удалить выбранные
        </Button>
        <Button
          as={Link}
          to={`/create-item/${inventoryId}`}
          variant="secondary"
          disabled={!hasWriteAccess}
          size="sm"
        >
          <i className="bi bi-plus-circle me-1"></i>
          Добавить товар
        </Button>
      </div>
    </div>
  );
};

export default ItemToolbar;
