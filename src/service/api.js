import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL
  ? `${process.env.REACT_APP_API_URL}/api`
  : "http://localhost:3001/api";

export const fetchInventoriesPublic = async () => {
  try {
    const response = await axios.get(`${API_BASE}/inventories/public`, {});
    return response.data;
  } catch (error) {
    console.error(`Ошибка отправки запроса`, error);
    throw error;
  }
};

export const fetchSearchAll = async (url) => {
  try {
    const query = url.split("?q=")[1]; //url.split('?q=') => ["/api/search", "библиотека"], затем обращаемся к первому элементу
    const response = await axios.get(`${API_BASE}/search`, {
      params: { q: query },
    }); // ← axios сам encodeURIComponent - декодирует;

    return response.data;
  } catch (error) {
    console.error(`Ошибка отправки данных для поиска совпадения`, error);
    throw error;
  }
};
