import { createTheme, ThemeOptions } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          primary: {
            main: '#1B75BB',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          secondary: {
            main: '#4CAF50',
            light: '#81c784',
            dark: '#388e3c',
          },
          background: {
            default: '#f5f5f5',
            paper: '#ffffff',
          },
        }
      : {
          // Dark mode
          primary: {
            main: '#1B75BB',
            light: '#42a5f5',
            dark: '#1565c0',
          },
          secondary: {
            main: '#4CAF50',
            light: '#81c784',
            dark: '#388e3c',
          },
          background: {
            default: '#121212',
            paper: '#1e1e1e',
          },
          text: {
            primary: 'rgba(255, 255, 255, 0.87)',
            secondary: 'rgba(255, 255, 255, 0.6)',
          },
        }),
  },
  typography: {
    fontFamily: '"Lexend", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : undefined,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#1e1e1e' : undefined,
          borderRight: mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : undefined,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'dark' ? '#242424' : undefined,
          boxShadow: mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.2)' : undefined,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

export const getTheme = (mode: PaletteMode) => createTheme(getDesignTokens(mode)); 