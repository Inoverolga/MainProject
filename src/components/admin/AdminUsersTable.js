import { useTranslation } from "react-i18next";

const AdminUsersTable = ({
  users,
  currentUser,
  onBlock,
  onAdmin,
  onDelete,
}) => {
  const { t } = useTranslation();
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
              {t("email")}
            </th>
            <th width="15%" className="text-dark">
              {t("name")}
            </th>
            <th width="10%" className="text-dark">
              {t("admin")}
            </th>
            <th width="15%" className="text-dark">
              {t("status")}
            </th>
            <th width="15%" className="text-dark">
              {t("registration")}
            </th>
            <th width="20%" className="text-dark">
              {t("actions")}
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
                  {user.isAdmin ? t("yes") : t("no")}
                </span>
              </td>
              <td>
                <span className="badge bg-light text-secondary border">
                  {user.isBlocked ? t("blocked") : t("active")}
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
                    title={user.isBlocked ? t("unblock") : t("block")}
                  >
                    {user.isBlocked ? "✓" : "🚫"}
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleAction("admin", user)}
                    title={user.isAdmin ? t("removeAdmin") : t("makeAdmin")}
                  >
                    ⚙️
                  </button>

                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => handleAction("delete", user)}
                    disabled={user.id === currentUser?.id}
                    title={t("delete")}
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
