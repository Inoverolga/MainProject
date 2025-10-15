import { fetchRegisterUser } from "../../service/api";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset: resetForm,
  } = useForm({ mode: "onChange" }); // валидация при изменении

  const {
    trigger,
    isMutating,
    data: newUser,
    error,
  } = useSWRMutation("/auth/register", (url, { arg: formData }) =>
    fetchRegisterUser(url, formData)
  );

  const onSubmit = async (formData) => {
    await trigger(formData);
    resetForm();
  };

  if (newUser) {
    setTimeout(() => navigate("/"), 2000);
    return (
      <div className="container mt-5">
        <div className="alert alert-success">
          ✅ Регистрация успешна! Добро пожаловать, {newUser.name}
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">
            <i className="bi bi-person-plus me-2"></i>
            Регистрация нового пользователя
          </h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${errors.name && "is-invalid"}`}
                placeholder="Имя пользователя"
                {...register("name", {
                  required: "Обязательное поле",
                  minLength: { value: 2, message: "Минимум 2 символа" },
                  pattern: {
                    value: /^[A-Za-zА-Яа-яЁё\s]+$/,
                    message: "Только буквы",
                  },
                })}
              />
              {errors.name && (
                <div className="invalid-feedback">{errors.name.message}</div>
              )}
            </div>

            <div className="mb-3">
              <input
                type="email"
                className={`form-control ${errors.email && "is-invalid"}`}
                placeholder="Email"
                {...register("email", {
                  required: "Обязательное поле",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Некорректный email",
                  },
                })}
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email.message}</div>
              )}
            </div>

            <div className="mb-3">
              <input
                type="password"
                className={`form-control ${errors.password && "is-invalid"}`}
                placeholder="Пароль"
                {...register("password", {
                  required: "Обязательное поле",
                  minLength: { value: 1, message: "Минимум 1 символ" },
                })}
              />
              {errors.password && (
                <div className="invalid-feedback">
                  {errors.password.message}
                </div>
              )}
            </div>

            {error && (
              <div className="alert alert-danger">
                {error.response?.data?.error || "Ошибка регистрации"}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isMutating}
            >
              {isMutating ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
