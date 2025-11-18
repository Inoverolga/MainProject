import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import {
  fetchOdooGenerateToken,
  fetchOdooUpdateToken,
  fetchOdooAggregateData,
  fetchOdooImport,
} from "../../service/api.js";

export const useOdooToken = (inventoryId) => {
  const [currentToken, setCurrentToken] = useState(undefined);
  const getStorageKey = (inventoryId) => `odoo_token_${inventoryId}`;

  // ДОБАВЬТЕ ОТЛАДКУ
  console.log("DEBUG useOdooToken:", {
    inventoryId,
    currentToken,
    hasApiToken: !!currentToken?.api_token,
    apiToken: currentToken?.api_token,
    storedToken: localStorage.getItem(getStorageKey(inventoryId)),
  });
  const { trigger: generateToken, isMutating: isGenerating } = useSWRMutation(
    "/odoo/generate-token",
    (url, { arg: name }) =>
      fetchOdooGenerateToken(
        `/odoo/${inventoryId}/generate-token?name=${encodeURIComponent(name)}`
      )
  );
  const { trigger: updateToken, isMutating: isUpdating } = useSWRMutation(
    `/odoo/${inventoryId}/refresh-token`,
    (url, { arg: name }) => fetchOdooUpdateToken(url, name)
  );

  const {
    data: aggregateData,
    isLoading: isLoadingAggregate,
    mutate: mutateAggregate,
  } = useSWR(
    currentToken?.api_token
      ? `/odoo/${currentToken.api_token}/aggregateddata`
      : null,
    fetchOdooAggregateData,
    {
      revalidateOnFocus: false,
    }
  );

  const swrKey = currentToken?.api_token
    ? `/odoo/${currentToken.api_token}/aggregateddata`
    : null;
  console.log("🔍 DEBUG useSWR:", {
    swrKey,
    currentTokenApiToken: currentToken?.api_token,
    fullUrl: swrKey ? `http://localhost:3001/api${swrKey}` : null,
  });
  const { trigger: importToOdoo, isMutating: isImporting } = useSWRMutation(
    `/odoo/import/${inventoryId}/import-to-odoo`,
    (url, { arg: odooApiToken }) => fetchOdooImport(url, odooApiToken)
  );

  const handleGenerateToken = async (name = "Токен для Odoo") => {
    try {
      const result = await generateToken(name);
      setCurrentToken(result);
      toast.success("Токен успешно создан!");
      return result;
    } catch (error) {
      toast.error("Ошибка при создании токена");
      throw error;
    }
  };

  const handleRefreshToken = async (name) => {
    try {
      const result = await updateToken(name || currentToken?.token_name);
      setCurrentToken(result);
      toast.success("Токен успешно обновлен!");
      return result;
    } catch (error) {
      toast.error("Ошибка при обновлении токена");
      throw error;
    }
  };

  const handleImportToOdoo = async () => {
    if (!currentToken?.api_token) {
      toast.error("Сначала сгенерируйте токен");
      return;
    }

    try {
      const result = await importToOdoo(currentToken.api_token);
      toast.success("Данные успешно импортированы в Odoo!");
      return result;
    } catch (error) {
      toast.error("Ошибка при импорте в Odoo");
      throw error;
    }
  };

  useEffect(() => {
    if (!inventoryId) return;

    try {
      const stored = localStorage.getItem(getStorageKey(inventoryId));
      if (stored) {
        const tokenData = JSON.parse(stored);
        setCurrentToken(tokenData);
      } else {
        setCurrentToken(null);
      }
    } catch (error) {
      localStorage.removeItem(getStorageKey(inventoryId));
      setCurrentToken(null);
    }
  }, [inventoryId]);

  useEffect(() => {
    if (!inventoryId || currentToken === undefined) return;

    if (currentToken) {
      localStorage.setItem(
        getStorageKey(inventoryId),
        JSON.stringify(currentToken)
      );
    } else {
      localStorage.removeItem(getStorageKey(inventoryId));
    }
  }, [currentToken, inventoryId]);

  return {
    token: currentToken,
    aggregateData,
    generateToken: handleGenerateToken,
    refreshToken: handleRefreshToken,
    isLoading: isGenerating || isUpdating,
    isLoadingAggregate,
    importToOdoo: handleImportToOdoo,
    isImporting,
  };
};
