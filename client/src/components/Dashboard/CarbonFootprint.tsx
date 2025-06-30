import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from '@mui/icons-material';

interface CarbonFootprintProps {
  data: {
    total: number;
    average: number;
    change: number;
    unit: string;
  };
}

const CarbonFootprint: React.FC<CarbonFootprintProps> = ({ data }) => {
  const { t } = useTranslation();
  
  // Calculate progress percentage (for demo purposes, assuming 500 is the max)
  const progressValue = Math.min(100, (data.total / 500) * 100);
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ position: 'relative', display: 'inline-flex', mb: 2 }}>
        <CircularProgress
          variant="determinate"
          value={progressValue}
          size={120}
          thickness={5}
          sx={{ color: data.change < 0 ? 'success.main' : 'error.main' }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" component="div" fontWeight="bold">
            {data.total}
          </Typography>
        </Box>
      </Box>
      
      <Typography variant="body2" color="text.secondary" align="center">
        {t('dashboard.totalCarbonEmissions')}
      </Typography>
      
      <Typography variant="body1" align="center" sx={{ mt: 1 }}>
        {data.unit}
      </Typography>
      
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
        {data.change < 0 ? (
          <Chip 
            icon={<TrendingDownIcon />} 
            label={`${Math.abs(data.change)}% ${t('dashboard.decrease')}`} 
            color="success" 
            size="small" 
          />
        ) : (
          <Chip 
            icon={<TrendingUpIcon />} 
            label={`${data.change}% ${t('dashboard.increase')}`} 
            color="error" 
            size="small" 
          />
        )}
      </Box>
    </Box>
  );
};

export default CarbonFootprint; 