import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { saveAs } from "file-saver";
import {
  fetchDeleteInventories,
  fetchExportInventories,
  fetchCreateInventories,
  fetchUpdateInventories,
} from "../../service/api.js";

export const useInventoryOperations = (
  mutateMyInventories,
  mutateAccessInventories = null,
  mutateCurrentInventory = null
) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { trigger: deleteInventory } = useSWRMutation(
    "/users/inventories-delete",
    (url, { arg: { inventoryId, version } }) =>
      fetchDeleteInventories(`${url}/${inventoryId}`, version)
  );

  const { trigger: createInventory, isMutating: isCreating } = useSWRMutation(
    "/users/inventories-create",
    fetchCreateInventories
  );

  const { trigger: updateInventory, isMutating: isUpdating } = useSWRMutation(
    "/users/inventories-update",
    (url, { arg: { inventoryId, formData } }) =>
      fetchUpdateInventories(`${url}/${inventoryId}`, formData)
  );

  const handleCreate = async (formatData) => {
    const result = await createInventory(formatData);
    if (result?.success) {
      mutateMyInventories?.();
      navigate(`/inventory/${result.data.id}`);
      return result.data;
    }
    toast.error(result.message || t("inventoryCreationError"));
    return null;
  };

  const handleDelete = async (
    selectedRows,
    setSelectedRows,
    inventories = []
  ) => {
    if (selectedRows.length === 0) return;

    if (
      !window.confirm(
        t("deleteInventoriesConfirmation", { count: selectedRows.length })
      )
    )
      return;

    try {
      for (const id of selectedRows) {
        const inventory = inventories.find((i) => i.id === id);

        if (!inventory?.version) {
          console.error(t("deleteVersionError"));
          return;
        }
        await deleteInventory({ inventoryId: id, version: inventory.version });
      }
      toast.success(t("inventoryDeletedSuccess"));
      mutateMyInventories?.();
      mutateAccessInventories?.();
      setSelectedRows([]);
    } catch (error) {
      if (error?.response?.status === 409) {
        toast.error(t("dataChangedError"));
      } else {
        toast.error(t("deleteError"));
      }
    }
  };

  const handleEdit = (selectedRows) => {
    if (selectedRows.length !== 1) {
      return;
    }
    navigate(`/inventory-edit/${selectedRows[0]}`);
  };

  const handleUpdate = async (inventoryId, formData) => {
    if (!inventoryId) {
      toast.error(t("inventoryIdNotFound"));
      return false;
    }

    const result = await updateInventory({ inventoryId, formData });

    if (result.success) {
      mutateMyInventories?.();
      mutateCurrentInventory?.();

      return true;
    }

    toast.error(result.message || t("inventoryUpdateError"));

    return false;
  };

  const handleExport = async (selectedRows) => {
    if (selectedRows.length !== 1) {
      toast.info(t("selectOneInventoryToExport"));
      return;
    }
    try {
      const response = await fetchExportInventories(
        `/users/inventories-export/${selectedRows[0]}`
      );
      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8",
      });
      saveAs(blob, `inventory-${selectedRows[0]}-${Date.now()}.csv`);
      toast.success(t("exportCompleted"));
    } catch (error) {
      toast.error(t("exportError"));
    }
  };

  return {
    handleDelete,
    handleEdit,
    handleExport,
    handleCreate,
    handleUpdate,
    isCreating,
    isUpdating,
  };
};
