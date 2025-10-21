import UniversalInventoryForm from "../../components/form/UniversalInventoryForm.js";
import useSWR from "swr";
import { fetchMyInventories } from "../../service/api.js";

const CreateInventoryPage = () => {
  const { mutate: mutateMyInventories } = useSWR(
    "/users/me/inventories",
    fetchMyInventories,
    { revalidateOnFocus: false }
  );
  return (
    <UniversalInventoryForm
      mode="create"
      mutateMyInventories={mutateMyInventories}
    />
  );
};

export default CreateInventoryPage;
