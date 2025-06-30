import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

interface ConsumptionOverviewProps {
  data: {
    total: number;
    average: number;
    change: number;
    unit: string;
  };
}

const ConsumptionOverview: React.FC<ConsumptionOverviewProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('dashboard.totalConsumption')}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {data.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.unit} / {t('dashboard.currentMonth')}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('dashboard.averageConsumption')}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {data.average}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.unit} / {t('dashboard.day')}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 2, textAlign: 'center', height: '100%', bgcolor: 'background.default' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {t('dashboard.change')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="h4" component="div" fontWeight="bold" color={data.change < 0 ? 'success.main' : 'error.main'}>
                {Math.abs(data.change)}%
              </Typography>
              <Box sx={{ ml: 1 }}>
                {data.change < 0 ? (
                  <Chip 
                    icon={<TrendingDownIcon />} 
                    label={t('dashboard.decrease')} 
                    color="success" 
                    size="small" 
                  />
                ) : (
                  <Chip 
                    icon={<TrendingUpIcon />} 
                    label={t('dashboard.increase')} 
                    color="error" 
                    size="small" 
                  />
                )}
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {t('dashboard.comparedToPreviousMonth')}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ConsumptionOverview; 