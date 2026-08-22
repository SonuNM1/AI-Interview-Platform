import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#7c3aed",
    },

    background: {
      default: "#0f0f14",
      paper: "#18181f",
    },
  },

  typography: {
    fontFamily: "Inter, sans-serif",
  },
});