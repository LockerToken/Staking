import { formatUnits } from "@ethersproject/units";
import { Close } from "@mui/icons-material";
import { Dialog, IconButton, Portal } from "@mui/material";
import clsx from "clsx";
import { SyntheticEvent, useCallback, useMemo, useState } from "react";
import create from "zustand";
import useContract from "../lib/contract/useContract";
import { LoadingButton } from "./Button";

interface UnStakeDialogState {
  open: boolean;
  openUnStakeDialog: () => void;
  closeUnStakeDialog: () => void;
}

export const useUnStakeDialog = create<UnStakeDialogState>((set) => ({
  open: false,
  openUnStakeDialog: () => set((state) => ({ ...state, open: true })),
  closeUnStakeDialog: () => set((state) => ({ ...state, open: false })),
}));

export enum UnStakeOptions {
  UN_STAKE,
  EMERGENCY_WITHDRAW,
}

export default function UnstakeDialog() {
  const open = useUnStakeDialog((s) => s.open);
  const onClose = useUnStakeDialog((s) => s.closeUnStakeDialog);
  const { unstakeTimeOff, penalty, unstake } = useContract();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<UnStakeOptions>(
    UnStakeOptions.UN_STAKE
  );

  const timeToClose = useMemo(() => {
    if (unstakeTimeOff) {
      return Number(formatUnits(unstakeTimeOff, 0)) / 60 / 60 / 24;
    }
    return "";
  }, [unstakeTimeOff]);

  const handleChangeOption = useCallback(
    (optionType: UnStakeOptions) => (e: SyntheticEvent) => {
      setSelectedOption(optionType);
    },
    [setSelectedOption]
  );

  const handleUnstake = useCallback(async () => {
    try {
      setIsLoading(true);
      await unstake(selectedOption === UnStakeOptions.EMERGENCY_WITHDRAW);
      setIsLoading(false);
      onClose();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [selectedOption, unstake, onClose]);

  return (
    <Portal>
      <Dialog
        open={open}
        onClose={onClose}
        PaperProps={{
          style: {
            background: "transparent",
          },
        }}
      >
        <div className="unstake-card p-4 space-y-4 bg-black rounded-md">
          <div className="flex items-center justify-between flex-1 w-full">
            <div>Choose UnStaking options</div>
            <IconButton onClick={onClose}>
              <Close color="inherit" className="text-gray-200" />
            </IconButton>
          </div>
          <div className="flex flex-col space-y-6">
            {unstakeTimeOff && (
              <div
                className={clsx("p-4 rounded-md space-y-2", {
                  "bg-black border border-secondary":
                    selectedOption === UnStakeOptions.UN_STAKE,
                  "bg-black border border-gray-500":
                    selectedOption !== UnStakeOptions.UN_STAKE,
                })}
                role="button"
                title="UnStake"
                onClick={handleChangeOption(UnStakeOptions.UN_STAKE)}
              >
                <div className="text-lg font-bold text-secondary">UnStake</div>
                <div
                  className={clsx({
                    "text-gray-300": selectedOption === UnStakeOptions.UN_STAKE,
                    "text-white": selectedOption !== UnStakeOptions.UN_STAKE,
                  })}
                >
                  UnStake tokens will allow you to withdraw your LOCKER token{" "}
                  {timeToClose} day(s) from now.
                </div>
              </div>
            )}
            {penalty && (
              <div
                className={clsx("p-4 rounded-md space-y-2", {
                  "bg-black border border-secondary":
                    selectedOption === UnStakeOptions.EMERGENCY_WITHDRAW,
                  "bg-black border border-gray-500":
                    selectedOption !== UnStakeOptions.EMERGENCY_WITHDRAW,
                })}
                role="button"
                title="Emergency Withdrawal"
                onClick={handleChangeOption(UnStakeOptions.EMERGENCY_WITHDRAW)}
              >
                <div className="text-lg font-bold text-secondary">
                  Emergency Withdrawal
                </div>
                <div
                  className={clsx({
                    "text-gray-300":
                      selectedOption === UnStakeOptions.EMERGENCY_WITHDRAW,
                    "text-white":
                      selectedOption !== UnStakeOptions.EMERGENCY_WITHDRAW,
                  })}
                >
                  By choosing this option, you will be able to withdraw your
                  LOCKER token instantly but will be charged{" "}
                  <span className="text-red-500 font-bold">
                    {penalty && `${100 - Number(penalty)}% penalty`}
                  </span>
                </div>
              </div>
            )}
            <LoadingButton
              disableElevation
              loading={isLoading}
              onClick={handleUnstake}
            >
              {selectedOption === UnStakeOptions.UN_STAKE
                ? "UnStake"
                : "Withdraw"}
            </LoadingButton>
          </div>
        </div>
      </Dialog>
    </Portal>
  );
}
