// components/EditFieldModal.js
import { useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { useForm } from "react-hook-form";

const EditFieldModal = ({ show, field, onClose, onSave, isSaving }) => {
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
        <Modal.Title>✏️ Редактирование поля</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Название *</Form.Label>
            <Form.Control
              {...register("name", {
                required: "Название обязательно",
                minLength: { value: 2, message: "Минимум 2 символа" },
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
              placeholder="Описание"
              className="mb-3"
            />
            <Form.Control.Feedback type="invalid">
              {errors.name?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Check
            {...register("isVisibleInTable")}
            label="Показывать в таблице"
            className="mb-2"
          />
          <Form.Check {...register("isRequired")} label="Обязательное поле" />
        </Modal.Body>

        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isSaving}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditFieldModal;
