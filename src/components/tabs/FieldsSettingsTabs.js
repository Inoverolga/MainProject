import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button, Card, Form, Row, Col, Badge } from "react-bootstrap";
import { useItemFieldOperations } from "../../hooks/itemsWithFields/useItemFieldOperations.js";
import EditFieldModal from "../modal/EditFieldModal";
import { useTranslation } from "react-i18next";

const FIELD_TYPES = {
  STRING: { label: "🔤 Текст", icon: "🔤" },
  TEXT: { label: "📄 Многострочный", icon: "📄" },
  INTEGER: { label: "🔢 Число", icon: "🔢" },
  BOOLEAN: { label: "✅ Да/Нет", icon: "✅" },
  FILE: { label: "📎 Файл/Изображение", icon: "📎" },
};

const FieldsSettingsTabs = ({ inventoryId, fields, mutateFields }) => {
  const { t } = useTranslation();
  const [editingField, setEditingField] = useState(null);

  const {
    handleCreateField,
    handleDeleteField,
    handleUpdateField,
    isMutating,
  } = useItemFieldOperations(inventoryId, mutateFields);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      fieldType: "STRING",
      name: "",
      description: "",
      isVisibleInTable: true,
      isRequired: false,
    },
  });

  const onSubmit = async (formData) => {
    const success = await handleCreateField(formData);
    if (success) return reset();
  };

  const handleSaveField = async (fieldId, formData) => {
    const success = await handleUpdateField(fieldId, formData);
    if (success) {
      setEditingField(null);
    }
    return success;
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🛠️ {t("manageItemFields")}</h5>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit(onSubmit)} className="mb-4">
          <Row className="g-2 align-items-end">
            <Col md={3}>
              <Form.Label>{t("fieldType")}</Form.Label>
              <Form.Select {...register("fieldType")}>
                {Object.entries(FIELD_TYPES).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.label}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label>{t("name")} *</Form.Label>
              <Form.Control
                {...register("name", {
                  required: t("nameRequired"),
                  minLength: { value: 2, message: t("minLength2") },
                })}
                placeholder={t("fieldNamePlaceholder")}
                isInvalid={!!errors.name}
              />
              <Form.Control.Feedback type="invalid">
                {errors.name?.message}
              </Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label>{t("description")}</Form.Label>
              <Form.Control
                {...register("description")}
                placeholder={t("fieldDescriptionPlaceholder")}
              />
            </Col>

            <Col md={2}>
              <Button
                type="submit"
                variant="secondary"
                disabled={!isValid || isMutating}
              >
                {t("addField")}
              </Button>
            </Col>
          </Row>

          <Row className="mt-2">
            <Col>
              <Form.Check
                type="checkbox"
                label={t("showInTable")}
                {...register("isVisibleInTable")}
              />
            </Col>
            <Col>
              <Form.Check
                type="checkbox"
                label={t("requiredField")}
                {...register("isRequired")}
              />
            </Col>
          </Row>
        </Form>

        <div className="border rounded">
          {fields.map((field) => (
            <div key={field.id} className="p-3 border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="d-flex align-items-center gap-2 mb-1">
                    <strong>{field.name}</strong>
                    <Badge bg="secondary">
                      {FIELD_TYPES[field.fieldType]?.label}
                    </Badge>
                    {field.isVisibleInTable && (
                      <Badge bg="secondary">{t("inTable")}</Badge>
                    )}
                    {field.isRequired && (
                      <Badge bg="secondary">{t("required")}</Badge>
                    )}
                  </div>
                  {field.description && (
                    <div className="text-muted small">{field.description}</div>
                  )}
                </div>

                <div className="d-flex gap-1">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="btn-toolbar-style"
                    onClick={() => setEditingField(field)}
                    disabled={isMutating}
                  >
                    ✏️ {t("edit")}
                  </Button>
                  <Button
                    variant="outline-danger"
                    className="btn-toolbar-style"
                    size="sm"
                    onClick={() => handleDeleteField(field.id)}
                    disabled={isMutating}
                  >
                    🗑️ {t("delete")}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {fields.length === 0 && (
          <div className="text-center text-muted py-4">
            <p>{t("noFieldsAdded")}</p>
            <small>{t("addFieldsHint")}</small>
          </div>
        )}

        <EditFieldModal
          show={!!editingField}
          field={editingField}
          onClose={() => setEditingField(null)}
          onSave={handleSaveField}
          isSaving={isMutating}
        />
      </Card.Body>
    </Card>
  );
};

export default FieldsSettingsTabs;
