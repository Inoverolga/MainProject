import { useState, useEffect } from "react";
import { Modal, Button, Form, Card } from "react-bootstrap";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { fetchCreateSupportRequest } from "../../service/api.js";
import { useTranslation } from "react-i18next";

const SupportModal = ({ show, onHide, currentInventory, currentPage }) => {
  const { t } = useTranslation();
  const [problem, setProblem] = useState("");
  const [priority, setPriority] = useState("medium");
  const [currentPageUrl, setCurrentPageUrl] = useState("");

  useEffect(() => {
    setCurrentPageUrl(window.location.href);
  }, [currentPage, currentInventory]);

  const { trigger, isMutating } = useSWRMutation(
    "/request/support",
    fetchCreateSupportRequest
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await trigger({
        problem: problem.trim(),
        priority,
        inventoryId: currentInventory?.id || null,
        pageUrl: currentPageUrl,
      });
      if (result.success) {
        setProblem("");
        setPriority("medium");
        onHide();

        toast.success(t("supportRequestSuccess"));

        if (result.data.jsonData) {
        }
      } else {
        toast.error(result.message || t("supportRequestError"));
      }
    } catch (err) {
      toast.error(t("supportRequestSendError"));
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "#dc3545";
      case "medium":
        return "#ffc107";
      case "low":
        return "#28a745";
      default:
        return "#6c757d";
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>📧 {t("createSupportRequest")}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Card className="mb-4 border-info">
            <Card.Body className="p-3">
              <h6 className="mb-2">{t("requestInformation")}</h6>
              <div className="small text-muted">
                <div>
                  <strong>{t("page")}:</strong> {currentPageUrl}
                </div>
                {currentInventory && (
                  <div>
                    <strong>{t("inventory")}:</strong> {currentInventory.name}
                  </div>
                )}
                <div>
                  👤 <strong>{t("user")}:</strong>{" "}
                  {localStorage.getItem("userName") || t("currentUser")}
                </div>
              </div>
            </Card.Body>
          </Card>

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>{t("problemDescription")} *</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder={t("problemPlaceholder")}
              required
              minLength={10}
            />
            <Form.Text className="text-muted">{t("minCharacters")}</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>
              <strong>{t("priority")} *</strong>
            </Form.Label>
            <Form.Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={{
                borderLeft: `4px solid ${getPriorityColor(priority)}`,
              }}
            >
              <option value="low">
                🟢 {t("lowPriority")} - {t("lowPriorityDesc")}
              </option>
              <option value="medium">
                🟡 {t("mediumPriority")} - {t("mediumPriorityDesc")}
              </option>
              <option value="high">
                🔴 {t("highPriority")} - {t("highPriorityDesc")}
              </option>
            </Form.Select>
          </Form.Group>

          <div className="small text-muted mt-3">* {t("requiredFields")}</div>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={onHide} disabled={isMutating}>
            {t("cancel")}
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isMutating || !problem.trim() || problem.length < 10}
          >
            {isMutating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                {t("creatingRequest")}
              </>
            ) : (
              `📤 ${t("sendRequest")}`
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default SupportModal;
