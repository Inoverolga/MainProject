import { Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export const CustomFieldsForm = ({ fields, formData, onFieldChange }) => {
  const { t } = useTranslation();
  const renderFieldInput = (field) => {
    const value = formData[field.targetField] || "";

    switch (field.fieldType) {
      case "STRING":
        return (
          <Form.Control
            type="text"
            value={value}
            onChange={(e) => onFieldChange(field.targetField, e.target.value)}
            required={field.isRequired}
          />
        );
      case "TEXT":
        return (
          <Form.Control
            as="textarea"
            rows={3}
            value={value}
            onChange={(e) => onFieldChange(field.targetField, e.target.value)}
            required={field.isRequired}
          />
        );
      case "INTEGER":
        return (
          <Form.Control
            type="number"
            value={value}
            onChange={(e) =>
              onFieldChange(field.targetField, parseInt(e.target.value) || "")
            }
            required={field.isRequired}
          />
        );
      case "BOOLEAN":
        return (
          <Form.Check
            type="checkbox"
            checked={!!value}
            onChange={(e) => onFieldChange(field.targetField, e.target.checked)}
          />
        );
      case "FILE":
        return (
          <Form.Control
            type="url"
            placeholder={t("imageUrlPlaceholder")}
            value={value}
            onChange={(e) => onFieldChange(field.targetField, e.target.value)}
            required={field.isRequired}
          />
        );
      default:
        return null;
    }
  };

  if (fields.length === 0) return null;

  return (
    <div className="mt-4">
      <h5> {t("additionalFields")}</h5>
      {fields.map((field) => (
        <Form.Group key={field.id} className="mb-3">
          <Form.Label>
            {field.name}
            {field.isRequired && <span className="text-danger"> *</span>}
          </Form.Label>
          {field.description && (
            <Form.Text className="d-block text-muted mb-2">
              {field.description}
            </Form.Text>
          )}
          {renderFieldInput(field)}
        </Form.Group>
      ))}
    </div>
  );
};
