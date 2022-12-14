import { useWeb3React } from "@web3-react/core";
import {
  JsonRpcSigner,
  StaticJsonRpcProvider,
  Web3Provider,
} from "@ethersproject/providers";
// eslint-disable-next-line import/no-unresolved
import { Web3ReactContextInterface } from "@web3-react/core/dist/types";

export const simpleRpcProvider = new StaticJsonRpcProvider(
  "https://bsc-dataseed.binance.org/"
);

// account is not optional
export function getSigner(
  library: Web3Provider,
  account: string
): JsonRpcSigner {
  return library?.getSigner(account).connectUnchecked();
}

// account is optional
export function getProviderOrSigner(
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner {
  return account ? getSigner(library, account) : library;
}

/**
 * Provides a web3 provider with or without user's signer
 * Recreate web3 instance only if the provider change
 */
const useActiveWeb3React = (): Web3ReactContextInterface<Web3Provider> => {
  const { library, chainId, ...web3React } = useWeb3React();

  return {
    library: library || simpleRpcProvider,
    chainId: chainId ?? 56,
    ...web3React,
  };
};

export default useActiveWeb3React;
