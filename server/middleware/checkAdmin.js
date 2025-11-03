import { prisma } from "../lib/prisma.js";
import { handleError } from "../utils/handleError.js";

export const checkAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Требуется аутентификация" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { id: true, isAdmin: true, isBlocked: true },
    });

    if (!user || user.isBlocked) {
      return res.status(403).json({ error: "Пользователь заблокирован" });
    }

    if (!user.isAdmin) {
      return res.status(403).json({ error: "Требуются права администратора" });
    }

    req.adminUser = user;
    next();
  } catch (error) {
    handleError(error, res);
  }
};
