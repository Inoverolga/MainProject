import { useContext, useEffect } from "react";
import { Modal, Form, Button, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { fetchSalesforceCreateContact } from "../../service/api.js";
import { AuthContext } from "../../contexts/AuthContext.js";

const SalesforceFormModal = ({ show, onClose }) => {
  const { t } = useTranslation();
  const { authUser } = useContext(AuthContext);

  const { trigger, isMutating } = useSWRMutation(
    "/salesforce/create-account",
    async (url, { arg: formData }) => {
      return await fetchSalesforceCreateContact(url, formData);
    },
    {
      onSuccess: (data) => {
        toast.success(t("salesforceSuccess"));
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || t("salesforceError"));
      },
    }
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

  useEffect(() => {
    // Сбрасываем форму при открытии/закрытии модалки
    if (show) {
      reset({
        companyName: "",
        industry: "",
        phone: "",
        website: "",
        description: "",
        jobTitle: "",
        department: "",
      });
    }
  }, [show, reset]);

  const onSubmit = async (formData) => {
    try {
      const totalFormData = {
        ...formData,
        userName: authUser?.name,
        userEmail: authUser?.email,
      };
      await trigger(totalFormData);
    } catch (err) {
      console.error("Submit error:", err);
    }
  };

  const industryOptions = [
    { value: "", label: t("selectIndustry") },
    { value: "Technology", label: t("technology") },
    { value: "Manufacturing", label: t("manufacturing") },
    { value: "Retail", label: t("retail") },
    { value: "Healthcare", label: t("healthcare") },
    { value: "Education", label: t("education") },
    { value: "Finance", label: t("finance") },
    { value: "Other", label: t("other") },
  ];
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title> {t("createSalesforceAccount")}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t("companyName")} *</Form.Label>
            <Form.Control
              {...register("companyName", {
                required: t("companyNameRequired"),
                minLength: { value: 2, message: t("minLength2") },
              })}
              placeholder={t("enterCompanyName")}
              isInvalid={!!errors.companyName}
            />
            <Form.Control.Feedback type="invalid">
              {errors.companyName?.message}
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t("jobTitle")}</Form.Label>
                <Form.Control
                  {...register("jobTitle")}
                  placeholder={t("enterJobTitle")}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t("department")}</Form.Label>
                <Form.Control
                  {...register("department")}
                  placeholder={t("enterDepartment")}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t("phone")}</Form.Label>
                <Form.Control
                  {...register("phone")}
                  placeholder="+375 (XX) XXX-XX-XX"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t("industry")}</Form.Label>
                <Form.Select {...register("industry")}>
                  {industryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>{t("website")}</Form.Label>
                <Form.Control
                  {...register("website")}
                  placeholder="https://example.com"
                  type="url"
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label>{t("description")}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              {...register("description")}
              placeholder={t("describeYourBusiness")}
            />
          </Form.Group>

          <div className="bg-light p-3 rounded mt-3">
            <h6 className="mb-2"> {t("userInfo")}</h6>
            <div className="small">
              <strong>{t("name")}:</strong> {authUser?.name || "—"}
            </div>
            <div className="small">
              <strong>Email:</strong> {authUser?.email || "—"}
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="outline-secondary"
            onClick={onClose}
            disabled={isMutating}
          >
            {t("cancel")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={!isValid || isMutating}
          >
            {isMutating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {t("creating")}
              </>
            ) : (
              <> {t("createInSalesforce")}</>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SalesforceFormModal;
