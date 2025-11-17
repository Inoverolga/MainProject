import { Card } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const IntegrationDocs = () => {
  const { t } = useTranslation();

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">🔗 {t("odooIntegration")}</h5>
      </Card.Header>
      <Card.Body>
        <p>{t("odooIntegrationDescription")}</p>

        <div className="mb-3">
          <h6> {t("whatDataIsShared")}</h6>
          <ul className="small">
            <li>{t("inventoryStatistics")}</li>
            <li>{t("categorySummaries")}</li>
            <li>{t("fieldAggregations")}</li>
            <li>{t("totalCounts")}</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default IntegrationDocs;
