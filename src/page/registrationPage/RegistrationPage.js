import { fetchMagicLink } from "../../service/api";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";

const RegistrationPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset: resetForm,
  } = useForm({ mode: "onChange" }); // валидация при изменении

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
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(
          error.response.data.error ||
            "Пользователь с таким email уже существует"
        );
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
              {isSendingMagicLink ? "Регистрация..." : "Зарегистрироваться"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;

// const RegistrationPage = () => {
//   const navigate = useNavigate();
//   const { openAuthPopup } = useContext(AuthContext);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isValid },
//     reset: resetForm,
//   } = useForm({ mode: "onChange" }); // валидация при изменении

//   const {
//     trigger: registerTrigger,
//     isMutating: isRegistering,
//     data: newUser,
//     error: registerError,
//   } = useSWRMutation("/auth/register", fetchRegisterUser);

//   const { trigger: magicTrigger, isMutating: isSendingMagicLink } =
//     useSWRMutation("/auth/magic", fetchMagicLink);

//   const onSubmit = async (formData) => {
//     try {
//       await magicTrigger({ email: formData.email });
//       //await registerTrigger(formData);
//       resetForm();

//       toast.success(
//         `Регистрация успешна!
//          Ссылка для входа
//          отправлена на
//          ${formData.email}`
//       );
//       //setTimeout(() => navigate("/"), 1000);
//     } catch (error) {
//       toast.error("Ошибка регистрации");
//       setTimeout(() => navigate("/"), 1000);
//       console.error("Ошибка регистрации:", error);
//     }
//   };

//   const isLoading = isRegistering || isSendingMagicLink;

//   return (
//     <div className="container mt-5">
//       <div className="row justify-content-center">
//         <div className="col-md-6">
//           <h2 className="mb-4">
//             <i className="bi bi-person-plus me-2"></i>
//             Регистрация нового пользователя
//           </h2>

//           <form onSubmit={handleSubmit(onSubmit)}>
//             <div className="mb-3">
//               <input
//                 type="text"
//                 className={`form-control ${errors.name && "is-invalid"}`}
//                 placeholder="Имя пользователя"
//                 {...register("name", {
//                   required: "Обязательное поле",
//                   minLength: { value: 2, message: "Минимум 2 символа" },
//                 })}
//               />
//               {errors.name && (
//                 <div className="invalid-feedback">{errors.name.message}</div>
//               )}
//             </div>

//             <div className="mb-3">
//               <input
//                 type="email"
//                 className={`form-control ${errors.email && "is-invalid"}`}
//                 placeholder="Email"
//                 {...register("email", {
//                   required: "Обязательное поле",
//                   pattern: {
//                     value: /^\S+@\S+$/i,
//                     message: "Некорректный email",
//                   },
//                 })}
//               />
//               {errors.email && (
//                 <div className="invalid-feedback">{errors.email.message}</div>
//               )}
//             </div>

//             <div className="mb-3">
//               <input
//                 type="password"
//                 className={`form-control ${errors.password && "is-invalid"}`}
//                 placeholder="Пароль"
//                 {...register("password", {
//                   required: "Обязательное поле",
//                   minLength: { value: 1, message: "Минимум 1 символ" },
//                 })}
//               />
//               {errors.password && (
//                 <div className="invalid-feedback">
//                   {errors.password.message}
//                 </div>
//               )}
//             </div>

//             {registerError && (
//               <div className="alert alert-danger">
//                 {registerError.response?.data?.error || "Ошибка регистрации"}
//               </div>
//             )}

//             <button
//               type="submit"
//               className="btn btn-primary w-100"
//               disabled={!isValid || isLoading}
//             >
//               {isLoading ? "Регистрация..." : "Зарегистрироваться"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegistrationPage;
