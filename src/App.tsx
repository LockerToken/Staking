import { AlertSnackbar } from "./components/Snackbar";
import WalletConnectDialog from "./components/WalletConnectDialog";
import Stake from "./components/Stake";
import useNetworkListener from "./lib/hooks/useNetworkListener";
import AccountInfo from "./components/AccountInfo";
import Footer from "./components/Footer";
import StakeDialog from "./components/StakeDialog";
import UnstakeDialog from "./components/UnstakeDialog";
import "@fontsource/tauri";

function App() {
  useNetworkListener();

  return (
    <>
      <div className="relative w-full min-h-screen flex justify-center items-center bg-main z-20">
        <div className="relative group">
          <div className="absolute animate-pulse -inset-0.5 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
          <div className="my-4 md:my-0 mx-4 sm:mx-0 min-w-card w-full sm:w-auto relative z-30 backdrop-blur h-full flex flex-col items-center text-white rounded-2xl bg-gradient-to-b from-background-top to-background-bottom bg-card">
            <div className="p-4 sm:p-8 space-y-4 flex flex-col w-full items-center">
              <Stake />
              <AccountInfo />
              <Footer />
            </div>
          </div>
        </div>
      </div>
      <WalletConnectDialog />
      <AlertSnackbar />
      <StakeDialog />
      <UnstakeDialog />
    </>
  );
}

export default App;
