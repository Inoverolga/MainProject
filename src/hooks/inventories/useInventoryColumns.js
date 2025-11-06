import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const useInventoryColumns = (data = [], type = "my") => {
  const { t } = useTranslation();
  return useMemo(() => {
    const baseColumns = [
      {
        field: "imageUrl",
        headerName: t("image"),
        width: 80,
        align: "center",
        headerAlign: "center",
        renderCell: (params) =>
          params.value ? (
            <img
              src={params.value}
              alt={params.row.name}
              style={{
                width: "40px",
                height: "40px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          ) : (
            <span className="text-muted" style={{ fontSize: "12px" }}>
              <i className="bi bi-image"></i>
            </span>
          ),
        sortable: false,
        filterable: false,
      },
      {
        field: "name",
        headerName: t("inventoryName"),
        width: 250,
        flex: 1,
        renderCell: (params) => (
          <Link
            data-field="name"
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
      headerName: t("itemsCount"),
      width: 120,
      align: "center",
      headerAlign: "center",
      valueGetter: (_, row) => row?._count?.items ?? 0,
    });

    baseColumns.push({
      field: "createdAt",
      headerName: t("createdAt"),
      width: 150,
      align: "center",
      headerAlign: "center",
      valueFormatter: (value) =>
        value ? new Date(value).toLocaleDateString("ru-RU") : "-",
    });

    if (type === "accessible") {
      baseColumns.splice(1, 0, {
        field: "owner",
        headerName: t("creator"),
        align: "center",
        headerAlign: "center",
        width: 150,
        valueGetter: (_, row) => row?.user?.name || "-",
      });
    }

    return baseColumns;
  }, [data, type, t]);
};
