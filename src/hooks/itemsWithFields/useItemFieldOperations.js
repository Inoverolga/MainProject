import { toast } from "react-toastify";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { useCallback } from "react";
import {
  fetchMyFieldCreate,
  fetchMyFieldDelete,
  fetchMyFieldUpdate,
} from "../../service/api.js";

export const useItemFieldOperations = (inventoryId, mutateFields) => {
  const { t } = useTranslation();
  const { trigger: createField, isMutating: isCreating } = useSWRMutation(
    "/users/inventories",
    (url, { arg: { inventoryId, fieldData } }) =>
      fetchMyFieldCreate(
        `${url}/${inventoryId}/fields-create-access`,
        fieldData
      )
  );

  const { trigger: updateField, isMutating: isUpdating } = useSWRMutation(
    "/users/fields-update-access",
    (url, { arg: { fieldId, fieldData } }) =>
      fetchMyFieldUpdate(`${url}/${fieldId}`, fieldData)
  );

  const { trigger: deleteField, isMutating: isDeleting } = useSWRMutation(
    "/users/fields-delete-access",
    (url, { arg: fieldId }) => fetchMyFieldDelete(`${url}/${fieldId}`)
  );

  const handleCreateField = async (fieldData) => {
    if (!inventoryId) {
      toast.error(t("inventoryIdNotFound"));
      return null;
    }

    const result = await createField({
      inventoryId,
      fieldData,
    });

    if (result.success) {
      mutateFields?.();
      toast.success(t("fieldCreatedSuccess"));
      return result.data;
    }
    toast.error(result.message || t("fieldCreationError"));
    return null;
  };

  const handleUpdateField = useCallback(
    async (fieldId, fieldData) => {
      const result = await updateField({ fieldId, fieldData });

      if (result.success) {
        mutateFields?.();
        toast.success(t("fieldUpdatedSuccess"));
        return true;
      }
      toast.error(result.message || t("fieldUpdateError"));
      return false;
    },
    [updateField, mutateFields]
  );

  const handleDeleteField = async (fieldId) => {
    const result = await deleteField(fieldId);

    if (result.success) {
      mutateFields?.();
      toast.success(t("fieldDeletedSuccess"));
      return true;
    }
    toast.error(result.message || t("fieldDeletionError"));
    return false;
  };

  return {
    handleCreateField,
    handleUpdateField,
    handleDeleteField,
    isMutating: isCreating || isUpdating || isDeleting,
  };
};
