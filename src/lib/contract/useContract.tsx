import { formatUnits, parseUnits } from "@ethersproject/units";
import { ERC20, useEthers } from "@usedapp/core";
import { BigNumber, Contract } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { useSnackbar } from "../../components/Snackbar";

import abi from "../abis/contract_abi.json";

export const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

export function useContractMethods<T>(
  contract: Contract | null,
  methods: string,
  params?: any[],
  callback?: (result: T) => any,
  dependencies?: any[]
) {
  return useSWR<T>(
    contract && [CONTRACT_ADDRESS, methods, ...(dependencies || [])],
    async () => {
      const result = await contract?.[methods]?.(...(params || []));
      if (typeof callback === "function") {
        return callback(result);
      }
      return result;
    }
  );
}

type KeyValue = { [key: string]: any };

export interface UserInfo extends KeyValue {
  stakedAmount: BigNumber;
  rewardDebt: BigNumber;
  lastDepositTime: BigNumber;
  unstakeStartTime: BigNumber;
  pendingAmount: BigNumber;
}

export function useTokenContract() {
  const { library } = useEthers();
  const contract = useMemo(
    () =>
      new Contract(
        "0x0000000000000000000000000000000000000000",
        ERC20.abi,
        library?.getSigner?.().connectUnchecked()
      ),
    [library]
  );

  return contract;
}

export default function useContract() {
  const [contract, setContract] = useState<Contract | null>(null);
  const { account, library: signedLibrary, chainId, library } = useEthers();
  const { openSnackbar } = useSnackbar();

  const { data: rewardRate } = useContractMethods<string>(
    contract,
    "rewardRate",
    [],
    (result) => formatUnits(result, 0),
    [chainId]
  );

  const { data: penalty } = useContractMethods<string>(
    contract,
    "emergencyPercentageToWithdraw",
    [],
    (result) => formatUnits(result, 0),
    [chainId]
  );

  const { data: unstakeTimeOff } = useContractMethods<string>(
    contract,
    "UNSTAKE_TIMEOFF",
    [],
    (result) => formatUnits(result, 0),
    [chainId]
  );

  const { data: totalStakedAmount } = useContractMethods<string>(
    contract,
    "totalStakedAmount",
    [],
    (result) => formatUnits(result, 18),
    [chainId]
  );

  const { data: userInfos, mutate: refreshUserInfo } = useSWR<UserInfo>(
    [CONTRACT_ADDRESS, "userInfos", account],
    async () => {
      const _contract = new Contract(
        CONTRACT_ADDRESS,
        abi,
        signedLibrary?.getSigner()
      );
      const info = await _contract.userInfos(account);
      return info;
    }
  );

  const { data: calcReward = BigNumber.from(0), mutate: refreshCalcReward } =
    useSWR<BigNumber>([CONTRACT_ADDRESS, "calcReward", account], async () => {
      const _contract = new Contract(
        CONTRACT_ADDRESS,
        abi,
        signedLibrary?.getSigner()
      );
      const info = await _contract.calcReward(account);
      return info;
    });
  const initContract = useCallback(async () => {
    try {
      const _contract = new Contract(
        CONTRACT_ADDRESS,
        abi,
        library?.getSigner().connectUnchecked()
      );
      console.log({ _contract });
      await _contract.rewardRate();
      setContract(_contract);
    } catch (error) {
      console.log("Failed to init contract", error);
    }
  }, [library]);

  const handleApprove = async (amount: string) => {
    const amountBN = parseUnits(amount, 18);
    const tokenContract = new Contract(
      "0x0000000000000000000000000000000000000000",
      ERC20.abi,
      signedLibrary?.getSigner?.()
    );
    const tx = await tokenContract?.approve(contract?.address, amountBN);
    await signedLibrary?.waitForTransaction(tx.hash);
    openSnackbar("Approval successful", "success");
  };

  const handleStakeToken = async (amount: string) => {
    const amountBN = parseUnits(amount, 18);
    const _contract = new Contract(
      CONTRACT_ADDRESS,
      abi,
      signedLibrary?.getSigner?.()
    );
    const tx = await _contract?.stakeToken(amountBN);
    await signedLibrary?.waitForTransaction(tx.hash);
    openSnackbar("Stake successful", "success");
  };

  const unstakeEndTime = useMemo(() => {
    if (!unstakeTimeOff || !userInfos) {
      return undefined;
    }
    const unstakeStartTime = new Date(
      Number(formatUnits(userInfos.unstakeStartTime, 0)) * 1000
    );
    const daysToUnstake = Number(formatUnits(unstakeTimeOff, 0)) / 60 / 60 / 24;
    const unstakeEndTime = new Date(
      unstakeStartTime.getTime() + daysToUnstake * 24 * 60 * 60 * 1000
    );
    return unstakeEndTime;
  }, [unstakeTimeOff, userInfos]);

  const isAvailableToClaim = useMemo(() => {
    if (!unstakeEndTime) {
      return false;
    }
    return Date.now() > unstakeEndTime.getTime();
  }, [unstakeEndTime]);

  const handleUnstakeToken = async (isEmergencyWithdraw: boolean = false) => {
    if (!contract) {
      throw new Error("No contract");
    }
    try {
      const _contract = new Contract(
        CONTRACT_ADDRESS,
        abi,
        signedLibrary?.getSigner?.()
      );
      const tx = await _contract?.unstakeToken(
        userInfos?.stakedAmount,
        isEmergencyWithdraw
      );
      await signedLibrary?.waitForTransaction(tx.hash);
      openSnackbar("Unstake success", "success");
    } catch (error) {
      console.error("Failed to unstake token", error);
      if (error && (error as Error).message) {
        openSnackbar((error as Error)?.message, "error");
      }
    }
  };

  const handleClaim = async () => {
    if (!contract) {
      throw new Error("No contract");
    }
    try {
      const _contract = new Contract(
        CONTRACT_ADDRESS,
        abi,
        signedLibrary?.getSigner?.()
      );
      const tx = await _contract?.claim();
      await signedLibrary?.waitForTransaction(tx.hash);
      openSnackbar("Claim success", "success");
    } catch (error) {
      console.error("Failed to claim", error);
      if (error && (error as Error).message) {
        openSnackbar((error as Error)?.message, "error");
      }
    }
  };

  const handleHarvest = async () => {
    try {
      const _contract = new Contract(
        CONTRACT_ADDRESS,
        abi,
        signedLibrary?.getSigner?.()
      );
      const tx = await _contract?.harvest();
      await signedLibrary?.waitForTransaction(tx.hash);
      openSnackbar("Harvest success", "success");
    } catch (error) {
      console.error("Failed to stake token", error);
      if (error && (error as Error).message) {
        openSnackbar((error as Error)?.message, "error");
      }
    }
  };

  /**
   * Init contract
   */
  useEffect(() => {
    if (contract === null) {
      initContract();
    }
  }, [initContract, contract]);

  return {
    contract,
    rewardRate,
    isAvailableToClaim,
    totalStakedAmount,
    unstakeEndTime,
    userInfos,
    penalty,
    calcReward,
    refreshCalcReward,
    claim: handleClaim,
    approveToken: handleApprove,
    stakeToken: handleStakeToken,
    refreshUserInfo,
    harvest: handleHarvest,
    unstake: handleUnstakeToken,
    unstakeTimeOff,
    isLoading: !rewardRate || !totalStakedAmount,
  };
}
