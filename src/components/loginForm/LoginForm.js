import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import useSWRMutation from "swr/mutation";
import { fetchLoginUser } from "../../service/api";

const LoginForm = () => {
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

  useEffect(() => {
    if (dataUser) {
      console.log("✅ Успешный вход! Пользователь:", dataUser);

      localStorage.setItem("accessToken", dataUser.token);
      localStorage.setItem("user", JSON.stringify(dataUser.user));

      navigate("/");
    }
  }, [dataUser, navigate]); // ← зависимость от dataUser

  const onSubmit = async (formData) => {
    try {
      await trigger(formData);
      resetForm();
    } catch (error) {}
  };

  return (
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
              className={`form-control ${errors.email && "is-invalid"}`}
              id="password"
              placeholder="Введите пароль"
              {...register("password", {
                required: "Обязательное поле",
              })}
            />
            {errors.password && (
              <div className="invalid-feedback">{errors.password.message}</div>
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
