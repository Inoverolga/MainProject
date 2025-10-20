import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import useSWR from "swr";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchCreateInventories, fetchTags } from "../../service/api";
import { useState } from "react";
import CreatableSelect from "react-select/creatable";

const CreateInventoryPage = () => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchInput, setTagSearchInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset: resetForm,
  } = useForm({ mode: "onChange" });

  const { trigger, isMutating } = useSWRMutation(
    "/users/inventories-create",
    fetchCreateInventories
  );

  const { data: tags = [], isLoading: tagsLoading } = useSWR(
    tagSearchInput ? `/tags/autocompletion?q=${tagSearchInput}` : null,
    fetchTags,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const tagOptions = tags.map((tag) => ({
    value: tag, // сохраняемое значение (пойдет в БД)
    label: tag, // отображаемый текст (увидит пользователь)
  }));

  const onSubmit = async (formData) => {
    try {
      const tagValues = selectedTags.map((tag) => tag.value);

      const dataWithTags = {
        ...formData,
        tags: tagValues, // ← добавляем теги к данным формы
        isPublic: formData.isPublic === "true",
      };
      console.log("📤 Отправляемые данные:", dataWithTags);
      const result = await trigger(dataWithTags);
      if (result.success) {
        toast.success("Инвентарь успешно создан!");
        setSelectedTags([]);
        resetForm();

        const newInventoryId = result.data.id;
        navigate(`/inventory/${newInventoryId}`);
      } else {
        toast.error(result.message || "Ошибка создания инвентаря");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Ошибка создания инвентаря");
      // setTimeout(() => navigate("/profile"), 2000);
    }
  };

  return (
    <div className="container mt-4">
      <h2>🧰 Создание инвентаря</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Название */}
        <div className="mb-3">
          <label className="form-label">Название</label>
          <input
            type="text"
            className="form-control"
            {...register("name", { required: "Название обязательно" })}
          />
          {errors.name && (
            <div className="text-danger">{errors.name.message}</div>
          )}
        </div>

        {/* Описание */}
        <div className="mb-3">
          <label className="form-label">Описание</label>
          <textarea
            className="form-control"
            placeholder="Описание инвентаря (поддерживает Markdown)..."
            rows={4}
            {...register("description", {
              required: "Поле обязательно к заполнению",
              minLength: { value: 10, message: "Минимум 10 символов" },
              maxLength: { value: 1000, message: "Максимум 1000 символов" },
            })}
          />

          {errors.description && (
            <div className="text-danger">{errors.description.message}</div>
          )}
        </div>

        {/* Категория */}
        <div className="mb-3">
          <label className="form-label">Категория</label>
          <select
            className={`form-select ${errors.category ? "is-invalid" : ""}`}
            {...register("category", { required: "Выберите категорию" })}
          >
            <option value="">Выберите категорию</option>
            <option value="Оборудование">Оборудование</option>
            <option value="Мебель">Мебель</option>
            <option value="Книги">Книги</option>
            <option value="Другое">Другое</option>
          </select>
          {errors.category && (
            <div className="invalid-feedback">{errors.category.message}</div>
          )}
        </div>

        {/* Теги */}
        <div className="mb-3">
          <label className="form-label">Теги</label>
          <CreatableSelect
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            onInputChange={setTagSearchInput}
            placeholder={tagsLoading ? "Загрузка тегов..." : "Поиск тегов..."}
            formatCreateLabel={(inputValue) => `Создать "${inputValue}"`}
            onCreateOption={(inputValue) => {
              setSelectedTags((prev) => [
                ...prev,
                { value: inputValue, label: inputValue },
              ]);
            }}
            isValidNewOption={(inputValue) =>
              inputValue.length > 0 &&
              !selectedTags.some((tag) => tag.value === inputValue)
            }
            noOptionsMessage={({ inputValue }) =>
              inputValue
                ? `"${inputValue}" не найден`
                : "Введите текст для поиска"
            }
          />
        </div>

        {/* Видимость */}
        <div className="mb-3">
          <label className="form-label">Видимость инвентаря</label>
          <div className="form-check">
            <input
              type="radio"
              value="true"
              {...register("isPublic")}
              defaultChecked
              className="form-check-input"
            />
            <label className="form-check-label">🟢 Публичный</label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              value="false"
              {...register("isPublic")}
              className="form-check-input"
            />
            <label className="form-check-label">🔴 Приватный</label>
          </div>
        </div>

        {/* Изображение */}
        <div className="mb-3">
          <label className="form-label">Изображение</label>
          <input
            type="file"
            accept="image/*"
            className="form-control"
            onChange={(e) =>
              e.target.files[0] &&
              console.log("Выбран файл:", e.target.files[0])
            }
          />
        </div>

        <button
          type="submit"
          className="btn btn-secondary"
          disabled={isMutating || !isValid}
        >
          {isMutating ? "Создание..." : "Создать инвентарь"}
        </button>
      </form>
    </div>
  );
};

export default CreateInventoryPage;

// error = {
//   response: {
//     status: 400,
//     data: {
//       success: false,
//       message: "Категория не найдена"  // ← наше сообщение
//     }
//   }
// }
//const result = await trigger(formData) - хранится ответ от сервера

// {
//   name: "Название инвентаря",        // из formData
//   description: "Описание...",        // из formData
//   category: "Оборудование",          // из formData
//   isPublic: true,                    // преобразовано из formData
//   tags: ["техника", "офис", "важное"] // из selectedTags (контекста)
// }

// Исходные данные из API:
// javascript
// // tags = ["техника", "офис", "важное"]
// // (простой массив строк)
// После преобразования:
// javascript
// tagOptions = [
//   { value: "техника", label: "техника" },
//   { value: "офис", label: "офис" },
//   { value: "важное", label: "важное" }
// ]
// (массив объектов с структурированными данными)
// 🎯 Почему это нужно:
// React Select ожидает данные в формате:

// javascript
// {
//   value: "уникальный_идентификатор", // что хранится
//   label: "отображаемый_текст"        // что показывается пользователю
// }
