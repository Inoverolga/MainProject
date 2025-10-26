import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useCallback } from "react";
import {
  fetchMyFieldCreate,
  fetchMyFieldDelete,
  fetchMyFieldUpdate,
} from "../service/api.js";

export const useItemFieldOperations = (inventoryId, mutateFields) => {
  // Создание кастомного поля товара
  const { trigger: createField, isMutating: isCreating } = useSWRMutation(
    "/users/inventories",
    (url, { arg: { inventoryId, fieldData } }) =>
      fetchMyFieldCreate(
        `${url}/${inventoryId}/fields-create-access`,
        fieldData
      )
  );

  // Обновление поля
  const { trigger: updateField, isMutating: isUpdating } = useSWRMutation(
    "/users/fields-update-access",
    (url, { arg: { fieldId, fieldData } }) =>
      fetchMyFieldUpdate(`${url}/${fieldId}`, fieldData)
  );

  // Удаление поля
  const { trigger: deleteField, isMutating: isDeleting } = useSWRMutation(
    "/users/fields-delete-access",
    (url, { arg: fieldId }) => fetchMyFieldDelete(`${url}/${fieldId}`)
  );

  const handleCreateField = async (fieldData) => {
    if (!inventoryId) {
      toast.error("ID инвентаря не найден");
      return null;
    }

    const result = await createField({
      inventoryId,
      fieldData,
    });

    if (result.success) {
      mutateFields?.();
      toast.success("Поле успешно создано");
      return result.data;
    }
    toast.error(result.message || "Ошибка создания поля");
    return null;
  };

  const handleUpdateField = useCallback(
    async (fieldId, fieldData) => {
      const result = await updateField({ fieldId, fieldData });

      if (result.success) {
        mutateFields?.();
        toast.success("Поле успешно обновлено");
        return true;
      }
      toast.error(result.message || "Ошибка обновления поля");
      return false;
    },
    [updateField, mutateFields]
  );

  const handleDeleteField = async (fieldId) => {
    const result = await deleteField(fieldId);

    if (result.success) {
      mutateFields?.();
      toast.success("Поле удалено");
      return true;
    }
    toast.error(result.message || "Ошибка удаления поля");
    return false;
  };

  return {
    handleCreateField,
    handleUpdateField,
    handleDeleteField,
    isMutating: isCreating || isUpdating || isDeleting,
  };
};
