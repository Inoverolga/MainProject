import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
        `/admin/users/${userId}/block`,
        isBlocked
      );
    }
  );

  const { trigger: changeAdminRole, isMutating: adminLoading } = useSWRMutation(
    "/admin/users/role",
    async (url, { arg: { userId, isAdmin: isAdminRole } }) => {
      return await fetchAddRoleAdmin(
        `/admin/users/${userId}/role`,
        isAdminRole
      );
    }
  );

  const { trigger: deleteUser, isMutating: deleteLoading } = useSWRMutation(
    "/admin/users/delete",
    async (url, { arg: userId }) => {
      return await fetchDeleteRoleAdmin(`/admin/users/${userId}`);
    }
  );

  const handleBlock = async (userId, isBlocked) => {
    try {
      await blockUser({ userId, isBlocked });
      toast.success(isBlocked ? t("userBlocked") : t("userUnblocked"));
      mutateAllUsers();
    } catch (error) {
      toast.error(error.message || t("blockUserError"));
    }
  };

  const handleAdmin = async (userId, isAdminRole) => {
    try {
      await changeAdminRole({ userId, isAdmin: isAdminRole });
      toast.success(
        isAdminRole ? t("adminRoleGranted") : t("adminRoleRevoked")
      );
      mutateAllUsers();
    } catch (error) {
      toast.error(error.message || t("changeRoleError"));
    }
  };

  const handleDelete = async (userId) => {
    try {
      await deleteUser(userId);
      toast.success(t("userDeleted"));
      mutateAllUsers();
    } catch (error) {
      toast.error(error.message || t("deleteUserError"));
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
