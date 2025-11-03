import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.js";
import {
  fetchAllUser,
  fetchStats,
  fetchBlockAndUnblock,
  fetchAddRoleAdmin,
  fetchDeleteRoleAdmin,
} from "../../service/api.js";

export const useAdminData = () => {
  const { authUser: currentUser } = useContext(AuthContext);
  const isAdmin = currentUser?.isAdmin;

  const {
    data: allUsersData,
    error: allUsersError,
    isLoading: allUsersLoading,
    mutate: mutateAllUsers,
  } = useSWR(isAdmin ? "/admin/users" : null, fetchAllUser, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: statsData,
    error: statsError,
    isLoading: statsLoading,
  } = useSWR(isAdmin ? "/admin/stats" : null, fetchStats, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const { trigger: blockUser, isMutating: blockLoading } = useSWRMutation(
    "/admin/users/block",
    async (url, { arg: { userId, isBlocked } }) => {
      return await fetchBlockAndUnblock(
        isAdmin ? `/admin/users/${userId}/block` : null,
        isBlocked
      );
    }
  );

  const { trigger: changeAdminRole, isMutating: adminLoading } = useSWRMutation(
    "/admin/users/role",
    async (url, { arg: { userId, isAdmin } }) => {
      return await fetchAddRoleAdmin(
        isAdmin ? `/admin/users/${userId}/role` : null,
        isAdmin
      );
    }
  );

  const { trigger: deleteUser, isMutating: deleteLoading } = useSWRMutation(
    "/admin/users/delete",
    async (url, { arg: userId }) => {
      return await fetchDeleteRoleAdmin(
        isAdmin ? `/admin/users/${userId}` : null
      );
    }
  );

  const handleBlock = async (userId, isBlocked) => {
    try {
      await blockUser({ userId, isBlocked });
      toast.success(
        `Пользователь ${isBlocked ? "заблокирован" : "разблокирован"}`
      );
      mutateAllUsers();
    } catch (error) {
      toast.error(error.message || "Ошибка при блокировке пользователя");
    }
  };

  const handleAdmin = async (userId, isAdminRole) => {
    try {
      await changeAdminRole({ userId, isAdmin: isAdminRole });
      toast.success(
        `Права администратора ${isAdminRole ? "назначены" : "сняты"}`
      );
      mutateAllUsers();
    } catch (error) {
      toast.error(error.message || "Ошибка при изменении прав");
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      toast.success("Пользователь удален");
      mutateAllUsers();
    } catch (error) {
      toast.error(error.message || "Ошибка при удалении пользователя");
    }
  };

  const loading = allUsersLoading || statsLoading;
  const actionLoading = blockLoading || adminLoading || deleteLoading;

  return {
    users: allUsersData?.data || [],
    stats: statsData?.data || {},
    loading,
    actionLoading,
    currentUser,
    handleBlock,
    handleAdmin,
    handleDelete,
    usersError: allUsersError,
    statsError,
  };
};
