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

const getData = (url) => axios.get(`${API_BASE}${url}`).then((res) => res.data);
const postData = (url, data) =>
  axios.post(`${API_BASE}${url}`, data).then((res) => res.data);
const putData = (url, data) =>
  axios.put(`${API_BASE}${url}`, data).then((res) => res.data);
const deleteData = (url) =>
  axios.delete(`${API_BASE}${url}`).then((res) => res.data);
const patchData = (url, data) =>
  axios.patch(`${API_BASE}${url}`, data).then((res) => res.data);

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
//export const fetchInventoriesPublicPopular = (url) => getData(url); //api/inventories/public
export const fetchInventoryWithItems = (url) => getData(url); //api/inventories/:id (публичный доступ)

export const fetchTags = (url) => getData(url); //api/tags - без query-парметра
//api/tags/autocompletion?q=${encodeURIComponent(tagSearchInput)}` - с query-парметров (для автодополнения)

// Личный кабинет - инвентари пользователя
export const fetchCategories = (url) => getData(url);
export const fetchMyInventories = (url) => getData(url); //api/users/me/inventories
export const fetchAccessibleInventories = (url) => getData(url); //api/users/me/accessible-inventories
export const fetchInventoryWithAccessCheck = (url) => getData(url); //api/users/inventories/:id/items-with-access
export const fetchCreateInventories = (url, formData) =>
  postData(url, formData); //api/users/inventories-create
export const fetchDeleteInventories = (url, version = null) => {
  return deleteData(version ? `${url}?version=${version}` : url);
}; //api/users/inventories-delete/:id
export const fetchEditInventories = (url) => getData(url); //api/users/inventories-edit/${id}
export const fetchUpdateInventories = (url, formData) => putData(url, formData); //api/users/inventories-update/${inventoryId}
export const fetchExportInventories = (url) =>
  axios.get(`${API_BASE}${url}`, { responseType: "blob" }); //api/users/inventories-export/${selectedRows[0]}

//товары пользователя
export const fetchItemsWithFieldsPublic = (url) => getData(url); //(не использую)//api/users/inventories/:inventoryId/items
export const fetchItem = (url) => getData(url); //api/users/items-edit/:id
export const fetchCreateItem = (url, formData) => postData(url, formData); //api/users/inventories/:inventoryId/items-create
export const fetchDeleteItem = (url, version = null) => {
  return deleteData(version ? `${url}?version=${version}` : url);
}; //api/users/items-delete/:id
export const fetchUpdateItem = (url, formData) => putData(url, formData); //api/users/items-update/:id

//кастомные поля товаров
export const fetchFieldsPublic = (url) => getData(url); //api/users/inventories/:inventoryId/fields-public
export const fetchMyFieldCreate = (url, formData) => postData(url, formData); //api/users/inventories/:inventoryId/fields-create-access
export const fetchMyFieldDelete = (url) => deleteData(url); //api/users/fields-delete-access/:fieldId
export const fetchMyFieldUpdate = (url, fieldData) => putData(url, fieldData); //api/users/fields-update-access/:fieldId

//предоставление доступа
export const fetchUserListAccess = (url) => getData(url); //api/access/user/inventories/:inventoryId/user-list-access
export const fetchTogglePublicAccess = (url, isPublic) =>
  patchData(url, { isPublic }); //api/access/user/:inventoryId/public-access
export const fetchUserAditAccess = (url, formData) => postData(url, formData); //api/access/user/:inventoryId/edit-access
export const fetchUserDeleteAccess = (url) => deleteData(url); //api/access/user/:inventoryId/:userId/delete-access
//Получение инвентаря (вкл.товары) с проверкой доступа в секции с инвентарем

//Обсуждения
export const fetchPostsGetMessage = (url) => getData(url); //api/posts?invotoryId="..."
export const fetchPostsCreateMessage = (url, formData) =>
  postData(url, formData); //api/posts/create-post

//Лайки
export const fetchLikesCreate = (url) => postData(url); //api/likes/:itemId/like-create
export const fetchLikesDelete = (url) => deleteData(url); //api/likes/:itemId/like-delete
export const fetchLikePublicInfo = (url) => getData(url); //api/likes/inventory/:inventoryId/likes-publicInfo

//Формат id
export const fetchFormatId = (url) => getData(url); //api/idFormat/inventories/:inventoryId/custom-id-format
export const fetchFormatIdUpdate = (url, formatData) =>
  putData(url, formatData); //api/idFormat/inventories/:inventoryId/custom-id-format-update
export const fetchFormatIdGenerate = (url, formData) => postData(url, formData); //api/idFormat/inventories/:inventoryId/generate-id

//Администратор
export const fetchAllUser = (url) => getData(url); //api/admin/users
export const fetchOneUser = (url) => getData(url); //api/admin/users/:userId
export const fetchBlockAndUnblock = (url, isBlocked) =>
  patchData(url, { isBlocked }); //api/admin/users/:userId/block
export const fetchAddRoleAdmin = (url, isAdmin) => patchData(url, { isAdmin }); //api/admin/users/:userId/role
export const fetchDeleteRoleAdmin = (url) => deleteData(url); //api/admin/users/:userId
export const fetchStats = (url) => getData(url); //api/admin/stats
//Статистика
export const fetchStatsInventory = (url) => getData(url); //api/stats/inventories/:id
//поиск
export const fetchSearchAll = (url) => getData(url); //api/search?q=${searchTerm}
export const fetchItemsSearch = (url) => getData(url); //api/search/items?q=${searchTerm}
export const fetchUserSearch = (url) => getData(url); //api/search/users?q=${searchTerm}; (для форм)
export const fetchAdminSearch = (url) => getData(url); //api/search/users?q=${searchTerm};
//изображения
export const fetchImgLoading = (url, formData) => postData(url, formData); //api/img/inventories/:inventoryId/image-loading
export const fetchImgDelete = (url) => deleteData(url); //api/img/inventories/:inventoryId/image-delete
//интеграция Salesforce
export const fetchSalesforceCreateContact = (url, formData) =>
  postData(url, formData); //api/salesforce/create-contact
//интеграция Odoo
export const fetchOdooGenerateToken = (url) => getData(url); //api/odoo/:inventoryId/generate-token?name="..."
export const fetchOdooAggregateData = (url) => getData(url); //api/odoo/:token/aggregateddata
export const fetchOdooUpdateToken = (url, name) => patchData(url, { name }); //api/odoo/:inventoryId/refresh-token
export const fetchOdooImport = (url, odooApiToken) =>
  postData(url, { odooApiToken });
