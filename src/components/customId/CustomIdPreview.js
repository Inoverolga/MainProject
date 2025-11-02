import { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { useCustomIdFormat } from "../../hooks/customId/useCustomId.js";
import { toast } from "react-toastify";

const CustomIdPreview = ({ formats, inventoryId }) => {
  const [previewId, setPreviewId] = useState("");

  const { generateFormatPreview, isGeneratingPreview } =
    useCustomIdFormat(inventoryId);

  const handleGeneratePreview = async () => {
    if (formats.length === 0) return;
    try {
      const result = await generateFormatPreview(formats);
      setPreviewId(result || "");
    } catch (error) {
      toast.error("Не удалось сгенерировать предпросмотр ID");
    }
  };

  if (formats.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Предпросмотр ID
      </Typography>

      <Box display="flex" alignItems="center" gap={2} sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          onClick={handleGeneratePreview}
          disabled={isGeneratingPreview || formats.length === 0}
          startIcon={isGeneratingPreview && <CircularProgress size={16} />}
        >
          {isGeneratingPreview ? "Генерация..." : "Сгенерировать preview"}
        </Button>
      </Box>

      <Box display="flex" alignItems="center" gap={1}>
        <Typography
          variant="body1"
          sx={{
            fontFamily: "monospace",
            backgroundColor: "grey.100",
            p: 1,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "grey.300",
            flex: 1,
          }}
        >
          {previewId || "Нажмите кнопку для генерации preview"}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CustomIdPreview;
