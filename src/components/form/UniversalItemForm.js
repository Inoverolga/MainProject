import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import CreatableSelect from "react-select/creatable";
import { useItemsOperations } from "../../hooks/useItemsOperations";
import { useTags } from "../../hooks/useTags";
import useSWR from "swr";
import { Spinner } from "react-bootstrap";
import { fetchInventoryWithItems, fetchItem } from "../../service/api";

const UniversalItemForm = ({ mode = "create" }) => {
  const navigate = useNavigate();
  const { id: urlInventoryId, itemId: urlItemId } = useParams();

  const { data: itemData } = useSWR(
    mode === "edit" && urlItemId ? `/users/items-adit/${urlItemId}` : null,
    fetchItem
  );

  const inventoryId =
    mode === "create" ? urlInventoryId : itemData?.data?.inventoryId;

  // Загружаем данные для мутации
  const { mutate: mutateMyItems } = useSWR(
    inventoryId ? `/users/inventories/${inventoryId}/items-with-access` : null,
    fetchInventoryWithItems,
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
    hasChanges,
  } = useTags(itemData?.data?.tags || [], mode);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue,
  } = useForm({
    mode: "onChange",
  });

  const { handleCreate, handleUpdate, isCreating, isUpdating } =
    useItemsOperations(mutateMyItems, inventoryId);

  // Заполняем форму данными при редактировании
  useEffect(() => {
    if (mode === "edit" && itemData?.data) {
      const data = itemData.data;
      setValue("name", data.name);
      setValue("description", data.description);
    }
  }, [mode, itemData, setValue]);

  const isMutating = isCreating || isUpdating;
  const canSubmit = mode === "create" ? isValid : hasChanges;

  const onSubmit = async (formData) => {
    try {
      const dataWithTags = {
        ...formData,
        tags: tagValues,
      };
      console.log("=== SUBMIT DEBUG ===");
      console.log("mode:", mode);
      console.log("finalItemId:", urlItemId);
      console.log("dataWithTags:", dataWithTags);
      if (mode === "create") {
        const result = await handleCreate(dataWithTags, inventoryId);
        if (result) {
          toast.success("Товар успешно создан!");
          setSelectedTags([]);
          reset();
        }
      } else {
        const success = await handleUpdate(urlItemId, dataWithTags);
        if (success) {
          toast.success("Товар успешно обновлен!");
          navigate(-1);
        }
      }
    } catch (error) {
      toast.error(
        `Ошибка ${mode === "create" ? "создания" : "обновления"} товара`
      );
    }
  };

  if (mode === "edit" && !itemData) return <Spinner />;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        {mode === "create" ? "📦 Создание товара" : "✏️ Редактирование товара"}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">Название товара *</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder="Введите название товара"
            {...register("name", {
              required: "Название обязательно",
              minLength: { value: 2, message: "Минимум 2 символа" },
              maxLength: { value: 200, message: "Максимум 200 символов" },
            })}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>

        {/* Описание */}
        <div className="mb-3">
          <label className="form-label">Описание *</label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            placeholder="Описание товара..."
            rows={4}
            {...register("description", {
              required: "Описание обязательно",
              minLength: { value: 10, message: "Минимум 10 символов" },
              maxLength: { value: 1000, message: "Максимум 1000 символов" },
            })}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description.message}</div>
          )}
        </div>

        {/* Теги */}
        <div className="mb-4">
          <label className="form-label">Теги</label>
          <CreatableSelect
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            isLoading={isSearching}
            placeholder={isSearching ? "Поиск тегов..." : "Выберите теги..."}
            formatCreateLabel={(inputValue) => `Создать "${inputValue}"`}
            onInputChange={setTagSearchInput}
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

        {/* Кнопки */}
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
              ? "Создать товар"
              : "Сохранить изменения"}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isMutating}
            onClick={() => navigate(`/inventory/${inventoryId}`)}
          >
            Вернуться на страницу инвентаря
          </button>
        </div>
      </form>
    </div>
  );
};

export default UniversalItemForm;
