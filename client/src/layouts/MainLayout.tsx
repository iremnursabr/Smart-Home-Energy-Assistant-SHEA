import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { setTheme, setLanguage } from '../store/slices/settingsSlice';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery,
  Badge,
  Breadcrumbs,
  Link,
  ListItemButton,
  Container,
  Button,
  Stack,
  Grid,
  TextField,
  Paper
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Dashboard as DashboardIcon,
  DevicesOther as DevicesIcon,
  BoltOutlined as EnergyIcon,
  Receipt as InvoiceIcon,
  EmojiObjects as SuggestionIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Language as LanguageIcon,
  Home as HomeIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Bolt as BoltIcon,
  Translate as TranslateIcon,
  QuestionAnswer as SurveyIcon,
  Chat as ChatIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { styled } from '@mui/material/styles';

// Drawer width
const drawerWidth = 240;

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
}));

const NavLink = styled(RouterLink)(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  marginLeft: theme.spacing(3),
  padding: '8px 16px',
  borderRadius: '4px',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.primary.main,
  },
}));

const MainLayout: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { user } = useSelector((state: RootState) => state.auth);
  const settingsState = useSelector((state: RootState) => state.settings);
  const currentTheme = settingsState.settings?.theme || 'light';
  
  // Local state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [platformMenu, setPlatformMenu] = useState<null | HTMLElement>(null);
  const [industriesMenu, setIndustriesMenu] = useState<null | HTMLElement>(null);
  const [resourcesMenu, setResourcesMenu] = useState<null | HTMLElement>(null);
  const [languageMenu, setLanguageMenu] = useState<null | HTMLElement>(null);
  const [notificationsMenu, setNotificationsMenu] = useState<null | HTMLElement>(null);
  const [profileMenu, setProfileMenu] = useState<null | HTMLElement>(null);
  
  // Handle drawer toggle
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };
  
  // Handle platform menu open
  const handleOpenPlatformMenu = (event: React.MouseEvent<HTMLElement>) => {
    setPlatformMenu(event.currentTarget);
  };
  
  // Handle platform menu close
  const handleClosePlatformMenu = () => {
    setPlatformMenu(null);
  };
  
  // Handle industries menu open
  const handleOpenIndustriesMenu = (event: React.MouseEvent<HTMLElement>) => {
    setIndustriesMenu(event.currentTarget);
  };
  
  // Handle industries menu close
  const handleCloseIndustriesMenu = () => {
    setIndustriesMenu(null);
  };
  
  // Handle resources menu open
  const handleOpenResourcesMenu = (event: React.MouseEvent<HTMLElement>) => {
    setResourcesMenu(event.currentTarget);
  };
  
  // Handle resources menu close
  const handleCloseResourcesMenu = () => {
    setResourcesMenu(null);
  };
  
  // Handle language menu open
  const handleOpenLanguageMenu = (event: React.MouseEvent<HTMLElement>) => {
    setLanguageMenu(event.currentTarget);
  };
  
  // Handle language menu close
  const handleCloseLanguageMenu = () => {
    setLanguageMenu(null);
  };
  
  // Handle notifications menu open
  const handleOpenNotificationsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsMenu(event.currentTarget);
  };
  
  // Handle notifications menu close
  const handleCloseNotificationsMenu = () => {
    setNotificationsMenu(null);
  };
  
  // Handle profile menu open
  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setProfileMenu(event.currentTarget);
  };
  
  // Handle profile menu close
  const handleCloseProfileMenu = () => {
    setProfileMenu(null);
  };
  
  // Handle language change
  const handleLanguageChange = (lang: 'en' | 'tr') => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
    handleCloseLanguageMenu();
  };
  
  // Handle logout
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleCloseProfileMenu();
  };
  
  // Handle navigation
  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };
  
  // Navigation items
  const navItems = user?.role === 'admin'
    ? [{ text: 'Admin Panel', icon: <SettingsIcon />, path: '/admin' }]
    : [
        { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/dashboard' },
        { text: t('navigation.devices'), icon: <DevicesIcon />, path: '/devices' },
        { text: t('navigation.energy'), icon: <EnergyIcon />, path: '/energy' },
        { text: t('navigation.invoices'), icon: <InvoiceIcon />, path: '/invoices' },
        { text: t('navigation.suggestions'), icon: <SuggestionIcon />, path: '/suggestions' },
        { text: t('navigation.assistant'), icon: <ChatIcon />, path: '/assistant' },
        { text: t('navigation.survey'), icon: <SurveyIcon />, path: '/survey' },
        { text: t('navigation.profile'), icon: <ProfileIcon />, path: '/profile' }
      ];
  
  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    
    return (
      <Breadcrumbs aria-label="breadcrumb">
        <Link 
          color="inherit" 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          {t('navigation.home')}
        </Link>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          
          // Convert path to readable text
          let breadcrumbName = name;
          if (name === 'dashboard') breadcrumbName = t('navigation.dashboard');
          else if (name === 'devices') breadcrumbName = t('navigation.devices');
          else if (name === 'energy') breadcrumbName = t('navigation.energy');
          else if (name === 'invoices') breadcrumbName = t('navigation.invoices');
          else if (name === 'suggestions') breadcrumbName = t('navigation.suggestions');
          else if (name === 'assistant') breadcrumbName = t('navigation.assistant');
          else if (name === 'survey') breadcrumbName = t('navigation.survey');
          else if (name === 'profile') breadcrumbName = t('navigation.profile');
          
          return isLast ? (
            <Typography color="text.primary" key={routeTo}>
              {breadcrumbName}
            </Typography>
          ) : (
            <Link
              color="inherit"
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigate(routeTo);
              }}
              key={routeTo}
            >
              {breadcrumbName}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, setMenu: (el: HTMLElement | null) => void) => {
    setMenu(event.currentTarget);
  };

  const handleMenuClose = (setMenu: (el: HTMLElement | null) => void) => {
    setMenu(null);
  };
  
  // Handle home navigation
  const handleHomeNavigation = () => {
    navigate('/');
  };
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: theme.palette.mode === 'dark' ? '#1a1a1a' : theme.palette.primary.main,
          boxShadow: theme.palette.mode === 'dark' ? '0 2px 8px rgba(0,0,0,0.3)' : undefined
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }} onClick={handleHomeNavigation}>
              <BoltIcon sx={{ mr: 1 }} />
              <Typography
                variant="h6"
                noWrap
                sx={{
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                }}
              >
                {t('common.appName')}
              </Typography>
            </Box>

            {/* Mobile Menu Button */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1 }} />

            {/* Theme Toggle */}
            <IconButton 
              onClick={handleThemeToggle} 
              color="inherit"
              sx={{ mr: 2 }}
            >
              {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>

            {/* Language Selector */}
            <Tooltip title={t('settings.language')}>
              <IconButton color="inherit" onClick={handleOpenLanguageMenu}>
                <TranslateIcon />
              </IconButton>
            </Tooltip>
            <Menu
              id="language-menu"
              anchorEl={languageMenu}
              open={Boolean(languageMenu)}
              onClose={handleCloseLanguageMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => handleLanguageChange('en')}>English</MenuItem>
              <MenuItem onClick={() => handleLanguageChange('tr')}>Türkçe</MenuItem>
            </Menu>

            {/* Notifications */}
            <Tooltip title={t('notifications.title')}>
              <IconButton color="inherit" onClick={handleOpenNotificationsMenu}>
                <Badge badgeContent={0} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Menu
              id="notifications-menu"
              anchorEl={notificationsMenu}
              open={Boolean(notificationsMenu)}
              onClose={handleCloseNotificationsMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={handleCloseNotificationsMenu}>
                {t('notifications.noNewNotifications')}
              </MenuItem>
            </Menu>

            {/* Profile Menu */}
            <Tooltip title={user?.username || ''}>
              <IconButton onClick={handleOpenProfileMenu} sx={{ p: 0, ml: 2 }}>
                <Avatar alt={user?.username} src="/static/images/avatar/2.jpg" />
              </IconButton>
            </Tooltip>
            <Menu
              id="profile-menu"
              anchorEl={profileMenu}
              open={Boolean(profileMenu)}
              onClose={handleCloseProfileMenu}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem onClick={() => {
                navigate('/profile');
                handleCloseProfileMenu();
              }}>
                <ListItemIcon>
                  <ProfileIcon fontSize="small" />
                </ListItemIcon>
                {t('nav.profile')}
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                {t('auth.logout')}
              </MenuItem>
            </Menu>
          </Toolbar>
        </Container>
      </AppBar>
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        {/* Drawer */}
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : drawerOpen}
          onClose={handleDrawerToggle}
          sx={{
            width: drawerOpen ? drawerWidth : 72,
            flexShrink: 0,
            position: 'relative',
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : 72,
              boxSizing: 'border-box',
              bgcolor: theme.palette.mode === 'dark' ? '#242424' : undefined,
              borderRight: theme.palette.mode === 'dark' ? '1px solid rgba(255,255,255,0.1)' : undefined,
              overflowX: 'hidden',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              zIndex: theme.zIndex.drawer,
            },
          }}
        >
          <Toolbar />
          {/* Toggle drawer button when not mobile */}
          {!isMobile && (
            <IconButton
              onClick={handleDrawerToggle}
              sx={{
                mx: 'auto',
                my: 1
              }}
            >
              {drawerOpen ? <ChevronLeftIcon /> : <MenuIcon />}
            </IconButton>
          )}
          <Divider />
          <Box sx={{ overflow: 'auto', mt: 1 }}>
            <List>
              {navItems.map((item) => (
                <ListItem key={item.path} disablePadding>
                  <ListItemButton
                    onClick={() => handleNavigation(item.path)}
                    selected={location.pathname === item.path}
                    sx={{
                      minHeight: 48,
                      justifyContent: drawerOpen ? 'initial' : 'center',
                      px: 2.5,
                      '&.Mui-selected': {
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                        '&:hover': {
                          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
                        }
                      }
                    }}
                  >
                    <ListItemIcon 
                      sx={{ 
                        minWidth: 0, 
                        mr: drawerOpen ? 3 : 'auto', 
                        justifyContent: 'center',
                        color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.7)' : undefined 
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    {drawerOpen && <ListItemText primary={item.text} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Drawer>
        
        {/* Main Content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            pt: { xs: 2, sm: 2 },
            minHeight: '100vh',
            width: { sm: `calc(100% - ${drawerOpen ? drawerWidth : 72}px)` },
            ml: { sm: 0 },
            position: 'relative',
            zIndex: theme.zIndex.drawer - 1,
            transition: theme.transitions.create(['width', 'margin-left'], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          {/* Breadcrumbs */}
          <Box sx={{ mb: 3, mt: { xs: 7, sm: 8 } }}>
            <Paper sx={{ p: 2, borderRadius: 1, boxShadow: 1 }}>
              {generateBreadcrumbs()}
            </Paper>
          </Box>
          
          {/* Page Content */}
          <Outlet />
        </Box>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 5,
          backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#f5f5f5',
          borderTop: '1px solid',
          borderColor: 'divider',
          mt: 'auto',
          position: 'relative',
          zIndex: theme.zIndex.drawer - 1
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Company Info */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                {t('common.appName')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('footer.address')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {t('footer.phone')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('footer.email')}
              </Typography>
            </Grid>

            {/* Quick Links */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                {t('footer.links')}
              </Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/dashboard" color="inherit" underline="hover">
                  {t('navigation.dashboard')}
                </Link>
                <Link component={RouterLink} to="/devices" color="inherit" underline="hover">
                  {t('navigation.devices')}
                </Link>
                <Link component={RouterLink} to="/energy" color="inherit" underline="hover">
                  {t('navigation.energy')}
                </Link>
              </Stack>
            </Grid>

            {/* Resources */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                {t('footer.links')}
              </Typography>
              <Stack spacing={1}>
                <Link component={RouterLink} to="/suggestions" color="inherit" underline="hover">
                  {t('navigation.suggestions')}
                </Link>
                <Link component={RouterLink} to="/invoices" color="inherit" underline="hover">
                  {t('navigation.invoices')}
                </Link>
                <Link component={RouterLink} to="/profile" color="inherit" underline="hover">
                  {t('navigation.profile')}
                </Link>
              </Stack>
            </Grid>

            {/* Newsletter */}
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                {t('footer.newsletter')}
              </Typography>
              <Box
                component="form"
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 1,
                }}
              >
                <TextField
                  required
                  fullWidth
                  id="email"
                  label={t('auth.email')}
                  name="email"
                  autoComplete="email"
                  size="small"
                  sx={{ mb: { xs: 1, sm: 0 } }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    whiteSpace: 'nowrap',
                    minWidth: { sm: '120px' }
                  }}
                >
                  {t('footer.subscribe')}
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Footer */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'center', sm: 'center' },
              gap: 2
            }}
          >
            <Typography variant="body2" color="text.secondary" align="center">
              © {new Date().getFullYear()} {t('common.appName')}, {t('footer.allRightsReserved')}
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout; 