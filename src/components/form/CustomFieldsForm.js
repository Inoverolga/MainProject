import { Form } from "react-bootstrap";

export const CustomFieldsForm = ({ fields, formData, onFieldChange }) => {
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
      default:
        return null;
    }
  };

  if (fields.length === 0) return null;

  return (
    <div className="mt-4">
      <h5> Дополнительные поля</h5>
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
