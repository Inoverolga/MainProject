import { DataGrid } from "@mui/x-data-grid";
import { GridColumnMenu } from "@mui/x-data-grid";
import { ruRU } from "@mui/x-data-grid/locales";

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
  ...props
}) => {
  return (
    <div style={{ width: "100%" }}>
      <DataGrid
        rows={data || []}
        onRowClick={(params) => {
          if (hasWriteAccess) {
            onEdit(params.row.id);
          }
        }}
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
        disableRowSelectionOnClick
        slots={{
          columnMenu: CustomColumnMenu,
        }}
        localeText={ruRU.components.MuiDataGrid.defaultProps.localeText}
        getRowHeight={() => "auto"}
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
        }}
        {...props}
      />
    </div>
  );
};

export default MyInventoriesTable;
