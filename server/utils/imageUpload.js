import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const uploadToImgBB = async (fileBuffer, originalName = "image.jpg") => {
  try {
    const formData = new FormData();

    formData.append("image", fileBuffer, { filename: originalName });

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=40459d287516b00156eb257575411727`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error?.message || "ImgBB upload failed");
    }
    return data.data.url;
  } catch (error) {
    throw new Error(`ImgBB upload failed: ${error.message}`);
  }
};
