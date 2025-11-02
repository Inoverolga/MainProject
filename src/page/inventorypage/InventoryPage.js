import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { Container, Card, Tabs, Tab } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import Spinner from "../../components/spinner/Spinner";
import Error from "../../components/error/Error";
import {
  fetchInventoryWithItems,
  fetchFieldsPublic,
  fetchInventoryWithAccessCheck,
} from "../../service/api";
import { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import ItemsTabs from "../../components/tabs/ItemsTabs.js";
import FieldSettingTabs from "../../components/tabs/FieldsSettingsTabs.js";
import InventorySettingsTabs from "../../components/tabs/InventorySettingTabs.js";
import AccessTab from "../../components/tabs/AccessTabs.js";
import DiscussionTab from "../../components/tabs/DiscussionTabs.js";
import CustomIdTabs from "../../components/tabs/CustomIdTabs.js";

const InventoryPage = () => {
  const { id } = useParams();
  const { isAuthenticated, authUser } = useContext(AuthContext);
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

  const inventory = dataInventory?.data;
  const items = inventory?.items || [];
  const isOwner = inventory?.userId === authUser?.id;
  const hasWriteAccess = Boolean(isOwner || inventory?.canWrite);

  const { data: dataConfigFields, mutate: mutateFieldsPublic } = useSWR(
    isAuthenticated && hasWriteAccess
      ? `/users/inventories/${id}/fields-public`
      : null,
    fetchFieldsPublic
  );

  const fields = dataConfigFields?.data || [];

  if (inventoryLoading) return <Spinner />;

  if (inventoryError) {
    return <Error message={`Ошибка загрузки: ${inventoryError.message}`} />;
  }

  if (!inventory) return <div>Инвентарь не найден</div>;

  return (
    <Container className="py-4">
      <div className="mb-3">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate("/profile")}
        >
          <i className="bi bi-arrow-left me-1"></i>
          Назад
        </button>
      </div>

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="fs-4 mb-0 text-dark fw-bold">
          {inventory.name || "Новый инвентарь"}
        </h1>
      </div>

      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Card.Title className="text-muted mb-3 small text-uppercase fw-semibold">
            📋 Описание инвентаря
          </Card.Title>
          <div className="markdown-content" style={{ lineHeight: "1.6" }}>
            {inventory.description ? (
              <ReactMarkdown>{inventory.description}</ReactMarkdown>
            ) : (
              <p className="text-muted fst-italic mb-0">Описание отсутствует</p>
            )}
          </div>
        </Card.Body>
      </Card>

      <Tabs
        defaultActiveKey="items"
        className="mb-3"
        activeKey={activeTab}
        onSelect={setActiveTab}
      >
        <Tab eventKey="items" title="🗃️ Товары">
          <ItemsTabs
            inventory={inventory}
            data={items}
            fields={fields}
            hasWriteAccess={hasWriteAccess}
            mutateMyItems={mutateMyInventoryWithItems}
            isAuthenticated={isAuthenticated}
          />
        </Tab>

        <Tab eventKey="discussion" title="💬 Обсуждение">
          <DiscussionTab
            inventoryId={id}
            authUser={authUser}
            isAuthenticated={isAuthenticated}
            hasWriteAccess={hasWriteAccess}
          />
        </Tab>

        {isOwner && (
          <Tab eventKey="settings" title="⚙️ Настройки">
            <InventorySettingsTabs
              inventoryId={id}
              inventory={inventory}
              mutateInventory={mutateMyInventoryWithItems}
              onSuccess={() => setActiveTab("items")}
            />
          </Tab>
        )}

        {isOwner && (
          <Tab eventKey="fields" title="🛠️ Поля">
            <FieldSettingTabs
              inventoryId={id}
              fields={fields}
              mutateFields={mutateFieldsPublic}
              isOwner={isOwner}
            />
          </Tab>
        )}

        {isOwner && (
          <Tab eventKey="custom-id" title="#️⃣ Формат ID">
            <CustomIdTabs inventoryId={id} />
          </Tab>
        )}

        {isOwner && (
          <Tab eventKey="access" title="👥 Доступ">
            <AccessTab inventoryId={id} isOwner={isOwner} />
          </Tab>
        )}
      </Tabs>
    </Container>
  );
};

export default InventoryPage;
