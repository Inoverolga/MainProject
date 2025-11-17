import { Button, Spinner, Badge } from "react-bootstrap";
import { useTranslation } from "react-i18next";

const TokenInfo = ({ token, onRefresh, isLoading, onImport, isImporting }) => {
  const { t } = useTranslation();

  const isExpired = token.expires_at && new Date(token.expires_at) < new Date();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <Badge bg={isExpired ? "danger" : "success"}>
            {isExpired ? t("expired") : t("active")}
          </Badge>
          {token.expires_at && (
            <small className="text-muted d-block mt-1">
              {t("expires")}: {new Date(token.expires_at).toLocaleDateString()}
            </small>
          )}
        </div>
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => onRefresh(token?.token_name)}
          disabled={isLoading}
        >
          {isLoading ? <Spinner size="sm" /> : t("refresh")}
        </Button>
      </div>

      <div className="mb-3">
        <label className="form-label small text-muted">{t("token")}</label>
        <div className="input-group">
          <input
            type="text"
            className="form-control font-monospace"
            value={token.api_token}
            readOnly
          />
        </div>
      </div>

      <div className="mb-3">
        <Button
          variant="outline-secondary"
          onClick={onImport}
          disabled={isImporting || !token.api_token}
          className="w-100"
        >
          {isImporting ? (
            <>
              <Spinner size="sm" className="me-2" />
              {t("importing")}...
            </>
          ) : (
            ` ${t("importToOdoo")}`
          )}
        </Button>
        <small className="text-muted d-block mt-1">
          {t("importDescription")}
        </small>
      </div>

      <div className="small text-muted">
        <div>
          <strong>{t("inventory")}:</strong> {token.inventory_name}
        </div>
        <div>
          <strong>{t("created")}:</strong>{" "}
          {new Date(token.created_at).toLocaleString()}
        </div>
      </div>

      <div className="mt-3 pt-3 border-top">
        <small className="text-muted">
          <strong>{t("odooLink")}:</strong>{" "}
          <a
            href="https://odoo-render-setup.onrender.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-decoration-none"
          >
            https://odoo-render-setup.onrender.com
          </a>
        </small>
      </div>
    </div>
  );
};

export default TokenInfo;
