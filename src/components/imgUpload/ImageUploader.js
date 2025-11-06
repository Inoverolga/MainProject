import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useTranslation } from "react-i18next";
import { useUploadImg } from "../../hooks/imgUpload/useUploadImg.js";

export const ImageUploader = ({
  inventoryId,
  currentImage,
  onImageChange,
  mode = "edit",
}) => {
  const { t } = useTranslation();

  const { handleUpload, handleRemove, isMutating } = useUploadImg(
    inventoryId,
    onImageChange
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];
      handleUpload(file);
    },
    [handleUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
  });

  if (mode === "create") {
    return (
      <div className="mb-3">
        <label className="form-label">{t("inventoryImage")}</label>
        <input
          type="url"
          className="form-control"
          placeholder="https://example.com/image.jpg"
          value={currentImage || ""}
          onChange={(e) => onImageChange(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="mb-3">
      <label className="form-label">{t("inventoryImage")}</label>

      <div
        {...getRootProps()}
        className={`border rounded p-4 text-center ${
          isDragActive ? "border-primary bg-light" : "border-dashed"
        } ${isMutating ? "opacity-50" : ""}`}
        style={{ cursor: isMutating ? "not-allowed" : "pointer" }}
      >
        <input {...getInputProps()} disabled={isMutating} />
        {isMutating ? (
          <div>
            <div className="spinner-border spinner-border-sm me-2" />
            {t("uploading")}
          </div>
        ) : isDragActive ? (
          <p>{t("dropImageHere")}</p>
        ) : (
          <div>
            <p>{t("dragDropImage")}</p>
            <small className="text-muted">{t("imageFormats")} (max 5MB)</small>
          </div>
        )}
      </div>

      {currentImage && (
        <div className="mt-3">
          <img
            src={currentImage}
            alt={t("inventoryImage")}
            className="img-thumbnail"
            style={{ maxHeight: "200px" }}
          />
          <div className="mt-2">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleRemove}
              disabled={isMutating}
            >
              {t("removeImage")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
