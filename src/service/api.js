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

// Общая функция для GET запросов
const getData = async (url) => {
  try {
    const response = await axios.get(`${API_BASE}${url}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при запросе ${url}:`, error);
    throw error;
  }
};

// Общая функция для POST запросов
const postData = async (url, data) => {
  try {
    const response = await axios.post(`${API_BASE}${url}`, data);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при отправке данных на ${url}:`, error);
    throw error;
  }
};

// Главная страница - публичные инвентари, поиск, теги
export const fetchInventoriesPublic = (url) => getData(url);
export const fetchSearchAll = (url) => getData(url);
export const fetchTags = (url) => getData(url);

// Просмотр инвентаря
export const fetchInventoryItem = (url) => getData(url);

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
// Личный кабинет - инвентари пользователя
export const fetchMyInventories = (url) => getData(url);
export const fetchAccessibleInventories = (url) => getData(url);
export const fetchCreateInventories = (url, formData) =>
  postData(url, formData);
export const fetchDeleteInventories = async (url) => {
  const response = await axios.delete(`${API_BASE}${url}`);
  return response.data;
};
export const fetchEditInventories = (url) => getData(url);
export const fetchUpdateInventories = async (url, { arg: formData }) => {
  const response = await axios.put(`${API_BASE}${url}`, formData);
  return response.data;
};
export const fetchExportInventories = async (url) => {
  const response = await axios.get(`${API_BASE}${url}`, {
    responseType: "blob",
  });
  return response;
};

//export const fetchCreateInventoryItems = (url) => getData(url);
