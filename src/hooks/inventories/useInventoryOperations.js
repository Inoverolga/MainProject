import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchDeleteInventories,
  fetchExportInventories,
  fetchCreateInventories,
  fetchUpdateInventories,
} from "../../service/api.js";
import { saveAs } from "file-saver";

export const useInventoryOperations = (
  mutateMyInventories,
  mutateAccessInventories = null
) => {
  const navigate = useNavigate();

  // Удаление
  const { trigger: deleteInventory } = useSWRMutation(
    "/users/inventories-delete",
    (url, { arg: { inventoryId, version } }) =>
      fetchDeleteInventories(`${url}/${inventoryId}`, version)
  );

  // Создание
  const { trigger: createInventory, isMutating: isCreating } = useSWRMutation(
    "/users/inventories-create",
    fetchCreateInventories
  );

  // Обновление
  const { trigger: updateInventory, isMutating: isUpdating } = useSWRMutation(
    "/users/inventories-update",
    (url, { arg: { inventoryId, formData } }) =>
      fetchUpdateInventories(`${url}/${inventoryId}`, formData)
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

  const handleDelete = async (
    selectedRows,
    setSelectedRows,
    inventories = []
  ) => {
    if (selectedRows.length === 0) return;

    if (!window.confirm(`Удалить ${selectedRows.length} инвентарей?`)) return;

    try {
      for (const id of selectedRows) {
        const inventory = inventories.find((i) => i.id === id);

        if (!inventory?.version) {
          console.error(
            "Не удалось выполнить удаление. Пожалуйста, обновите страницу"
          );
          return;
        }
        await deleteInventory({ inventoryId: id, version: inventory.version });
      }
      toast.success(`Инвентарь удален`);
      mutateMyInventories?.();
      mutateAccessInventories?.();
      setSelectedRows([]);
    } catch (error) {
      if (error?.response?.status === 409) {
        toast.error(
          "Данные были изменены другим пользователем. Пожалуйста, обновите страницу."
        );
      } else {
        toast.error("Ошибка при удалении");
      }
    }
  };

  const handleEdit = (selectedRows, navigate) => {
    if (selectedRows.length !== 1) {
      //  toast.info("Выберите один инвентарь для редактирования");
      return;
    }
    navigate(`/inventory-edit/${selectedRows[0]}`);
  };

  const handleUpdate = useCallback(
    async (inventoryId, formData) => {
      if (!inventoryId) {
        toast.error("ID инвентаря не найден");
        return false;
      }

      const result = await updateInventory({ inventoryId, formData });

      if (result.success) {
        mutateMyInventories?.();
        //  navigate("/profile");
        return true;
      }

      toast.error(result.message || "Ошибка обновления инвентаря");

      return false;
    },
    [updateInventory, mutateMyInventories, navigate]
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
