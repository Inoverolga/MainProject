import { useForm } from "react-hook-form";
import useSWR from "swr";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { fetchTags } from "../../service/api";
import { useState, useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { useInventoryOperations } from "../../hooks/useInventoryOperations";
import { useMemo, useRef } from "react";

const UniversalInventoryForm = ({
  mode = "create",
  initialData = null,
  inventoryId = null,
  onSuccess = null,
  mutateMyInventories,
}) => {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchInput, setTagSearchInput] = useState("");
  const initialTagsRef = useRef([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm({
    mode: "onChange",
    defaultValues: { isPublic: "true" },
  });

  const hasChanges =
    mode === "create" ||
    JSON.stringify(selectedTags.map((tag) => tag.value)) !==
      JSON.stringify(initialTagsRef.current);

  const canSubmit = mode === "create" ? isValid : hasChanges;

  const { handleCreate, handleUpdate, isCreating, isUpdating } =
    useInventoryOperations(mutateMyInventories, inventoryId);

  const { data: allTags = [] } = useSWR("/tags", fetchTags, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });

  const { data: searchedTags = [], isLoading: isSearching } = useSWR(
    tagSearchInput
      ? `/tags/autocompletion?q=${encodeURIComponent(tagSearchInput)}`
      : null,
    fetchTags,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (mode === "edit" && initialData) {
      setValue("name", initialData.name);
      setValue("description", initialData.description);
      setValue("category", initialData.category?.name || "");
      setValue("isPublic", initialData.isPublic?.toString() || "true");

      if (initialData.tags) {
        const formattedTags = initialData.tags.map((tag) => {
          if (typeof tag === "object" && tag.name) {
            return { value: tag.name, label: tag.name };
          }
          return { value: tag, label: tag };
        });
        setSelectedTags(formattedTags);
        initialTagsRef.current = formattedTags.map((tag) => tag.value);
      }
    }
  }, [mode, initialData, setValue]);

  const tagOptions = useMemo(() => {
    const options = tagSearchInput ? searchedTags : allTags;
    return options.map((tag) => ({ value: tag, label: tag }));
  }, [allTags, searchedTags, tagSearchInput]);

  const isMutating = isCreating || isUpdating;

  const onSubmit = async (formData) => {
    try {
      const tagValues = selectedTags.map((tag) => tag.value);

      const dataWithTags = {
        ...formData,
        tags: tagValues,
        isPublic: formData.isPublic === "true",
      };

      if (mode === "create") {
        const result = await handleCreate(dataWithTags);
        if (result) {
          toast.success("Инвентарь успешно создан!");
          setSelectedTags([]);
          reset();
        }
      } else {
        const success = await handleUpdate(dataWithTags);
        if (success) {
          toast.success("Инвентарь успешно обновлен!");
          onSuccess?.();
        }
      }
    } catch (error) {
      toast.error(
        `Ошибка ${mode === "create" ? "создания" : "обновления"} инвентаря`
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2>
        {mode === "create"
          ? "🧰 Создание инвентаря"
          : "✏️ Редактирование инвентаря"}
      </h2>
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
            isLoading={isSearching}
            placeholder={isSearching ? "Поиск тегов..." : "Выберите теги..."}
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
                ? `Тег "${inputValue}" не найден. Нажмите Enter чтобы создать.`
                : "Введите текст для поиска тегов"
            }
            loadingMessage={() => "Поиск тегов..."}
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

        {/* Изображение - ТОЛЬКО ССЫЛКА */}
        <div className="mb-3">
          <label className="form-label">Ссылка на изображение</label>
          <input
            type="url"
            className="form-control"
            placeholder="https://example.com/image.jpg"
            {...register("imageUrl")}
          />
        </div>

        <div className="d-flex gap-2 mb-5">
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={isMutating || !canSubmit}
          >
            {isMutating
              ? mode === "create"
                ? "Создание..."
                : "Сохранение..."
              : mode === "create"
              ? "Создать инвентарь"
              : "Сохранить изменения"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isMutating}
            onClick={() => navigate("/profile")}
          >
            Вернуться в личный кабинет
          </button>
        </div>
      </form>
    </div>
  );
};

export default UniversalInventoryForm;
