import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const ItemToolbar = ({
  selectedRows,
  onDelete,
  onEdit,
  hasWriteAccess,
  inventoryId,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mb-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
      <span className="text-muted">
        {t("selected")}: {selectedRows.length}
      </span>
      <div className="d-flex gap-2">
        <Button
          variant="outline-secondary"
          className="btn-toolbar-style"
          size="sm"
          onClick={onEdit}
          disabled={selectedRows.length === 0 || !hasWriteAccess}
        >
          ✏️ {t("edit")}
        </Button>
        <Button
          variant="outline-secondary"
          className="btn-toolbar-style"
          size="sm"
          onClick={() => onDelete(selectedRows)}
          disabled={selectedRows.length === 0 || !hasWriteAccess}
        >
          🗑️ {t("deleteSelected")}
        </Button>
        <Button
          as={Link}
          to={`/create-item/${inventoryId}`}
          variant="secondary"
          disabled={!hasWriteAccess}
          size="sm"
        >
          <i className="bi bi-plus-circle me-1"></i>
          {t("addItem")}
        </Button>
      </div>
    </div>
  );
};

export default ItemToolbar;
