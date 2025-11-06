import express from "express";
import { prisma } from "../lib/prisma.js";
import { checkToken } from "../middleware/checkToken.js";
import { upload, uploadToImgBB } from "../utils/imageUpload.js";
import { handleError } from "../utils/handleError.js";
import { canManagersInventory } from "../utils/accessUtils.js";

const routerImg = express.Router();

routerImg.post(
  "/inventories/:inventoryId/image-loading",
  checkToken,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Файл не загружен",
        });
      }

      const canManage = await canManagersInventory(
        req.params.inventoryId,
        req.user.userId,
        req.user.isAdmin
      );

      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: "Нет прав для редактирования этого инвентаря",
        });
      }
      console.log("☁️ Uploading to ImgBB...");
      const imageUrl = await uploadToImgBB(
        req.file.buffer,
        req.file.originalname
      );

      await prisma.inventory.update({
        where: {
          id: req.params.inventoryId,
        },
        data: { imageUrl },
      });

      res.json({
        success: true,
        imageUrl,
        message: "Изображение успешно загружено",
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

routerImg.delete(
  "/inventories/:inventoryId/image-delete",
  checkToken,
  async (req, res) => {
    try {
      const canManage = await canManagersInventory(
        req.params.inventoryId,
        req.user.userId,
        req.user.isAdmin
      );

      if (!canManage) {
        return res.status(403).json({
          success: false,
          message: "Нет прав для редактирования этого инвентаря",
        });
      }

      await prisma.inventory.update({
        where: {
          id: req.params.inventoryId,
        },
        data: { imageUrl: null },
      });

      res.json({
        success: true,
        message: "Изображение удалено",
      });
    } catch (error) {
      handleError(error, res);
    }
  }
);

export default routerImg;
