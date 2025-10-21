import { useMemo } from "react";
import { Link } from "react-router-dom";

export const useInventoryColumns = (data = [], type = "my") => {
  return useMemo(() => {
    //  const sampleItem = data[0] || {};

    const baseColumns = [
      {
        field: "name",
        headerName: "Название",
        width: 250,
        flex: 1,
        renderCell: (params) => (
          <Link
            to={`/inventory/${params.row.id}`}
            style={{
              textDecoration: "none",
              color: "#007bff",
            }}
          >
            {params.value}
          </Link>
        ),
      },
    ];

    baseColumns.push({
      field: "itemCount",
      headerName: "Товаров",
      width: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (_, row) => row?._count?.items ?? 0,
    });

    baseColumns.push({
      field: "createdAt",
      headerName: "Дата создания",
      width: 150,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString("ru-RU") : "-",
    });

    if (type === "accessible") {
      baseColumns.splice(1, 0, {
        field: "owner",
        headerName: "Создатель",
        align: "center",
        headerAlign: "center",
        width: 150,
        valueGetter: (_, row) => row?.user?.name || "-",
      });
    }

    return baseColumns;
  }, [data, type]);
};
