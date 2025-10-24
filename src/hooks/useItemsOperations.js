import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useCallback } from "react";

import {
  fetchCreateItem,
  fetchDeleteItem,
  fetchUpdateItem,
} from "../service/api.js";

export const useItemsOperations = (mutateMyItems, inventoryId = null) => {
  // Удаление
  const { trigger: deleteItem } = useSWRMutation(
    "/users/items-delete",
    (url, { arg: itemId }) => fetchDeleteItem(`${url}/${itemId}`)
  );

  //создание
  const { trigger: createItem, isMutating: isCreating } = useSWRMutation(
    "/users/inventories",
    (url, { arg: { inventoryId, formData } }) =>
      fetchCreateItem(`${url}/${inventoryId}/items-create`, formData)
  );

  // Обновление
  const { trigger: updateItem, isMutating: isUpdating } = useSWRMutation(
    "/users/items-update",
    (url, { arg: { itemId, formData } }) =>
      fetchUpdateItem(`${url}/${itemId}`, { arg: formData })
  );

  const handleCreate = async (formData, targetInventoryId = inventoryId) => {
    if (!targetInventoryId) {
      toast.error("ID инвентаря не найден");
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
    toast.error(result.message || "Ошибка создания товара");
    return null;
  };

  const handleDelete = async (selectedRows, setSelectedRows) => {
    if (selectedRows.length === 0) return;

    if (!window.confirm(`Удалить ${selectedRows.length} товаров?`)) return;

    try {
      for (const itemId of selectedRows) {
        await deleteItem(itemId);
      }
      toast.success(`Товар удален`);
      mutateMyItems?.();
      setSelectedRows([]);
    } catch (error) {
      toast.error("Ошибка при удалении");
    }
  };

  const handleEdit = (selectedRows, navigate) => {
    if (selectedRows.length !== 1) {
      toast.info("Выберите один товар для редактирования");
      return;
    }
    navigate(`/edit-item/${selectedRows[0]}`);
  };

  const handleUpdate = useCallback(
    async (itemId, formData) => {
      if (!itemId) {
        toast.error("ID товара не найден");
        return false;
      }

      const result = await updateItem({ itemId, formData });

      if (result.success) {
        mutateMyItems?.();
        return true;
      }
      toast.error(result.message || "Ошибка редактирования товара");
      return false;
    },
    [updateItem, mutateMyItems]
  );
  //
  return {
    // Операции с таблицей
    handleDelete,
    handleEdit,

    // Операции с формами
    handleCreate,
    handleUpdate,

    // Состояния загрузки
    isCreating,
    isUpdating,
  };
};
