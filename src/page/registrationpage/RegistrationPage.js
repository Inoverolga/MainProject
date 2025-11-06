import { fetchMagicLink } from "../../service/api";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const RegistrationPage = () => {
  const { t } = useTranslation();
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
      await magicTrigger({
        email: formData.email,
        name: formData.name,
        password: String(formData.password),
        isRegistration: true,
      });

      resetForm();

      toast.success(t("registrationSuccess", { email: formData.email }));
      navigate("/");
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || t("userAlreadyExists"));
        setTimeout(() => navigate("/"), 2000);
      } else {
        toast.error(t("linkSendError"));
      }
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <h2 className="mb-4">📋 {t("registration")}</h2>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <input
                type="text"
                className={`form-control ${errors.name && "is-invalid"}`}
                placeholder={t("username")}
                {...register("name", {
                  required: t("fieldRequired"),
                  minLength: { value: 2, message: t("minLength2") },
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
                  required: t("fieldRequired"),
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: t("invalidEmail"),
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
                placeholder={t("password")}
                {...register("password", {
                  required: t("fieldRequired"),
                  minLength: { value: 1, message: t("minLength1") },
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
                {magicError.response?.data?.error || t("registrationError")}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!isValid || isSendingMagicLink}
            >
              📝 {isSendingMagicLink ? t("registering") : t("register")}
            </button>
            <div className="mt-3 text-center">
              <Link to="/" className="btn btn-outline-secondary btn-sm">
                ← {t("backToHome")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
