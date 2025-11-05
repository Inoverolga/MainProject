import { DataGrid, GridColumnMenu } from "@mui/x-data-grid";
import { ruRU } from "@mui/x-data-grid/locales";
import { useContext } from "react";
import { toast } from "react-toastify";
import { AuthContext } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";

const CustomColumnMenu = (props) => (
  <GridColumnMenu
    {...props}
    slots={{
      columnMenuColumnsItem: null,
      columnMenuHideItem: null,
    }}
  />
);

const MyInventoriesTable = ({
  data,
  columns,
  loading,
  height,
  hasWriteAccess,
  enablePagination = true,
  pageSize = 10,
  onSelectionChange,
  onEdit,
  selectedRows,
  ...props
}) => {
  const { t, i18n } = useTranslation();
  const getGridLocale = () => {
    return i18n.language === "ru" ? ruRU : undefined;
  };
  const { isAuthenticated } = useContext(AuthContext);
  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        rows={data || []}
        onRowClick={(params, event) => {
          const isNameClick = event.target.closest('a[data-field="name"]');
          const isLikesClick = event.target.closest('[data-field="likes"]');

          if (!isAuthenticated && !hasWriteAccess) {
            toast.info(t("loginToViewItems"));
            return false;
          }

          if (!isNameClick && !isLikesClick) {
            toast.info(t("selectItemToEdit"));
            onEdit([]);
          }
          return false;
        }}
        disableRowSelectionOnClick
        disableColumnSorting={!isAuthenticated}
        disableColumnFilter={!isAuthenticated}
        disableColumnMenu={!isAuthenticated}
        columns={columns || []}
        loading={loading}
        pagination={enablePagination}
        initialState={{
          pagination: { paginationModel: { pageSize } },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={hasWriteAccess}
        onRowSelectionModelChange={(selectionModel) =>
          onSelectionChange?.(Array.from(selectionModel?.ids || []))
        }
        slots={{
          columnMenu: CustomColumnMenu,
        }}
        localeText={
          getGridLocale()?.components?.MuiDataGrid?.defaultProps?.localeText
        }
        sx={{
          border: 0,

          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #f0f0f0",
            "&:hover, &:focus-within": { bgcolor: "transparent" },
          },
          "& .MuiDataGrid-columnHeaders": {
            bgcolor: "#f8f9fa",
            fontWeight: "bold",
          },
          "& .MuiDataGrid-row": {
            "&.Mui-selected": { bgcolor: "#f8f9fa" },
            "&.Mui-selected:hover": { bgcolor: "#e9ecef" },
            "&:hover": { bgcolor: "#f8f9fa" },
          },
          "& .MuiCheckbox-root": {
            color: "#6c757d",
            "&.Mui-checked": { color: "#495057" },
          },
          "& .MuiDataGrid-cell": {
            "&:focus, &:focus-within": {
              outline: "none !important",
              boxShadow: "none !important",
              border: "none !important",
            },
          },
        }}
        {...props}
      />
    </div>
  );
};

export default MyInventoriesTable;
