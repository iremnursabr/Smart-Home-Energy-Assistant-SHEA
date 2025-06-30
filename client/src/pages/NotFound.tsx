import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  useTheme
} from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          borderRadius: 2,
          textAlign: 'center',
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(30, 30, 30, 0.9)' 
            : 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Typography variant="h1" component="h1" sx={{ fontSize: '8rem', fontWeight: 'bold', color: 'primary.main' }}>
          404
        </Typography>
        
        <Typography variant="h4" component="h2" gutterBottom>
          {t('notFound.title')}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
          {t('notFound.message')}
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            {t('notFound.goHome')}
          </Button>
          
          <Button
            variant="outlined"
            color="primary"
            size="large"
            onClick={() => navigate(-1)}
          >
            {t('notFound.goBack')}
          </Button>
        </Box>
      </Paper>
      
      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {t('notFound.help')} <a href="mailto:support@smartenergy.com">support@smartenergy.com</a>
        </Typography>
      </Box>
    </Container>
  );
};

export default NotFound; 