import useSWR from "swr";
import { Link } from "react-router-dom";
import {
  fetchMyInventories,
  fetchAccessibleInventories,
} from "../../service/api";
import { Container, Card, Table, Button } from "react-bootstrap";
//import { toast } from "react-toastify";
import Error from "../../components/error/Error.js";
import Spinner from "../../components/spinner/Spinner.js";

const ProfilePage = () => {
  const {
    data: myData,
    isLoading: myLoading,
    error: myError,
  } = useSWR("/users/me/inventories", fetchMyInventories);

  const {
    data: accessibleData,
    isLoading: accessibleLoading,
    error: accessibleError,
  } = useSWR("/users/me/accessible-inventories", fetchAccessibleInventories);

  const myInventories = myData?.data || [];
  const accessibleInventories = accessibleData?.data || [];

  // ДОБАВЬ ЭТО ДЛЯ ОТЛАДКИ:
  console.log("My inventories:", { myInventories, myLoading, myError });
  console.log("Accessible inventories:", {
    accessibleInventories,
    accessibleLoading,
    accessibleError,
  });

  if (myLoading || accessibleLoading) return <Spinner />;
  if (myError || accessibleError) return <Error />;

  return (
    <Container className="py-4">
      <h1 className="mb-4 fs-5">👤 Личный кабинет</h1>

      <Card className="mb-5">
        <Card.Header>
          <h5 className="mb-0">📁 Мои инвентари</h5>
        </Card.Header>
        <Card.Body>
          {myInventories.length === 0 ? (
            <div className="text-center py-4">
              <p>У вас пока нет инвентарей</p>
              <Button as={Link} to="/inventory/create" variant="primary">
                Создать инвентарь
              </Button>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Товаров</th>
                  <th>Дата создания</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {myInventories.map((inventory) => (
                  <tr key={inventory.id}>
                    <td>
                      <Link to={`/inventory/${inventory.id}`}>
                        {inventory.name}
                      </Link>
                    </td>
                    <td>
                      <span className="badge bg-primary">
                        {inventory._count?.items || 0}
                      </span>
                    </td>
                    <td>
                      {new Date(inventory.createdAt).toLocaleDateString(
                        "ru-RU"
                      )}
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/inventory/${inventory.id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        Открыть
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Card>
        <Card.Header>
          <h5 className="mb-0">🔗 Доступные инвентари</h5>
        </Card.Header>
        <Card.Body>
          {accessibleInventories.length === 0 ? (
            <div className="text-center py-4">
              <p>У вас нет доступа к чужим инвентарям</p>
            </div>
          ) : (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Владелец</th>
                  <th>Товаров</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {accessibleInventories.map((inventory) => (
                  <tr key={inventory.id}>
                    <td>
                      <Link to={`/inventory/${inventory.id}`}>
                        {inventory.name}
                      </Link>
                    </td>
                    <td>{inventory.user?.name}</td>
                    <td>
                      <span className="badge bg-primary">
                        {inventory._count?.items || 0}
                      </span>
                    </td>
                    <td>
                      <Button
                        as={Link}
                        to={`/inventory/${inventory.id}`}
                        variant="outline-primary"
                        size="sm"
                      >
                        Открыть
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};
export default ProfilePage;
