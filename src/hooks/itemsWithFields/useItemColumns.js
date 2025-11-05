import { useMemo } from "react";
import { Link } from "react-router-dom";
import LikeButton from "../../components/likes/LikesButton";
import { useTranslation } from "react-i18next";

export const useItemColumns = (
  fields = [],
  isAuthenticated,
  inventoryId,
  getItemLikeData,
  toggleLike
) => {
  const { t } = useTranslation();
  return useMemo(() => {
    const baseColumns = [
      {
        field: "customId",
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
        headerName: t("name"),
        width: 200,
        flex: 1,
        headerAlign: "center",
        renderCell: (params) => (
          <div data-field="name" style={{ width: "100%" }}>
            {isAuthenticated ? (
              <Link
                to={`/edit-item/${params.row.id}`}
                className="text-primary text-decoration-none fw-medium"
                onClick={(e) => e.stopPropagation()}
              >
                {params.value}
              </Link>
            ) : (
              <span style={{ cursor: "not-allowed" }}>{params.value}</span>
            )}
          </div>
        ),
      },
      {
        field: "likes",
        headerName: t("likes"),
        width: 120,
        headerAlign: "center",
        align: "center",
        renderCell: (params) => {
          const likeData = getItemLikeData(params.row.id);

          return (
            <div className="d-flex justify-content-center align-items-center gap-0 h-100">
              <LikeButton
                isAuthenticated={isAuthenticated}
                itemId={params.row.id}
                likeData={likeData}
                onToggleLike={toggleLike}
                size="sm"
                showCount={true}
                className="bg-transparent border-0 outline-none p-0"
              />
            </div>
          );
        },
        sortable: false,
        filterable: false,
      },

      {
        field: "description",
        headerName: t("description"),
        width: 250,
        flex: 1,
        headerAlign: "center",
        valueFormatter: (value) => value || "-",
      },
      {
        field: "tags",
        headerName: t("tags"),
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
  }, [fields, isAuthenticated, inventoryId, getItemLikeData, toggleLike, t]);
};
