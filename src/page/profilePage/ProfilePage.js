import useSWR from "swr";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import {
  fetchMyInventories,
  fetchAccessibleInventories,
  fetchSearchAll,
} from "../../service/api.js";
import Error from "../../components/error/Error.js";
import Spinner from "../../components/spinner/Spinner.js";
import { useInventoryColumns } from "../../hooks/inventories/useInventoryColumns.js";
import { SearchContext } from "../../contexts/SearchContext.js";
import { InventorySection } from "../../components/table/ToolbarForProfilePage.js";
import { useInventoryOperations } from "../../hooks/inventories/useInventoryOperations.js";

const ProfilePage = () => {
  const { searchTerm } = useContext(SearchContext);

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
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const {
    data: accessData,
    isLoading: accessLoading,
    error: accessError,
    mutate: mutateAccessInventories,
  } = useSWR(
    searchTerm ? `/search?q=${searchTerm}` : "/users/me/accessible-inventories",
    searchTerm ? fetchSearchAll : fetchAccessibleInventories,
    {
      keepPreviousData: true,
      revalidateOnFocus: false,
    }
  );

  const { handleDelete, handleEdit, handleExport } = useInventoryOperations(
    mutateMyInventories,
    mutateAccessInventories
  );

  console.log(myData);
  const myInventories = myData?.data || myData || [];
  const accessInventories = accessData?.data || accessData || [];

  const myColumns = useInventoryColumns(myInventories, "my");
  const accessColumns = useInventoryColumns(accessInventories, "accessible");

  if ((myLoading && !myData) || (accessLoading && !accessData))
    return <Spinner />;
  if (myError || accessError) return <Error />;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="mb-4 fs-5">👤 Личный кабинет</h1>
        <Link to="/inventory-create">
          <Button variant="secondary" size="sm">
            ＋ Создать инвентарь
          </Button>
        </Link>
      </div>

      <InventorySection
        title="📁 Мои инвентари"
        data={myInventories}
        columns={myColumns}
        loading={myLoading}
        selectedRows={selectedMyRows}
        onSelectionChange={setSelectedMyRows}
        // onEdit={() => handleEdit(selectedMyRows, navigate)}
        onEdit={() => handleEdit(selectedMyRows)}
        onExport={() => handleExport(selectedMyRows)}
        onDelete={() =>
          handleDelete(selectedMyRows, setSelectedMyRows, myInventories)
        }
        showDelete={true}
        hasWriteAccess={true}
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
        //onEdit={() => handleEdit(selectedAccessRows, navigate)}
        onEdit={() => handleEdit(selectedMyRows)}
        onExport={() => handleExport(selectedAccessRows)}
        showDelete={false}
        onDelete={() =>
          handleDelete(
            selectedAccessRows,
            setSelectedAccessRows,
            accessInventories
          )
        }
        hasWriteAccess={false}
        createButtonVariant="secondary"
        emptyMessage="У вас нет доступа к чужим инвентарям"
      />
    </Container>
  );
};
export default ProfilePage;
