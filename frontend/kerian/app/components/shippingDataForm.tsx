"use client";

import { Formik, Form } from "formik";
import * as Yup from "yup";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { styled } from "@mui/system";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { createCheckoutSession } from "@/api";
import { phoneRegExp } from "@/constants/constants";
import {
  Currency,
  SUPPORTED_CURRENCIES,
  formatPrice,
} from "@/constants/currency";
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
  currencyGroup: `${PREFIX}-currencyGroup`,
  totalLine: `${PREFIX}-totalLine`,
  checkoutContainer: `${PREFIX}-checkoutContainer`,
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

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null;

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    padding: "20px",
    borderRadius: "4px",
    marginTop: "50px",
    boxShadow: theme.vars?.palette.kerian.shadowHover,
    maxWidth: "600px",
    marginLeft: "auto",
    marginRight: "auto",
    [theme.breakpoints.down("sm")]: {
      padding: "16px",
      marginTop: "24px",
      marginLeft: "8px",
      marginRight: "8px",
    },
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
  [`& .${classes.currencyGroup}`]: {
    marginTop: "16px",
    marginBottom: "8px",
  },
  [`& .${classes.totalLine}`]: {
    marginTop: "8px",
    fontWeight: 600,
  },
  [`& .${classes.checkoutContainer}`]: {
    marginTop: "16px",
  },
}));

interface FormValues {
  name: string;
  email: string;
  phone: string;
  shippingAddress: string;
  billingAddress: string;
  note: string;
  billingDifferent: boolean;
  currency: Currency;
}

export default function ShippingDataForm() {
  const { t, i18n } = useTranslation();
  const { showSnackbar } = useSnackbar();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  const totalHuf = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + item.productPrice * item.productQuantity,
        0
      ),
    [cartItems]
  );

  const initialValues: FormValues = {
    name: "",
    email: "",
    phone: "",
    shippingAddress: "",
    billingAddress: "",
    note: "",
    billingDifferent: false,
    currency: "HUF",
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
    currency: Yup.string().oneOf(SUPPORTED_CURRENCIES).required(),
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setError(false);
      const { clientSecret: secret } = await createCheckoutSession({
        name: values.name,
        email: values.email,
        shippingAddress: values.shippingAddress,
        billingAddress: values.billingDifferent
          ? values.billingAddress
          : undefined,
        note: values.note,
        language: i18n.language,
        currency: values.currency,
        cartItems,
      });
      setClientSecret(secret);
    } catch (orderError) {
      console.error("Error creating checkout session", orderError);
      setError(true);

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

  if (clientSecret && stripePromise) {
    return (
      <Root className={classes.root}>
        <Typography className={classes.title} variant="h5">
          {t("payment.title")}
        </Typography>
        <Box className={classes.checkoutContainer}>
          <EmbeddedCheckoutProvider
            stripe={stripePromise}
            options={{ clientSecret }}
          >
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </Box>
      </Root>
    );
  }

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
              error={touched.shippingAddress && Boolean(errors.shippingAddress)}
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
                error={touched.billingAddress && Boolean(errors.billingAddress)}
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

            <FormControl className={classes.currencyGroup}>
              <FormLabel id="currency-label">
                {t("payment.currencyLabel")}
              </FormLabel>
              <RadioGroup
                row
                aria-labelledby="currency-label"
                name="currency"
                value={values.currency}
                onChange={handleChange}
              >
                <FormControlLabel
                  value="HUF"
                  control={<Radio />}
                  label={t("payment.currency.huf")}
                />
                <FormControlLabel
                  value="EUR"
                  control={<Radio />}
                  label={t("payment.currency.eur")}
                />
              </RadioGroup>
            </FormControl>

            <Typography className={classes.totalLine}>
              {t("payment.totalLabel")}:{" "}
              {formatPrice(totalHuf, values.currency)}
            </Typography>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className={classes.sendFromButton}
              disabled={!stripePromise || cartItems.length === 0}
            >
              {t("payment.payNow")}
            </Button>
          </Form>
        )}
      </Formik>
    </Root>
  );
}
