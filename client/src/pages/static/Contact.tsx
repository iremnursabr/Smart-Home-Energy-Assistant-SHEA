import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { setTheme, setLanguage } from '../../store/slices/settingsSlice';
import { 
  Box, 
  Typography, 
  Container, 
  Paper,
  Divider,
  TextField,
  Button,
  Grid,
  Snackbar,
  Alert,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import { 
  Send as SendIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Contact: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  
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
  
  const handleHomeNavigation = () => {
    navigate('/');
  };
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name) {
      errors.name = t('errors.required', { field: t('contact.name') });
    }
    
    if (!formData.email) {
      errors.email = t('errors.required', { field: t('auth.email') });
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('errors.email');
    }
    
    if (!formData.subject) {
      errors.subject = t('errors.required', { field: t('contact.subject') });
    }
    
    if (!formData.message) {
      errors.message = t('errors.required', { field: t('contact.message') });
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      console.log('Form submitted:', formData);
      setSubmitSuccess(true);
      
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(true);
    }
  };
  
  const handleCloseSnackbar = () => {
    setSubmitSuccess(false);
    setSubmitError(false);
  };

  return (
    <Container maxWidth="md">
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
      
      <Paper elevation={3} sx={{ p: 6, my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {t('footer.contact')}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Grid container spacing={6}>
          <Grid item xs={12} md={5}>
            <Typography variant="h6" gutterBottom>
              {t('contact.getInTouch')}
            </Typography>
            <Typography variant="body1" paragraph>
              {t('contact.description')}
            </Typography>
            
            <Box sx={{ mt: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <LocationIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">
                  {t('footer.address')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PhoneIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">
                  {t('footer.phone')}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <EmailIcon color="primary" sx={{ mr: 2 }} />
                <Typography variant="body1">
                  {t('footer.email')}
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={7}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="name"
                    label={t('contact.name')}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="email"
                    label={t('auth.email')}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="subject"
                    label={t('contact.subject')}
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!formErrors.subject}
                    helperText={formErrors.subject}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="message"
                    label={t('contact.message')}
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    error={!!formErrors.message}
                    helperText={formErrors.message}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    endIcon={<SendIcon />}
                    sx={{ mt: 2 }}
                  >
                    {t('contact.send')}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      
      <Snackbar
        open={submitSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success">
          {t('contact.messageSent')}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={submitError}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error">
          {t('contact.messageFailed')}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Contact; 