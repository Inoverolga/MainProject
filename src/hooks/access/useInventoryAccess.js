import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import {
  fetchUserListAccess,
  fetchTogglePublicAccess,
  fetchUserAditAccess,
  fetchUserDeleteAccess,
} from "../../service/api.js";

export const useInventoryAccess = (inventoryId) => {
  const { t } = useTranslation();

  const {
    data: accessDataUsers,
    error,
    isLoading,
    mutate,
  } = useSWR(
    inventoryId
      ? `/access/user/inventories/${inventoryId}/user-list-access`
      : null,
    fetchUserListAccess,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      keepPreviousData: true,
    }
  );

  const { trigger: addAccess, isMutating: isAdding } = useSWRMutation(
    `/access/user/${inventoryId}/edit-access`,
    (url, { arg: userId }) => fetchUserAditAccess(url, { userId })
  );

  const { trigger: removeAccess, isMutating: isDeleting } = useSWRMutation(
    `/access/user/${inventoryId}`,
    (url, { arg: userId }) =>
      fetchUserDeleteAccess(`${url}/${userId}/delete-access`)
  );

  const { trigger: togglePublicAccess, isMutating: isToggling } =
    useSWRMutation(
      `/access/user/${inventoryId}/public-access`,
      (url, { arg: isPublic }) => fetchTogglePublicAccess(url, isPublic)
    );

  const handleAddAccess = async (userId) => {
    try {
      await addAccess(userId);
      mutate();
      toast.success(t("accessGranted"));
    } catch (error) {
      toast.error(t("addAccessError"));
      throw error;
    }
  };

  const handleDeleteAccess = async (userId) => {
    try {
      await removeAccess(userId);
      mutate();
      toast.success(t("accessRemoved"));
    } catch (error) {
      toast.error(t("removeAccessError"));
      throw error;
    }
  };

  const handleTogglePublic = async (isPublic) => {
    try {
      await togglePublicAccess(isPublic);
      mutate();
      toast.success(
        isPublic ? t("inventoryNowPublic") : t("inventoryNowPrivate")
      );
    } catch (error) {
      toast.error(t("toggleAccessError"));
      throw error;
    }
  };

  return {
    accessListUsers: accessDataUsers?.data || [],
    isLoading,
    error,
    handleAddAccess,
    handleDeleteAccess,
    handleTogglePublic,
    isAdding,
    isDeleting,
    isToggling,
  };
};
