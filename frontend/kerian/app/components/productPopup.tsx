"use client";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  styled,
  Box,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Image from "next/image";

type ProductPopupProps = {
  open: boolean;
  onClose: () => void;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
};

const PREFIX = "ProductPopup";

const classes = {
  root: `${PREFIX}-root`,
  container: `${PREFIX}-container`,
  dataContainer: `${PREFIX}-dataContainer`,
  addToCardButton: `${PREFIX}-addToCardButton`,
  productDescription: `${PREFIX}-productDescription`,
  price: `${PREFIX}-price`,
  popupFooterBox: `${PREFIX}-popupFooterBox`,
};

const Root = styled(Dialog)(() => ({
  [`&.${classes.root}`]: {
    maxWidth: "1000px",
    margin: "auto",
  },
  [`& .${classes.container}`]: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  [`& .${classes.dataContainer}`]: {
    display: "flex",
    flexDirection: "column",
    margin: "10px 0px 10px 20px",
  },
  [`& .${classes.addToCardButton}`]: {
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "20px",
    width: "150px",
  },
  [`& .${classes.productDescription}`]: {
    fontFamily: "monospace",
    fontWeight: "normal",
    fontSize: "15px",
    marginBottom: "15px",
  },
  [`& .${classes.price}`]: {
    fontFamily: "monospace",
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: "25px",
    marginTop: "10px",
  },
  [`& .${classes.popupFooterBox}`]: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "auto",
  },
}));

export default function ProductPopup({
  open,
  onClose,
  name,
  description,
  imageUrl,
  price,
}: ProductPopupProps) {
  return (
    <Root
      className={classes.root}
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {name}
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box className={classes.container}>
          <Image
            src={imageUrl}
            alt={name}
            width={450}
            height={500}
            style={{ borderRadius: 4 }}
          />
          <Box className={classes.dataContainer}>
            <Typography
              className={classes.productDescription}
              variant="body1"
              paragraph
            >
              {description}
            </Typography>
            <Box className={classes.popupFooterBox}>
              <Typography className={classes.price} fontWeight="bold">
                {price} Ft
              </Typography>
              <Button
                className={classes.addToCardButton}
                variant="contained"
                size="small"
              >
                Add To Cart
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
    </Root>
  );
}
