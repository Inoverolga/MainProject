import useSWRMutation from "swr/mutation";
import { useCallback } from "react";
import { fetchImgLoading, fetchImgDelete } from "../../service/api.js";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export const useUploadImg = (inventoryId, onImageChange) => {
  const { t } = useTranslation();

  const { trigger: uploadImage, isMutating: isUploading } = useSWRMutation(
    inventoryId ? `/img/inventories/${inventoryId}/image-loading` : null,
    (url, { arg: formData }) => fetchImgLoading(url, formData)
  );

  const { trigger: deleteImage, isMutating: isDeleting } = useSWRMutation(
    inventoryId ? `/img/inventories/${inventoryId}/image-delete` : null,
    (url) => fetchImgDelete(url)
  );

  const handleUpload = useCallback(
    async (file) => {
      if (!file || !inventoryId) return;

      const formData = new FormData();
      formData.append("image", file);

      try {
        const result = await uploadImage(formData);

        if (result.success) {
          onImageChange(result.imageUrl);
          toast.success(t("imageUploadSuccess"));
        }
      } catch (error) {
        toast.error(t("imageUploadError"));
      }
    },
    [inventoryId, uploadImage, onImageChange, t]
  );

  const handleRemove = useCallback(async () => {
    if (!inventoryId) return;

    try {
      const result = await deleteImage();

      if (result.success) {
        onImageChange("");
        toast.success(t("imageRemoveSuccess"));
      }
    } catch (error) {
      toast.error(t("imageRemoveError"));
    }
  }, [inventoryId, deleteImage, onImageChange, t]);

  return {
    handleUpload,
    handleRemove,
    isUploading,
    isDeleting,
    isMutating: isUploading || isDeleting,
  };
};
