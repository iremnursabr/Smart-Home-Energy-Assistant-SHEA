import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { 
  fetchSuggestions, 
  implementSuggestion, 
  dismissSuggestion, 
  generateSuggestionsFromDevices,
  clearSuggestions,
  generateAiSuggestions,
  manualUpdate
} from '../store/slices/suggestionSlice';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Divider,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  LinearProgress,
  Container,
  ButtonGroup
} from '@mui/material';
import {
  Lightbulb as LightbulbIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  EmojiObjects as EmojiObjectsIcon,
  Savings as SavingsIcon,
  BoltOutlined as BoltIcon,
  BarChart as BarChartIcon,
  Delete as DeleteIcon,
  SmartToy as SmartToyIcon,
  AutoFixHigh as AutoFixHighIcon,
  ShoppingCart as ShoppingCartIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import DashboardHeader from '../components/Dashboard/DashboardHeader';

// Tab panel component
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`suggestion-tabpanel-${index}`}
      aria-labelledby={`suggestion-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Priority colors
const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'info'
};

// Savings level component
const SavingsLevel: React.FC<{ level: number }> = ({ level }) => {
  const getColor = () => {
    if (level < 30) return 'error';
    if (level < 70) return 'warning';
    return 'success';
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress 
          variant="determinate" 
          value={level} 
          color={getColor()}
          sx={{ height: 10, borderRadius: 5 }}
        />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">
          {level}%
        </Typography>
      </Box>
    </Box>
  );
};

// Purchase link button component
const PurchaseLinkButton: React.FC<{ suggestion: any }> = ({ suggestion }) => {
  const { t } = useTranslation();
  
  // Debug: Component'in çağrılıp çağrılmadığını logla
  console.log('🔍 PurchaseLinkButton called for:', {
    id: suggestion.id,
    title: suggestion.title,
    purchase_link: suggestion.purchase_link,
    has_link: !!suggestion.purchase_link
  });
  
  if (!suggestion.purchase_link) {
    console.log('❌ No purchase link found for:', suggestion.title);
    return null;
  }

  console.log('✅ Rendering purchase button for:', suggestion.title);

  const handleClick = () => {
    window.open(suggestion.purchase_link, '_blank', 'noopener,noreferrer');
  };

  return (
    <Button
      size="small"
      variant="outlined"
      color="success"
      startIcon={<ShoppingCartIcon />}
      endIcon={<OpenInNewIcon />}
      onClick={handleClick}
      sx={{ 
        mt: 1,
        borderColor: '#4CAF50',
        color: '#4CAF50',
        '&:hover': {
          borderColor: '#45A049',
          backgroundColor: 'rgba(76, 175, 80, 0.04)'
        }
      }}
    >
      {t('suggestions.shopOnCimri', 'Cimri\'de İncele')}
    </Button>
  );
};

const Suggestions: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { suggestions, isLoading, error } = useSelector((state: RootState) => state.suggestions);
  
  // Local state
  const [tabValue, setTabValue] = useState(0);
  const [implementDialogOpen, setImplementDialogOpen] = useState(false);
  const [dismissDialogOpen, setDismissDialogOpen] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [detailSuggestion, setDetailSuggestion] = useState<any>(null);
  const [generatingLoading, setGeneratingLoading] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [clearStatus, setClearStatus] = useState<string | null>(null);
  const [generatingAiLoading, setGeneratingAiLoading] = useState(false);
  const [generateAiError, setGenerateAiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch suggestions on component mount
  useEffect(() => {
    dispatch(fetchSuggestions());
  }, [dispatch]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Open implement confirmation dialog
  const handleOpenImplementDialog = (suggestionId: string) => {
    setSelectedSuggestion(suggestionId);
    setImplementDialogOpen(true);
  };

  // Close implement confirmation dialog
  const handleCloseImplementDialog = () => {
    setImplementDialogOpen(false);
    setSelectedSuggestion(null);
  };

  // Handle implementing suggestion
  const handleImplementSuggestion = () => {
    if (selectedSuggestion) {
      dispatch(implementSuggestion(selectedSuggestion))
        .unwrap()
        .then(() => {
          handleCloseImplementDialog();
        })
        .catch((error) => {
          console.error('Failed to implement suggestion:', error);
          handleCloseImplementDialog();
        });
    }
  };

  // Open dismiss confirmation dialog
  const handleOpenDismissDialog = (suggestionId: string) => {
    setSelectedSuggestion(suggestionId);
    setDismissDialogOpen(true);
  };

  // Close dismiss confirmation dialog
  const handleCloseDismissDialog = () => {
    setDismissDialogOpen(false);
    setSelectedSuggestion(null);
  };

  // Handle dismissing suggestion
  const handleDismissSuggestion = () => {
    if (selectedSuggestion) {
      dispatch(dismissSuggestion(selectedSuggestion))
        .unwrap()
        .then(() => {
          handleCloseDismissDialog();
        })
        .catch((error) => {
          console.error('Failed to dismiss suggestion:', error);
          handleCloseDismissDialog();
        });
    }
  };

  // Open detail dialog
  const handleOpenDetailDialog = (suggestion: any) => {
    setDetailSuggestion(suggestion);
    setDetailDialogOpen(true);
  };

  // Close detail dialog
  const handleCloseDetailDialog = () => {
    setDetailDialogOpen(false);
    setDetailSuggestion(null);
  };

  // Filter suggestions based on tab
  const filteredSuggestions = suggestions.filter(suggestion => {
    if (tabValue === 0) return suggestion.status === 'active';
    if (tabValue === 1) return suggestion.status === 'implemented';
    if (tabValue === 2) return suggestion.status === 'dismissed';
    return true;
  });

  // Cihazlardan öneri oluştur
  const handleGenerateSuggestions = async () => {
    setGeneratingLoading(true);
    setGenerateError(null);
    
    try {
      await dispatch(generateSuggestionsFromDevices()).unwrap();
    } catch (error: any) {
      setGenerateError(error);
    } finally {
      setGeneratingLoading(false);
    }
  };

  // Önerileri temizleme
  const handleOpenClearDialog = (status: string | null) => {
    console.log('Temizlenecek öneriler status:', status);
    setClearStatus(status);
    setClearDialogOpen(true);
  };

  const handleCloseClearDialog = () => {
    setClearDialogOpen(false);
    setClearStatus(null);
  };

  const handleClearSuggestions = async () => {
    try {
      console.log('Temizleme isteği gönderiliyor, status:', clearStatus);
      
      // Manuel state güncellemesi için mevcut suggestions kopyalansın
      const currentSuggestions = [...suggestions];
      
      // Temizleme sırasında bir bilgi mesajı göster
      setSuccessMessage(t('suggestions.clearingInProgress'));
      
      // Temizleme işlemini gerçekleştir
      const result = await dispatch(clearSuggestions(clearStatus)).unwrap();
      console.log('Temizleme işlemi sonucu:', result);
      
      // UI'ı manuel olarak güncelle (state manipülasyonu)
      let updatedSuggestions = [...currentSuggestions];
      
      if (clearStatus?.startsWith('ai_')) {
        // AI önerileri temizleniyor
        if (clearStatus === 'ai_active') {
          console.log('UI: AI aktif önerileri temizleniyor');
          // Aktif AI önerilerini UI'dan kaldır
          updatedSuggestions = updatedSuggestions.filter(s => 
            !(s.source === 'ai' && s.status === 'active')
          );
          setAiTabValue(0); // Aktif tab'a git
          setSuccessMessage(t('suggestions.successClearAiActive'));
        } else if (clearStatus === 'ai_implemented') {
          console.log('UI: AI uygulanmış önerileri temizleniyor');
          updatedSuggestions = updatedSuggestions.filter(s => 
            !(s.source === 'ai' && s.status === 'implemented')
          );
          setAiTabValue(1); // Implemented tab'a git
          setSuccessMessage(t('suggestions.successClearAiImplemented'));
        } else if (clearStatus === 'ai_dismissed') {
          console.log('UI: AI reddedilmiş önerileri temizleniyor');
          updatedSuggestions = updatedSuggestions.filter(s => 
            !(s.source === 'ai' && s.status === 'dismissed')
          );
          setAiTabValue(2); // Dismissed tab'a git
          setSuccessMessage(t('suggestions.successClearAiDismissed'));
        } else if (clearStatus === 'ai_all') {
          console.log('UI: Tüm AI önerileri temizleniyor');
          updatedSuggestions = updatedSuggestions.filter(s => s.source !== 'ai');
          setSuccessMessage(t('suggestions.successClearAiAll'));
        }
      } else {
        // Normal öneriler temizleniyor
        if (clearStatus === 'active') {
          console.log('UI: Aktif önerileri temizleniyor');
          updatedSuggestions = updatedSuggestions.filter(s => 
            !(s.status === 'active' && s.source !== 'ai')
          );
          setTabValue(0); // Aktif tab'a git
          setSuccessMessage(t('suggestions.successClearActive'));
        } else {
          console.log('UI: Tüm önerileri temizleniyor');
          // Sistem önerilerini tamamen temizle
          updatedSuggestions = updatedSuggestions.filter(s => s.source === 'ai');
          setSuccessMessage(t('suggestions.successClearAll'));
        }
      }
      
      // Manuel güncellemeyi hemen uygula (herhangi bir API hatası durumunda)
      dispatch(manualUpdate(updatedSuggestions));
      
      // Redux state'i güncellemeye çalış
      try {
        await dispatch(fetchSuggestions());
        console.log('Öneriler yeniden yüklendi');
      } catch (fetchError) {
        console.error('Öneriler yeniden yüklenemedi:', fetchError);
        // Zaten manuel güncelleme yapıldığı için ek bir işleme gerek yok
      }
      
      // Dialog'u kapat
      handleCloseClearDialog();
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (error) {
      console.error('Failed to clear suggestions:', error);
      
      // Hata durumunda bile UI güncelle
      if (clearStatus) {
        const currentSuggestions = [...suggestions];
        let updatedSuggestions = [...currentSuggestions];
        
        // Clearstatus değerine göre manuel filtreleme
        if (clearStatus?.startsWith('ai_')) {
          if (clearStatus === 'ai_active') {
            updatedSuggestions = updatedSuggestions.filter(s => !(s.source === 'ai' && s.status === 'active'));
          } else if (clearStatus === 'ai_implemented') {
            updatedSuggestions = updatedSuggestions.filter(s => !(s.source === 'ai' && s.status === 'implemented'));
          } else if (clearStatus === 'ai_dismissed') {
            updatedSuggestions = updatedSuggestions.filter(s => !(s.source === 'ai' && s.status === 'dismissed'));
          } else if (clearStatus === 'ai_all') {
            updatedSuggestions = updatedSuggestions.filter(s => s.source !== 'ai');
          }
        } else if (clearStatus === 'active') {
          updatedSuggestions = updatedSuggestions.filter(s => !(s.status === 'active' && s.source !== 'ai'));
        }
        
        // Manuel güncelleme uygula
        dispatch(manualUpdate(updatedSuggestions));
        setSuccessMessage(t('suggestions.clearingWithWarning'));
      }
      
      handleCloseClearDialog();
      
      // 3 saniye sonra bilgi mesajını kaldır
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    }
  };

  // Handle generating AI suggestions
  const handleGenerateAiSuggestions = async () => {
    try {
      setGeneratingAiLoading(true);
      setGenerateAiError(null);
      
      await dispatch(generateAiSuggestions()).unwrap();
      
    } catch (error: any) {
      console.error('Failed to generate AI suggestions:', error);
      setGenerateAiError(error.toString());
    } finally {
      setGeneratingAiLoading(false);
    }
  };

  // Debug: Önerileri logla
  console.log('🔍 Current suggestions state:', {
    allSuggestions: suggestions,
    suggestionsWithPurchaseLink: suggestions.filter(s => s.purchase_link),
    purchaseLinks: suggestions.map(s => ({ id: s.id, title: s.title, purchase_link: s.purchase_link })),
    sources: suggestions.map(s => ({ id: s.id, title: s.title, source: s.source })),
    aiSuggestions: suggestions.filter(s => s.source === 'ai'),
    systemSuggestions: suggestions.filter(s => s.source !== 'ai')
  });

  // Filter AI and system suggestions
  const aiSuggestions = suggestions.filter(suggestion => suggestion.source === 'ai');
  const systemSuggestions = suggestions.filter(suggestion => suggestion.source !== 'ai');
  
  // Count suggestions by status for tabs
  const activeSuggestions = systemSuggestions.filter(s => s.status === 'active');
  const implementedSuggestions = systemSuggestions.filter(s => s.status === 'implemented');
  const dismissedSuggestions = systemSuggestions.filter(s => s.status === 'dismissed');

  // Filter AI suggestions by status for tabs
  const activeAiSuggestions = aiSuggestions.filter(s => s.status === 'active');
  const implementedAiSuggestions = aiSuggestions.filter(s => s.status === 'implemented');
  const dismissedAiSuggestions = aiSuggestions.filter(s => s.status === 'dismissed');
  
  // AI suggestions tab state
  const [aiTabValue, setAiTabValue] = useState(0);
  
  // Handle AI tab change
  const handleAiTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setAiTabValue(newValue);
  };
  
  // Get filtered AI suggestions based on tab
  const filteredAiSuggestions = (() => {
    if (aiTabValue === 0) return activeAiSuggestions;
    if (aiTabValue === 1) return implementedAiSuggestions;
    if (aiTabValue === 2) return dismissedAiSuggestions;
    return aiSuggestions;
  })();

  // Loading state
  if (isLoading && suggestions.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl">
      <DashboardHeader
        title={t('suggestions.title')}
        icon={<EmojiObjectsIcon fontSize="large" />}
      />

      {/* Başarı mesajı */}
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 2, fontWeight: 'medium' }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}

      {/* AI Öneriler Bölümü */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 2,
          background: 'linear-gradient(to right, #e0f7fa, #f3e5f5)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <SmartToyIcon sx={{ mr: 1, color: 'primary.main', fontSize: 28 }} />
              <Typography variant="h5" component="h2" fontWeight="bold" color="primary.main">
                {t('suggestions.aiSuggestions')}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph>
              {t('suggestions.aiDescription')}
            </Typography>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'right' }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              {/* Aktif önerileri temizleme butonu */}
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => handleOpenClearDialog('ai_active')}
                disabled={activeAiSuggestions.length === 0}
                sx={{ mb: 2, fontWeight: 'bold' }}
              >
                {t('suggestions.clearActiveOnly')}
              </Button>
              
              {/* AI önerileri oluşturma butonu */}
              <Button
                variant="contained"
                color="primary"
                startIcon={generatingAiLoading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
                onClick={handleGenerateAiSuggestions}
                disabled={generatingAiLoading}
                sx={{ mb: 2 }}
              >
                {generatingAiLoading ? t('suggestions.generating') : t('suggestions.generateAi')}
              </Button>
            </Box>
          </Grid>
          
          {generateAiError && (
            <Grid item xs={12}>
              <Alert severity="error" sx={{ mb: 2 }}>
                {generateAiError}
              </Alert>
            </Grid>
          )}
          
          <Grid item xs={12}>
            <Paper sx={{ mb: 3 }}>
              <Tabs 
                value={aiTabValue} 
                onChange={handleAiTabChange}
                variant="fullWidth"
                indicatorColor="primary"
                textColor="primary"
              >
                <Tab 
                  icon={<LightbulbIcon />} 
                  label={`${t('suggestions.active')} (${activeAiSuggestions.length})`} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<CheckCircleIcon />} 
                  label={`${t('suggestions.implemented')} (${implementedAiSuggestions.length})`} 
                  iconPosition="start"
                />
                <Tab 
                  icon={<CancelIcon />} 
                  label={`${t('suggestions.dismissed')} (${dismissedAiSuggestions.length})`} 
                  iconPosition="start"
                />
              </Tabs>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleOpenClearDialog(
                    aiTabValue === 0 ? 'ai_active' : 
                    aiTabValue === 1 ? 'ai_implemented' : 
                    aiTabValue === 2 ? 'ai_dismissed' : 'ai_all'
                  )}
                  disabled={filteredAiSuggestions.length === 0}
                  sx={{ fontWeight: 'bold' }}
                >
                  {t('suggestions.clearAll')}
                </Button>
              </Box>

              <TabPanel value={aiTabValue} index={0}>
                {activeAiSuggestions.length > 0 ? (
                  <Grid container spacing={2}>
                    {activeAiSuggestions.map((suggestion) => (
                      <Grid item xs={12} md={6} lg={4} key={suggestion.id}>
                        <Card 
                          sx={{ 
                            height: '100%', 
                            display: 'flex', 
                            flexDirection: 'column',
                            position: 'relative',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              right: 0,
                              width: '60px',
                              height: '60px',
                              background: 'linear-gradient(135deg, transparent 50%, #bbdefb 50%)',
                              borderRadius: '0 4px 0 0',
                            }
                          }}
                        >
                          <CardHeader
                            title={suggestion.title}
                            subheader={
                              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <Chip
                                  label={suggestion.priority}
                                  color={priorityColors[suggestion.priority] as any}
                                  size="small"
                                  sx={{ mr: 1 }}
                                />
                                <AutoFixHighIcon sx={{ fontSize: 16, color: 'primary.main', ml: 'auto', mr: 1 }} />
                              </Box>
                            }
                          />
                          <Divider />
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {suggestion.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <SavingsIcon sx={{ color: 'success.main', mr: 1 }} />
                              <Typography variant="body2">
                                {t('suggestions.estimatedSavings')}: {suggestion.estimated_savings} kWh
                              </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <BoltIcon sx={{ color: 'warning.main', mr: 1 }} />
                              <Typography variant="body2">
                                {t('suggestions.difficulty')}: {suggestion.difficulty}
                              </Typography>
                            </Box>
                            <PurchaseLinkButton suggestion={suggestion} />
                          </CardContent>
                          <Divider />
                          <CardActions>
                            <ButtonGroup size="small" variant="text">
                              <Button 
                                startIcon={<CheckCircleIcon />}
                                color="success"
                                onClick={() => handleOpenImplementDialog(suggestion.id)}
                              >
                                {t('suggestions.apply')}
                              </Button>
                              <Button 
                                startIcon={<CancelIcon />}
                                color="error"
                                onClick={() => handleOpenDismissDialog(suggestion.id)}
                              >
                                {t('suggestions.dismiss')}
                              </Button>
                              <IconButton
                                onClick={() => handleOpenDetailDialog(suggestion)}
                                size="small"
                              >
                                <InfoIcon fontSize="small" />
                              </IconButton>
                            </ButtonGroup>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <SmartToyIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      {t('suggestions.noAiSuggestions')}
                    </Typography>
                  </Box>
                )}
              </TabPanel>
                
              <TabPanel value={aiTabValue} index={1}>
                {implementedAiSuggestions.length > 0 ? (
                  <Grid container spacing={2}>
                    {implementedAiSuggestions.map((suggestion) => (
                      <Grid item xs={12} md={6} lg={4} key={suggestion.id}>
                        <Card>
                          <CardHeader
                            avatar={<CheckCircleIcon color="success" />}
                            title={suggestion.title}
                            subheader={`${t('suggestions.implementedOn')}: ${suggestion.implementation_date ? new Date(suggestion.implementation_date).toLocaleDateString() : t('common.notAvailable')}`}
                            action={
                              <IconButton onClick={() => handleOpenDetailDialog(suggestion)}>
                                <InfoIcon />
                              </IconButton>
                            }
                          />
                          <Divider />
                          <CardContent>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {suggestion.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SavingsIcon sx={{ color: 'success.main', mr: 1 }} />
                              <Typography variant="body2">
                                {t('suggestions.savedEnergy')}: {suggestion.estimated_savings} kWh
                              </Typography>
                            </Box>
                            <PurchaseLinkButton suggestion={suggestion} />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ m: 2 }}>
                    {t('suggestions.noImplementedSuggestions')}
                  </Alert>
                )}
              </TabPanel>
                
              <TabPanel value={aiTabValue} index={2}>
                {dismissedAiSuggestions.length > 0 ? (
                  <Grid container spacing={2}>
                    {dismissedAiSuggestions.map((suggestion) => (
                      <Grid item xs={12} md={6} lg={4} key={suggestion.id}>
                        <Card>
                          <CardHeader
                            avatar={<CancelIcon color="error" />}
                            title={suggestion.title}
                            subheader={`${t('suggestions.dismissedOn')}: ${suggestion.dismissal_date ? new Date(suggestion.dismissal_date).toLocaleDateString() : t('common.notAvailable')}`}
                            action={
                              <IconButton onClick={() => handleOpenDetailDialog(suggestion)}>
                                <InfoIcon />
                              </IconButton>
                            }
                          />
                          <Divider />
                          <CardContent>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {suggestion.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <SavingsIcon sx={{ color: 'error.main', mr: 1 }} />
                              <Typography variant="body2">
                                {t('suggestions.missedSavings')}: {suggestion.estimated_savings} kWh
                              </Typography>
                            </Box>
                            <PurchaseLinkButton suggestion={suggestion} />
                          </CardContent>
                          <Divider />
                          <CardActions>
                            <Button 
                              size="small" 
                              color="primary" 
                              startIcon={<CheckCircleIcon />}
                              onClick={() => handleOpenImplementDialog(suggestion.id)}
                            >
                              {t('suggestions.reconsider')}
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ m: 2 }}>
                    {t('suggestions.noDismissedSuggestions')}
                  </Alert>
                )}
              </TabPanel>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Sistem Önerileri Bölümü */}
      <Paper elevation={2} sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        {/* Butonlar için Toolbar */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          {/* Sol tarafta temizleme butonu */}
          <Button 
            variant="outlined" 
            color="error" 
            startIcon={<DeleteIcon />}
            onClick={() => handleOpenClearDialog(tabValue === 0 ? 'active' : null)}
            disabled={tabValue === 0 ? activeSuggestions.length === 0 : systemSuggestions.length === 0}
            sx={{ fontWeight: 'bold' }}
          >
            {tabValue === 0 
              ? t('suggestions.clearActiveOnly') 
              : t('suggestions.clearAll')}
          </Button>

          {/* Sağ tarafta öneri oluşturma butonu */}
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<EmojiObjectsIcon />}
            onClick={handleGenerateSuggestions}
            disabled={generatingLoading}
          >
            {generatingLoading ? 
              <><CircularProgress size={24} color="inherit" sx={{ mr: 1 }} /> {t('suggestions.generating')}</>
              : t('suggestions.generateSuggestions')
            }
          </Button>
        </Box>
        
        {generateError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {generateError}
          </Alert>
        )}

        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab 
              icon={<LightbulbIcon />} 
              label={t('suggestions.active')} 
              iconPosition="start"
            />
            <Tab 
              icon={<CheckCircleIcon />} 
              label={t('suggestions.implemented')} 
              iconPosition="start"
            />
            <Tab 
              icon={<CancelIcon />} 
              label={t('suggestions.dismissed')} 
              iconPosition="start"
            />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            {activeSuggestions.length > 0 ? (
              <Grid container spacing={3}>
                {activeSuggestions.map((suggestion) => (
                  <Grid item xs={12} md={6} lg={4} key={suggestion.id}>
                    <Card>
                      <CardHeader
                        avatar={<EmojiObjectsIcon color="primary" />}
                        title={suggestion.title}
                        subheader={
                          <Chip 
                            label={t(`suggestions.priority.${suggestion.priority}`)} 
                            color={priorityColors[suggestion.priority] as 'error' | 'warning' | 'info'} 
                            size="small" 
                            sx={{ mt: 1 }}
                          />
                        }
                        action={
                          <Tooltip title={t('suggestions.details')}>
                            <IconButton onClick={() => handleOpenDetailDialog(suggestion)}>
                              <InfoIcon />
                            </IconButton>
                          </Tooltip>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {suggestion.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SavingsIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="body2">
                            {t('suggestions.estimatedSavings')}: {suggestion.estimated_savings} kWh
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BoltIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="body2">
                            {t('suggestions.impactLevel')}:
                          </Typography>
                        </Box>
                        <SavingsLevel level={suggestion.impact_level} />
                        <PurchaseLinkButton suggestion={suggestion} />
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleOpenImplementDialog(suggestion.id)}
                        >
                          {t('suggestions.implement')}
                        </Button>
                        <Button 
                          size="small" 
                          color="error" 
                          startIcon={<CancelIcon />}
                          onClick={() => handleOpenDismissDialog(suggestion.id)}
                        >
                          {t('suggestions.dismiss')}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                {t('suggestions.noActiveSuggestions')}
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {implementedSuggestions.length > 0 ? (
              <Grid container spacing={3}>
                {implementedSuggestions.map((suggestion) => (
                  <Grid item xs={12} md={6} lg={4} key={suggestion.id}>
                    <Card>
                      <CardHeader
                        avatar={<CheckCircleIcon color="success" />}
                        title={suggestion.title}
                        subheader={`${t('suggestions.implementedOn')}: ${suggestion.implementation_date ? new Date(suggestion.implementation_date).toLocaleDateString() : t('common.notAvailable')}`}
                        action={
                          <IconButton onClick={() => handleOpenDetailDialog(suggestion)}>
                            <InfoIcon />
                          </IconButton>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {suggestion.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <SavingsIcon sx={{ color: 'success.main', mr: 1 }} />
                          <Typography variant="body2">
                            {t('suggestions.actualSavings')}: {suggestion.actual_savings || suggestion.estimated_savings} kWh
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BarChartIcon sx={{ color: 'primary.main', mr: 1 }} />
                          <Typography variant="body2">
                            {t('suggestions.efficiencyGain')}: {suggestion.efficiency_gain || '0'}%
                          </Typography>
                        </Box>
                        <PurchaseLinkButton suggestion={suggestion} />
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                {t('suggestions.noImplementedSuggestions')}
              </Alert>
            )}
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            {dismissedSuggestions.length > 0 ? (
              <Grid container spacing={3}>
                {dismissedSuggestions.map((suggestion) => (
                  <Grid item xs={12} md={6} lg={4} key={suggestion.id}>
                    <Card>
                      <CardHeader
                        avatar={<CancelIcon color="error" />}
                        title={suggestion.title}
                        subheader={`${t('suggestions.dismissedOn')}: ${suggestion.dismissal_date ? new Date(suggestion.dismissal_date).toLocaleDateString() : t('common.notAvailable')}`}
                        action={
                          <IconButton onClick={() => handleOpenDetailDialog(suggestion)}>
                            <InfoIcon />
                          </IconButton>
                        }
                      />
                      <Divider />
                      <CardContent>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {suggestion.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SavingsIcon sx={{ color: 'error.main', mr: 1 }} />
                          <Typography variant="body2">
                            {t('suggestions.missedSavings')}: {suggestion.estimated_savings} kWh
                          </Typography>
                        </Box>
                        <PurchaseLinkButton suggestion={suggestion} />
                      </CardContent>
                      <Divider />
                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary" 
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleOpenImplementDialog(suggestion.id)}
                        >
                          {t('suggestions.reconsider')}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Alert severity="info">
                {t('suggestions.noDismissedSuggestions')}
              </Alert>
            )}
          </TabPanel>
        </Paper>
      </Paper>

      {/* Implement Confirmation Dialog */}
      <Dialog
        open={implementDialogOpen}
        onClose={handleCloseImplementDialog}
      >
        <DialogTitle>{t('suggestions.implementSuggestion')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('suggestions.confirmImplement')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImplementDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleImplementSuggestion} color="success" autoFocus>
            {t('suggestions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dismiss Confirmation Dialog */}
      <Dialog
        open={dismissDialogOpen}
        onClose={handleCloseDismissDialog}
      >
        <DialogTitle>{t('suggestions.dismissSuggestion')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('suggestions.confirmDismiss')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDismissDialog} color="primary">
            {t('common.cancel')}
          </Button>
          <Button onClick={handleDismissSuggestion} color="error" autoFocus>
            {t('suggestions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Detail Dialog */}
      {detailSuggestion && (
        <Dialog
          open={detailDialogOpen}
          onClose={handleCloseDetailDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {detailSuggestion.title}
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" paragraph>
              {detailSuggestion.description}
            </Typography>
            
            <Typography variant="h6" gutterBottom>
              {t('suggestions.details')}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('suggestions.energyImpact')}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <SavingsIcon sx={{ color: 'success.main', mr: 1 }} />
                    <Typography variant="body2">
                      {t('suggestions.estimatedSavings')}: {detailSuggestion.estimated_savings} kWh
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <BoltIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Typography variant="body2">
                      {t('suggestions.impactLevel')}:
                    </Typography>
                  </Box>
                  <SavingsLevel level={detailSuggestion.impact_level} />
                </Paper>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('suggestions.implementationInfo')}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {t('suggestions.difficulty')}: {t(`suggestions.difficultyLevels.${detailSuggestion.difficulty}`)}
                  </Typography>
                  <Typography variant="body2" paragraph>
                    {t('suggestions.timeToImplement')}: {detailSuggestion.time_to_implement}
                  </Typography>
                  <Typography variant="body2">
                    {t('suggestions.costToImplement')}: {detailSuggestion.cost_to_implement || t('common.free')}
                  </Typography>
                </Paper>
              </Grid>
              
              <Grid item xs={12}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {t('suggestions.additionalInfo')}
                  </Typography>
                  <Typography variant="body2">
                    {detailSuggestion.additional_info || t('suggestions.noAdditionalInfo')}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailDialog} color="primary">
              {t('common.close')}
            </Button>
            {detailSuggestion.status === 'active' && (
              <>
                <Button 
                  color="success" 
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    handleCloseDetailDialog();
                    handleOpenImplementDialog(detailSuggestion.id);
                  }}
                >
                  {t('suggestions.implement')}
                </Button>
                <Button 
                  color="error" 
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    handleCloseDetailDialog();
                    handleOpenDismissDialog(detailSuggestion.id);
                  }}
                >
                  {t('suggestions.dismiss')}
                </Button>
              </>
            )}
            {detailSuggestion.status === 'dismissed' && (
              <Button 
                color="primary" 
                startIcon={<CheckCircleIcon />}
                onClick={() => {
                  handleCloseDetailDialog();
                  handleOpenImplementDialog(detailSuggestion.id);
                }}
              >
                {t('suggestions.reconsider')}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* Temizleme Onay Diyalogu */}
      <Dialog
        open={clearDialogOpen}
        onClose={handleCloseClearDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 'bold', bgcolor: 'error.light', color: 'error.contrastText' }}>
          {t('suggestions.clearSuggestions')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <DialogContentText>
              {clearStatus === 'active' 
                ? t('suggestions.confirmClearActive')
                : clearStatus === 'ai_active'
                ? t('suggestions.confirmClearAiActive')
                : clearStatus === 'ai_implemented'
                ? t('suggestions.confirmClearAiImplemented')
                : clearStatus === 'ai_dismissed'
                ? t('suggestions.confirmClearAiDismissed')
                : clearStatus === 'ai_all'
                ? t('suggestions.confirmClearAiAll')
                : t('suggestions.confirmClearAll')}
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseClearDialog} color="primary" variant="outlined">
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={handleClearSuggestions} 
            color="error" 
            variant="contained" 
            startIcon={<DeleteIcon />}
            autoFocus
          >
            {t('suggestions.confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Suggestions; 