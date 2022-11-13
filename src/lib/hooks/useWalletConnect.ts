import { useEthers } from "@usedapp/core";
import { useSnackbar } from "../../components/Snackbar";
import { injectedConnector, walletConnectConnector } from "../connectors";
import create from "zustand";

interface UseWalletConnectDialog {
  open: boolean;
  openWalletConnect: () => void;
  closeWalletConnect: () => void;
}

const useWalletConnectDialog = create<UseWalletConnectDialog>((set) => ({
  open: false,
  openWalletConnect: () => {
    set({ open: true });
  },
  closeWalletConnect: () => {
    set({ open: false });
  },
}));

export default function useWalletConnect() {
  const { activate } = useEthers();
  const { openSnackbar } = useSnackbar();
  const { open, openWalletConnect, closeWalletConnect } =
    useWalletConnectDialog();

  const handleConnectInjected = async () => {
    try {
      await activate(injectedConnector);
      closeWalletConnect();
    } catch (error) {
      console.log("ERR", error);
    }
  };

  const handleConnectWalletConnect = async () => {
    try {
      await activate(walletConnectConnector);
    } catch (error) {
      console.log((error as any)?.name);
      if ((error as any)?.name === "UserRejectedRequestError") {
        openSnackbar(
          "Closing Wallet Connect requires a reload, please reload the page.",
          "warning"
        );
      }
    } finally {
      closeWalletConnect();
    }
  };

  return {
    onConnectInjected: handleConnectInjected,
    onConnectWalletConnect: handleConnectWalletConnect,
    openWalletConnect,
    closeWalletConnect,
    open,
  };
}
