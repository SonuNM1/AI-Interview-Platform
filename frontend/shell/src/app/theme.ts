import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",

    background: {
      default: "#0B0A10",
      paper: "#121019",
    },

    primary: {
      main: "#8B5CF6",
      light: "#A78BFA",
      dark: "#6D28D9",
      contrastText: "#FFFFFF",
    },

    secondary: {
      main: "#D977A8",
      light: "#E5A4C2",
      dark: "#B4537F",
      contrastText: "#FFFFFF",
    },

    success: {
      main: "#6FCF97",
    },

    error: {
      main: "#E87979",
    },

    text: {
      primary: "#F4F1F7",
      secondary: "#A8A3B0",
    },

    divider: "#2A2633",
  },

  shape: {
    borderRadius: 12,
  },

  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',

    h1: {
      fontWeight: 700,
    },

    h2: {
      fontWeight: 700,
    },

    h3: {
      fontWeight: 700,
    },

    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },

  components: {
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },

    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "#121019",

          "& fieldset": {
            borderColor: "#2A2633",
          },

          "&:hover fieldset": {
            borderColor: "#51495F",
          },

          "&.Mui-focused fieldset": {
            borderColor: "#8B5CF6",
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
        },
      },
    },
  },
});