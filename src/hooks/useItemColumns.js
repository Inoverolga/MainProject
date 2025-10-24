import { useMemo } from "react";
import { Link } from "react-router-dom";

export const useItemColumns = () => {
  return useMemo(() => {
    const baseColumns = [
      {
        field: "id",
        headerName: "ID",
        width: 100,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <span className="fw-semibold text-muted">{params.value}</span>
        ),
      },
      {
        field: "name",
        headerName: "Название",
        width: 200,
        flex: 1,
        headerAlign: "center",
        renderCell: (params) => (
          <Link
            to={`/items/${params.row.id}`}
            className="text-primary text-decoration-none fw-medium"
          >
            {params.value}
          </Link>
        ),
      },
      {
        field: "description",
        headerName: "Описание",
        width: 250,
        flex: 1,
        headerAlign: "center",
        valueFormatter: (value) => value || "-",
      },
      {
        field: "tags",
        headerName: "Теги",
        width: 150,
        headerAlign: "center",
        renderCell: ({ value }) => (
          <div className="text-center">
            {value?.map((tag) => (
              <span
                key={tag.id}
                className="badge bg-secondary me-1"
                style={{ fontSize: "0.7rem" }}
              >
                {tag.name}
              </span>
            )) || "-"}
          </div>
        ),
      },
    ];

    return baseColumns;
  }, []);
};
