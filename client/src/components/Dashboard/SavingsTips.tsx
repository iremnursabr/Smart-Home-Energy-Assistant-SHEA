import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip
} from '@mui/material';
import {
  Lightbulb as TipIcon,
  TrendingDown as TrendingDownIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';

interface SavingsTipsProps {
  tips: Array<{
    id: string;
    title: string;
    description: string;
    estimatedSavings: number;
    difficulty: string;
  }>;
}

const SavingsTips: React.FC<SavingsTipsProps> = ({ tips }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'success';
      case 'medium':
        return 'warning';
      case 'hard':
        return 'error';
      default:
        return 'default';
    }
  };
  
  const handleViewAllTips = () => {
    navigate('/suggestions');
  };
  
  const handleViewTip = (id: string) => {
    navigate(`/suggestions?highlight=${id}`);
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="h2">
          {t('dashboard.savingsTips')}
        </Typography>
      </Box>

      {tips.length === 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
          <TipIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 2 }} />
          <Typography variant="body1" color="text.secondary" align="center">
            {t('dashboard.noSavingsTips')}
          </Typography>
          <Button
            sx={{ mt: 2 }}
            variant="outlined"
            onClick={handleViewAllTips}
          >
            {t('dashboard.generateSuggestions')}
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {tips.map((tip) => (
              <Grid item xs={12} sm={6} md={4} key={tip.id}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {tip.title}
                      </Typography>
                      <Chip 
                        label={t(`common.difficulty.${tip.difficulty}`)} 
                        color={getDifficultyColor(tip.difficulty) as 'success' | 'error' | 'warning' | 'default'} 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {tip.description.length > 100 
                        ? `${tip.description.substring(0, 100)}...` 
                        : tip.description}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TrendingDownIcon color="success" fontSize="small" />
                      <Typography variant="body2" color="success.main" sx={{ ml: 0.5 }}>
                        {t('dashboard.estimatedSavings')}: {tip.estimatedSavings} kWh
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => handleViewTip(tip.id)}
                    >
                      {t('dashboard.learnMore')}
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 2, mt: 'auto' }}>
            <Button
              endIcon={<ArrowForwardIcon />}
              onClick={handleViewAllTips}
              size="small"
            >
              {t('dashboard.viewAllTips')}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default SavingsTips; 