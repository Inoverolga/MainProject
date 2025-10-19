import { DataGrid } from "@mui/x-data-grid";
import { GridColumnMenu } from "@mui/x-data-grid";

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
  loading = false,
  height = 400,
  enableSelection = false,
  enablePagination = true,
  pageSize = 10,
  onSelectionChange,
  ...props
}) => {
  return (
    <div style={{ height, width: "100%" }}>
      <DataGrid
        rows={data || []}
        columns={columns}
        loading={loading}
        pagination={enablePagination}
        initialState={{
          pagination: { paginationModel: { pageSize } },
        }}
        pageSizeOptions={[5, 10, 25, 50]}
        checkboxSelection={enableSelection}
        onRowSelectionModelChange={(selectionModel) =>
          onSelectionChange?.(Array.from(selectionModel?.ids || []))
        }
        disableRowSelectionOnClick
        slots={{
          columnMenu: CustomColumnMenu,
        }}
        sx={{
          border: 0,
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
