import useSWR from "swr";
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "react-bootstrap";
import {
  fetchMyInventories,
  fetchAccessibleInventories,
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
    `/users/me/inventories?q=${encodeURIComponent(
      searchTerm
    )}&page=1&limit=100`,
    fetchMyInventories,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const {
    data: accessData,
    isLoading: accessLoading,
    error: accessError,
    mutate: mutateAccessInventories,
  } = useSWR(
    `/users/me/accessible-inventories?q=${encodeURIComponent(
      searchTerm
    )}&page=1&limit=100`,
    fetchAccessibleInventories,
    { revalidateOnFocus: false, keepPreviousData: true }
  );

  const { handleDelete, handleEdit, handleExport } = useInventoryOperations(
    mutateMyInventories,
    mutateAccessInventories
  );

  const myInventories = myData?.data || [];
  const accessInventories = accessData?.data || [];

  const myPagination = myData?.pagination;
  const accessPagination = accessData?.pagination;

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
        loading={myLoading && myData}
        selectedRows={selectedMyRows}
        onSelectionChange={setSelectedMyRows}
        onEdit={() => handleEdit(selectedMyRows)}
        onExport={() => handleExport(selectedMyRows)}
        onDelete={() =>
          handleDelete(selectedMyRows, setSelectedMyRows, myInventories)
        }
        showDelete={true}
        hasWriteAccess={true}
        createButtonVariant="secondary"
        emptyMessage={
          searchTerm
            ? `По запросу "${searchTerm}" не найдено ваших инвентарей`
            : "У вас пока нет инвентарей"
        }
      />

      {searchTerm && myPagination && myPagination.totalPages > 1 && (
        <div className="text-center text-muted mt-2 mb-4">
          Страница {myPagination.page} из {myPagination.totalPages}
        </div>
      )}

      <InventorySection
        title="🔗 Доступные инвентари"
        data={accessInventories}
        columns={accessColumns}
        loading={accessLoading && accessData}
        selectedRows={selectedAccessRows}
        onSelectionChange={setSelectedAccessRows}
        onEdit={() => handleEdit(selectedAccessRows)}
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
        emptyMessage={
          searchTerm
            ? `По запросу "${searchTerm}" не найдено доступных инвентарей`
            : "У вас нет доступа к чужим инвентарям"
        }
      />
      {searchTerm && accessPagination && accessPagination.totalPages > 1 && (
        <div className="text-center text-muted mt-2">
          Страница {accessPagination.page} из {accessPagination.totalPages}
        </div>
      )}
    </Container>
  );
};
export default ProfilePage;
