import { useState } from "react";
import { useForm } from "react-hook-form";
import Select from "react-select";
import { useInventoryAccess } from "../../hooks/access/useInventoryAccess.js";
import { useUserSearch } from "../../hooks/search/useUserSearch.js";
import Spinner from "../spinner/Spinner.js";

const AccessTab = ({
  inventoryId,
  initialIsPublic = false,
  isOwner = false,
}) => {
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

  // Сортировка списка пользователей
  const [sortBy, setSortBy] = useState("name");
  const sortedUsers = [...accessListUsers].sort((a, b) =>
    a.user[sortBy].localeCompare(b.user[sortBy])
  );

  const isPublic = watch("isPublic"); //получение состояния публичного доступа

  //преобразуем для Select
  const userOptions = resultsSearchUsers.map((user) => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  // Обработчики
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

  // Проверка прав доступа
  if (!isOwner) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="text-warning mb-3">
            <i className="bi bi-shield-lock" style={{ fontSize: "3rem" }}></i>
          </div>
          <h5 className="card-title">Доступ ограничен</h5>
          <p className="text-muted">
            Только владелец инвентаря может управлять настройками доступа.
          </p>
          <small className="text-muted">
            Если вам нужен доступ к управлению, обратитесь к владельцу
            инвентаря.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="access-tab">
      <h3 className="mb-4">Управление доступом</h3>

      {/* Карточка публичного доступа */}
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
              Сделать инвентарь публичным
            </label>
          </div>
          <small className="text-muted d-block mt-2">
            {isPublic
              ? "✅ Все авторизованные пользователи могут добавлять товары"
              : "🔒 Только выбранные пользователи могут добавлять товары"}
            {isToggling && <span className="ms-2">Сохранение...</span>}
          </small>
        </div>
      </div>

      {/* Карточка добавления пользователей (только для приватных инвентарей) */}
      {!isPublic && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title mb-3">Добавить пользователя</h5>
            <form onSubmit={handleSubmit(onAddUser)}>
              <div className="mb-3">
                <label className="form-label">Выберите пользователя</label>
                <Select
                  options={userOptions}
                  onInputChange={setSearchTerm}
                  isLoading={isSearching}
                  placeholder="Введите имя или email..."
                  noOptionsMessage={() => "Начните вводить для поиска"}
                  loadingMessage={() => "Поиск пользователей..."}
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
                    Добавление...
                  </>
                ) : (
                  "Добавить доступ"
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Карточка списка пользователей с доступом */}
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">
              Пользователи с доступом{" "}
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
                  По имени
                </button>
                <button
                  onClick={() => setSortBy("email")}
                  className={`btn ${
                    sortBy === "email" ? "btn-primary" : "btn-outline-primary"
                  }`}
                >
                  По email
                </button>
              </div>
            )}
          </div>

          {sortedUsers.length === 0 ? (
            <p className="text-muted text-center py-3">
              Нет пользователей с доступом
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
                      Добавлен:
                      {new Date(access.createdAt).toLocaleDateString("ru-RU")}
                    </small>
                  </div>
                  <button
                    onClick={() => handleDeleteAccess(access.userId)}
                    className="btn btn-outline-danger btn-sm"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "..." : "Удалить"}
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
