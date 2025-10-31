import useSWR from "swr";
import {
  fetchLikePublicInfo,
  fetchLikesCreate,
  fetchLikesDelete,
} from "../../service/api";
import { useContext, useState } from "react"; // Добавляем useState
import { AuthContext } from "../../contexts/AuthContext";

export const useLikes = (inventoryId) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isToggling, setIsToggling] = useState(false);

  const { data, mutate, isLoading } = useSWR(
    inventoryId ? `/likes/inventory/${inventoryId}/likes-publicInfo` : null,
    fetchLikePublicInfo,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
      refreshInterval: 3000,
      revalidateIfStale: true,
    }
  );

  const toggleLike = async (itemId) => {
    if (!inventoryId || !itemId || !isAuthenticated) return;

    const current = data?.data?.likes?.[itemId];
    if (!current) return;

    const newIsLiked = !current.isLiked;
    const newLikeCount = newIsLiked
      ? current.likeCount + 1
      : Math.max(0, current.likeCount - 1);

    // Оптимистичное обновление
    mutate(
      {
        ...data,
        data: {
          ...data.data,
          likes: {
            ...data.data.likes,
            [itemId]: {
              ...current,
              likeCount: newLikeCount,
              isLiked: newIsLiked,
            },
          },
        },
      },
      false
    );

    setIsToggling(true);
    try {
      await (newIsLiked
        ? fetchLikesCreate(`/likes/${itemId}/like-create`)
        : fetchLikesDelete(`/likes/${itemId}/like-delete`));
      mutate();
    } catch (error) {
      mutate();
    } finally {
      setIsToggling(false);
    }
  };

  const getItemLikeData = (itemId) =>
    data?.data?.likes?.[itemId] || { itemId, likeCount: 0, isLiked: false };

  return {
    likesData: data?.data?.likes || {},
    toggleLike,
    isToggling,
    isLoading: isLoading && inventoryId,
    getItemLikeData,
  };
};
