import { formatUnits } from "@ethersproject/units";
import { useEthers } from "@usedapp/core";
import useContract, {
  useContractMethods,
  useTokenContract,
} from "../lib/contract/useContract";
import useAppState from "../lib/hooks/useAppState";
import { formatToUSD } from "../lib/number";
import { LoadingButton } from "./Button";
import { LoadingButton as MUILoadingButton } from "@mui/lab";
import { useStakeDialog } from "./StakeDialog";
import { useRef, useState } from "react";
import { Button, Drawer, DrawerProps, Portal, Tooltip } from "@mui/material";
import { useUnStakeDialog } from "./UnstakeDialog";
import Countdown, { CountdownRenderProps } from "react-countdown";
import useMedia from "../lib/hooks/useMedia";

const USER_INFOS_LABEL_MAP: { [key: string]: string } = {
  stakedAmount: "Staked Amount",
  rewardDebt: "Reward Debt",
  lastDepositTime: "Last Stake Time",
  unstakeStartTime: "Time Left to Claim",
  pendingAmount: "Pending Amount",
};

const IS_BIG_NUMBER = ["stakedAmount", "rewardDebt", "pendingAmount"];
const BUY_URL =
  "https://app.uniswap.org/#/swap?outputCurrency=0x0000000000000000000000000000000000000000";

const Completionist = () => <span>You're eligible to claim now!</span>;

const renderer =
  (balance: number) =>
  ({ completed, formatted }: CountdownRenderProps) => {
    if (balance === 0) {
      return <span>You don't have anything to claim.</span>;
    }
    if (completed) {
      // Render a completed state
      return <Completionist />;
    } else {
      // Render a countdown
      return (
        <div className="font-bold text-base">
          {formatted.days}:{formatted.hours}:{formatted.minutes}:
          {formatted.seconds}
        </div>
      );
    }
  };

const CountdownDrawer = ({ anchor, open, onClose, children }: DrawerProps) => {
  return (
    <Drawer anchor={anchor} open={open} onClose={onClose}>
      {children}
    </Drawer>
  );
};

export default function Stake() {
  const {
    rewardRate,
    harvest,
    isAvailableToClaim,
    claim,
    totalStakedAmount,
    userInfos,
    unstakeEndTime,
    calcReward,
  } = useContract();
  const { isConnected } = useAppState();
  const { openUnStakeDialog } = useUnStakeDialog();
  const { account } = useEthers();
  const { openStakeDialog } = useStakeDialog();
  const tokenContract = useTokenContract();
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const { matchesDesktop } = useMedia();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const { data: balance } = useContractMethods<string>(
    tokenContract,
    "balanceOf",
    [account],
    (result) => formatUnits(result, 18),
    [account]
  );

  const handleHarvest = async () => {
    if (!account) {
      return;
    }
    setIsHarvesting(true);
    await harvest();
    setIsHarvesting(false);
  };
  const anchor = useRef(null);

  const handleClaim = async () => {
    if (!account) {
      return;
    }
    setIsClaiming(true);
    await claim();
    setIsClaiming(false);
  };
  const renderInfoValue = (key: string) => {
    if (!userInfos) {
      return;
    }
    if (IS_BIG_NUMBER.includes(key)) {
      if (key === "rewardDebt") {
        return (
          <div className="space-y-0" key={key}>
            <div className="font-bold text-sm md:text-sm text-white">
              {USER_INFOS_LABEL_MAP[key]}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-secondary min-w-200 font-bold">
                {formatToUSD(formatUnits(userInfos?.[key], 18))} LOCKER
              </div>
            </div>
          </div>
        );
      }
      if (key === "pendingAmount") {
        return (
          <div className="space-y-0" key={key}>
            <div className="font-bold text-sm md:text-sm text-white">
              {USER_INFOS_LABEL_MAP[key]}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-secondary min-w-200 font-bold">
                {formatToUSD(formatUnits(userInfos?.[key], 18))} LOCKER
              </div>
              <div className="flex items-center">
                <Tooltip
                  followCursor={matchesDesktop}
                  title={
                    <>
                      <Countdown
                        zeroPadTime={2}
                        date={unstakeEndTime}
                        renderer={renderer(
                          Number(formatUnits(userInfos?.[key], 18) || 0)
                        )}
                      />
                      {Number(formatUnits(userInfos?.[key], 18) || 0) !== 0 && (
                        <div className="text-sm text-secondary">
                          Time Left to Claim
                        </div>
                      )}
                    </>
                  }
                >
                  <span
                    ref={anchor}
                    onClick={(e) => {
                      if (!matchesDesktop && !isAvailableToClaim) {
                        setIsDrawerOpen(true);
                      }
                    }}
                  >
                    <MUILoadingButton
                      variant="outlined"
                      size="small"
                      onClick={handleClaim}
                      loading={isClaiming}
                      loadingIndicator={"Loading..."}
                      disabled={
                        userInfos.pendingAmount.isZero() || !isAvailableToClaim
                      }
                    >
                      Claim
                    </MUILoadingButton>
                  </span>
                </Tooltip>
              </div>
            </div>
            {!isAvailableToClaim && !matchesDesktop && (
              <Portal>
                <CountdownDrawer
                  open={isDrawerOpen}
                  onClose={() => setIsDrawerOpen(false)}
                  anchor={"bottom"}
                >
                  <div className="p-4 flex flex-col items-center rounded-t-lg">
                    <Countdown
                      zeroPadTime={2}
                      date={unstakeEndTime}
                      renderer={renderer(
                        Number(formatUnits(userInfos?.[key], 18) || 0)
                      )}
                    />
                    {Number(formatUnits(userInfos?.[key], 18) || 0) !== 0 && (
                      <div className="text-sm text-secondary">
                        Time Left to Claim
                      </div>
                    )}
                  </div>
                </CountdownDrawer>
              </Portal>
            )}
          </div>
        );
      }
      if (key === "stakedAmount") {
        return (
          <div className="space-y-0" key={key}>
            <div className="font-bold text-sm md:text-sm text-white">
              {USER_INFOS_LABEL_MAP[key]}
            </div>
            <div className="flex items-center justify-between">
              <div className="text-lg text-secondary min-w-200 font-bold">
                {formatToUSD(formatUnits(userInfos?.[key], 18))} LOCKER
              </div>
              <div className="flex flex-col items-center space-y-1">
                <MUILoadingButton
                  disabled={userInfos.stakedAmount.isZero()}
                  variant="outlined"
                  size="small"
                  color="error"
                  onClick={openUnStakeDialog}
                >
                  Unstake
                </MUILoadingButton>
              </div>
            </div>
          </div>
        );
      }
      return (
        <div className="space-y-0" key={key}>
          <div className="font-bold text-sm md:text-sm text-white">
            {USER_INFOS_LABEL_MAP[key]}
          </div>
          <div className="text-lg text-secondary min-w-200 font-bold">
            {formatToUSD(formatUnits(userInfos?.[key], 18))} LOCKER
          </div>
        </div>
      );
    }
    if (key === "lastDepositTime") {
      return (
        <div className="space-y-0" key={key}>
          <div className="font-bold text-sm md:text-sm text-white">
            {USER_INFOS_LABEL_MAP[key]}
          </div>
          <time className="text-lg text-gray-500">
            {new Date(
              Number(formatUnits(userInfos.lastDepositTime, 0)) * 1000
            ).toLocaleString()}
          </time>
        </div>
      );
    }
    if (key === "unstakeStartTime") {
      return null;
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-col w-full">
        <div className="font-bold tracking-wider mx-auto">Locker Token</div>
        <div className="font-bold mx-auto text-2xl mb-3">Stake App</div>
        {isConnected && (
          <div className="space-x-6 flex items-center p-4 bg-black border-2 border-secondary rounded-md">
            <div className="space-y-0 flex-1">
              <div className="font-bold text-sm md:text-sm text-white">
                Reward Rate
              </div>
              <div className="text-xl md:text-xl text-secondary min-w-200 font-bold">
                {rewardRate || "0"}%
              </div>
            </div>
            <div className="space-y-0 flex-1">
              <div className="font-bold text-sm md:text-sm text-white">
                Total Staked
              </div>
              <div className="text-xl md:text-xl text-secondary min-w-200 font-bold">
                {totalStakedAmount ? formatToUSD(totalStakedAmount) : 0} LOCKER
              </div>
            </div>
          </div>
        )}
      </div>
      {isConnected && account && (
        <div className="flex flex-col w-full space-y-6 p-4 bg-black border-2 border-secondary rounded-md">
          <div className="space-y-3">
            <div className="font-bold text-sm md:text-lg text-white">
              Your Info ({account?.substr(0, 4)}...
              {account?.substr(account?.length - 4, 4)})
            </div>
            <div className="space-y-0">
              <div className="font-bold text-sm md:text-sm text-white">
                Your Balance
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg text-secondary min-w-200 font-bold">
                  {balance ? formatToUSD(balance) : 0} LOCKER
                </div>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    typeof window !== "undefined" &&
                      window.open(BUY_URL, "_blank");
                  }}
                >
                  Buy
                </Button>
              </div>
            </div>

            <div className="space-y-0">
              <div className="font-bold text-sm md:text-sm text-white">
                Rewards
              </div>
              <div className="flex items-center justify-between">
                <div className="text-lg text-secondary min-w-200 font-bold">
                  {formatToUSD(formatUnits(calcReward, 18))} LOCKER
                </div>
                <MUILoadingButton
                  disabled={calcReward.isZero()}
                  variant="outlined"
                  size="small"
                  onClick={handleHarvest}
                  loading={isHarvesting}
                  loadingIndicator={"Loading..."}
                >
                  Harvest
                </MUILoadingButton>
              </div>
            </div>
            {userInfos ? (
              <>
                {Object.keys(userInfos || {}).map(
                  (key) =>
                    Object.keys(USER_INFOS_LABEL_MAP).includes(key) &&
                    renderInfoValue(key)
                )}
              </>
            ) : (
              <div className="text-gray-600 min-w-200">
                You don't have any stake yet.
              </div>
            )}

            <LoadingButton disableElevation onClick={openStakeDialog}>
              Stake
            </LoadingButton>

            <a
              href="
https://etherscan.io/address/0x0000000000000000000000000000000000000000"
              target="_blank"
              rel="noreferrer noopener"
              className="underline mx-auto block text-center mt-4"
            >
              Stake Contract
            </a>
          </div>
        </div>
      )}
    </>
  );
}
