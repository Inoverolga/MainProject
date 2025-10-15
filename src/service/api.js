import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : "http://localhost:3001/api";

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const fetchInventoriesPublic = async (url) => {
  try {
    const response = await axios.get(`${API_BASE}${url}`, {});
    return response.data;
  } catch (error) {
    console.error(`Ошибка отправки запроса`, error);
    throw error;
  }
};

export const fetchSearchAll = async (url) => {
  try {
    const response = await axios.get(`${API_BASE}${url}`);
    return response.data;

    // const query = url.split("?q=")[1]; //url.split('?q=') => ["/api/search", "библиотека"], затем обращаемся к первому элементу
    // const response = await axios.get(`${API_BASE}/search`, {
    // params: { q: query },
    // }); // ← axios сам encodeURIComponent - декодирует;
    //return response.data;
  } catch (error) {
    console.error(`Ошибка отправки данных для поиска совпадения`, error);
    throw error;
  }
};

export const fetchTags = async (url) => {
  try {
    const response = await axios.get(`${API_BASE}${url}`, {});
    return response.data;
  } catch (error) {
    console.error(`Ошибка отправки запроса`, error);
    throw error;
  }
};

export const fetchInventoryItem = async (url) => {
  try {
    const response = await axios.get(`${API_BASE}${url}`, {});
    return response.data;
  } catch (error) {
    console.error(`Ошибка отправки запроса`, error);
    throw error;
  }
};

export const fetchRegisterUser = async (url, { arg: userFormData }) => {
  try {
    const response = await axios.post(`${API_BASE}${url}`, userFormData);
    return response.data;
  } catch (error) {
    console.error("Ошибка регистрации:", error);
    throw error;
  }
};

export const fetchLoginUser = async (url, { arg: userFormData }) => {
  try {
    const response = await axios.post(`${API_BASE}${url}`, userFormData);
    return response.data;
  } catch (error) {
    console.error("Ошибка входа:", error);
    if (error.response?.status === 401) {
      throw new Error("Неверный email или пароль");
    }
  }
};
