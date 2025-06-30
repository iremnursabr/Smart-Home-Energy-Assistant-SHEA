import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  ButtonGroup,
  Typography
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface EnergyUsageChartProps {
  data: Array<{
    date: string;
    value: number;
  }>;
}

const EnergyUsageChart: React.FC<EnergyUsageChartProps> = ({ data }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  
  // Format dates for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  // Prepare chart data
  const chartLabels = data.map(item => formatDate(item.date));
  const chartValues = data.map(item => item.value);
  
  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: t('dashboard.energyUsage'),
        data: chartValues,
        borderColor: theme.palette.primary.main,
        backgroundColor: `${theme.palette.primary.main}20`,
        fill: true,
        tension: 0.4,
      },
    ],
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: `${theme.palette.divider}40`,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
        },
      },
    },
  };
  
  const handlePeriodChange = (newPeriod: 'day' | 'week' | 'month') => {
    setPeriod(newPeriod);
    // In a real app, this would trigger a data fetch for the new period
  };
  
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.periodSelection')}
        </Typography>
        <ButtonGroup size="small" aria-label="period selection">
          <Button 
            variant={period === 'day' ? 'contained' : 'outlined'} 
            onClick={() => handlePeriodChange('day')}
          >
            {t('dashboard.daily')}
          </Button>
          <Button 
            variant={period === 'week' ? 'contained' : 'outlined'} 
            onClick={() => handlePeriodChange('week')}
          >
            {t('dashboard.weekly')}
          </Button>
          <Button 
            variant={period === 'month' ? 'contained' : 'outlined'} 
            onClick={() => handlePeriodChange('month')}
          >
            {t('dashboard.monthly')}
          </Button>
        </ButtonGroup>
      </Box>
      
      <Box sx={{ flexGrow: 1, minHeight: 200 }}>
        <Line data={chartData} options={chartOptions} />
      </Box>
    </Box>
  );
};

export default EnergyUsageChart; 