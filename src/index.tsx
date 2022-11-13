import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {  DAppProvider, DAppProviderProps, Mainnet } from "@usedapp/core";
import { ThemeProvider } from "@mui/material";
import { theme } from "./lib/theme";
import { getDefaultProvider } from "ethers";

const config: DAppProviderProps["config"] = {
  networks: [Mainnet],
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Mainnet.chainId]: getDefaultProvider("mainnet"),
  },
};

// @ts-ignore
const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

root.render(
  <ThemeProvider theme={theme}>
    <DAppProvider config={config}>
      <App />
    </DAppProvider>
  </ThemeProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
