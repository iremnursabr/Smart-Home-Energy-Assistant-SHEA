import React from 'react';
import { Outlet, Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import {
  Box,
  Container,
  Paper,
  Typography,
  Link,
  Grid,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { setTheme, setLanguage } from '../store/slices/settingsSlice';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const AuthLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Redux state
  const settingsState = useSelector((state: RootState) => state.settings);
  const currentTheme = settingsState.settings?.theme || 'light';
  
  // Language menu
  const [langAnchorEl, setLangAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };
  
  const handleCloseLangMenu = () => {
    setLangAnchorEl(null);
  };
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };
  
  // Handle language change
  const handleLanguageChange = (lang: 'en' | 'tr') => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
    handleCloseLangMenu();
  };
  
  // Handle home navigation
  const handleHomeNavigation = () => {
    navigate('/');
  };
  
  // Container size based on route
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        position: 'relative'
      }}
    >
      {/* Language and Theme Toggles */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 1,
          display: 'flex',
          gap: 1
        }}
      >
        <Tooltip title={t('nav.home')}>
          <IconButton color="primary" onClick={handleHomeNavigation}>
            <HomeIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title={t('settings.language')}>
          <IconButton color="primary" onClick={handleOpenLangMenu}>
            <TranslateIcon />
          </IconButton>
        </Tooltip>
        <Menu
          anchorEl={langAnchorEl}
          open={Boolean(langAnchorEl)}
          onClose={handleCloseLangMenu}
        >
          <MenuItem onClick={() => handleLanguageChange('en')}>
            English
          </MenuItem>
          <MenuItem onClick={() => handleLanguageChange('tr')}>
            Türkçe
          </MenuItem>
        </Menu>
        
        <Tooltip title={currentTheme === 'light' ? t('settings.darkMode') : t('settings.lightMode')}>
          <IconButton color="primary" onClick={handleThemeToggle}>
            {currentTheme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      
      <Container 
        component="main" 
        maxWidth={isAuthPage ? "sm" : "md"}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          flexGrow: 1,
          py: 6
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 6, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            borderRadius: 2
          }}
        >
          <Typography 
            component="h1" 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.main',
              mb: 3
            }}
          >
            {t('app.title')}
          </Typography>
          
          <Box sx={{ width: '100%' }}>
            <Outlet />
          </Box>
        </Paper>
        
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} {t('app.title')}
          </Typography>
          <Grid container justifyContent="center" spacing={2} sx={{ mt: 1 }}>
            <Grid item>
              <Link component={RouterLink} to="/privacy" variant="body2">
                {t('footer.privacy')}
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/terms" variant="body2">
                {t('footer.terms')}
              </Link>
            </Grid>
            <Grid item>
              <Link component={RouterLink} to="/contact" variant="body2">
                {t('footer.contact')}
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthLayout; 