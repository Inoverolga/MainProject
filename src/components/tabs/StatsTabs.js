import useSWR from "swr";
import { Card, Row, Col, Badge, ProgressBar } from "react-bootstrap";
import { fetchStatsInventory } from "../../service/api.js";
import Spinner from "../../components/spinner/Spinner.js";
import Error from "../../components/error/Error.js";
import { useTranslation } from "react-i18next";

const StatsTabs = ({ inventoryId }) => {
  const { t } = useTranslation();
  const {
    data: dataStats,
    error,
    isLoading,
  } = useSWR(
    inventoryId && `/stats/inventories/${inventoryId}/stats`,
    () => fetchStatsInventory(`/stats/inventories/${inventoryId}`),
    { revalidateOnFocus: false }
  );

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;
  if (!dataStats)
    return <div className="text-center text-muted py-4">{t("noData")}</div>;

  const renderFieldCard = (fieldData, fieldKey) => (
    <Col xs={12} sm={6} md={4} lg={3} key={fieldKey} className="mb-4">
      <Card className="h-100 border-light shadow-sm">
        <Card.Body className="d-flex flex-column">
          <Card.Title className="h6 text-secondary mb-3">
            {fieldData.name}
          </Card.Title>

          <div className="mb-3">
            <div className="d-flex justify-content-between mb-1">
              <small className="text-muted">{t("filled")}:</small>
              <small className="text-muted">
                {fieldData.filledPercentage}%
              </small>
            </div>
            <ProgressBar now={fieldData.filledPercentage} variant="secondary" />
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">{t("values")}:</span>
            <Badge bg="light" text="dark">
              {fieldData.count} {t("of")} {dataStats.itemsCount}
            </Badge>
          </div>

          {fieldData.average && (
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">{t("average")}:</span>
              <strong>{fieldData.average}</strong>
            </div>
          )}

          {fieldData.uniqueCount && (
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">{t("unique")}:</span>
              <strong>{fieldData.uniqueCount}</strong>
            </div>
          )}

          {fieldData.truePercentage !== undefined && (
            <div className="mt-auto">
              <div className="d-flex justify-content-between">
                <small className="text-muted">{t("yes")}:</small>
                <small className="text-muted">
                  {fieldData.truePercentage}%
                </small>
              </div>
              <ProgressBar
                now={fieldData.truePercentage}
                variant="secondary"
                className="mb-1"
              />

              <div className="d-flex justify-content-between">
                <small className="text-muted">{t("no")}:</small>
                <small className="text-muted">
                  {fieldData.falsePercentage}%
                </small>
              </div>
              <ProgressBar
                now={fieldData.falsePercentage}
                variant="secondary"
              />
            </div>
          )}
        </Card.Body>
      </Card>
    </Col>
  );

  const renderFieldTypeSection = (fieldType) => {
    const fields = dataStats.fieldTypes?.[fieldType]?.fields;
    if (!fields || Object.keys(fields).length === 0) return null;

    return (
      <div className="mb-5">
        <h4 className="text-secondary mb-4">
          {dataStats.fieldTypes[fieldType].title}
        </h4>
        <Row>
          {Object.entries(fields).map(([fieldKey, fieldData]) =>
            renderFieldCard(fieldData, fieldKey)
          )}
        </Row>
      </div>
    );
  };

  return (
    <div className="container-fluid py-4">
      <Row className="mb-5">
        <Col>
          <Card className="border-0 bg-light text-center">
            <Card.Body className="py-4">
              <h3 className="text-secondary mb-3">{dataStats.inventoryName}</h3>
              {dataStats.inventoryDescription && (
                <p className="text-muted mb-3">
                  {dataStats.inventoryDescription}
                </p>
              )}

              <div className="row">
                <div className="col-md-4">
                  <div className="display-4 fw-bold text-dark">
                    {dataStats.itemsCount}
                  </div>
                  <p className="mb-0 text-muted">{t("items")}</p>
                </div>
                <div className="col-md-4">
                  <div className="display-4 fw-bold text-dark">
                    {dataStats.totalFields}
                  </div>
                  <p className="mb-0 text-muted">{t("fields")}</p>
                </div>
                <div className="col-md-4">
                  <div className="display-4 fw-bold text-dark">
                    {dataStats.overallCompletion}%
                  </div>
                  <p className="mb-0 text-muted">{t("completed")}</p>
                </div>
              </div>

              <div className="mt-3">
                <small className="text-muted">
                  {t("creator")}: {dataStats.creator}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {renderFieldTypeSection("numbers")}
      {renderFieldTypeSection("strings")}
      {renderFieldTypeSection("text")}
      {renderFieldTypeSection("booleans")}

      {!dataStats.fieldTypes && (
        <Card className="border-0 text-center bg-light">
          <Card.Body className="py-5">
            <h5 className="text-muted">{t("noDataToDisplay")}</h5>
            <p className="text-muted mb-0">{t("addItemsWithFieldsHint")}</p>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
export default StatsTabs;
