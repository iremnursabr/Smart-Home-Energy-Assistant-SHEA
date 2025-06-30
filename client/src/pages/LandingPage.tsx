import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setLanguage, setTheme } from '../store/slices/settingsSlice';
import { AppDispatch, RootState } from '../store';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  useMediaQuery,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuItem
} from '@mui/material';
import {
  BoltOutlined as EnergyIcon,
  DevicesOutlined as DevicesIcon,
  MonetizationOnOutlined as BillingIcon,
  TipsAndUpdatesOutlined as TipsIcon,
  Translate as TranslateIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const dispatch = useDispatch<AppDispatch>();
  const { settings } = useSelector((state: RootState) => state.settings);
  
  // Logo slider ref
  const sliderRef = useRef<HTMLDivElement>(null);
  
  // Language menu
  const [anchorElLang, setAnchorElLang] = useState<null | HTMLElement>(null);
  
  const handleOpenLangMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElLang(event.currentTarget);
  };
  
  const handleCloseLangMenu = () => {
    setAnchorElLang(null);
  };
  
  // Handle language change
  const handleLanguageChange = (lang: 'en' | 'tr') => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
    handleCloseLangMenu();
  };
  
  // Handle theme toggle
  const handleThemeToggle = () => {
    const newTheme = theme.palette.mode === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
  };

  // Partner logos
  const partnerLogos = [
    '/images/partner1.png',
    '/images/partner2.png',
    '/images/partner3.png',
    '/images/partner4.png',
    '/images/partner5.png',
    '/images/partner6.png',
    '/images/partner7.png',
    '/images/partner8.png',
  ];

  const features = [
    {
      title: t('landing.monitorEnergy'),
      description: t('landing.monitorEnergyDesc'),
      icon: <EnergyIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      image: '/images/energy-chart.jpg'
    },
    {
      title: t('landing.manageDevices'),
      description: t('landing.manageDevicesDesc'),
      icon: <DevicesIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      image: '/images/smart-devices.jpg'
    },
    {
      title: t('landing.optimizeBills'),
      description: t('landing.optimizeBillsDesc'),
      icon: <BillingIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      image: '/images/billing.jpg'
    },
    {
      title: t('landing.personalizedSuggestions'),
      description: t('landing.personalizedSuggestionsDesc'),
      icon: <TipsIcon sx={{ fontSize: 60, color: 'primary.main' }} />,
      image: '/images/tips.jpg'
    }
  ];

  return (
    <Box sx={{ 
      bgcolor: 'background.default', 
      minHeight: '100vh', 
      position: 'relative',
      fontFamily: '"Lexend", "Roboto", Arial, sans-serif' 
    }}>
      {/* Header with Logo, Controls and Auth Buttons */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        {/* Logo on the left */}
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          sx={{ 
            color: 'white',
            letterSpacing: '0.1em'
          }}
        >
          SHEA
        </Typography>
        
        {/* Controls and buttons on the right */}
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title={t('settings.language')}>
            <IconButton color="inherit" onClick={handleOpenLangMenu} sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
            }}>
              <TranslateIcon />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorElLang}
            open={Boolean(anchorElLang)}
            onClose={handleCloseLangMenu}
          >
            <MenuItem onClick={() => handleLanguageChange('en')}>
              English
            </MenuItem>
            <MenuItem onClick={() => handleLanguageChange('tr')}>
              Türkçe
            </MenuItem>
          </Menu>
          
          <Tooltip title={theme.palette.mode === 'light' ? t('settings.dark') : t('settings.light')}>
            <IconButton color="inherit" onClick={handleThemeToggle} sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              color: 'white',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } 
            }}>
              {theme.palette.mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
          
          <Button 
            variant="outlined" 
            size="small" 
            onClick={() => navigate('/login')}
            sx={{ ml: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'white' }}
          >
            {t('landing.login')}
          </Button>
          <Button 
            variant="contained" 
            size="small" 
            onClick={() => navigate('/register')}
            color="secondary"
            sx={{ ml: 1, borderRadius: 2, fontWeight: 'bold' }}
          >
            {t('landing.tryFree')}
          </Button>
        </Box>
      </Box>
      
      {/* Hero Section */}
      <Box 
        sx={{ 
          py: 8,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(45deg, #0d47a1 30%, #1565c0 90%)' 
            : 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
          color: 'white'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                fontWeight="bold"
                gutterBottom
                sx={{ 
                  mt: 6,
                  fontFamily: '"Lexend", sans-serif' 
                }}
              >
                {t('landing.hero.title')}
              </Typography>
              <Typography 
                variant="h5" 
                paragraph 
                sx={{ 
                  mb: 4, 
                  fontWeight: 500,
                  fontFamily: '"Lexend", sans-serif'
                }}
              >
                {t('landing.heroSubtitle')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button 
                  variant="contained" 
                  size="large" 
                  onClick={() => navigate('/register')}
                  color="secondary"
                  sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
                >
                  {t('landing.tryFree')}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                component="img"
                src="/images/hero-image.png"
                alt="Smart Energy Management"
                sx={{ 
                  width: '100%', 
                  maxWidth: 300, 
                  height: 'auto',
                  display: { xs: 'none', md: 'block' },
                  mx: 'auto',
                  filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.2))',
                  transform: 'translateY(-10px)'
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Partner Logos Slider */}
      <Box sx={{ 
        py: 4, 
        bgcolor: theme.palette.background.paper,
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Typography 
          variant="h6" 
          component="h3" 
          align="center" 
          fontWeight="medium"
          sx={{ mb: 3, color: 'text.secondary' }}
        >
          {t('landing.partners.trustedPartners')}
        </Typography>
        
        <Box 
          ref={sliderRef}
          sx={{
            display: 'flex',
            width: '100%',
            overflow: 'hidden',
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              width: 100,
              height: '100%',
              top: 0,
              zIndex: 1,
            },
            '&::before': {
              left: 0,
              background: `linear-gradient(to right, ${theme.palette.background.paper}, transparent)`,
            },
            '&::after': {
              right: 0,
              background: `linear-gradient(to left, ${theme.palette.background.paper}, transparent)`,
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              animation: 'slide 40s linear infinite',
              minWidth: '100%',
              width: 'auto',
              '@keyframes slide': {
                '0%': {
                  transform: 'translateX(0)'
                },
                '100%': {
                  transform: 'translateX(-50%)'
                }
              },
              '& img': {
                height: 70,
                objectFit: 'contain',
                mx: 5,
                filter: theme.palette.mode === 'dark' ? 'brightness(0.8) grayscale(0.5)' : 'grayscale(0.5)',
                opacity: 0.8,
                transition: 'all 0.3s ease',
                '&:hover': {
                  filter: 'none',
                  opacity: 1
                }
              }
            }}
          >
            {/* Triple the logos for smoother continuous loop */}
            {[...partnerLogos, ...partnerLogos, ...partnerLogos].map((logo, index) => (
              <img key={index} src={logo} alt={`Partner ${index % partnerLogos.length + 1}`} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h2" 
          component="h2" 
          textAlign="center" 
          fontWeight="bold" 
          gutterBottom
          color="primary"
        >
          {i18n.language === 'tr' ? 'Neler Sunuyoruz' : 'What We Offer'}
        </Typography>
        
        <Grid container spacing={5}>
          {/* Enerji Tüketim İzleme ve Analiz */}
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 4, 
                borderRadius: 2,
                background: theme.palette.background.default,
                mb: 5
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                  <Typography variant="h4" component="h3" fontWeight="bold" gutterBottom color="primary">
                    {i18n.language === 'tr' ? 'Enerji Tüketim İzleme' : 'Energy Consumption Monitoring'}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      {i18n.language === 'tr' ? 'Detaylı ve gerçek zamanlı' : 'Detailed and real-time'}
                    </Box> {i18n.language === 'tr' 
                      ? 'Detaylı ve gerçek zamanlı cihaz bazlı izleme ile enerji tüketiminizi takip edin. Günlük, haftalık ve aylık raporlarla tüketim alışkanlıklarınızı analiz edin.' 
                      : 'Track your energy consumption with detailed and real-time device-based monitoring. Analyze your consumption habits with daily, weekly, and monthly reports.'}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        {i18n.language === 'tr' 
                          ? t('landing.featureItem1_1')
                          : 'Identify energy vampires with device-based consumption analysis'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        {i18n.language === 'tr'
                          ? t('landing.featureItem1_2')
                          : 'Easily understand your consumption data with visual graphs'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        {i18n.language === 'tr'
                          ? t('landing.featureItem1_3')
                          : 'Analyze any period with date range filtering'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                  <Box
                    component="img"
                    src="/images/energy-monitoring.png"
                    alt="Enerji Tüketim İzleme"
                    sx={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Kişiselleştirilmiş Tasarruf Önerileri */}
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 4, 
                borderRadius: 2,
                background: theme.palette.background.default,
                mb: 5
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src="/images/ai-suggestions.png"
                    alt="Kişiselleştirilmiş Tasarruf Önerileri"
                    sx={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" fontWeight="bold" gutterBottom color="primary">
                    {i18n.language === 'tr' ? 'Kişiselleştirilmiş Tasarruf Önerileri' : 'Personalized Savings Recommendations'}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      {i18n.language === 'tr' ? 'Yapay zeka algoritmaları' : 'AI algorithms'}
                    </Box> {i18n.language === 'tr'
                      ? 'Yapay zeka algoritmaları, kullanım modellerinizi analiz ederek kişiselleştirilmiş tasarruf tavsiyeleri oluşturur. Her ay yüzlerce lira tasarruf edin.'
                      : 'AI algorithms analyze your usage patterns to create personalized savings advice. Save hundreds of dollars every month.'}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        {i18n.language === 'tr'
                          ? t('landing.featureItem2_1')
                          : 'Identify outdated and inefficient devices with device replacement recommendations'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        {i18n.language === 'tr'
                          ? t('landing.featureItem2_2')
                          : 'Consume energy during optimal usage hours with time-based recommendations'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        {i18n.language === 'tr'
                          ? t('landing.featureItem2_3')
                          : 'Get notified about unusual consumption patterns immediately'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Fatura Tahmini ve Maliyet Analizi */}
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 4, 
                borderRadius: 2,
                background: theme.palette.background.default,
                mb: 5
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6} order={{ xs: 2, md: 1 }}>
                  <Typography variant="h4" component="h3" fontWeight="bold" gutterBottom color="primary">
                    {i18n.language === 'tr' ? 'Fatura Yönetimi ve Analizi' : 'Invoice Management and Analysis'}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      {i18n.language === 'tr' ? 'Elektrik faturalarınızı akıllı teknolojilerle yönetin' : 'Manage your electricity bills with smart technologies'}
                    </Box> {i18n.language === 'tr'
                      ? '. Fotoğrafını çekmeniz yeterli - OCR teknolojimiz faturaları otomatik olarak analiz eder.'
                      : '. Just take a photo - our OCR technology automatically analyzes your bills.'}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {i18n.language === 'tr' ? 'Otomatik Fatura Tarama' : 'Automatic Invoice Scanning'}
                        </Box> {i18n.language === 'tr' ? 'ile kağıt faturalarınızı dijitalleştirin' : 'to digitize your paper invoices'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {i18n.language === 'tr' ? 'Geçmiş Tüketim Analizi' : 'Historical Consumption Analysis'}
                        </Box> {i18n.language === 'tr' ? 'ile enerji kullanım alışkanlıklarınızı görün' : 'to see your energy usage habits'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {i18n.language === 'tr' ? 'Maliyet Karşılaştırması' : 'Cost Comparison'}
                        </Box> {i18n.language === 'tr' ? 'ile tasarruf fırsatlarını keşfedin' : 'to discover saving opportunities'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={6} order={{ xs: 1, md: 2 }}>
                  <Box
                    component="img"
                    src="/images/bill-prediction.png"
                    alt="Fatura Tahmini ve Maliyet Analizi"
                    sx={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          {/* Görsel Raporlama ve Veri İşleme */}
          <Grid item xs={12}>
            <Paper 
              elevation={3}
              sx={{ 
                p: 4, 
                borderRadius: 2,
                background: theme.palette.background.default
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src="/images/visual-reporting.png"
                    alt="Görsel Raporlama ve Veri İşleme"
                    sx={{ 
                      width: '100%', 
                      height: 'auto',
                      borderRadius: 2,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" component="h3" fontWeight="bold" gutterBottom color="primary">
                    {i18n.language === 'tr' ? 'Akıllı Cihaz Yönetimi ve Tüketim Analizi' : 'Smart Device Management and Consumption Analysis'}
                  </Typography>
                  <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 3 }}>
                    <Box component="span" sx={{ fontWeight: 'bold', color: 'secondary.main' }}>
                      {i18n.language === 'tr' ? 'Enerji tüketen tüm cihazlarınızı' : 'Add all your energy-consuming devices'}
                    </Box> {i18n.language === 'tr'
                      ? ' kolayca sisteme ekleyin ve gerçek zamanlı tüketimlerini takip edin. Hangi cihazların ne kadar enerji harcadığını görerek tasarruf fırsatlarını keşfedin.'
                      : ' easily to the system and track their real-time consumption. Discover saving opportunities by seeing which devices consume how much energy.'}
                  </Typography>
                  <Box component="ul" sx={{ pl: 2 }}>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {i18n.language === 'tr' ? 'Kolay Cihaz Ekleme' : 'Easy Device Management'}
                        </Box> {i18n.language === 'tr' ? 'ile enerji tüketen tüm cihazlarınızı sisteme kaydedin ve kategorilendirin' : 'register and categorize all your energy-consuming devices'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {i18n.language === 'tr' ? 'Cihaz Bazlı Tüketim İzleme' : 'Device-Based Consumption Monitoring'}
                        </Box> {i18n.language === 'tr' ? 'ile hangi cihazların ne kadar enerji harcadığını net olarak görün' : 'see exactly which devices consume how much energy'}
                      </Typography>
                    </Box>
                    <Box component="li" sx={{ mb: 1 }}>
                      <Typography>
                        <Box component="span" sx={{ fontWeight: 'bold' }}>
                          {i18n.language === 'tr' ? 'Enerji Verimliliği Karşılaştırması' : 'Energy Efficiency Comparison'}
                        </Box> {i18n.language === 'tr' ? 'ile cihazlarınızın performansını değerlendirin' : 'evaluate the performance of your devices'}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: theme.palette.background.paper, py: 8 }}>
        <Container maxWidth="md">
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              borderRadius: 2,
              textAlign: 'center',
              background: theme.palette.mode === 'dark' 
                ? 'linear-gradient(135deg, #0d47a1 0%, #1565c0 100%)' 
                : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h4" component="h2" gutterBottom fontWeight="bold">
              {t('landing.cta.title')}
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: 700, mx: 'auto', fontSize: '1.1rem' }}>
              {t('landing.cta.description')}
            </Typography>
            <Button 
              variant="contained" 
              size="large" 
              onClick={() => navigate('/register')}
              color="secondary"
              sx={{ px: 4, py: 1.5, borderRadius: 2, fontWeight: 'bold' }}
            >
              {t('landing.cta.button')}
            </Button>
          </Paper>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: theme.palette.background.default, py: 6, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" fontWeight="bold" sx={{ letterSpacing: '0.1em', mr: 1 }}>
                  SHEA
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  Smart Home Energy Assistant
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('landing.footer.description')}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton size="small" color="primary" aria-label="twitter">
                  <Box component="img" src="/images/twitter.png" alt="Twitter" sx={{ width: 18, height: 18 }} />
                </IconButton>
                <IconButton size="small" color="primary" aria-label="linkedin">
                  <Box component="img" src="/images/linkedin.png" alt="LinkedIn" sx={{ width: 18, height: 18 }} />
                </IconButton>
                <IconButton size="small" color="primary" aria-label="instagram">
                  <Box component="img" src="/images/instagram.png" alt="Instagram" sx={{ width: 18, height: 18 }} />
                </IconButton>
                <IconButton size="small" color="primary" aria-label="facebook">
                  <Box component="img" src="/images/facebook.png" alt="Facebook" sx={{ width: 18, height: 18 }} />
                </IconButton>
              </Box>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                {t('landing.footer.company')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.about')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.careers')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.blog')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.press')}</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                {t('landing.footer.support')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.helpCenter')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.faq')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.contactUs')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.liveSupport')}</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                {t('landing.footer.legal')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.privacy')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.terms')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.cookies')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>{t('landing.footer.kvkk')}</Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold" color="primary">
                {t('landing.footer.contact')}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{t('landing.footer.email')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{t('landing.footer.phone')}</Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>{t('landing.footer.address')}</Typography>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('landing.footer.copyright')}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button color="inherit" size="small" onClick={() => navigate('/login')} sx={{ '&:hover': { color: 'primary.main' } }}>
                Giriş
              </Button>
              <Button color="inherit" size="small" onClick={() => navigate('/register')} sx={{ '&:hover': { color: 'primary.main' } }}>
                Ücretsiz Dene
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 