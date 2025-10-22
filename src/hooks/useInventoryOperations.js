// hooks/useInventoryOperations.js
import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useCallback } from "react";

import {
  fetchDeleteInventories,
  fetchExportInventories,
  fetchCreateInventories,
  fetchUpdateInventories,
} from "../service/api.js";
import { saveAs } from "file-saver";

export const useInventoryOperations = (
  mutateMyInventories,
  inventoryId = null
) => {
  // Удаление
  const { trigger: deleteInventory } = useSWRMutation(
    "/users/inventories-delete",
    (url, { arg: inventoryId }) =>
      fetchDeleteInventories(`${url}/${inventoryId}`)
  );

  // Создание
  const { trigger: createInventory, isMutating: isCreating } = useSWRMutation(
    "/users/inventories-create",
    fetchCreateInventories
  );

  // Обновление
  const { trigger: updateInventory, isMutating: isUpdating } = useSWRMutation(
    inventoryId ? `/users/inventories-update/${inventoryId}` : null,
    fetchUpdateInventories
  );

  const handleCreate = async (formData) => {
    const result = await createInventory(formData);
    if (result.success) {
      mutateMyInventories?.();
      return result.data;
    }
    toast.error(result.message || "Ошибка создания инвентаря");
    return null;
  };

  const handleDelete = async (selectedRows, setSelectedRows) => {
    if (selectedRows.length === 0) return;

    try {
      for (const id of selectedRows) {
        await deleteInventory(id);
      }
      toast.success(`Инвентарь удален`);
      mutateMyInventories?.();
      setSelectedRows([]);
    } catch (error) {
      toast.error("Ошибка при удалении");
    }
  };

  const handleEdit = (selectedRows, navigate) => {
    if (selectedRows.length !== 1) {
      toast.info("Выберите один инвентарь для редактирования");
      return;
    }
    // Простая навигация - данные загрузит EditInventoryPage
    navigate(`/edit-inventory/${selectedRows[0]}`);
  };

  const handleUpdate = useCallback(
    async (formData) => {
      if (!inventoryId) {
        toast.error("ID инвентаря не найден");
        return false;
      }
      const result = await updateInventory(formData);
      if (result.success) {
        mutateMyInventories?.();
        return true;
      }

      toast.error(result.message || "Ошибка обновления инвентаря");
      return false;
    },
    [inventoryId, updateInventory, mutateMyInventories]
  );

  const handleExport = async (selectedRows) => {
    if (selectedRows.length !== 1) {
      toast.info("Выберите один инвентарь для экспорта");
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
      toast.success("Экспорт завершен");
    } catch (error) {
      toast.error("Ошибка при экспорте");
    }
  };

  return {
    // Операции с таблицей
    handleDelete,
    handleEdit,
    handleExport,

    // Операции с формами
    handleCreate,
    handleUpdate,

    // Состояния загрузки
    isCreating,
    isUpdating,
  };
};
