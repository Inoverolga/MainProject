import { useNavigate, useParams } from "react-router-dom";
import useSWR from "swr";
import { Container, Card, Tabs, Tab } from "react-bootstrap";
import ReactMarkdown from "react-markdown";
import Spinner from "../../components/spinner/Spinner";
import Error from "../../components/error/Error";
import {
  fetchInventoryWithItems,
  fetchFieldsPublic,
  fetchItemsWithFieldsPublic,
} from "../../service/api";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import ItemsTabs from "../../components/tabs/ItemsTabs.js";
import FieldSettingTabs from "../../components/tabs/FieldsSettingsTabs.js";

const InventoryPage = () => {
  const { id } = useParams();
  const { isAuthenticated, authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Загружаем инвентарь публичный (название, описание, создатель)
  const {
    data: dataInventory,
    error: inventoryError,
    isLoading: inventoryLoading,
  } = useSWR(`/inventories/${id}`, fetchInventoryWithItems, {
    revalidateOnFocus: false,
  });

  // 2. Загружаем поля для колонок (только для авторизованных)
  const { data: dataConfigFields, mutate: mutateFieldsPublic } = useSWR(
    isAuthenticated ? `/users/inventories/${id}/fields-public` : null,
    fetchFieldsPublic
  );

  // 3. Загружаем товары (только для авторизованных)
  const {
    data: dataItemsWithField,
    error: itemsError,
    isLoading: itemsLoading,
    mutate: mutateMyItems,
  } = useSWR(
    isAuthenticated ? `/users/inventories/${id}/items` : null,
    fetchItemsWithFieldsPublic,
    {
      revalidateOnFocus: false,
    }
  );

  const inventory = dataInventory?.data;
  const fields = dataConfigFields?.data || [];

  const items = isAuthenticated
    ? dataItemsWithField?.data || []
    : inventory?.items || [];

  const isOwner = inventory?.userId === authUser?.id;
  const hasWriteAccess = isOwner || inventory?.canWrite || false;

  if (inventoryLoading) return <Spinner />;
  if (inventoryError)
    return <Error message={`Ошибка загрузки: ${inventoryError.message}`} />;
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
        <h1 className="fs-4 mb-0 text-dark fw-bold">{inventory.name}</h1>
        {hasWriteAccess && (
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => navigate(`/inventory-edit/${id}`)}
          >
            <i className="bi bi-pencil me-1"></i>
            Редактировать инвентарь
          </button>
        )}
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

      <Tabs defaultActiveKey="items" className="mb-3">
        <Tab eventKey="items" title="🗃️ Товары">
          <ItemsTabs
            inventory={inventory}
            data={items}
            fields={fields}
            hasWriteAccess={hasWriteAccess}
            mutateMyItems={mutateMyItems}
            itemsLoading={isAuthenticated ? itemsLoading : false}
            itemsError={itemsError}
            isAuthenticated={isAuthenticated}
          />
        </Tab>

        {hasWriteAccess && (
          <Tab eventKey="fields" title="🛠️ Поля">
            <FieldSettingTabs
              inventoryId={id}
              fields={fields}
              mutateFields={mutateFieldsPublic}
              isOwner={isOwner}
            />
          </Tab>
        )}
        {/* Остальные вкладки (пока disabled) */}
        <Tab eventKey="discussion" title="💬 Обсуждение" disabled>
          {/* DiscussionTab - будет создан */}
        </Tab>

        <Tab eventKey="settings" title="⚙️ Настройки" disabled>
          {/* BasicSettings - будет создан */}
        </Tab>

        <Tab eventKey="access" title="👥 Доступ" disabled>
          {/* AccessSettings - будет создан */}
        </Tab>
      </Tabs>
    </Container>
  );
};

export default InventoryPage;
