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
import {
  AdminProduct,
  createProduct,
  updateProduct,
} from "@/api";
import { colors } from "@/constants/colors";
import { AVAILABLE_COLORS, AVAILABLE_SIZES, AVAILABLE_GENDERS } from "@/constants/filterConstants";

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
    backgroundColor: "rgba(0,0,0,0.7)",
    color: "#fff",
    padding: "2px",
    "&:hover": {
      backgroundColor: "rgba(0,0,0,0.9)",
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

import { API_BASE } from "../../utils/image";

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

  const onRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
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

    const existingUrls = images
      .filter((img) => img.isExisting)
      .map((img) => {
        const url = img.url;
        return url.startsWith(API_BASE) ? url.replace(API_BASE, "") : url;
      });
    formData.append("existingImageUrls", JSON.stringify(existingUrls));

    images
      .filter((img) => !img.isExisting && img.file)
      .forEach((img) => formData.append("images", img.file!));

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
      ? currentValues.filter((v) => v !== value)
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

            <Box className={classes.imageSection}>
              <Typography variant="subtitle2">
                {t("admin.products.images")}
              </Typography>
              <Box className={classes.imageGrid}>
                {images.map((img, index) => (
                  <Box key={index} className={classes.imageWrapper}>
                    <img
                      src={img.url}
                      alt={`Preview ${index + 1}`}
                      className={classes.imagePreview}
                    />
                    <IconButton
                      className={classes.removeImageButton}
                      size="small"
                      onClick={() => onRemoveImage(index)}
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
