const AdminUsersTable = ({
  users,
  currentUser,
  onBlock,
  onAdmin,
  onDelete,
}) => {
  const handleAction = (type, user) => {
    switch (type) {
      case "block":
        onBlock(user.id, !user.isBlocked);
        break;
      case "admin":
        onAdmin(user.id, !user.isAdmin);
        break;
      case "delete":
        onDelete(user.id);
        break;
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-hover">
        <thead>
          <tr>
            <th width="25%" className="text-dark">
              Email
            </th>
            <th width="15%" className="text-dark">
              Имя
            </th>
            <th width="10%" className="text-dark">
              Админ
            </th>
            <th width="15%" className="text-dark">
              Статус
            </th>
            <th width="15%" className="text-dark">
              Регистрация
            </th>
            <th width="20%" className="text-dark">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td className="fw-semibold text-secondary">{user.email}</td>
              <td className="text-secondary">{user.name}</td>
              <td>
                <span className="badge bg-light text-secondary border">
                  {user.isAdmin ? "Да" : "Нет"}
                </span>
              </td>
              <td>
                <span className="badge bg-light text-secondary border">
                  {user.isBlocked ? "Заблокирован" : "Активен"}
                </span>
              </td>
              <td className="text-secondary">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("ru-RU")
                  : "-"}
              </td>
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleAction("block", user)}
                    title={user.isBlocked ? "Разблокировать" : "Заблокировать"}
                  >
                    {user.isBlocked ? "✓" : "🚫"}
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleAction("admin", user)}
                    title={user.isAdmin ? "Снять права" : "Сделать админом"}
                  >
                    ⚙️
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleAction("delete", user)}
                    disabled={user.id === currentUser?.id}
                    title="Удалить"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersTable;
