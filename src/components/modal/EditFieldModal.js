import { useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

const EditFieldModal = ({ show, field, onClose, onSave, isSaving }) => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: field || {},
  });

  useEffect(() => {
    reset(field || {});
  }, [field]);

  const onSubmit = async (data) => {
    const success = await onSave(field.id, data);
    if (success) {
      onClose();
    }
  };

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>✏️ {t("editField")}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t("name")} *</Form.Label>
            <Form.Control
              {...register("name", {
                required: t("nameRequired"),
                minLength: { value: 2, message: t("minLength2") },
              })}
              isInvalid={!!errors.name}
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Описание*</Form.Label>
            <Form.Control
              {...register("description")}
              placeholder={t("description")}
              className="mb-3"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Check
            {...register("isVisibleInTable")}
            label={t("showInTable")}
            className="mb-2"
          />
          <Form.Check {...register("isRequired")} label={t("requiredField")} />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSaving}
          >
            {isSaving ? t("saving") : t("save")}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditFieldModal;
