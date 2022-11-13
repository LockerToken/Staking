import { Alert, AlertColor, Snackbar } from "@mui/material";
import { useEffect } from "react";
import create from "zustand";

interface UseSnackbar {
  open: boolean;
  message: JSX.Element | string;
  severity: AlertColor;
  openSnackbar: (message: JSX.Element | string, severity: AlertColor) => void;
  closeSnackbar: () => void;
}

export const useSnackbar = create<UseSnackbar>((set) => ({
  open: false,
  message: "",
  severity: "info",
  openSnackbar: (message: JSX.Element | string, severity: AlertColor = "info") =>
    set((state) => ({ ...state, open: true, message, severity })),
  closeSnackbar: () =>
    set((state) => ({ ...state, open: false, message: "", severity: "info" })),
}));

export const AlertSnackbar = () => {
  const { open, severity, message, closeSnackbar } = useSnackbar();

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        closeSnackbar();
      }, 10000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Snackbar
      open={open}
      anchorOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      autoHideDuration={500}
    >
      <Alert severity={severity} className="border border-app-primary">
        {message}
      </Alert>
    </Snackbar>
  );
};
