import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { Container, Tabs, Tab } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useContext, useState } from "react";
import Spinner from "../../components/spinner/Spinner";
import Error from "../../components/error/Error";
import ReactMarkdown from "react-markdown";
import {
  fetchInventoryWithItems,
  fetchFieldsPublic,
  fetchInventoryWithAccessCheck,
  fetchItemsSearch,
} from "../../service/api";
import { AuthContext } from "../../contexts/AuthContext";
import { SearchContext } from "../../contexts/SearchContext.js";
import ItemsTabs from "../../components/tabs/ItemsTabs.js";
import FieldSettingTabs from "../../components/tabs/FieldsSettingsTabs.js";
import InventorySettingsTabs from "../../components/tabs/InventorySettingTabs.js";
import AccessTab from "../../components/tabs/AccessTabs.js";
import DiscussionTab from "../../components/tabs/DiscussionTabs.js";
import CustomIdTabs from "../../components/tabs/CustomIdTabs.js";
import StatsTabs from "../../components/tabs/StatsTabs.js";
import OdooIntegrationTabs from "../../components/tabs/OdooIntegrationTabs.js";

const InventoryPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  const { isAuthenticated, authUser, isAdmin } = useContext(AuthContext);
  const { searchTerm } = useContext(SearchContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("items");

  const {
    data: dataInventory,
    error: inventoryError,
    isLoading: inventoryLoading,
    mutate: mutateMyInventoryWithItems,
  } = useSWR(
    isAuthenticated
      ? `/users/inventories/${id}/items-with-access`
      : `/inventories/${id}`,
    isAuthenticated ? fetchInventoryWithAccessCheck : fetchInventoryWithItems,
    {
      revalidateOnFocus: false,
    }
  );

  const { data: searchData, isLoading: searchLoading } = useSWR(
    searchTerm
      ? `/search/items?inventoryId=${id}&q=${encodeURIComponent(searchTerm)}`
      : null,
    fetchItemsSearch,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const inventory = dataInventory?.data;
  const items = searchTerm ? searchData?.data || [] : inventory?.items || [];
  const isOwner = inventory?.userId === authUser?.id;
  const hasWriteAccess = Boolean(isOwner || inventory?.canWrite || isAdmin);
  const hasTotalAccess = isOwner || isAdmin;

  const { data: dataConfigFields, mutate: mutateFieldsPublic } = useSWR(
    isAuthenticated && hasWriteAccess
      ? `/users/inventories/${id}/fields-public`
      : null,
    fetchFieldsPublic
  );

  const fields = dataConfigFields?.data || [];

  if (inventoryLoading) return <Spinner />;

  if (inventoryError) {
    return <Error message={`${t("loadingError")} ${inventoryError.message}`} />;
  }

  if (!inventory) return <div>{t("inventoryNotFound")}</div>;

  return (
    <Container className="py-4">
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/profile")}
        >
          <i className="bi bi-grid me-1"></i>
          {t("backToInventories")}
        </button>
      </div>

      <div className="d-flex gap-3 align-items-start mb-4">
        <div className="flex-shrink-0">
          {inventory.imageUrl ? (
            <img
              src={inventory.imageUrl}
              alt={inventory.name}
              className="rounded"
              style={{ width: "80px", height: "80px", objectFit: "cover" }}
            />
          ) : (
            <div
              className="bg-light rounded d-flex align-items-center justify-content-center"
              style={{ width: "80px", height: "80px" }}
            >
              <i className="bi bi-image text-muted"></i>
            </div>
          )}
        </div>

        <div className="flex-grow-1">
          <h1 className="fs-4 mb-1">{inventory.name}</h1>
          {inventory.description && (
            <div className="text-muted mb-0">
              <ReactMarkdown>{inventory.description}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>
      <Tabs
        defaultActiveKey="items"
        className="mb-3"
        activeKey={activeTab}
        onSelect={setActiveTab}
      >
        <Tab eventKey="items" title={`🗃️ ${t("items")}`}>
          <ItemsTabs
            inventory={inventory}
            data={items}
            fields={fields}
            hasWriteAccess={hasWriteAccess}
            mutateMyItems={mutateMyInventoryWithItems}
            isAuthenticated={isAuthenticated}
            loading={searchLoading && searchTerm}
            searchTerm={searchTerm}
          />
        </Tab>

        <Tab eventKey="discussion" title={`💬 ${t("discussion")}`}>
          <DiscussionTab
            inventoryId={id}
            authUser={authUser}
            isAuthenticated={isAuthenticated}
            hasWriteAccess={hasWriteAccess}
          />
        </Tab>

        {hasTotalAccess && (
          <Tab eventKey="settings" title={`⚙️ ${t("settings")}`}>
            <InventorySettingsTabs
              inventoryId={id}
              inventory={inventory}
              mutateInventory={mutateMyInventoryWithItems}
              onSuccess={() => setActiveTab("items")}
            />
          </Tab>
        )}

        {hasTotalAccess && (
          <Tab eventKey="fields" title={`🛠️ ${t("fields")}`}>
            <FieldSettingTabs
              inventoryId={id}
              fields={fields}
              mutateFields={mutateFieldsPublic}
            />
          </Tab>
        )}

        {hasTotalAccess && (
          <Tab eventKey="custom-id" title={`#️⃣ ${t("idFormat")}`}>
            <CustomIdTabs inventoryId={id} />
          </Tab>
        )}

        {hasTotalAccess && (
          <Tab eventKey="odoo" title={`🔗 ${t("integration")}`}>
            <OdooIntegrationTabs inventoryId={id} />
          </Tab>
        )}

        {hasTotalAccess && (
          <Tab eventKey="stats" title={`📈 ${t("statistics")}`}>
            <StatsTabs inventoryId={id} />
          </Tab>
        )}

        {hasTotalAccess && (
          <Tab eventKey="access" title={`👥 ${t("Access")}`}>
            <AccessTab inventoryId={id} />
          </Tab>
        )}
      </Tabs>
    </Container>
  );
};

export default InventoryPage;
