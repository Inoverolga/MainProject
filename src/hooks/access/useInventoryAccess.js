import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import {
  fetchUserListAccess,
  fetchTogglePublicAccess,
  fetchUserAditAccess,
  fetchUserDeleteAccess,
  //fetchUserSearch,
} from "../../service/api.js";

export const useInventoryAccess = (inventoryId) => {
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

  // Мутация(добавление доступа)
  const { trigger: addAccess, isMutating: isAdding } = useSWRMutation(
    `/access/user/${inventoryId}/edit-access`,
    (url, { arg: userId }) => fetchUserAditAccess(url, { userId })
  );

  // Мутация (удаления доступа)
  const { trigger: removeAccess, isMutating: isDeleting } = useSWRMutation(
    `/access/user/${inventoryId}`,
    (url, { arg: userId }) =>
      fetchUserDeleteAccess(`${url}/${userId}/delete-access`)
  );

  // Мутация для переключения публичного доступа
  const { trigger: togglePublicAccess, isMutating: isToggling } =
    useSWRMutation(
      `/access/user/${inventoryId}/public-access`,
      (url, { arg: isPublic }) => fetchTogglePublicAccess(url, isPublic)
    );

  const handleAddAccess = async (userId) => {
    try {
      await addAccess(userId);
      mutate();
      toast.success("Доступ предоставлен");
    } catch (error) {
      toast.error("Ошибка при добавлении доступа");
      throw error;
    }
  };

  const handleDeleteAccess = async (userId) => {
    try {
      await removeAccess(userId);
      mutate();
      toast.success("Доступ удален");
    } catch (error) {
      toast.error("Ошибка при удалении доступа");
      throw error;
    }
  };

  const handleTogglePublic = async (isPublic) => {
    try {
      await togglePublicAccess(isPublic);
      mutate();
      toast.success(`Инвентарь теперь ${isPublic ? "публичный" : "приватный"}`);
    } catch (error) {
      toast.error("Ошибка при изменении настроек доступа");
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
