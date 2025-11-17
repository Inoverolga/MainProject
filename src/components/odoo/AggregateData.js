import { Card, Badge, Row, Col, ProgressBar } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import Spinner from "../spinner/Spinner.js";

const AggregateData = ({ data, isLoading }) => {
  const { t } = useTranslation();

  const renderNumericAggregation = (fieldName, fieldData) => (
    <div key={fieldName} className="mb-3 p-3 border rounded">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>{fieldName}</strong>
        <Badge bg="secondary">{t("number")}</Badge>
      </div>
      <Row className="small text-muted">
        <Col>
          <div>
            {t("average")}: <strong>{fieldData.average || t("na")}</strong>
          </div>
        </Col>
        <Col>
          <div>
            {t("minimum")}: <strong>{fieldData.min || t("na")}</strong>
          </div>
        </Col>
        <Col>
          <div>
            {t("maximum")}: <strong>{fieldData.max || t("na")}</strong>
          </div>
        </Col>
        <Col>
          <div>
            {t("total")}: <strong>{fieldData.count || 0}</strong>
          </div>
        </Col>
      </Row>
    </div>
  );

  const renderStringAggregation = (fieldName, fieldData) => (
    <div key={fieldName} className="mb-3 p-3 border rounded">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>{fieldName}</strong>
        <Badge bg="secondary">{t("text")}</Badge>
      </div>
      <div className="small text-muted mb-2">{t("mostPopularValues")}:</div>
      {fieldData.top_values?.slice(0, 3).map((item, index) => (
        <div
          key={index}
          className="d-flex justify-content-between align-items-center mb-1"
        >
          <span className="text-truncate" style={{ maxWidth: "60%" }}>
            {item.value}
          </span>
          <div className="d-flex align-items-center" style={{ width: "40%" }}>
            <ProgressBar
              now={parseFloat(item.percentage)}
              style={{ flex: 1, height: "8px" }}
              variant="secondary"
            />
            <small className="ms-2" style={{ minWidth: "45px" }}>
              {item.percentage}%
            </small>
          </div>
        </div>
      ))}
      <div className="small text-muted mt-1">
        {t("uniqueValues")}: <strong>{fieldData.unique_count}</strong>
      </div>
    </div>
  );

  const renderBooleanAggregation = (fieldName, fieldData) => (
    <div key={fieldName} className="mb-3 p-3 border rounded">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <strong>{fieldName}</strong>
        <Badge bg="outline-secondary">{t("boolean")}</Badge>
      </div>
      <div className="small text-muted">
        {t("totalElements")}: <strong>{fieldData.count || 0}</strong>
      </div>
    </div>
  );

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">{t("aggregateData")}</h5>
      </Card.Header>
      <Card.Body>
        {isLoading ? (
          <div className="text-center">
            <Spinner />
            <p className="mt-2">{t("loading")}</p>
          </div>
        ) : data ? (
          <div>
            <Row className="mb-4 text-center">
              <Col>
                <div className="border rounded p-2">
                  <div className="h5 mb-1 text-secondary">
                    {data.aggregations?.total_count || 0}
                  </div>
                  <small className="text-muted">{t("totalElements")}</small>
                </div>
              </Col>
              <Col>
                <div className="border rounded p-2">
                  <div className="h5 mb-1 text-secondary">
                    {data.inventory?.fields?.length || 0}
                  </div>
                  <small className="text-muted">{t("fields")}</small>
                </div>
              </Col>
              <Col>
                <div className="border rounded p-2">
                  <div className="h5 mb-1 text-secondary">
                    {
                      Object.keys(data.aggregations?.fields_aggregation || {})
                        .length
                    }
                  </div>
                  <small className="text-muted">{t("aggregations")}</small>
                </div>
              </Col>
            </Row>

            {data.aggregations?.fields_aggregation && (
              <div>
                <h6>{t("fieldAnalytics")}:</h6>
                {Object.entries(data.aggregations.fields_aggregation).map(
                  ([fieldName, fieldData]) => {
                    if (fieldData.type === "number")
                      return renderNumericAggregation(fieldName, fieldData);
                    if (fieldData.type === "string")
                      return renderStringAggregation(fieldName, fieldData);
                    if (
                      fieldData.type === "boolean" ||
                      fieldData.type === "bool"
                    )
                      return renderBooleanAggregation(fieldName, fieldData);
                    return null;
                  }
                )}
              </div>
            )}

            {data.inventory?.fields && data.inventory.fields.length > 0 && (
              <div className="mt-4">
                <h6>{t("inventoryFields")}:</h6>
                {data.inventory.fields.map((field, index) => (
                  <Badge
                    key={index}
                    bg="outline-secondary"
                    className="me-2 mb-1"
                    style={{
                      backgroundColor: "#f8f9fa",
                      color: "#6c757d",
                      border: "1px solid #dee2e6",
                    }}
                  >
                    {field.name} ({t(field.type.toLowerCase())})
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="text-muted text-center">{t("noData")}</p>
        )}
      </Card.Body>
    </Card>
  );
};
export default AggregateData;
