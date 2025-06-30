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
  List,
  ListItem,
  ListItemText,
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

const Terms: React.FC = () => {
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
          {t('footer.terms')}
        </Typography>
        <Divider sx={{ mb: 4 }} />
        
        <Typography variant="body1" paragraph>
          Akıllı Enerji Asistanı uygulamasını kullanarak aşağıdaki kullanım şartlarını kabul etmiş olursunuz.
          Lütfen bu şartları dikkatlice okuyun.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Hizmet Kullanımı
        </Typography>
        <Typography variant="body1" paragraph>
          Akıllı Enerji Asistanı, enerji tüketiminizi izlemenize, yönetmenize ve optimize etmenize 
          yardımcı olan bir hizmettir. Uygulama yalnızca bilgi amaçlıdır ve bir enerji tedarikçisi 
          veya danışmanlık hizmeti değildir.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Hesap Yükümlülükleri
        </Typography>
        <Typography variant="body1" paragraph>
          Hesap oluşturduğunuzda, doğru, eksiksiz ve güncel bilgiler sağlamakla yükümlüsünüz. 
          Hesabınızın güvenliğinden ve hesabınız altında gerçekleşen tüm etkinliklerden siz sorumlusunuz.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Fikri Mülkiyet
        </Typography>
        <Typography variant="body1" paragraph>
          Uygulama ve içeriği, telif hakkı, ticari marka ve diğer fikri mülkiyet hakları ile korunmaktadır. 
          İzinsiz kopyalama, değiştirme veya dağıtım yasaktır.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Kullanım Kısıtlamaları
        </Typography>
        <List sx={{ pl: 2 }}>
          <ListItem>
            <ListItemText primary="Yasalara aykırı veya zararlı amaçlarla hizmeti kullanmayın." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Sistemin güvenliğini ihlal etmeyin veya aşırı yük bindirmeyin." />
          </ListItem>
          <ListItem>
            <ListItemText primary="Diğer kullanıcıların hizmeti kullanmasını engellemeyin." />
          </ListItem>
          <ListItem>
            <ListItemText primary="İzinsiz reklam veya promosyon materyalleri dağıtmayın." />
          </ListItem>
        </List>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Sorumluluk Reddi
        </Typography>
        <Typography variant="body1" paragraph>
          Hizmet "olduğu gibi" sağlanır ve belirli bir amaca uygunluk veya kesintisiz 
          erişim dahil olmak üzere hiçbir garanti verilmez. Uygulama tarafından sağlanan öneriler ve tahminler 
          tahmini değerlerdir ve gerçek enerji tasarrufunuz farklılık gösterebilir.
        </Typography>
        
        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          Şartlarda Değişiklik
        </Typography>
        <Typography variant="body1" paragraph>
          Bu kullanım şartlarını herhangi bir zamanda güncelleme hakkını saklı tutarız. 
          Değişiklikler uygulamada veya web sitemizde yayınlandıktan sonra geçerli olacaktır.
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

export default Terms; 