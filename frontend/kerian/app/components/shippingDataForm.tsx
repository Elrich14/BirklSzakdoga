"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { styled } from "@mui/system";
import { sendOrder } from "@/api";
import { OrderStatus, phoneRegExp } from "@/constants/constants";
import OrderStatusTracker from "./orderStatusTracker";
import { boxShadows } from "@/constants/colors";
import { useCartStore } from "./store/cartStore";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "../providers/snackbarProvider";

const PREFIX = "ShippingDataForm";
const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  errorText: `${PREFIX}-errorText`,
  textField: `${PREFIX}-textField`,
  defferentAddressCheckbox: `${PREFIX}-defferentAddressCheckbox`,
  sendFromButton: `${PREFIX}-sendFromButton`,
};

interface StockError {
  productName: string;
  size: string;
  color: string;
  available: number;
}

const parseStockError = (message: string): StockError | null => {
  try {
    const parsed = JSON.parse(message);
    if (parsed.type === "insufficientStock") return parsed as StockError;
  } catch {
    // Message is not JSON — not a stock error
  }
  return null;
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    borderRadius: "4px",
    marginTop: "50px",
    boxShadow: boxShadows.kerian_main_button_hover_shadow,
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
  },
  [`& .${classes.title}`]: {
    marginBottom: "16px",
  },
  [`& .${classes.errorText}`]: {
    marginBottom: "16px",
  },
  [`& .${classes.textField}`]: {
    marginBottom: "16px",
  },
  [`& .${classes.sendFromButton}`]: {
    marginTop: "16px",
  },
}));

export default function ShippingDataForm() {
  const { t, i18n } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [completedOrder, setCompletedOrder] = useState<{
    orderId: number;
    status: OrderStatus;
  } | null>(null);
  const [error, setError] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    shippingAddress: "",
    billingAddress: "",
    note: "",
    billingDifferent: false,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required(t("common.validation.required")),
    email: Yup.string()
      .email(t("common.validation.invalidEmail"))
      .required(t("common.validation.required")),
    phone: Yup.string()
      .matches(phoneRegExp, t("common.validation.invalidPhone"))
      .required(t("common.validation.required")),
    shippingAddress: Yup.string().required(t("common.validation.required")),
    billingAddress: Yup.string().when("billingDifferent", {
      is: true,
      then: (schema) => schema.required(t("common.validation.required")),
      otherwise: (schema) => schema.notRequired(),
    }),
    note: Yup.string(),
    billingDifferent: Yup.boolean(),
  });

  const onSubmit = async (values: typeof initialValues) => {
    try {
      setError(false);
      const orderResponse = await sendOrder({
        ...values,
        cartItems,
        language: i18n.language,
      });
      clearCart();
      setCompletedOrder(orderResponse);
      showSnackbar(t("snackbar.orderSuccess"), "success");
    } catch (orderError) {
      console.error("Error when sending email", orderError);
      setError(true);
      setCompletedOrder(null);

      const message = orderError instanceof Error ? orderError.message : "";
      const stockError = parseStockError(message);
      if (stockError) {
        showSnackbar(
          t("snackbar.insufficientStock", {
            productName: stockError.productName,
            size: stockError.size,
            color: stockError.color,
            available: stockError.available,
          }),
          "error"
        );
        return;
      }
      showSnackbar(t("snackbar.orderError"), "error");
    }
  };

  return (
    <Root className={classes.root}>
      <Typography className={classes.title} variant="h5">
        {t("orderingForm.title")}
      </Typography>

      {error && (
        <Typography className={classes.errorText} color="error">
          {t("feedback.orderError")}
        </Typography>
      )}
      {completedOrder ? (
        <OrderStatusTracker
          orderId={completedOrder.orderId}
          initialStatus={completedOrder.status}
        />
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ handleChange, handleBlur, values, touched, errors }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label={t("orderingForm.fullName")}
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                className={classes.textField}
              />

              <TextField
                fullWidth
                margin="normal"
                name="email"
                label={t("common.email")}
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                className={classes.textField}
              />

              <TextField
                fullWidth
                margin="normal"
                name="phone"
                label={t("orderingForm.phone")}
                value={values.phone}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.phone && Boolean(errors.phone)}
                helperText={touched.phone && errors.phone}
                className={classes.textField}
              />

              <TextField
                fullWidth
                margin="normal"
                name="shippingAddress"
                label={t("orderingForm.shippingAddress")}
                placeholder={`${t("orderingForm.country")}, ${t("orderingForm.zipCode")}, ${t("orderingForm.city")}, ${t("orderingForm.streetAddress")}`}
                value={values.shippingAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                error={
                  touched.shippingAddress && Boolean(errors.shippingAddress)
                }
                helperText={touched.shippingAddress && errors.shippingAddress}
                className={classes.textField}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="billingDifferent"
                    checked={values.billingDifferent}
                    onChange={handleChange}
                    className={classes.defferentAddressCheckbox}
                  />
                }
                label={t("orderingForm.sameAsShipping")}
              />

              {values.billingDifferent && (
                <TextField
                  fullWidth
                  margin="normal"
                  name="billingAddress"
                  label={t("orderingForm.billingAddress")}
                  value={values.billingAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    touched.billingAddress && Boolean(errors.billingAddress)
                  }
                  helperText={touched.billingAddress && errors.billingAddress}
                  className={classes.textField}
                />
              )}

              <TextField
                fullWidth
                multiline
                minRows={3}
                margin="normal"
                name="note"
                label={t("orderingForm.note")}
                value={values.note}
                onChange={handleChange}
                className={classes.textField}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                className={classes.sendFromButton}
              >
                {t("orderingForm.submit")}
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </Root>
  );
}
