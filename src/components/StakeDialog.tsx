import { Check, Close } from "@mui/icons-material";
import {
  CircularProgress,
  Dialog,
  IconButton,
  Input,
  InputAdornment,
} from "@mui/material";
import { LoadingButton as MuiLoadingButton } from "@mui/lab";
import Portal from "@mui/material/Portal";
import clsx from "clsx";
import { FormEvent, useRef, useState } from "react";
import create from "zustand";
import useContract, {
  useContractMethods,
  useTokenContract,
} from "../lib/contract/useContract";
import { LoadingButton } from "./Button";
import { useSnackbar } from "./Snackbar";
import { formatUnits } from "@ethersproject/units";
import { useEthers } from "@usedapp/core";
import { formatToUSD } from "../lib/number";

interface StakeDialogState {
  open: boolean;
  openStakeDialog: () => void;
  closeStakeDialog: () => void;
}

export const useStakeDialog = create<StakeDialogState>((set) => ({
  open: false,
  openStakeDialog: () => set((state) => ({ ...state, open: true })),
  closeStakeDialog: () => set((state) => ({ ...state, open: false })),
}));

export default function StakeDialog() {
  const { open, closeStakeDialog } = useStakeDialog();
  const { isLoading, stakeToken, refreshUserInfo, approveToken } =
    useContract();
  const { account } = useEthers();
  const tokenContract = useTokenContract();
  const { data: balance = "0.0" } = useContractMethods<string>(
    tokenContract,
    "balanceOf",
    [account],
    (result) => formatUnits(result, 18),
    [account]
  );

  const [isStaking, setIsStaking] = useState(false);
  const currencyInputRef = useRef<HTMLInputElement>(null);
  const { openSnackbar: show } = useSnackbar();

  const [step, setStep] = useState(0);

  const handleStake = async (e: FormEvent) => {
    e.preventDefault();
    // @ts-ignore
    const amount = Math.floor(currencyInputRef?.current.value).toString();
    setIsStaking(true);
    if (Number(amount) > Number(balance)) {
      show("You don't have enough tokens to stake", "error");
      setIsStaking(false);
      return;
    }
    if (Number(amount) < 1) {
      show("Amount cannot be less than 1", "error");
      setIsStaking(false);
      return;
    }
    try {
      setStep(1);
      await approveToken(amount);
      show("Stake allowance amount approved", "success");
      setStep(2);
      await stakeToken(amount);
      show("Staking successful", "success");
      setStep(3);
    } catch (error) {
      show((error as Error)?.message || "Staking failed", "error");
    } finally {
      refreshUserInfo();
      setTimeout(() => {
        setIsStaking(false);
        setStep(0);
        closeStakeDialog();
      }, 2000);
    }
  };

  return (
    <Portal>
      <Dialog
        open={open}
        onClose={closeStakeDialog}
        PaperProps={{
          style: {
            background: "transparent",
          },
        }}
      >
        <div className="p-4 space-y-4 bg-black rounded-md">
          <div className="flex items-center justify-between flex-1 w-full">
            <div>Stake</div>
            <IconButton disabled={step !== 0} onClick={closeStakeDialog}>
              <Close color="inherit" className="text-gray-200" />
            </IconButton>
          </div>
          <form onSubmit={handleStake} className="flex flex-col space-y-4">
            <div className="flex flex-col flex-1 space-y-1">
              <div className="text-sm font-bold text-gray-300">
                Amount to Stake
              </div>
              <Input
                disabled={isLoading}
                endAdornment={
                  <InputAdornment position="end">
                    <MuiLoadingButton
                      loading={isLoading}
                      variant="text"
                      size="small"
                      onClick={() => {
                        if (currencyInputRef.current) {
                          currencyInputRef.current.value = (
                            Number(balance) > 0 ? Number(balance) : 0
                          ).toString();
                        }
                      }}
                    >
                      Max
                    </MuiLoadingButton>
                  </InputAdornment>
                }
                name="amount"
                placeholder="0.0"
                type="string"
                inputRef={currencyInputRef}
              />
            </div>
            <div className="flex items-center justify-end space-x-2">
              <div>Balance: {formatToUSD(balance)} LOCKER</div>
            </div>
            <LoadingButton
              loading={isStaking}
              variant="contained"
              disableElevation
              type="submit"
              onClick={() => {}}
              disabled={Number(currencyInputRef?.current?.value) < 0}
              color="primary"
            >
              Stake
            </LoadingButton>
            <div className="text-base text-gray-300 p-2">
              You will be requested with 2 transactions to approve &amp; stake
              <div className="flex flex-col space-y-2 py-4">
                <div className="flex items-center space-x-2">
                  <div
                    className={clsx(
                      "h-6 w-6 rounded-full flex items-center justify-center",
                      {
                        "bg-primary text-white": step === 0,
                        "bg-secondary text-white": step >= 3,
                      }
                    )}
                  >
                    {step < 2 && step !== 0 && (
                      <CircularProgress size="16px" color="inherit" />
                    )}
                    {step >= 2 ? (
                      <Check fontSize="small" color="inherit" />
                    ) : (
                      <div className="h-2 w-2" />
                    )}
                  </div>

                  {step < 2 && step !== 0 && (
                    <div>
                      <div className="font-bold">Approving Transaction</div>
                    </div>
                  )}

                  {step >= 2 && (
                    <div className="font-bold">Transaction Approved</div>
                  )}
                  {step === 0 && (
                    <div className="font-bold">Transaction Approval</div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <div
                    className={clsx(
                      "h-6 w-6 flex rounded-full  items-center justify-center",
                      {
                        "bg-white text-white": step === 0,
                        "bg-green-500 text-white": step >= 3,
                      }
                    )}
                  >
                    {step < 3 && step !== 0 && (
                      <CircularProgress size="16px" color="inherit" />
                    )}
                    {step >= 3 ? (
                      <Check fontSize="small" color="inherit" />
                    ) : (
                      <div className="h-2 w-2" />
                    )}
                  </div>

                  {step < 3 && step !== 0 && (
                    <div>
                      <div className="font-bold">Approving Staking</div>
                    </div>
                  )}
                  {step >= 3 && (
                    <div className="font-bold">Staking Approved</div>
                  )}
                  {step === 0 && (
                    <div className="font-bold">Staking Approval</div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      </Dialog>
    </Portal>
  );
}
