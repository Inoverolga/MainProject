export const handleError = (error, res) => {
  if (error.code === "P2002") {
    return res.status(400).json({
      success: false,
      message: "Это действие уже выполнено. Пожалуйста, обновите страницу.",
    });
  }

  if (error.code === "P2023") {
    return res.status(400).json({
      success: false,
      message: "Неверный формат ID товара",
    });
  }
  if (error.code === "P2025") {
    return res.status(409).json({
      success: false,
      message:
        "Данные были изменены другим пользователем. Пожалуйста, обновите страницу.",
    });
  }

  const status = error.message.includes("не найден")
    ? 404
    : error.message.includes("доступ")
    ? 403
    : error.message.includes("прав")
    ? 403
    : 500;
  res.status(status).json({ success: false, message: error.message });
};
