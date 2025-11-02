import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useController } from "react-hook-form";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Paper,
} from "@mui/material";
import { DragHandle, Delete } from "@mui/icons-material";
import { CUSTOM_ID_PART_LABELS } from "../../constants/customIdFormat.js";

const CustomIdPart = ({ part, index, control, onRemove }) => {
  // Контроллеры для всех полей
  const separatorField = useController({
    control,
    name: `parts.${index}.separator`,
  });

  const formatField = useController({
    control,
    name: `parts.${index}.format`,
  });

  const valueField = useController({
    control,
    name: `parts.${index}.value`,
  });

  const sequenceKeyField = useController({
    control,
    name: `parts.${index}.sequenceKey`,
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: part.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Paper
      ref={setNodeRef}
      style={style}
      sx={{
        p: 2,
        mb: 1,
        display: "flex",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box {...attributes} {...listeners} sx={{ cursor: "grab" }}>
        <DragHandle />
      </Box>

      <FormControl sx={{ minWidth: 200 }}>
        <InputLabel>Тип элемента</InputLabel>
        <Select value={part.type} label="Тип элемента" disabled>
          <MenuItem value={part.type}>
            {CUSTOM_ID_PART_LABELS[part.type] || part.type}
          </MenuItem>
        </Select>
      </FormControl>

      {part.type === "fixed" && (
        <TextField
          label="Текст"
          value={valueField.field.value || ""}
          onChange={valueField.field.onChange}
          size="small"
          sx={{ width: 150 }}
          placeholder="Например: INV"
        />
      )}

      {part.type === "sequence" && (
        <>
          <TextField
            label="Формат чисел"
            value={formatField.field.value || ""}
            onChange={formatField.field.onChange}
            size="small"
            sx={{ width: 120 }}
            placeholder="0000"
            helperText="0000 = 4 цифры"
          />
          <TextField
            label="Ключ последовательности"
            value={sequenceKeyField.field.value || "default"}
            onChange={sequenceKeyField.field.onChange}
            size="small"
            sx={{ width: 150 }}
          />
        </>
      )}

      {part.type === "datetime" && (
        <TextField
          label="Формат даты"
          value={formatField.field.value || ""}
          onChange={formatField.field.onChange}
          size="small"
          sx={{ width: 150 }}
          placeholder="yyyy-MM-dd"
          helperText="формат date-fns"
        />
      )}

      <TextField
        label="Разделитель"
        value={separatorField.field.value || ""}
        onChange={separatorField.field.onChange}
        size="small"
        sx={{ width: 100 }}
        placeholder="_"
      />

      <IconButton onClick={onRemove} color="error">
        <Delete />
      </IconButton>
    </Paper>
  );
};

export default CustomIdPart;
