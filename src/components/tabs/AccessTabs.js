import { useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { useInventoryAccess } from "../../hooks/access/useInventoryAccess.js";
import { useUserSearch } from "../../hooks/search/useUserSearch.js";
import Spinner from "../spinner/Spinner.js";
import { useTranslation } from "react-i18next";

const AccessTab = ({
  inventoryId,
  initialIsPublic = false,
  isOwner = false,
}) => {
  const { t } = useTranslation();
  const {
    accessListUsers,
    isLoading,
    handleAddAccess,
    handleDeleteAccess,
    handleTogglePublic,
    isAdding,
    isDeleting,
    isToggling,
  } = useInventoryAccess(inventoryId);

  const {
    searchTerm,
    setSearchTerm,
    resultsSearchUsers,
    isSearching,
    clearSearch,
  } = useUserSearch();
  const { watch, setValue, handleSubmit } = useForm({
    defaultValues: { selectedUser: null, isPublic: initialIsPublic },
  });

  const [sortBy, setSortBy] = useState("name");
  const sortedUsers = [...accessListUsers].sort((a, b) =>
    a.user[sortBy].localeCompare(b.user[sortBy])
  );

  const isPublic = watch("isPublic");

  const userOptions = resultsSearchUsers.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  const onAddUser = async (data) => {
    if (data.selectedUser) {
      await handleAddAccess(data.selectedUser.value);
      setValue("selectedUser", null);
      clearSearch();
    }
  };

  const onTogglePublic = async (newIsPublic) => {
    try {
      await handleTogglePublic(newIsPublic);
      setValue("isPublic", newIsPublic);
    } catch (error) {
      setValue("isPublic", !newIsPublic);
    }
  };

  if (isLoading) return <Spinner />;

  if (!isOwner) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="text-warning mb-3">
            <i className="bi bi-shield-lock" style={{ fontSize: "3rem" }}></i>
          </div>
          <h5 className="card-title">{t("accessRestricted")}</h5>
          <p className="text-muted">{t("onlyOwnerCanManageAccess")}</p>
          <small className="text-muted">{t("contactOwnerForAccess")}</small>
        </div>
      </div>
    );
  }

  return (
    <div className="access-tab">
      <h3 className="mb-4">{t("accessManagement")}</h3>

      <div className="card mb-4">
        <div className="card-body">
          <div className="form-check form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              checked={isPublic}
              onChange={(e) => onTogglePublic(e.target.checked)}
              disabled={isToggling}
              style={{ transform: "scale(1.2)" }}
            />
            <label className="form-check-label fw-bold">
              {t("makeInventoryPublic")}
            </label>
          </div>
          <small className="text-muted d-block mt-2">
            {isPublic
              ? t("publicAccessDescription")
              : t("privateAccessDescription")}
            {isToggling && <span className="ms-2">{t("saving")}</span>}
          </small>
        </div>
      </div>

      {!isPublic && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">{t("addUser")}</h5>
            <form onSubmit={handleSubmit(onAddUser)}>
              <div className="mb-3">
                <label className="form-label">{t("selectUser")}</label>
                <Select
                  options={userOptions}
                  onInputChange={setSearchTerm}
                  isLoading={isSearching}
                  placeholder={t("searchUserPlaceholder")}
                  noOptionsMessage={() => t("startTypingToSearch")}
                  loadingMessage={() => t("searchingUsers")}
                  isDisabled={isAdding}
                  value={watch("selectedUser")}
                  onChange={(selected) => setValue("selectedUser", selected)}
                />
              </div>
              <button
                type="submit"
                className="btn btn-success"
                disabled={isAdding || !watch("selectedUser")}
              >
                {isAdding ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    {t("adding")}
                  </>
                ) : (
                  t("addAccess")
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">
              {t("usersWithAccess")}
              {sortedUsers.length > 0 && `(${sortedUsers.length})`}
            </h5>
            {sortedUsers.length > 0 && (
              <div className="btn-group btn-group-sm">
                <button
                  onClick={() => setSortBy("name")}
                  className={`btn ${
                    sortBy === "name" ? "btn-primary" : "btn-outline-primary"
                  }`}
                >
                  {t("byName")}
                </button>
                <button
                  onClick={() => setSortBy("email")}
                  className={`btn ${
                    sortBy === "email" ? "btn-primary" : "btn-outline-primary"
                  }`}
                >
                  {t("byEmail")}
                </button>
              </div>
            )}
          </div>

          {sortedUsers.length === 0 ? (
            <p className="text-muted text-center py-3">
              {t("noUsersWithAccess")}
            </p>
          ) : (
            <div className="access-list">
              {sortedUsers.map((access) => (
                <div
                  key={access.id}
                  className="d-flex justify-content-between align-items-center py-2 border-bottom"
                >
                  <div className="user-info">
                    <strong className="d-block">{access.user.name}</strong>
                    <small className="text-muted d-block">
                      {access.user.email}
                    </small>
                    <small className="text-muted">
                      {t("added")}:
                      {new Date(access.createdAt).toLocaleDateString("ru-RU")}
                    </small>
                  </div>
                  <button
                    onClick={() => handleDeleteAccess(access.userId)}
                    className="btn btn-outline-danger btn-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "..." : t("delete")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessTab;
