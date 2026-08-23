import {
  Toaster as SonnerToaster,
  toast as sonnerToast,
} from "sonner";

export const toast = {
  success: (message: string) => {
    sonnerToast.success(message);
  },

  error: (message: string) => {
    sonnerToast.error(message);
  },

  info: (message: string) => {
    sonnerToast.info(message);
  },

  warning: (message: string) => {
    sonnerToast.warning(message);
  },
};

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      theme="dark"
      richColors
      closeButton
      duration={4000}
    />
  );
}