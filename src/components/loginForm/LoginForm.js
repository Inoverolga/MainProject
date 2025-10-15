import { Link } from "react-router-dom";
const LoginForm = () => {
  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">
          <i className="bi bi-box-seam me-2"></i>
          Вход в систему
        </h5>
        <form className="row g-3 align-items-end pt-4">
          <div className="col-md-4">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="example@mail.ru"
            />
          </div>

          <div className="col-md-4">
            <label htmlFor="password" className="form-label">
              Пароль
            </label>
            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Введите пароль"
            />
          </div>

          <div className="col-md-4">
            <button type="submit" className="btn btn-primary w-100">
              Войти
            </button>
          </div>
        </form>

        <div className="mt-3">
          <small>
            Нет аккаунта?{" "}
            <Link
              to={"/auth/register"}
              className="text-decoration-none fw-medium"
            >
              Зарегистрироваться
            </Link>
          </small>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
