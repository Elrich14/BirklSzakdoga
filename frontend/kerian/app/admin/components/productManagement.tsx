"use client";

import { styled } from "@mui/system";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import Image from "next/image";
import { fetchAdminProducts, deleteProduct, AdminProduct } from "@/api";
import ProductForm from "./productForm";
import { API_BASE } from "@/constants/constants";

const PREFIX = "ProductManagement";
const classes = {
  root: `${PREFIX}-root`,
  header: `${PREFIX}-header`,
  table: `${PREFIX}-table`,
  productImage: `${PREFIX}-productImage`,
  addButton: `${PREFIX}-addButton`,
  editButton: `${PREFIX}-editButton`,
  deleteButton: `${PREFIX}-deleteButton`,
  dialogPaper: `${PREFIX}-dialogPaper`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  [`& .${classes.header}`]: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  [`& .${classes.table}`]: {
    backgroundColor: theme.palette.admin.surface,
    borderRadius: "12px",
    "& .MuiTableCell-root": {
      borderColor: theme.palette.admin.border,
    },
  },
  [`& .${classes.productImage}`]: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "6px",
  },
  [`& .${classes.addButton}`]: {
    backgroundColor: theme.palette.kerian.main,
  },
  [`& .${classes.editButton}`]: {
    color: theme.palette.kerian.main,
  },
  [`& .${classes.deleteButton}`]: {
    color: theme.palette.error.main,
  },
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  [`& .${classes.dialogPaper}`]: {
    backgroundColor: theme.palette.admin.surface,
    color: theme.palette.text.primary,
  },
}));

export default function ProductManagement() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<AdminProduct | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  const { data: products = [] } = useQuery({
    queryKey: ["adminProducts"],
    queryFn: fetchAdminProducts,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProducts"] });
      setDeleteTarget(null);
    },
  });

  const onAddNew = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const onEdit = (product: AdminProduct) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const onFormClose = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  if (isFormOpen) {
    return (
      <ProductForm product={editingProduct} onClose={onFormClose} />
    );
  }

  return (
    <Root className={classes.root}>
      <Box className={classes.header}>
        <Typography variant="h6">{t("admin.products.title")}</Typography>
        <Button
          variant="contained"
          onClick={onAddNew}
          className={classes.addButton}
        >
          {t("admin.products.addNew")}
        </Button>
      </Box>

      <TableContainer className={classes.table}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("admin.products.image")}</TableCell>
              <TableCell>{t("admin.products.name")}</TableCell>
              <TableCell>{t("admin.products.price")}</TableCell>
              <TableCell>{t("admin.products.category")}</TableCell>
              <TableCell>{t("admin.products.stock")}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.imageUrls?.[0] && (
                    <Image
                      src={
                        product.imageUrls[0].startsWith("/uploads")
                          ? `${API_BASE}${product.imageUrls[0]}`
                          : product.imageUrls[0]
                      }
                      alt={product.name}
                      width={50}
                      height={50}
                      className={classes.productImage}
                      unoptimized
                    />
                  )}
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.price} Ft</TableCell>
                <TableCell>{product.category || "-"}</TableCell>
                <TableCell>
                  {product.variants
                    ? product.variants.reduce(
                        (totalStock, variant) => totalStock + variant.stock,
                        0
                      )
                    : 0}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => onEdit(product)}
                    className={classes.editButton}
                  >
                    {t("admin.products.edit")}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setDeleteTarget(product)}
                    className={classes.deleteButton}
                  >
                    {t("admin.products.delete")}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <StyledDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        slotProps={{ paper: { className: classes.dialogPaper } }}
      >
        <DialogTitle>{t("admin.products.deleteConfirm")}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>
            {t("admin.products.cancel")}
          </Button>
          <Button
            onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            className={classes.deleteButton}
          >
            {t("admin.products.delete")}
          </Button>
        </DialogActions>
      </StyledDialog>
    </Root>
  );
}
