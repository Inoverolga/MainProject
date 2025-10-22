import Spinner from "../../components/spinner/Spinner";
import Error from "../../components/error/Error";
import useSWR from "swr";
import { fetchEditInventories, fetchMyInventories } from "../../service/api";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import UniversalInventoryForm from "../../components/form/UniversalInventoryForm.js";

const EditInventoryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { mutate: mutateMyInventories } = useSWR(
    "/users/me/inventories",
    fetchMyInventories,
    { revalidateOnFocus: false }
  );

  const { data, isLoading, error } = useSWR(
    id ? `/users/inventories-edit/${id}` : null,
    fetchEditInventories
  );

  const handleSuccess = () => {
    navigate("/profile");
  };

  if (isLoading) return <Spinner />;
  if (error) return <Error />;

  return (
    <UniversalInventoryForm
      mode="edit"
      initialData={data?.data}
      inventoryId={id}
      onSuccess={handleSuccess}
      mutateMyInventories={mutateMyInventories}
    />
  );
};

export default EditInventoryPage;
