import { useForm, useWatch } from "react-hook-form";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef, useMemo } from "react";
import CreatableSelect from "react-select/creatable";
import { useItemsOperations } from "../../hooks/itemsWithFields/useItemsOperations.js";
import { useTags } from "../../hooks/tags/useTags.js";
import useSWR from "swr";
import { Spinner } from "react-bootstrap";
import {
  fetchInventoryWithItems,
  fetchItem,
  fetchFieldsPublic,
} from "../../service/api";
import { CustomFieldsForm } from "./CustomFieldsForm";
import { useCustomIdFormat } from "../../hooks/customId/useCustomId.js";
import { useTranslation } from "react-i18next";

const UniversalItemForm = ({ mode = "create" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id: urlInventoryId, itemId: urlItemId } = useParams();
  const [customFields, setCustomFields] = useState({});
  const initialDataRef = useRef(null);
  const formInitializedRef = useRef(false);

  const { data: itemData } = useSWR(
    mode === "edit" && urlItemId ? `/users/items-edit/${urlItemId}` : null,
    fetchItem,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,

      dedupingInterval: 0,
    }
  );

  const inventoryId =
    mode === "create" ? urlInventoryId : itemData?.data?.inventoryId;

  // Загружаем данные для мутации
  const { mutate: mutateMyItems } = useSWR(
    inventoryId ? `/users/inventories/${inventoryId}/items-with-access` : null,
    fetchInventoryWithItems,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  //загружаем кастомные поля
  const { data: fieldsData } = useSWR(
    inventoryId ? `/users/inventories/${inventoryId}/fields-public` : null,
    fetchFieldsPublic
  );
  const fields = useMemo(() => fieldsData?.data || [], [fieldsData?.data]);

  const {
    selectedTags,
    setSelectedTags,
    setTagSearchInput,
    tagOptions,
    tagValues,
    isSearching,
    hasTagChanges,
  } = useTags(itemData?.data?.tags || [], mode);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
    control,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      tags: [],
    },
  });

  useWatch({ control, name: "tags" });
  const customIdValue = watch("customId");

  const { handleCreate, handleUpdate, isCreating, isUpdating } =
    useItemsOperations(mutateMyItems, inventoryId);

  const { generateIdForNewItem, isGeneratingItemId } =
    useCustomIdFormat(inventoryId);

  const handleCustomFieldChange = (fieldName, value) => {
    setCustomFields((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleTagsChange = (newSelectedTags) => {
    setSelectedTags(newSelectedTags);
    setValue(
      "tags",
      newSelectedTags.map((tag) => tag.value),
      {
        shouldDirty: true,
      }
    );
  };

  // генерация id при создании товара
  useEffect(() => {
    const initializeForm = async () => {
      if (!formInitializedRef.current) {
        if (mode === "create" && inventoryId) {
          const id = await generateIdForNewItem();
          setValue("customId", id || "");
          reset({ name: "", description: "" });
          setCustomFields({});
          formInitializedRef.current = true;
        } else if (mode === "edit" && itemData?.data) {
          const data = itemData.data;
          const initialCustomFields = {};

          fields.forEach((field) => {
            const fieldName = field.targetField;
            if (data[fieldName] != null && data[fieldName] != undefined) {
              initialCustomFields[fieldName] = data[fieldName];
            }
          });

          initialDataRef.current = {
            name: data.name,
            description: data.description,
            customFields: initialCustomFields,
            customId: data.customId,
          };

          setValue("name", data.name);
          setValue("description", data.description);
          setValue("version", data.version);
          setValue("customId", data.customId);
          setValue("tags", tagValues);
          setCustomFields(initialCustomFields);
          formInitializedRef.current = true;
        }
      }
    };

    initializeForm();
  }, [
    mode,
    inventoryId,
    itemData,
    fields,
    setValue,
    reset,
    generateIdForNewItem,
  ]);

  const hasCustomFieldsChanges =
    mode === "create"
      ? false
      : initialDataRef.current &&
        Object.keys(customFields).some(
          (key) =>
            //customFields[key] !== initialDataRef.current.customFields[key]
            JSON.stringify(customFields[key]) !==
            JSON.stringify(initialDataRef.current.customFields[key])
        );

  const hasFormChanges =
    mode === "create"
      ? true
      : formInitializedRef.current &&
        (isDirty || hasCustomFieldsChanges || hasTagChanges);

  const isMutating = isCreating || isUpdating;

  const canSubmit = !isMutating && (mode === "create" || hasFormChanges);

  const onSubmit = async (formData) => {
    try {
      const dataWithTags = {
        ...formData,
        ...customFields,
        customId: formData.customId,
        tags: tagValues,
        version: itemData?.data?.version,
      };

      if (mode === "create") {
        const result = await handleCreate(dataWithTags, inventoryId);
        if (result) {
          toast.success(t("itemCreated"));
          setSelectedTags([]);
          setCustomFields([]);
          reset();
        }
      } else {
        const success = await handleUpdate(urlItemId, dataWithTags);
        if (success) {
          toast.success(t("itemUpdated"));
          navigate(`/inventory/${inventoryId}`);
        }
      }
    } catch (error) {
      if (error?.response?.status === 409) {
        toast.error(t("dataChangedByOther"));
      } else {
        toast.error(
          t(mode === "create" ? "createItemError" : "updateItemError")
        );
      }
    }
  };

  if (mode === "edit" && !itemData) return <Spinner />;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">
        {mode === "create" ? t("createItem") : t("editItem")}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-3">
          <label className="form-label">{t("itemId")}</label>
          <div className="input-group">
            <input
              type="text"
              className="form-control"
              value={customIdValue || ""}
              placeholder={
                isGeneratingItemId ? t("generatingId") : t("idWillBeGenerated")
              }
              readOnly
            />
            {mode === "create" || !itemData?.data?.customId ? (
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={() =>
                  generateIdForNewItem(true).then((id) => {
                    if (id) setValue("customId", id, { shouldDirty: true });
                  })
                }
                disabled={isGeneratingItemId}
              >
                {isGeneratingItemId ? "..." : "🔄"}
              </button>
            ) : null}
          </div>
          <div className="form-text">
            {mode === "create" ? t("idGenerationHint") : t("customIdHint")}
          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">{t("itemName")} *</label>
          <input
            type="text"
            className={`form-control ${errors.name ? "is-invalid" : ""}`}
            placeholder={t("enterItemName")}
            {...register("name", {
              required: t("nameRequired"),
              minLength: { value: 2, message: t("minLength2") },
              maxLength: { value: 200, message: t("maxLength200") },
            })}
          />
          {errors.name && (
            <div className="invalid-feedback">{errors.name.message}</div>
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">{t("description")} *</label>
          <textarea
            className={`form-control ${errors.description ? "is-invalid" : ""}`}
            placeholder={t("itemDescription")}
            rows={4}
            {...register("description", {
              required: t("descriptionRequired"),
              minLength: { value: 10, message: t("minLength10") },
              maxLength: { value: 1000, message: t("maxLength1000") },
            })}
          />
          {errors.description && (
            <div className="invalid-feedback">{errors.description.message}</div>
          )}
        </div>

        <div className="mb-4">
          <label className="form-label">{t("tags")}</label>
          <CreatableSelect
            isMulti
            options={tagOptions}
            value={selectedTags}
            onChange={handleTagsChange}
            isLoading={isSearching}
            placeholder={isSearching ? t("searchTags") : t("selectTags")}
            formatCreateLabel={(inputValue) => t("createTag", { inputValue })}
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
                ? t("tagNotFound", { inputValue })
                : t("enterToSearchTags")
            }
            loadingMessage={() => t("searchingTags")}
          />
        </div>
        <div className="mb-3">
          <CustomFieldsForm
            fields={fields}
            formData={customFields}
            onFieldChange={handleCustomFieldChange}
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
                ? t("creating")
                : t("saving")
              : mode === "create"
              ? t("createItemButton")
              : t("saveChanges")}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            disabled={isMutating}
            onClick={() => navigate(`/inventory/${inventoryId}`)}
          >
            {t("backToInventory")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UniversalItemForm;
