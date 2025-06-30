import React, { useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { blue, green } from '@mui/material/colors';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings } = useSelector((state: RootState) => state.settings);
  
  // Determine theme mode based on settings or system preference
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const themeMode = useMemo(() => {
    if (settings.theme === 'system') {
      return prefersDarkMode ? 'dark' : 'light';
    }
    return settings.theme;
  }, [settings.theme, prefersDarkMode]);

  // Create theme
  const theme = useMemo(() => {
    return createTheme({
      palette: {
        mode: themeMode as 'light' | 'dark',
        primary: {
          main: blue[600],
        },
        secondary: {
          main: green[500],
        },
      },
      typography: {
        fontFamily: [
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ].join(','),
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 8,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 12,
              boxShadow: themeMode === 'dark' 
                ? '0 4px 20px 0 rgba(0,0,0,0.5)'
                : '0 4px 20px 0 rgba(0,0,0,0.1)',
            },
          },
        },
      },
    });
  }, [themeMode]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};

export default ThemeProvider; 