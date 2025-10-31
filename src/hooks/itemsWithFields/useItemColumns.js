import { useMemo } from "react";
import { Link } from "react-router-dom";
import LikeButton from "../../components/likes/LikesButton";

export const useItemColumns = (fields = []) => {
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
          <div data-field="name" style={{ width: "100%" }}>
            <Link
              to={`/edit-item/${params.row.id}`}
              className="text-primary text-decoration-none fw-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {params.value}
            </Link>
          </div>
        ),
      },
      {
        field: "likes",
        headerName: "Лайки",
        width: 120,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => (
          <div className="d-flex justify-content-center align-items-center gap-0 h-100">
            <LikeButton
              data-field="likes"
              className="bg-transparent border-0 outline-none p-0"
              itemId={params.row.id}
              size="sm"
              showCount={true}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                padding: 0,
                cursor: "pointer",
                boxShadow: "none",
                ring: "none",
              }}
            />
          </div>
        ),
        sortable: false,
        filterable: false,
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
        flex: 1,
        minWidth: 150,
        headerAlign: "center",
        renderCell: ({ value }) => (
          <div
            className="d-flex flex-wrap gap-1"
            style={{
              maxWidth: "100%",
              padding: "8px 0 8px 0",
            }}
          >
            {value?.map((tag) => (
              <span
                key={tag.id}
                className="badge bg-secondary "
                style={{ fontSize: "0.7rem" }}
              >
                {tag.name}
              </span>
            )) || "-"}
          </div>
        ),
      },
    ];

    const customColumns = fields
      .filter((field) => field.isVisibleInTable)
      .map((field) => ({
        field: field.targetField,
        headerName: field.name.charAt(0).toUpperCase() + field.name.slice(1),
        width: 150,
        align: "center",
        headerAlign: "center",
        valueFormatter: (value) => {
          if (value === null || value === undefined || value === "") return "-";
          if (field.fieldType === "BOOLEAN") return value ? "✅" : "❌";
          return String(value);
        },
      }));

    return [...baseColumns, ...customColumns];
  }, [fields]);
};
