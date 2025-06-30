import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ThemeProvider, createTheme, CssBaseline, PaletteMode, ThemeOptions } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { RootState, AppDispatch } from './store';
import { fetchUserProfile } from './store/slices/authSlice';
import { setLanguage } from './store/slices/settingsSlice';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Devices from './pages/Devices';
import DeviceDetail from './pages/DeviceDetail';
import DeviceAdd from './pages/devices/DeviceAdd';
import EnergyConsumption from './pages/EnergyConsumption';
import Invoices from './pages/Invoices';
import InvoiceDetail from './pages/InvoiceDetail';
import InvoiceAdd from './pages/invoices/InvoiceAdd';
import Suggestions from './pages/Suggestions';
import Assistant from './pages/Assistant';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import Survey from './pages/Survey';
import AdminPanel from './pages/Admin/AdminPanel';

// Static Pages
import Privacy from './pages/static/Privacy';
import Terms from './pages/static/Terms';
import Contact from './pages/static/Contact';

// Tema tanımları
const getThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    primary: {
      main: '#1B75BB',
      light: '#3D97DD',
      dark: '#145C94',
    },
    secondary: {
      main: '#4CAF50',
      light: '#6FBF73',
      dark: '#388E3C',
    },
    background: {
      default: mode === 'light' ? '#FFFFFF' : '#121212',
      paper: mode === 'light' ? '#F5F5F5' : '#1e1e1e',
    },
    text: {
      primary: mode === 'light' ? '#333333' : '#ffffff',
      secondary: mode === 'light' ? '#666666' : '#b0b0b0',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);
  const { settings } = useSelector((state: RootState) => state.settings);
  
  // Loading state while checking authentication
  const [checking, setChecking] = useState(true);
  
  // Check if user is authenticated on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Session yoksa veya kullanıcı henüz authenticate olmamışsa profile bilgilerini getir
        if (!isAuthenticated) {
          await dispatch(fetchUserProfile());
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
      } finally {
        setChecking(false);
      }
    };
    
    checkAuth();
  }, [dispatch, isAuthenticated]);
  
  // Update language based on settings
  useEffect(() => {
    if (settings?.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings?.language]);
  
  // Create theme based on settings
  const themeMode = settings?.theme === 'dark' ? 'dark' : 'light';
  const theme = createTheme(getThemeOptions(themeMode as PaletteMode));
  
  // Show loading screen while checking authentication
  if (checking || isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh' 
        }}>
          <img 
            src="/logo192.png" 
            alt="Smart Energy Assistant" 
            style={{ 
              width: '150px', 
              height: 'auto',
              animation: 'pulse 1.5s infinite ease-in-out'
            }} 
          />
          <style>
            {`
              @keyframes pulse {
                0% { opacity: 0.6; }
                50% { opacity: 1; }
                100% { opacity: 0.6; }
              }
            `}
          </style>
        </div>
      </ThemeProvider>
    );
  }
  
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Public Landing Page */}
          <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
          
          {/* Auth Routes */}
          <Route element={<AuthLayout />}>
            <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
            <Route path="/register" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} />
            <Route path="/forgot-password" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <ForgotPassword />} />
            
            {/* Static Pages for Footer Links */}
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<Contact />} />
          </Route>
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/devices" element={<Devices />} />
              <Route path="/devices/add" element={<DeviceAdd />} />
              <Route path="/devices/:id/edit" element={<div>Cihaz Düzenleme Sayfası</div>} />
              <Route path="/devices/:id" element={<DeviceDetail />} />
              <Route path="/energy" element={<EnergyConsumption />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/add" element={<InvoiceAdd />} />
              <Route path="/invoices/:id/edit" element={<div>Fatura Düzenleme Sayfası</div>} />
              <Route path="/invoices/:id" element={<InvoiceDetail />} />
              <Route path="/suggestions" element={<Suggestions />} />
              <Route path="/assistant" element={<Assistant />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/survey" element={<Survey />} />
              <Route path="/admin" element={<AdminPanel />} />
            </Route>
          </Route>
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ThemeProvider>
    </I18nextProvider>
  );
};

export default App; 