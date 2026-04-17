"use client";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  IconButton,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";
import {
  AdminProduct,
  StockVariant,
  createProduct,
  updateProduct,
} from "@/api";
import { colors } from "@/constants/colors";
import { AVAILABLE_COLORS, AVAILABLE_SIZES, AVAILABLE_GENDERS } from "@/constants/filterConstants";
import VariantStockEditor from "./variantStockEditor";
import { API_BASE } from "@/constants/constants";

interface ProductFormProps {
  product: AdminProduct | null;
  onClose: () => void;
}

interface ImageEntry {
  url: string;
  file: File | null;
  isExisting: boolean;
}

interface ProductFormValues {
  name: string;
  description: string;
  price: string;
  category: string;
  colors: string[];
  sizes: string[];
  genders: string[];
}

const PREFIX = "ProductForm";
const classes = {
  root: `${PREFIX}-root`,
  form: `${PREFIX}-form`,
  title: `${PREFIX}-title`,
  alert: `${PREFIX}-alert`,
  field: `${PREFIX}-field`,
  sectionLabel: `${PREFIX}-sectionLabel`,
  checkboxGroup: `${PREFIX}-checkboxGroup`,
  checkboxLabel: `${PREFIX}-checkboxLabel`,
  checkbox: `${PREFIX}-checkbox`,
  imageSection: `${PREFIX}-imageSection`,
  imagePreview: `${PREFIX}-imagePreview`,
  imageGrid: `${PREFIX}-imageGrid`,
  imageWrapper: `${PREFIX}-imageWrapper`,
  removeImageButton: `${PREFIX}-removeImageButton`,
  hiddenInput: `${PREFIX}-hiddenInput`,
  uploadButton: `${PREFIX}-uploadButton`,
  actions: `${PREFIX}-actions`,
  saveButton: `${PREFIX}-saveButton`,
  cancelButton: `${PREFIX}-cancelButton`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    backgroundColor: colors.admin_surface,
    borderRadius: "12px",
    padding: "32px",
    maxWidth: "700px",
  },
  [`& .${classes.form}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  [`& .${classes.title}`]: {
    marginBottom: "16px",
  },
  [`& .${classes.alert}`]: {
    marginBottom: "16px",
  },
  [`& .${classes.field}`]: {
    "& .MuiOutlinedInput-root": {
      backgroundColor: colors.admin_input,
    },
  },
  [`& .${classes.sectionLabel}`]: {
    marginBottom: "8px",
  },
  [`& .${classes.checkboxGroup}`]: {
    display: "flex",
    flexWrap: "wrap",
    gap: "4px",
  },
  [`& .${classes.checkboxLabel}`]: {
    fontSize: "14px",
  },
  [`& .${classes.checkbox}`]: {
    color: colors.admin_checkbox_inactive,
    "&.Mui-checked": {
      color: colors.kerian_main,
    },
  },
  [`& .${classes.imageSection}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  [`& .${classes.imagePreview}`]: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    border: `1px solid ${colors.admin_border_light}`,
  },
  [`& .${classes.imageGrid}`]: {
    display: "flex",
    flexWrap: "wrap",
    gap: "12px",
  },
  [`& .${classes.imageWrapper}`]: {
    position: "relative",
  },
  [`& .${classes.removeImageButton}`]: {
    position: "absolute",
    top: "-8px",
    right: "-8px",
    backgroundColor: colors.admin_overlay,
    color: colors.white,
    padding: "2px",
    "&:hover": {
      backgroundColor: colors.admin_overlay_hover,
    },
  },
  [`& .${classes.hiddenInput}`]: {
    display: "none",
  },
  [`& .${classes.uploadButton}`]: {
    width: "fit-content",
    borderColor: colors.kerian_main,
    color: colors.kerian_main,
  },
  [`& .${classes.actions}`]: {
    display: "flex",
    gap: "12px",
    marginTop: "8px",
  },
  [`& .${classes.saveButton}`]: {
    backgroundColor: colors.kerian_main,
  },
  [`& .${classes.cancelButton}`]: {
    borderColor: colors.admin_checkbox_inactive,
    color: colors.admin_text_light,
  },
}));

export default function ProductForm({ product, onClose }: ProductFormProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ImageEntry[]>(() => {
    if (!product?.imageUrls) return [];
    return product.imageUrls.map((url) => ({
      url: url.startsWith("/uploads") ? `${API_BASE}${url}` : url,
      file: null,
      isExisting: true,
    }));
  });
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [stockMap, setStockMap] = useState<Record<string, number>>(() => {
    if (!product?.variants) return {};
    const map: Record<string, number> = {};
    for (const variant of product.variants) {
      map[`${variant.gender}_${variant.size}_${variant.color}`] = variant.stock;
    }
    return map;
  });

  const isEditing = product !== null;

  const validationSchema = Yup.object({
    name: Yup.string().required(t("common.validation.required")),
    price: Yup.number()
      .typeError(t("common.validation.required"))
      .positive()
      .required(t("common.validation.required")),
  });

  const initialValues: ProductFormValues = {
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price?.toString() || "",
    category: product?.category || "",
    colors: product?.color || [],
    sizes: product?.size || [],
    genders: product?.gender || [],
  };

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setFeedback({
        type: "success",
        message: t("admin.products.createSuccess"),
      });
      setTimeout(onClose, 1000);
    },
    onError: () => {
      setFeedback({
        type: "error",
        message: t("admin.products.createError"),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) =>
      updateProduct(product!.id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setFeedback({
        type: "success",
        message: t("admin.products.updateSuccess"),
      });
      setTimeout(onClose, 1000);
    },
    onError: () => {
      setFeedback({
        type: "error",
        message: t("admin.products.updateError"),
      });
    },
  });

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newEntries: ImageEntry[] = Array.from(files).map((file) => ({
      url: URL.createObjectURL(file),
      file,
      isExisting: false,
    }));
    setImages((prev) => [...prev, ...newEntries]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onRemoveImage = (targetIndex: number) => {
    setImages((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== targetIndex)
    );
  };

  const onSubmit = (values: ProductFormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("description", values.description);
    formData.append("price", values.price);
    formData.append("category", values.category);
    formData.append("color", JSON.stringify(values.colors));
    formData.append("size", JSON.stringify(values.sizes));
    formData.append("gender", JSON.stringify(values.genders));

    const stockUpdates: StockVariant[] = [];
    for (const gender of values.genders) {
      for (const size of values.sizes) {
        for (const color of values.colors) {
          stockUpdates.push({
            gender,
            size,
            color,
            stock: stockMap[`${gender}_${size}_${color}`] ?? 0,
          });
        }
      }
    }
    formData.append("stockUpdates", JSON.stringify(stockUpdates));

    const existingUrls = images
      .filter((image) => image.isExisting)
      .map((image) => {
        const url = image.url;
        return url.startsWith(API_BASE) ? url.replace(API_BASE, "") : url;
      });
    formData.append("existingImageUrls", JSON.stringify(existingUrls));

    images
      .filter((image) => !image.isExisting && image.file)
      .forEach((image) => formData.append("images", image.file!));

    if (isEditing) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const onCheckboxToggle = (
    currentValues: string[],
    value: string,
    setFieldValue: (field: string, value: string[]) => void,
    fieldName: string
  ) => {
    const updated = currentValues.includes(value)
      ? currentValues.filter((item) => item !== value)
      : [...currentValues, value];
    setFieldValue(fieldName, updated);
  };

  return (
    <Root className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        {isEditing ? t("admin.products.edit") : t("admin.products.addNew")}
      </Typography>

      {feedback && (
        <Alert severity={feedback.type} className={classes.alert}>
          {feedback.message}
        </Alert>
      )}

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, setFieldValue, handleChange, handleBlur }) => (
          <Form className={classes.form}>
            <TextField
              name="name"
              label={t("admin.products.name")}
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.name && Boolean(errors.name)}
              helperText={touched.name && errors.name}
              className={classes.field}
              fullWidth
            />

            <TextField
              name="description"
              label={t("admin.products.description")}
              value={values.description}
              onChange={handleChange}
              onBlur={handleBlur}
              multiline
              rows={3}
              className={classes.field}
              fullWidth
            />

            <TextField
              name="price"
              label={t("admin.products.price")}
              value={values.price}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.price && Boolean(errors.price)}
              helperText={touched.price && errors.price}
              type="number"
              className={classes.field}
              fullWidth
            />

            <TextField
              name="category"
              label={t("admin.products.category")}
              value={values.category}
              onChange={handleChange}
              onBlur={handleBlur}
              className={classes.field}
              fullWidth
            />

            <Box>
              <Typography variant="subtitle2" className={classes.sectionLabel}>
                {t("admin.products.colors")}
              </Typography>
              <FormGroup className={classes.checkboxGroup}>
                {AVAILABLE_COLORS.map((color) => (
                  <FormControlLabel
                    key={color}
                    control={
                      <Checkbox
                        checked={values.colors.includes(color)}
                        onChange={() =>
                          onCheckboxToggle(
                            values.colors,
                            color,
                            setFieldValue,
                            "colors"
                          )
                        }
                        className={classes.checkbox}
                      />
                    }
                    label={color}
                    className={classes.checkboxLabel}
                  />
                ))}
              </FormGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" className={classes.sectionLabel}>
                {t("admin.products.sizes")}
              </Typography>
              <FormGroup className={classes.checkboxGroup}>
                {AVAILABLE_SIZES.map((size) => (
                  <FormControlLabel
                    key={size}
                    control={
                      <Checkbox
                        checked={values.sizes.includes(size)}
                        onChange={() =>
                          onCheckboxToggle(
                            values.sizes,
                            size,
                            setFieldValue,
                            "sizes"
                          )
                        }
                        className={classes.checkbox}
                      />
                    }
                    label={size}
                    className={classes.checkboxLabel}
                  />
                ))}
              </FormGroup>
            </Box>

            <Box>
              <Typography variant="subtitle2" className={classes.sectionLabel}>
                {t("admin.products.genders")}
              </Typography>
              <FormGroup className={classes.checkboxGroup}>
                {AVAILABLE_GENDERS.map((gender) => (
                  <FormControlLabel
                    key={gender}
                    control={
                      <Checkbox
                        checked={values.genders.includes(gender)}
                        onChange={() =>
                          onCheckboxToggle(
                            values.genders,
                            gender,
                            setFieldValue,
                            "genders"
                          )
                        }
                        className={classes.checkbox}
                      />
                    }
                    label={gender}
                    className={classes.checkboxLabel}
                  />
                ))}
              </FormGroup>
            </Box>

            {values.genders.length > 0 &&
              values.sizes.length > 0 &&
              values.colors.length > 0 && (
                <VariantStockEditor
                  genders={values.genders}
                  sizes={values.sizes}
                  selectedColors={values.colors}
                  stockMap={stockMap}
                  onStockChange={(key, value) =>
                    setStockMap((prev) => ({ ...prev, [key]: value }))
                  }
                  onSetAll={(stockValue) => {
                    const newMap: Record<string, number> = { ...stockMap };
                    for (const gender of values.genders) {
                      for (const size of values.sizes) {
                        for (const color of values.colors) {
                          newMap[`${gender}_${size}_${color}`] = stockValue;
                        }
                      }
                    }
                    setStockMap(newMap);
                  }}
                />
              )}

            <Box className={classes.imageSection}>
              <Typography variant="subtitle2">
                {t("admin.products.images")}
              </Typography>
              <Box className={classes.imageGrid}>
                {images.map((image, imageIndex) => (
                  <Box key={imageIndex} className={classes.imageWrapper}>
                    <Image
                      src={image.url}
                      alt={`Preview ${imageIndex + 1}`}
                      width={120}
                      height={120}
                      className={classes.imagePreview}
                      unoptimized
                    />
                    <IconButton
                      className={classes.removeImageButton}
                      size="small"
                      onClick={() => onRemoveImage(imageIndex)}
                      aria-label={t("admin.products.removeImage")}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                multiple
                onChange={onFileChange}
                className={classes.hiddenInput}
              />
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                className={classes.uploadButton}
              >
                {t("admin.products.uploadImages")}
              </Button>
            </Box>

            <Box className={classes.actions}>
              <Button
                type="submit"
                variant="contained"
                disabled={createMutation.isPending || updateMutation.isPending}
                className={classes.saveButton}
              >
                {t("admin.products.save")}
              </Button>
              <Button
                variant="outlined"
                onClick={onClose}
                className={classes.cancelButton}
              >
                {t("admin.products.cancel")}
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Root>
  );
}
