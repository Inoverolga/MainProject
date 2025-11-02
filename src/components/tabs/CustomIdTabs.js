import { useForm, useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useCustomIdFormat } from "../../hooks/customId/useCustomId.js";
import CustomIdPart from "../customId/CustomIdPart.js";
import CustomIdPreview from "../customId/CustomIdPreview.js";
import Spinner from "../spinner/Spinner.js";
import { toast } from "react-toastify";
import { CUSTOM_ID_PART_LABELS } from "../../constants/customIdFormat.js";

const CustomIdTabs = ({ inventoryId }) => {
  const [selectValue, setSelectValue] = useState("");
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { isDirty },
  } = useForm({
    defaultValues: {
      parts: [],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "parts",
  });

  const { formatData, saveFormat, isLoading, isSaving } =
    useCustomIdFormat(inventoryId);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Инициализация данных
  useEffect(() => {
    if (formatData?.customIdFormats) {
      const formattedParts = formatData.customIdFormats.map((partOfFormat) => ({
        ...partOfFormat,
        id: partOfFormat.id || `part-${Date.now()}-${Math.random()}`,
      }));
      setValue("parts", formattedParts);
    }
  }, [formatData, setValue]);

  // Добавление элемента
  const addPartOfFormat = (type) => {
    const basePart = {
      id: `part-${Date.now()}-${Math.random()}`,
      type,
      position: fields.length,
      separator: "_",
    };

    const typeSpecificFields = {
      fixed: { value: "" },
      sequence: { format: "0000", sequenceKey: "default" },
      datetime: { format: "yyyy-MM-dd" },
      random6digit: {},
      random9digit: {},
      random20: {},
      random32: {},
      guid: {},
    };
    const newPart = { ...basePart, ...typeSpecificFields[type] };
    append(newPart);
  };

  // Обработчик выбора типа
  const handleTypeSelect = (event) => {
    const type = event.target.value;
    setSelectValue(type);
    addPartOfFormat(type);
  };

  // Обработчик drag-and-drop
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((item) => item.id === active.id);
      const newIndex = fields.findIndex((item) => item.id === over.id);
      move(oldIndex, newIndex);
    }
  };

  // Обработчик сохранения
  const onSubmit = async (data) => {
    try {
      await saveFormat(data.parts);
      toast.success("Формат ID успешно сохранен");
    } catch (error) {
      toast.error(error.message || "Ошибка сохранения формата ID");
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Настройка формата ID
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Создайте пользовательский формат идентификаторов для товаров в этом
        инвентаре
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)}>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Добавить элемент ID</InputLabel>
          <Select
            value={selectValue}
            label="Добавить элемент ID"
            onChange={handleTypeSelect}
            startAdornment={<Add sx={{ mr: 1, color: "action.active" }} />}
          >
            {Object.entries(CUSTOM_ID_PART_LABELS).map(([type, label]) => (
              <MenuItem key={type} value={type}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {fields.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Элементы формата (перетаскивайте для изменения порядка):
            </Typography>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <CustomIdPart
                    key={field.id}
                    part={field}
                    index={index}
                    control={control}
                    onRemove={() => remove(index)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </Box>
        )}

        <CustomIdPreview
          formats={watch("parts") || []}
          inventoryId={inventoryId}
        />

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={!isDirty || isSaving || fields.length === 0}
          sx={{ mt: 3 }}
          startIcon={isSaving && <CircularProgress size={16} />}
        >
          {isSaving ? "Сохранение..." : "Сохранить формат ID"}
        </Button>
      </Box>
    </Paper>
  );
};

export default CustomIdTabs;
