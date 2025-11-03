// pages/AdminPage.jsx
import { toast } from "react-toastify";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.js";
import AdminStats from "../../components/admin/AdminStats.js";
import AdminUsersTable from "../../components/admin/AdminUsersTable.js";
import { useAdminData } from "../../hooks/admin/useAdmin.js";
import Spinner from "../../components/spinner/Spinner.js";

const AdminPage = () => {
  const { authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    users,
    stats,
    loading,
    currentUser,
    handleBlock,
    handleAdmin,
    handleDelete,
  } = useAdminData();

  useEffect(() => {
    if (authUser && !authUser.isAdmin) {
      toast.error("У вас нет прав для доступа к панели администратора");
      navigate("/");
    }
  }, [authUser, navigate]);

  if (!authUser?.isAdmin) return null;
  if (loading && !users.length) return <Spinner />;

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4 text-dark">Панель администратора</h1>

          {/* Статистика */}
          <div
            className="mb-4 text-center mx-auto"
            style={{ width: "fit-content" }}
          >
            <AdminStats stats={stats} />
          </div>

          {/* Управление пользователями */}
          <div className="card border-light">
            <div className="card-body">
              <h2 className="h5 mb-3 text-dark">Управление пользователями</h2>

              <AdminUsersTable
                users={users}
                currentUser={currentUser}
                loading={loading}
                onBlock={handleBlock}
                onAdmin={handleAdmin}
                onDelete={handleDelete}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
