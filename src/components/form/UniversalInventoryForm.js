import { useForm } from "react-hook-form";
import useSWR from "swr";
import ReactMarkdown from "react-markdown";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import CreatableSelect from "react-select/creatable";
import { useInventoryOperations } from "../../hooks/inventories/useInventoryOperations.js";
import { useTags } from "../../hooks/tags/useTags.js";
import { Spinner } from "react-bootstrap";
import {
  fetchEditInventories,
  fetchMyInventories,
  fetchCategories,
} from "../../service/api";

const UniversalInventoryForm = ({ mode = "create", onSave }) => {
  const navigate = useNavigate();
  const { id: inventoryId } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  const { mutate: mutateMyInventories } = useSWR(
    "/users/me/inventories",
    fetchMyInventories,
    {
      revalidateOnFocus: false,
    }
  );

  const { data: inventoryData, isLoading } = useSWR(
    mode === "edit" && inventoryId
      ? `/users/inventories-edit/${inventoryId}`
      : null,
    fetchEditInventories,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 0,
    }
  );

  const { data: categoriesData } = useSWR(
    "/users/categories",
    fetchCategories,
    {
      revalidateOnFocus: false,
    }
  );

  const {
    selectedTags,
    setSelectedTags,
    setTagSearchInput,
    tagOptions,
    tagValues,
    isSearching,
    hasTagChanges,
  } = useTags(inventoryData?.data?.tags || [], mode);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isDirty, isSubmitting },
    reset,
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: { isPublic: "true" },
  });

  const { handleCreate, isCreating } =
    useInventoryOperations(mutateMyInventories);

  const isMutating = isCreating;
  const hasFormChanges = mode === "create" ? true : isDirty || hasTagChanges;
  const canSubmit = hasFormChanges && !isMutating && !isSubmitting;

  const prepareFormData = (formData) => ({
    ...formData,
    tags: tagValues,
    isPublic: formData.isPublic === "true",
    version: inventoryData?.data?.version || formData.version,
  });

  const descriptionValue = watch("description");

  //автосохранение
  //   useEffect(() => {
  //     if (mode !== "edit") return;

  //     let timeoutId;

  //     if ((isDirty || hasTagChanges) && !isAutoSaving) {
  //       timeoutId = setTimeout(async () => {
  //         try {
  //           setIsAutoSaving(true);
  //           const formData = getValues();
  //           await handleUpdate(inventoryId, prepareFormData(formData));

  //           reset(formData);
  //         } catch (error) {
  //           if (error?.response?.status === 409) {
  //             toast.error(
  //               "Данные были изменены другим пользователем. Пожалуйста, обновите страницу."
  //             );
  //           }
  //         } finally {
  //           setIsAutoSaving(false);
  //         }
  //       }, 8000);
  //     }

  //     return () => {
  //       if (timeoutId) {
  //         clearTimeout(timeoutId);
  //       }
  //     };
  //   }, [
  //     mode,
  //     isDirty,
  //     hasTagChanges,
  //     isAutoSaving,
  //     getValues,
  //     handleUpdate,
  //     inventoryId,
  //   ]);

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (mode === "edit" && inventoryData?.data) {
      const data = inventoryData.data;
      setValue("name", data.name);
      setValue("description", data.description);
      setValue("category", data.category?.name || "");
      setValue("isPublic", data.isPublic?.toString() || "true");
      setValue("version", data.version);
    }
  }, [mode, inventoryData, setValue]);

  const onSubmit = async (formData) => {
    try {
      const isFormValid = await trigger();
      if (!isFormValid) {
        toast.error("Пожалуйста, заполните все обязательные поля правильно");
        return;
      }

      const dataWithTags = prepareFormData(formData);
      console.log("данные для отправки", dataWithTags);

      if (mode === "create") {
        const result = await handleCreate(dataWithTags);
        console.log("отправляем", result);
        if (result) {
          toast.success("Инвентарь успешно создан!");
          setSelectedTags([]);
          console.log("данные успешно отправились");
          reset();
        }
      } else {
        if (onSave) {
          const success = await onSave(inventoryId, dataWithTags);
          if (success) {
            toast.success("Инвентарь успешно обновлен!");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }
      }
    } catch (error) {
      console.log("Данные не отправильсь");
      const message =
        error?.response?.status === 409
          ? "Данные были изменены другим пользователем. Пожалуйста обновите страницу"
          : `Ошибка ${mode === "create" ? "создания" : "обновления"} инвентаря`;
      toast.error(message);
    }
  };

  if (mode === "edit" && isLoading) return <Spinner />;

  return (
    <div className="container mt-4">
      <h2>
        {mode === "create" ? "Создание инвентаря" : "Редактирование инвентаря"}
      </h2>

      {mode === "edit" && (
        <div className="mb-3" style={{ height: "24px" }}>
          {isAutoSaving && (
            <div className="d-flex align-items-center text-primary">
              <div
                className="spinner-border spinner-border-sm me-2"
                role="status"
              >
                <span className="visually-hidden">Сохранение...</span>
              </div>
              <span className="small">Автосохранение...</span>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
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

        <div className="mb-3">
          <label className="form-label">
            Описание
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? "✏️ Редактировать" : "👁️ Предпросмотр"}
            </button>
          </label>

          {showPreview ? (
            <div className="border p-3 bg-light rounded">
              <ReactMarkdown>
                {descriptionValue || "*Описание отсутствует*"}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="form-control"
              placeholder="Описание инвентаря..."
              rows={4}
              {...register("description", {
                required: "Поле обязательно к заполнению",
                minLength: { value: 10, message: "Минимум 10 символов" },
                maxLength: { value: 1000, message: "Максимум 1000 символов" },
              })}
            />
          )}
          {errors.description && (
            <div className="text-danger">{errors.description.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Категория</label>
          <select
            className={`form-select ${errors.category ? "is-invalid" : ""}`}
            {...register("category", { required: "Выберите категорию" })}
          >
            <option value="" disabled selected>
              Выберите категорию
            </option>
            {categoriesData?.data?.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <div className="invalid-feedback">{errors.category.message}</div>
          )}
        </div>

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
            disabled={!canSubmit}
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
