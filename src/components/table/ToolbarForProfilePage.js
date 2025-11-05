import { Card, Button } from "react-bootstrap";
import MyInventoriesTable from "./MyInventoriesTable";
import { useTranslation } from "react-i18next";

const Toolbar = ({
  selectedRows,
  onEdit,
  onExport,
  onDelete,
  showDelete = true,
}) => {
  const { t } = useTranslation();
  return (
    <div className="mb-3 p-3 bg-light rounded d-flex justify-content-between align-items-center">
      <span className="text-muted">
        {t("selected")} {selectedRows.length}
      </span>
      <div className="d-flex gap-2">
        <Button
          variant="outline-secondary"
          className="btn-toolbar-style"
          size="sm"
          onClick={onEdit}
          disabled={selectedRows.length === 0}
        >
          ✏️ {t("edit")}
        </Button>

        <Button
          variant="outline-secondary"
          className="btn-toolbar-style"
          size="sm"
          onClick={onExport}
          disabled={selectedRows.length === 0}
        >
          📤 {t("export")}
        </Button>
        {showDelete && (
          <Button
            variant="outline-secondary"
            className="btn-toolbar-style"
            size="sm"
            onClick={onDelete}
            disabled={selectedRows.length === 0}
          >
            🗑️ {t("delete")}
          </Button>
        )}
      </div>
    </div>
  );
};

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
  hasWriteAccess = true,
}) => {
  const { t } = useTranslation();
  return (
    <Card className="mb-5">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{title}</h5>
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
          hasWriteAccess={hasWriteAccess}
          enableSelection={true}
          enablePagination={true}
          pageSize={10}
          onSelectionChange={onSelectionChange}
          onEdit={onEdit}
        />

        {data.length === 0 && !loading && (
          <p className="text-muted text-center py-4">{t("noInventories")}</p>
        )}
      </Card.Body>
    </Card>
  );
};
