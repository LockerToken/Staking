import { useEthers } from "@usedapp/core";
import { useMemo } from "react";

export default function useAppState() {
  const { account } = useEthers();

  return useMemo(() => ({
    isConnected: Boolean(account)
  }), [account])
}
