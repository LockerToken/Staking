import Button from "./Button";
import { useCallback } from "react";
import useAppState from "../lib/hooks/useAppState";
import { Mainnet, useEthers } from "@usedapp/core";
import useWalletConnect from "../lib/hooks/useWalletConnect";

export default function AccountInfo() {
  const { isConnected } = useAppState();
  const { chainId, switchNetwork } = useEthers();
  const { openWalletConnect } = useWalletConnect();

  const handleChangeNetwork = useCallback(() => {
    switchNetwork(Mainnet.chainId);
  }, [switchNetwork]);

  const renderButton = useCallback(() => {
    if (!isConnected) {
      return (
        <div className="relative group">
          <div className="absolute animate-pulse -inset-0.5 bg-gradient-to-r from-darkBrown to-brown rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <Button variant="contained" size="small" onClick={openWalletConnect}>
            Connect
          </Button>
        </div>
      );
    }
    if (chainId !== Mainnet.chainId) {
      return (
        <div className="space-y-2 w-full flex flex-col items-center">
          <Button disableElevation onClick={handleChangeNetwork}>
            Switch to Mainnet
          </Button>
          <div className="text-red-300">You are not connected to Mainnet.</div>
        </div>
      );
    }
    return null;
  }, [handleChangeNetwork, isConnected, openWalletConnect, chainId]);

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {renderButton()}
    </div>
  );
}
