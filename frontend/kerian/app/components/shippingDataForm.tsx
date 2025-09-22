"use client";

import { Formik, Form, ErrorMessage } from "formik";
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
import { boxShadows } from "@/constants/colors";
import { useCartStore } from "./store/cartStore";
import { useTranslation } from "react-i18next";
import { phoneRegExp } from "@/constants/constants";

const PREFIX = "ShippingDataForm";
const classes = {
  root: `${PREFIX}-root`,
  textField: `${PREFIX}-textField`,
  defferentAddressCheckbox: `${PREFIX}-defferentAddressCheckbox`,
  errorMsg: `${PREFIX}-errorMsg`,
  sendFromButton: `${PREFIX}-sendFromButton`,
};

const Root = styled(Box)(() => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    borderRadius: "4px",
    marginTop: "100px",
    boxShadow: boxShadows.kerian_main_button_hover_shadow,
  },
  [`& .${classes.textField}`]: {
    marginBottom: "16px",
  },
  [`& .${classes.errorMsg}`]: {
    color: "red",
    fontSize: "0.875rem",
    marginTop: "-12px",
    marginBottom: "8px",
  },
  [`& .${classes.sendFromButton}`]: {
    marginTop: "16px",
  },
}));

export default function ShippingDataForm() {
  const { t } = useTranslation();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const cartItems = useCartStore((state) => state.items);

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
      await sendOrder({ ...values, cartItems });
      setSent(true);
    } catch (error) {
      console.error("Error when sending email", error);
      setError(true);
      setSent(false);
    }
  };

  return (
    <Root className={classes.root} sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h5" mb={2}>
        {t("orderingForm.title")}
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {t("feedback.orderError")}
        </Typography>
      )}
      {sent ? (
        <Typography color="green">{t("feedback.orderSuccess")}</Typography>
      ) : (
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ handleChange, values }) => (
            <Form>
              <TextField
                fullWidth
                margin="normal"
                name="name"
                label={t("orderingForm.fullName")}
                value={values.name}
                onChange={handleChange}
                className={classes.textField}
              />
              <ErrorMessage
                name="name"
                component="div"
                className={classes.errorMsg}
              />

              <TextField
                fullWidth
                margin="normal"
                name="email"
                label={t("common.email")}
                value={values.email}
                onChange={handleChange}
                className={classes.textField}
              />
              <ErrorMessage
                name="email"
                component="div"
                className={classes.errorMsg}
              />

              <TextField
                fullWidth
                margin="normal"
                name="phone"
                label={t("orderingForm.phone")}
                value={values.phone}
                onChange={handleChange}
                className={classes.textField}
              />
              <ErrorMessage
                name="phone"
                component="div"
                className={classes.errorMsg}
              />

              <TextField
                fullWidth
                margin="normal"
                name="shippingAddress"
                label={t("orderingForm.shippingAddress")}
                placeholder={`${t("orderingForm.country")}, ${t("orderingForm.zipCode")}, ${t("orderingForm.city")}, ${t("orderingForm.streetAddress")}`}
                value={values.shippingAddress}
                onChange={handleChange}
                className={classes.textField}
              />
              <ErrorMessage
                name="shippingAddress"
                component="div"
                className={classes.errorMsg}
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
                <>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="billingAddress"
                    label={t("orderingForm.billingAddress")}
                    value={values.billingAddress}
                    onChange={handleChange}
                    className={classes.textField}
                  />
                  <ErrorMessage
                    name="billingAddress"
                    component="div"
                    className={classes.errorMsg}
                  />
                </>
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
