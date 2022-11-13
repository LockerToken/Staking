import { useEffect } from "react";
import { Mainnet, useEthers } from "@usedapp/core";

export default function useNetworkListener() {
  const { chainId, switchNetwork } = useEthers();

  useEffect(() => {
    const handleChangeNetwork = async () => {
      if (window !== undefined) {
        // @ts-ignore
        if (window?.ethereum?.networkVersion !== chainId) {
          try {
            console.log(
              "Changing network to",
              // @ts-ignore
              window?.ethereum?.networkVersion
            );
            await switchNetwork(Mainnet.chainId);
          } catch (err) {
            console.log(err);
            // @ts-ignore
            if (err.code === 4902) {
              // @ts-ignore
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [Mainnet],
              });
            }
          }
        }
      }
    };
    if (chainId !== Mainnet.chainId) {
      handleChangeNetwork();
    }
  }, [chainId, switchNetwork]);
}
