import useSWR from "swr";
import {
  fetchLikePublicInfo,
  fetchLikesCreate,
  fetchLikesDelete,
} from "../../service/api";

export const useLikes = (itemId) => {
  const { data, mutate } = useSWR(
    itemId ? `/likes/${itemId}/likes-publicInfo` : null,
    fetchLikePublicInfo,
    { revalidateOnFocus: false }
  );

  const toggleLike = async () => {
    if (!itemId) return;

    const current = data?.data;
    const newIsLiked = !current?.isLiked;
    const newLikeCount = newIsLiked
      ? (current?.likeCount || 0) + 1
      : Math.max(0, (current?.likeCount || 0) - 1);

    // Оптимистичное обновление
    mutate(
      {
        ...data,
        data: { ...current, likeCount: newLikeCount, isLiked: newIsLiked },
      },
      false
    );

    try {
      await (newIsLiked
        ? fetchLikesCreate(`/likes/${itemId}/like-create`)
        : fetchLikesDelete(`/likes/${itemId}/like-delete`));
    } catch (error) {
      mutate();
    }
  };

  return {
    likeCount: data?.data?.likeCount || 0,
    isLiked: data?.data?.isLiked || false,
    toggleLike,
  };
};
