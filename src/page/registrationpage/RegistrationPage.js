import { fetchMagicLink } from "../../service/api";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const RegistrationPage = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset: resetForm,
  } = useForm({ mode: "onChange" });

  const {
    trigger: magicTrigger,
    isMutating: isSendingMagicLink,
    error: magicError,
  } = useSWRMutation("/auth/magic", fetchMagicLink);

  const onSubmit = async (formData) => {
    try {
      console.log("📤 Отправляемые данные:", formData);
      await magicTrigger({
        email: formData.email,
        name: formData.name,
        password: String(formData.password),
        isRegistration: true,
      });

      resetForm();

      toast.success(
        `Регистрация успешна!
         Ссылка для входа
         отправлена на
         ${formData.email}`
      );
      navigate("/");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(
          error.response.data.error ||
            "Пользователь с таким email уже существует"
        );
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error("Ошибка отправки ссылки");
        console.error("Ошибка регистрации:", error);
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">📋 Регистрация нового пользователя</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${errors.name && "is-invalid"}`}
                placeholder="Имя пользователя"
                {...register("name", {
                  required: "Обязательное поле",
                  minLength: { value: 2, message: "Минимум 2 символа" },
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

            {magicError && (
              <div className="alert alert-danger">
                {magicError.response?.data?.error || "Ошибка регистрации"}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!isValid || isSendingMagicLink}
            >
              📝 {isSendingMagicLink ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
