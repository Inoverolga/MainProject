import { toast } from "react-toastify";
import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext.js";
import { SearchContext } from "../../contexts/SearchContext.js"; // ✅ Добавить
import { useGlobalSearch } from "../../hooks/search/useGlobalSearch.js";
import AdminStats from "../../components/admin/AdminStats.js";
import AdminUsersTable from "../../components/admin/AdminUsersTable.js";
import { useAdminData } from "../../hooks/admin/useAdmin.js";
import Spinner from "../../components/spinner/Spinner.js";

const AdminPage = () => {
  const { authUser } = useContext(AuthContext);
  const { searchTerm } = useContext(SearchContext);
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

  const { searchResults, isLoading: searchLoading } = useGlobalSearch("admin");

  useEffect(() => {
    if (authUser && !authUser.isAdmin) {
      toast.error("У вас нет прав для доступа к панели администратора");
      navigate("/");
    }
  }, [authUser, navigate]);

  if (!authUser?.isAdmin) return null;
  if (loading && !users.length) return <Spinner />;

  const displayUsers = searchTerm ? searchResults : users;
  const displayLoading = loading || searchLoading;

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <h1 className="h3 mb-4 text-dark">Панель администратора</h1>

          <div
            className="mb-4 text-center mx-auto"
            style={{ width: "fit-content" }}
          >
            <AdminStats stats={stats} />
          </div>

          <div className="card border-light">
            <div className="card-body">
              <h2 className="h5 mb-3 text-dark">Управление пользователями</h2>

              <AdminUsersTable
                users={displayUsers}
                currentUser={currentUser}
                loading={displayLoading}
                onBlock={handleBlock}
                onAdmin={handleAdmin}
                onDelete={handleDelete}
                searchTerm={searchTerm}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
