import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { fetchLoginUser } from "../../service/api";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

const LoginForm = () => {
  const { login, openOAuthPopup } = useContext(AuthContext);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset: resetForm,
  } = useForm({ mode: "onChange" }); // валидация при изменении

  const {
    trigger,
    isMutating,
    data: dataUser,
    error,
  } = useSWRMutation("/auth/login", fetchLoginUser);

  const onSubmit = async (formData) => {
    try {
      await trigger(formData);
      resetForm();
    } catch (error) {}
  };

  useEffect(() => {
    const handleLogin = (user, token) => {
      toast.success(`${user.name}, добро пожаловать в систему!`);
      login(user, token);
      navigate("/");
    };

    if (dataUser) {
      handleLogin(dataUser.user, dataUser.token);
    }

    const handleOAuthMessage = (event) => {
      if (event.data.type === "OAUTH_SUCCESS") {
        handleLogin(event.data.user, event.data.token);
      }
      if (event.data.type === "OAUTH_ERROR") {
        toast.error(event.data.error);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [dataUser, navigate, login]);

  return (
    <>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">
            <i className="bi bi-box-seam me-2"></i>
            Вход в систему
          </h5>
          <form
            className="row g-3 align-items-end pt-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="col-md-4">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                type="email"
                className={`form-control ${errors.email && "is-invalid"}`}
                id="email"
                placeholder="example@mail.ru"
                {...register("email", {
                  required: "Обязательное поле",
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="col-md-4">
              <label htmlFor="password" className="form-label">
                Пароль
              </label>
              <input
                type="password"
                className={`form-control ${errors.password && "is-invalid"}`}
                id="password"
                placeholder="Введите пароль"
                {...register("password", {
                  required: "Обязательное поле",
                })}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            <div className="col-md-4">
              <button
                type="submit"
                className="btn btn-primary w-100"
                disabled={!isValid || isMutating}
              >
                {isMutating ? "Вход..." : "Войти"}
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-danger mt-3">{error.message}</div>
          )}

          <div className="mt-3 d-flex gap-2">
            <button
              className="btn btn-outline-danger btn-sm flex-fill"
              onClick={() => openOAuthPopup("google")}
            >
              <i className="bi bi-google"></i> Войти через Google
            </button>
            <button
              className="btn btn-outline-primary btn-sm flex-fill"
              onClick={() => openOAuthPopup("facebook")}
            >
              <i className="bi bi-facebook"></i> Войти через Facebook
            </button>
          </div>

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
    </>
  );
};

export default LoginForm;
