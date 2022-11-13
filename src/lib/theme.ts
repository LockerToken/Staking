import { createTheme } from "@mui/material";

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#000000FF",
    },
    primary: {
      main: "#5accf6",
    },
    secondary: {
      main: "#000",
    },
    common: {
      black: "hsla(206, 10.1%, 13.5%, 1)",
    },
  },
  typography: {
    allVariants: {
      fontFamily: "Tauri",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          "&.Mui-disabled": {
            color: "#8f8f8f",
            borderColor: "#8f8f8f",
          },
        },
        contained: {
          backgroundColor: "#282827",
          color: "#aa9659",
          "&:hover": {
            backgroundColor: "#282827",
          },
        },
      },
    },
  },
});
