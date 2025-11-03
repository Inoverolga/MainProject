import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchCreateItem,
  fetchDeleteItem,
  fetchUpdateItem,
} from "../../service/api.js";

export const useItemsOperations = (mutateMyItems, inventoryId = null) => {
  const navigate = useNavigate();
  // Удаление
  const { trigger: deleteItem } = useSWRMutation(
    "/users/items-delete",
    (url, { arg: { itemId, version } }) =>
      fetchDeleteItem(`${url}/${itemId}`, version)
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
      fetchUpdateItem(`${url}/${itemId}`, formData)
  );

  const handleCreate = async (formData, targetInventoryId = inventoryId) => {
    console.log("📤 Данные для отправки на бэкенд:", formData);
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

  const handleDelete = async (selectedRows, setSelectedRows, items = []) => {
    if (selectedRows.length === 0) return;

    if (!window.confirm(`Удалить ${selectedRows.length} товаров?`)) return;

    try {
      for (const id of selectedRows) {
        const item = items.find((i) => i.id === id);

        if (!item?.version) {
          console.log(
            "Не удалось выполнить удаление. Пожалуйста, обновите страницу."
          );

          return;
        }
        await deleteItem({ itemId: id, version: item?.version });
      }
      toast.success(`Товар удален`);
      mutateMyItems?.();
      setSelectedRows([]);
    } catch (error) {
      toast.error(
        "Не удалось выполнить удаление. Пожалуйста, обновите страницу."
      );
    }
  };

  const handleEdit = (selectedRows) => {
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
        await mutateMyItems?.();
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
