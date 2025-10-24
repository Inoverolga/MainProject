import useSWR from "swr";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container } from "react-bootstrap";
import {
  fetchMyInventories,
  fetchAccessibleInventories,
  fetchSearchAll,
} from "../../service/api.js";
import Error from "../../components/error/Error.js";
import Spinner from "../../components/spinner/Spinner.js";
import { useInventoryColumns } from "../../hooks/useInventoryColumns.js";
import { SearchContext } from "../../contexts/SearchContext.js";
import { InventorySection } from "../../components/table/ToolbarForProfilePage.js";
import { useInventoryOperations } from "../../hooks/useInventoryOperations.js";

const ProfilePage = () => {
  const { searchTerm } = useContext(SearchContext);
  const navigate = useNavigate();

  const [selectedMyRows, setSelectedMyRows] = useState([]);
  const [selectedAccessRows, setSelectedAccessRows] = useState([]);

  const {
    data: myData,
    isLoading: myLoading,
    error: myError,
    mutate: mutateMyInventories,
  } = useSWR(
    searchTerm ? `/search?q=${searchTerm}` : "/users/me/inventories",
    searchTerm ? fetchSearchAll : fetchMyInventories,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  const {
    data: accessData,
    isLoading: accessLoading,
    error: accessError,
  } = useSWR(
    searchTerm ? `/search?q=${searchTerm}` : "/users/me/accessible-inventories",
    searchTerm ? fetchSearchAll : fetchAccessibleInventories,
    { keepPreviousData: true, revalidateOnFocus: false }
  );

  const { handleDelete, handleEdit, handleExport } =
    useInventoryOperations(mutateMyInventories);

  const myInventories = Array.isArray(myData) ? myData : myData?.data || [];
  const accessInventories = Array.isArray(accessData)
    ? accessData
    : accessData?.data || [];

  //   console.log("📊 Мои инвентари:", myInventories);
  //   console.log("📊 Доступные инвентари:", accessInventories);

  const myColumns = useInventoryColumns(myInventories, "my");
  const accessColumns = useInventoryColumns(accessInventories, "accessible");

  if ((myLoading && !myData) || (accessLoading && !accessData))
    return <Spinner />;
  if (myError || accessError) return <Error />;

  return (
    <Container className="py-4">
      <h1 className="mb-4 fs-5">👤 Личный кабинет</h1>

      <InventorySection
        title="📁 Мои инвентари"
        data={myInventories}
        columns={myColumns}
        loading={myLoading}
        selectedRows={selectedMyRows}
        onSelectionChange={setSelectedMyRows}
        onEdit={() => handleEdit(selectedMyRows, navigate)}
        onExport={() => handleExport(selectedMyRows)}
        onDelete={() => handleDelete(selectedMyRows, setSelectedMyRows)}
        showDelete={true}
        createButtonVariant="secondary"
        emptyMessage="У вас пока нет инвентарей"
      />

      <InventorySection
        title="🔗 Доступные инвентари"
        data={accessInventories}
        columns={accessColumns}
        loading={accessLoading}
        selectedRows={selectedAccessRows}
        onSelectionChange={setSelectedAccessRows}
        onEdit={() => handleEdit(selectedAccessRows, navigate)}
        onExport={() => handleExport(selectedAccessRows)}
        showDelete={false}
        createButtonVariant="secondary"
        emptyMessage="У вас нет доступа к чужим инвентарям"
      />
    </Container>
  );
};
export default ProfilePage;
