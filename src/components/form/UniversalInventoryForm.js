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
import { ImageUploader } from "../imgUpload/ImageUploader.js";
import { useTranslation } from "react-i18next";

const UniversalInventoryForm = ({ mode = "create", onSave }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: inventoryId } = useParams();
  const [showPreview, setShowPreview] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

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
    formState: { errors, isDirty, isSubmitting },
    reset,
    setValue,
    getValues,
    watch,
    trigger,
  } = useForm({
    mode: "onChange",
    defaultValues: { isPublic: "true" },
  });

  const { handleCreate, handleUpdate, isCreating } =
    useInventoryOperations(mutateMyInventories);

  const isMutating = isCreating;
  const hasFormChanges = mode === "create" ? true : isDirty || hasTagChanges;
  const canSubmit = hasFormChanges && !isMutating && !isSubmitting;

  const prepareFormData = (formData) => ({
    ...formData,
    tags: tagValues,
    isPublic: formData.isPublic === "true",
    version: inventoryData?.data?.version || formData.version,
    imageUrl: imageUrl,
  });

  const descriptionValue = watch("description");

  useEffect(() => {
    if (mode === "edit" && inventoryData?.data) {
      const data = inventoryData.data;
      setValue("name", data.name);
      setValue("description", data.description);
      setValue("category", data.category?.name || "");
      setValue("isPublic", data.isPublic?.toString() || "true");
      setValue("version", data.version);
      setImageUrl(data.imageUrl || "");
    }
  }, [mode, inventoryData, setValue]);

  const onSubmit = async (formData) => {
    try {
      const isFormValid = await trigger();
      if (!isFormValid) {
        toast.error(t("fillRequiredFields"));
        return;
      }

      const dataWithTags = prepareFormData(formData);

      if (mode === "create") {
        const result = await handleCreate(dataWithTags);
        if (result) {
          toast.success(t("inventoryCreated"));
          setSelectedTags([]);
          reset();
          setImageUrl("");
        }
      } else {
        if (onSave) {
          const success = await onSave(inventoryId, dataWithTags);
          if (success) {
            toast.success(t("inventoryUpdated"));
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        } else {
          const success = await handleUpdate(inventoryId, dataWithTags);
          if (success) {
            toast.success(t("inventoryUpdated"));
            navigate("/profile");
          }
        }
      }
    } catch (error) {
      const message =
        error?.response?.status === 409
          ? t("dataChangedByOther")
          : t(
              mode === "create"
                ? "createInventoryError"
                : "updateInventoryError"
            );
      toast.error(message);
    }
  };

  if (mode === "edit" && isLoading) return <Spinner />;

  return (
    <div className="container mt-4">
      <h2>{mode === "create" ? t("createInventory") : t("editInventory")}</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">{t("name")}</label>
          <input
            type="text"
            className="form-control"
            {...register("name", { required: t("nameRequired") })}
          />
          {errors.name && (
            <div className="text-danger">{errors.name.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">
            {t("description")}
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm ms-2"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? t("edit") : t("preview")}
            </button>
          </label>

          {showPreview ? (
            <div className="border p-3 bg-light rounded">
              <ReactMarkdown>
                {descriptionValue || t("noDescription")}
              </ReactMarkdown>
            </div>
          ) : (
            <textarea
              className="form-control"
              placeholder={t("inventoryDescription")}
              rows={4}
              {...register("description", {
                required: t("descriptionRequired"),
                minLength: { value: 10, message: t("descriptionMinLength") },
                maxLength: { value: 1000, message: t("descriptionMaxLength") },
              })}
            />
          )}
          {errors.description && (
            <div className="text-danger">{errors.description.message}</div>
          )}
        </div>

        <ImageUploader
          inventoryId={inventoryId}
          currentImage={imageUrl}
          onImageChange={setImageUrl}
          mode={mode}
        />

        <div className="mb-3">
          <label className="form-label">{t("category")}</label>
          <select
            className={`form-select ${errors.category ? "is-invalid" : ""}`}
            {...register("category", { required: t("categoryRequired") })}
          >
            <option value="" disabled selected>
              {t("chooseCategory")}
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
          <label className="form-label">{t("tags")}</label>
          <CreatableSelect
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={setSelectedTags}
            onInputChange={setTagSearchInput}
            isLoading={isSearching}
            placeholder={isSearching ? t("searchTags") : t("selectTags")}
            formatCreateLabel={(inputValue) => t("createTag", { inputValue })}
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
                ? t("tagNotFound", { inputValue })
                : t("enterToSearchTags")
            }
            loadingMessage={() => t("searchingTags")}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">{t("inventoryVisibility")}</label>
          <div className="form-check">
            <input
              type="radio"
              value="true"
              {...register("isPublic")}
              className="form-check-input"
            />
            <label className="form-check-label">{t("public")}</label>
          </div>
          <div className="form-check">
            <input
              type="radio"
              value="false"
              {...register("isPublic")}
              className="form-check-input"
            />
            <label className="form-check-label">{t("private")}</label>
          </div>
        </div>

        <div className="d-flex gap-2 mb-5">
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={!canSubmit}
          >
            {isMutating
              ? mode === "create"
                ? t("creating")
                : t("saving")
              : mode === "create"
              ? t("createInventoryButton")
              : t("saveChanges")}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isMutating}
            onClick={() => navigate("/profile")}
          >
            {t("backToProfile")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UniversalInventoryForm;
