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
  [`& .${classes.defferentAddressCheckbox}`]: {
    marginBottom: "12px",
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
  const [sent, setSent] = useState(false);
  const cartItems = useCartStore((state) => state.items);

  const initialValues = {
    name: "",
    email: "",
    shippingAddress: "",
    billingAddress: "",
    note: "",
    billingDifferent: false,
  };

  const validationSchema = Yup.object({
    name: Yup.string().required("Required field"),
    email: Yup.string().email("Wrong email format").required("Required field"),
    shippingAddress: Yup.string().required("Required field"),
    billingAddress: Yup.string().when("billingDifferent", {
      is: true,
      then: (schema) =>
        schema.required("Required, if different from shipping address"),
      otherwise: (schema) => schema.notRequired(),
    }),
    note: Yup.string(),
    billingDifferent: Yup.boolean(),
  });

  const onSubmit = async (values: typeof initialValues) => {
    try {
      await sendOrder({ ...values, cartItems });

      setSent(true);
    } catch (error) {
      console.error("Error when sending email", error);
    }
  };

  return (
    <Root className={classes.root} sx={{ maxWidth: 600, mx: "auto", p: 2 }}>
      <Typography variant="h5" mb={2}>
        Shipping
      </Typography>

      {sent ? (
        <Typography color="green">Order sent</Typography>
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
                label="Name"
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
                label="Email"
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
                name="shippingAddress"
                label="Shipping Address"
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
                label="Billing address different from shipping address"
              />

              {values.billingDifferent && (
                <>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="billingAddress"
                    label="Billing Address"
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
                label="Note"
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
                Order
              </Button>
            </Form>
          )}
        </Formik>
      )}
    </Root>
  );
}
