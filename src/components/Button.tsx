import { PropsWithChildren } from "react";
import { Button as MUIButton, ButtonProps, styled } from "@mui/material";
import MUILoadingButton, { LoadingButtonProps } from "@mui/lab/LoadingButton";

const StyledButton = styled(MUIButton)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  /* background-color: rgba(153, 27, 27, var(--tw-bg-opacity)); */
  padding: 12px 24px;
  min-width: 200px;
  width: 100%;
  text-transform: none;
`;
const StyledLoadingButton = styled(MUILoadingButton)`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-radius: 8px;
  /* background-color: rgba(153, 27, 27, var(--tw-bg-opacity)); */
  padding: 12px 24px;
  min-width: 200px;
  width: 100%;
  text-transform: none;
  /* &:hover {
    background-color: rgba(153, 27, 27, var(--tw-bg-opacity));
  } */
`;

export default function Button({
  children,
  ...props
}: PropsWithChildren<ButtonProps>) {
  return (
    <StyledButton variant="contained" {...props}>
      {children}
    </StyledButton>
  );
}

export function LoadingButton({
  children,
  ...props
}: PropsWithChildren<LoadingButtonProps>) {
  return (
    <StyledLoadingButton variant="contained" {...props}>
      {children}
    </StyledLoadingButton>
  );
}
