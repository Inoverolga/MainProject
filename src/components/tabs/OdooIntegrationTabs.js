import { Card, Button, Spinner } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useOdooToken } from "../../hooks/odooIntegration/useOdooToken.js";
import TokenInfo from "../odoo/TokenInfo";
import AggregateData from "../odoo/AggregateData";
import IntegrationDocs from "../odoo/IntegrationDocs";

const OdooIntegrationTabs = ({ inventoryId }) => {
  const { t } = useTranslation();
  const {
    token,
    aggregateData,
    generateToken,
    refreshToken,
    isLoading,
    isLoadingAggregate,
    importToOdoo,
    isImporting,
  } = useOdooToken(inventoryId);

  return (
    <div className="odoo-integration">
      <h4>🔗 {t("integration")}</h4>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">🔑 {t("apiToken")}</h5>
        </Card.Header>
        <Card.Body>
          {!token ? (
            <div className="text-center">
              <p className="text-muted">{t("noToken")}</p>
              <Button
                variant="secondary"
                onClick={() => generateToken()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner size="sm" className="me-2" />
                    {t("creating")}
                  </>
                ) : (
                  t("generateToken")
                )}
              </Button>
            </div>
          ) : (
            <TokenInfo
              token={token}
              onRefresh={refreshToken}
              onImport={importToOdoo}
              isLoading={isLoading}
              isImporting={isImporting}
            />
          )}
        </Card.Body>
      </Card>

      {token && (
        <AggregateData data={aggregateData} isLoading={isLoadingAggregate} />
      )}

      <IntegrationDocs />
    </div>
  );
};

export default OdooIntegrationTabs;
