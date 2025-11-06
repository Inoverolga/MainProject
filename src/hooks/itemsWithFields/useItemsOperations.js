import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchCreateItem,
  fetchDeleteItem,
  fetchUpdateItem,
} from "../../service/api.js";

export const useItemsOperations = (mutateMyItems, inventoryId = null) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { trigger: deleteItem } = useSWRMutation(
    "/users/items-delete",
    (url, { arg: { itemId, version } }) =>
      fetchDeleteItem(`${url}/${itemId}`, version)
  );

  const { trigger: createItem, isMutating: isCreating } = useSWRMutation(
    "/users/inventories",
    (url, { arg: { inventoryId, formData } }) =>
      fetchCreateItem(`${url}/${inventoryId}/items-create`, formData)
  );

  const { trigger: updateItem, isMutating: isUpdating } = useSWRMutation(
    "/users/items-update",
    (url, { arg: { itemId, formData } }) =>
      fetchUpdateItem(`${url}/${itemId}`, formData)
  );

  const handleCreate = async (formData, targetInventoryId = inventoryId) => {
    if (!targetInventoryId) {
      toast.error(t("inventoryIdNotFound"));
      return null;
    }

    const result = await createItem({
      inventoryId: targetInventoryId,
      formData,
    });

    if (result.success) {
      mutateMyItems?.();
      return result.data;
    }
    toast.error(result.message || t("itemCreationError"));
    return null;
  };

  const handleDelete = async (selectedRows, setSelectedRows, items = []) => {
    if (selectedRows.length === 0) return;

    if (
      !window.confirm(
        t("deleteItemsConfirmation", { count: selectedRows.length })
      )
    )
      return;

    try {
      for (const id of selectedRows) {
        const item = items.find((i) => i.id === id);

        if (!item?.version) {
          console.log(t("deleteVersionError"));
          return;
        }
        await deleteItem({ itemId: id, version: item?.version });
      }
      toast.success(t("itemDeletedSuccess"));
      mutateMyItems?.();
      setSelectedRows([]);
    } catch (error) {
      toast.error(t("deleteFailedError"));
    }
  };

  const handleEdit = (selectedRows) => {
    if (selectedRows.length !== 1) {
      toast.info(t("selectOneItemToEdit"));
      return;
    }
    navigate(`/edit-item/${selectedRows[0]}`);
  };

  const handleUpdate = useCallback(
    async (itemId, formData) => {
      if (!itemId) {
        toast.error(t("itemIdNotFound"));
        return false;
      }

      const result = await updateItem({ itemId, formData });

      if (result.success) {
        await mutateMyItems?.();
        return true;
      }
      toast.error(result.message || t("itemUpdateError"));
      return false;
    },
    [updateItem, mutateMyItems]
  );

  return {
    handleDelete,
    handleEdit,
    handleCreate,
    handleUpdate,
    isCreating,
    isUpdating,
  };
};
