import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Box, Typography, Paper, useTheme } from '@mui/material';
import EnergyAssistantChat from '../components/Assistant/EnergyAssistantChat';
import assistantConfig from '../config/assistantConfig';

const Assistant: React.FC = () => {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('tr-TR');
  const [selectedLanguageHeader, setSelectedLanguageHeader] = useState<string>('');
  const [selectedLanguageDescription, setSelectedLanguageDescription] = useState<string>('');
  
  // Initialize language based on user's current i18n setting
  useEffect(() => {
    const currentLanguage = i18n.language;
    if (currentLanguage === 'en') {
      setSelectedLanguage('en-US');
    } else {
      setSelectedLanguage('tr-TR');
    }
  }, [i18n.language]);
  
  // Update header and description when language changes
  useEffect(() => {
    const langData = assistantConfig.langs.find(lang => lang['lang-code'] === selectedLanguage);
    if (langData) {
      setSelectedLanguageHeader(langData.header);
      setSelectedLanguageDescription(langData.description);
    }
  }, [selectedLanguage]);
  
  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        {t('navigation.assistant')}
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        gap: 3,
        mt: 3,
        height: { md: 'calc(100vh - 200px)' }
      }}>
        {/* Assistant Info Section */}
        <Box sx={{ 
          width: { xs: '100%', md: '320px' }, 
          display: 'flex', 
          flexDirection: { xs: 'row', md: 'column' },
          height: { xs: 'auto', md: '100%' }
        }}>
          <Box 
            sx={{ 
              aspectRatio: '1/1',
              width: { xs: '50%', md: '100%' },
              borderRadius: { xs: '12px 0 0 12px', md: '12px 12px 0 0' },
              bgcolor: 'primary.light',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            <Box 
              component="img"
              src="/assistant-avatar.svg"
              alt="Energy Assistant"
              sx={{ 
                width: '80%',
                height: '80%',
                objectFit: 'contain',
                filter: theme.palette.mode === 'dark' ? 'brightness(0.9)' : 'none'
              }}
            />
          </Box>
          <Paper
            elevation={0}
            sx={{ 
              p: 3,
              flex: 1,
              borderRadius: { xs: '0 12px 12px 0', md: '0 0 12px 12px' },
              border: 1,
              borderColor: 'divider'
            }}
          >
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              {selectedLanguageHeader}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedLanguageDescription}
            </Typography>
          </Paper>
        </Box>

        {/* Chat Component */}
        <Box sx={{ flex: 1, height: '100%' }}>
          <EnergyAssistantChat 
            selectedLanguage={selectedLanguage} 
            setSelectedLanguage={setSelectedLanguage}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default Assistant; 