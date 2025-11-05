import { useNavigate } from "react-router-dom";

const AdminPanel = ({ currentInventoryId }) => {
  const navigate = useNavigate();

  const menuItems = [
    { path: "/admin", label: "Страница администратора" },
    { path: "/profile", label: "Инвентари" },
  ];

  const handleMenuItemClick = (path) => {
    navigate(path);
  };
  return (
    <div className="dropdown">
      <button
        className="btn btn-outline-secondary dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        🛡️
      </button>
      <ul className="dropdown-menu">
        {menuItems.map((item, i) => (
          <li key={i}>
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => handleMenuItemClick(item.path)}
            >
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;
