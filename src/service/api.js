import axios from "axios";

export const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : "http://localhost:3001/api";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// База
const getData = (url) => axios.get(`${API_BASE}${url}`).then((res) => res.data);
const postData = (url, data) =>
  axios.post(`${API_BASE}${url}`, data).then((res) => res.data);
const putData = (url, data) =>
  axios.put(`${API_BASE}${url}`, data).then((res) => res.data);
const deleteData = (url) =>
  axios.delete(`${API_BASE}${url}`).then((res) => res.data);

// Просмотр инвентаря

// Аутентификация (по ссылке)
export const fetchMagicLink = async (url, { arg: userFormData }) => {
  return postData(url, userFormData);
};

export const fetchLoginUser = async (url, { arg: userFormData }) => {
  try {
    return await postData(url, userFormData);
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Неверный email или пароль");
    }
    throw error;
  }
};

// Главная страница - публичные инвентари, поиск, теги
export const fetchInventoriesPublic = (url) => getData(url); //api/inventories/public
export const fetchInventoryWithItems = (url) => getData(url); //api/inventories/:id (публичный доступ)
export const fetchSearchAll = (url) => getData(url); //api/search?q=${searchTerm}
export const fetchTags = (url) => getData(url); //api/tags - без query-парметра
//api/tags/auto/autocompletion?q=${encodeURIComponent(tagSearchInput)}` - с query-парметров (для автодополнения)

// Личный кабинет - инвентари пользователя
export const fetchMyInventories = (url) => getData(url); //api/users/me/inventories
export const fetchAccessibleInventories = (url) => getData(url); //api/users/me/accessible-inventories
export const fetchCreateInventories = (url, { arg }) => postData(url, arg); //api/users/inventories-create
export const fetchDeleteInventories = deleteData; //api/users/inventories-delete
export const fetchEditInventories = (url) => getData(url); //api/users/inventories-edit/${id}
export const fetchUpdateInventories = (url, { arg }) => putData(url, arg); //api/users/inventories-update/${inventoryId}
export const fetchExportInventories = (
  url //api/users/inventories-export/${selectedRows[0]}
) => axios.get(`${API_BASE}${url}`, { responseType: "blob" });

//товары пользователя
export const fetchItemsPublic = (url) => getData(url); //api/users/inventories/:inventoryId/items
export const fetchItem = (url) => getData(url); //api/users/items-adit/:id
export const fetchCreateItem = (url, formData) => postData(url, formData); //api/users/inventories/:inventoryId/items-create
export const fetchDeleteItem = (url) => deleteData(url); //api/users/items-delete/:id
export const fetchUpdateItem = (url, { arg }) => putData(url, arg); //api/users/items-update/:id
