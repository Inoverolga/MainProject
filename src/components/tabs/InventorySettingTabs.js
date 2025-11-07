import { Card } from "react-bootstrap";
import UniversalInventoryForm from "../form/UniversalInventoryForm.js";
import { useInventoryOperations } from "../../hooks/inventories/useInventoryOperations";
import { useTranslation } from "react-i18next";

const InventorySettingsTabs = ({
  inventoryId,
  inventory,
  mutateInventory,
  onSuccess,
}) => {
  const { t } = useTranslation();
  const { handleUpdate } = useInventoryOperations(null, null, mutateInventory);

  const handleSaveWithRedirect = async (inventoryId, formData) => {
    const success = await handleUpdate(inventoryId, formData);
    if (success && onSuccess) {
      onSuccess();
    }
    return success;
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <h5>⚙️ {t("InventorySettings")}</h5>
        <UniversalInventoryForm
          key={inventory?.version}
          mode="edit"
          inventoryId={inventoryId}
          inventory={inventory}
          onSave={handleSaveWithRedirect}
        />
      </Card.Body>
    </Card>
  );
};

export default InventorySettingsTabs;
