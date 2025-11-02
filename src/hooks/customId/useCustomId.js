import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext.js";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  fetchFormatId,
  fetchFormatIdUpdate,
  fetchFormatIdGenerate,
} from "../../service/api.js";

export const useCustomIdFormat = (inventoryId) => {
  const { isAuthenticated } = useContext(AuthContext);

  // Загрузка формата
  const { data, isLoading, mutate } = useSWR(
    inventoryId
      ? `/idFormat/inventories/${inventoryId}/custom-id-format`
      : null,
    fetchFormatId
  );

  //Генерация preview и для товаров
  const { trigger: generateId, isMutating: isGenerating } = useSWRMutation(
    inventoryId && isAuthenticated
      ? `/idFormat/inventories/${inventoryId}/generate-id`
      : null,
    async (url, { arg }) => {
      return await fetchFormatIdGenerate(url, arg);
    }
  );

  //обновление формата
  const { trigger: updateFormat, isMutating: isUpdating } = useSWRMutation(
    inventoryId && isAuthenticated
      ? `/idFormat/inventories/${inventoryId}/custom-id-format-update`
      : null,
    async (url, { arg }) => {
      return await fetchFormatIdUpdate(url, arg);
    }
  );

  // Общая функция подготовки данных
  const prepareFormatData = (partsOfFormat) =>
    partsOfFormat.map((part, index) => ({
      type: part.type,
      position: index,
      value: part.value,
      format: part.format,
      sequenceKey: part.sequenceKey,
      separator: part.separator,
    }));

  const saveFormat = async (partsOfFormat) => {
    if (!inventoryId || !isAuthenticated) return;
    await updateFormat({ customIdFormats: prepareFormatData(partsOfFormat) });
    mutate();
  };

  const generateFormatPreview = async (partsOfFormat) => {
    if (!inventoryId || !isAuthenticated) return null;
    const result = await generateId({
      customIdFormats: prepareFormatData(partsOfFormat),
      forItem: false,
    });
    return result?.data?.customId;
  };

  const generateIdForNewItem = async () => {
    if (!inventoryId || !isAuthenticated) return null;

    try {
      const result = await generateId({
        forItem: true,
      });
      return result?.data?.customId;
    } catch (error) {
      console.error("Ошибка генерации ID для товара:", error);
      return null;
    }
  };

  return {
    formatData: data?.data,
    isLoading,
    isSaving: isUpdating,
    isGeneratingPreview: isGenerating,
    isGeneratingItemId: isGenerating,
    saveFormat,
    generateFormatPreview,
    generateIdForNewItem,
    mutate,
  };
};
