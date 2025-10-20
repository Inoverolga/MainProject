import useSWR from "swr";
import { useState, useContext } from "react";
import {
  fetchMyInventories,
  fetchAccessibleInventories,
  fetchSearchAll,
} from "../../service/api.js";
import { Container } from "react-bootstrap";
//import { toast } from "react-toastify";
import Error from "../../components/error/Error.js";
import Spinner from "../../components/spinner/Spinner.js";
import { useInventoryColumns } from "../../hooks/useInventoryColumns.js";
import { SearchContext } from "../../contexts/SearchContext.js";
import { InventorySection } from "../../components/table/Toolbar.js";

const ProfilePage = () => {
  const { searchTerm } = useContext(SearchContext);
  const {
    data: myData,
    isLoading: myLoading,
    error: myError,
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

  const [selectedMyRows, setSelectedMyRows] = useState([]);
  const [selectedAccessRows, setSelectedAccessRows] = useState([]);

  const myInventories = myData?.data || [];
  const accessInventories = accessData?.data || [];
  console.log(myInventories);
  console.log(accessInventories);

  const myColumns = useInventoryColumns(myInventories, "my");
  const accessColumns = useInventoryColumns(accessInventories, "accessible");

  const handleDeleteMyInv = () => {
    if (selectedMyRows.length > 0) {
      console.log("Удаляем мои инвентари:", selectedMyRows);
    }
  };

  const handleExportMyInv = () => {
    if (selectedMyRows.length > 0) {
      console.log("Экспортируем мои инвентари:", selectedMyRows);
    }
  };

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
        //   onEdit={handleEditMy}
        //   onExport={handleExportMy}
        //   onDelete={handleDeleteMy}
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
        //   onEdit={handleEditAccess}
        //   onExport={handleExportAccess}
        //   onDelete={handleDeleteMy}
        showDelete={false}
        createButtonVariant="outline-secondary"
        emptyMessage="У вас нет доступа к чужим инвентарям"
      />
    </Container>
  );
};
export default ProfilePage;
