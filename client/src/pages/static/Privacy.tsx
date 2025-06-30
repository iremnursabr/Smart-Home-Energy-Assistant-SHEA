import React from 'react';
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
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import { 
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  Translate as TranslateIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Privacy: React.FC = () => {
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
          {t('footer.privacy')}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Typography variant="body1" paragraph>
          Bu Gizlilik Politikası, Akıllı Enerji Asistanı uygulamasının kişisel verilerinizi nasıl topladığını, 
          kullandığını ve koruduğunu açıklar. Uygulamamızı kullanarak, bu politikada belirtilen 
          veri uygulamalarını kabul etmiş olursunuz.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Topladığımız Bilgiler
        </Typography>
        <Typography variant="body1" paragraph>
          Kullanıcı hesabınız için gerekli kişisel bilgiler (ad, e-posta adresi vb.), 
          enerji tüketim verileri, cihaz bilgileri ve kullanım istatistikleri toplanmaktadır.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Verilerin Kullanımı
        </Typography>
        <Typography variant="body1" paragraph>
          Topladığımız verileri, hizmetlerimizi sunmak, kullanıcı deneyimini iyileştirmek ve 
          özelleştirilmiş enerji tasarrufu önerileri sağlamak için kullanırız.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Veri Güvenliği
        </Typography>
        <Typography variant="body1" paragraph>
          Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uygulanmaktadır. 
          Verileriniz şifreleme ile korunur ve yalnızca yetkili personelin erişimi vardır.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Veri Paylaşımı
        </Typography>
        <Typography variant="body1" paragraph>
          Verileriniz, sizin açık izniniz olmadan üçüncü taraflarla paylaşılmaz. 
          Yalnızca hizmet sağlayıcılarımız ve yasal zorunluluklarımız kapsamında veri paylaşımı yapılabilir.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Haklarınız
        </Typography>
        <Typography variant="body1" paragraph>
          Kişisel verilerinize erişim, düzeltme ve silme haklarına sahipsiniz. 
          Herhangi bir sorunuz veya talebiniz için lütfen iletişime geçin.
        </Typography>
        
        <Box sx={{ mt: 5 }}>
          <Typography variant="body2" color="text.secondary">
            Son güncelleme: {new Date().toLocaleDateString()}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Privacy; 