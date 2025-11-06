import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import useSWRMutation from "swr/mutation";
import { fetchLoginUser } from "../../service/api";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const LoginForm = () => {
  const { t } = useTranslation();
  const { login, openOAuthPopup } = useContext(AuthContext);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset: resetForm,
  } = useForm({ mode: "onChange" });

  const {
    trigger,
    isMutating,
    data: dataUser,
    error,
  } = useSWRMutation("/auth/login", fetchLoginUser);

  const onSubmit = async (formData) => {
    try {
      const result = await trigger(formData);

      if (result) {
        toast.success(t("welcomeMessage", { name: result.user.name }));
        login(result.user, result.token);
        resetForm();
        const userIsAdmin = result.user.isAdmin;
        navigate(userIsAdmin ? "/" : "/profile");
      }
    } catch (error) {}
  };

  useEffect(() => {
    const handleOAuthMessage = (event) => {
      if (event.data.type === "OAUTH_SUCCESS") {
        toast.success(t("welcomeMessage", { name: event.data.user.name }));
        login(event.data.user, event.data.token);
        const userIsAdmin = event.data.user.isAdmin;
        navigate(userIsAdmin ? "/" : "/profile");
      }
      if (event.data.type === "OAUTH_ERROR") {
        toast.error(event.data.error);
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, [navigate, login]);

  return (
    <>
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">🔐 {t("loginToSystem")}</h5>

          <LoginFormAouth openOAuthPopup={openOAuthPopup} />

          <div className="text-center my-3 position-relative">
            <hr />
            <span className="bg-body px-3 text-muted position-absolute top-50 start-50 translate-middle">
              {t("or")}
            </span>
          </div>

          {!showEmailForm ? (
            <div className="text-center">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setShowEmailForm(true)}
                disabled={isMutating}
              >
                <i className="bi bi-envelope me-2"></i>
                {isMutating ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    {t("loggingIn")}
                  </>
                ) : (
                  t("loginWithEmail")
                )}
              </button>
            </div>
          ) : (
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
                  placeholder={t("emailPlaceholder")}
                  {...register("email", {
                    required: t("fieldRequired"),
                  })}
                />
                {errors.email && (
                  <div className="invalid-feedback">{errors.email.message}</div>
                )}
              </div>

              <div className="col-md-4">
                <label htmlFor="password" className="form-label">
                  {t("password")}
                </label>
                <input
                  type="password"
                  className={`form-control ${errors.password && "is-invalid"}`}
                  id="password"
                  placeholder={t("passwordPlaceholder")}
                  {...register("password", {
                    required: t("fieldRequired"),
                  })}
                />
                {errors.password && (
                  <div className="invalid-feedback">
                    {errors.password.message}
                  </div>
                )}
              </div>

              <div className="col-md-4">
                <div className="d-flex gap-2">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1"
                    disabled={!isValid || isMutating}
                  >
                    {isMutating ? t("loggingIn") : t("login")}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setShowEmailForm(false);
                      resetForm();
                    }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </form>
          )}

          {error && (
            <div className="alert alert-danger mt-3">{error.message}</div>
          )}

          <div className="mt-3">
            <small>
              {t("noAccount")}{" "}
              <Link
                to={"/auth/register"}
                className="text-decoration-none fw-medium"
              >
                {t("register")}
              </Link>
            </small>
          </div>
        </div>
      </div>
    </>
  );
};

export const LoginFormAouth = ({ openOAuthPopup }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-3 d-flex gap-2">
      <button
        className="btn btn-outline-danger btn-sm flex-fill"
        onClick={() => openOAuthPopup("google")}
      >
        <i className="bi bi-google"></i> {t("loginWithGoogle")}
      </button>
      <button
        className="btn btn-outline-primary btn-sm flex-fill"
        onClick={() => openOAuthPopup("facebook")}
      >
        <i className="bi bi-facebook"></i> {t("loginWithFacebook")}
      </button>
    </div>
  );
};
