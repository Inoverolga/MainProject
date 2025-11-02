import { Card } from "react-bootstrap";
import UniversalInventoryForm from "../form/UniversalInventoryForm";
import { useInventoryOperations } from "../../hooks/inventories/useInventoryOperations";

const InventorySettingsTabs = ({
  inventoryId,
  inventory,
  mutateInventory,
  onSuccess,
}) => {
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
        <h5>⚙️ Настройки инвентаря</h5>
        <UniversalInventoryForm
          key={inventory?.version} //чтобы  обновлялись версии
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
