import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { RootState, AppDispatch } from '../store';
import { fetchConsumptionData, fetchConsumptionByDevice } from '../store/slices/consumptionSlice';
import { fetchDevices } from '../store/slices/deviceSlice';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  ButtonGroup,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Container
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  ChartOptions
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import DashboardHeader from '../components/Dashboard/DashboardHeader';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Chart colors
const chartColors = [
  'rgba(75, 192, 192, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(255, 99, 132, 0.6)',
  'rgba(153, 102, 255, 0.6)',
  'rgba(255, 159, 64, 0.6)',
  'rgba(199, 199, 199, 0.6)',
  'rgba(83, 102, 255, 0.6)',
  'rgba(40, 159, 64, 0.6)',
  'rgba(210, 199, 199, 0.6)',
];

const EnergyConsumption: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { 
    consumptionData, 
    consumptionByDevice, 
    isLoading, 
    error 
  } = useSelector((state: RootState) => state.consumption);
  
  const { devices } = useSelector((state: RootState) => state.devices);
  
  // Local state
  const [chartType, setChartType] = useState<'line' | 'bar'>('bar');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDevice, setSelectedDevice] = useState<string>('all');

  // Fetch consumption data on component mount
  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  // Handle chart type change
  const handleChartTypeChange = (type: 'line' | 'bar') => {
    setChartType(type);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle device selection change
  const handleDeviceChange = (event: SelectChangeEvent) => {
    setSelectedDevice(event.target.value);
  };

  // Calculate total consumption based on device data
  const calculateTotalConsumption = (calcTimeRange: 'day' | 'week' | 'month' | 'year') => {
    if (!devices || devices.length === 0) return 0;
    
    return devices.reduce((total, device) => {
      // kWh cinsinden günlük tüketim
      const powerKW = (device.power_consumption_watts || 0) / 1000;
      const hoursPerDay = Math.max(device.usage_hours_per_day || 0, 0.01);
      const daysPerWeek = device.usage_days_per_week || 7;
      
      // Günlük kWh hesabı
      const dailyConsumption = Number((powerKW * hoursPerDay * (daysPerWeek / 7)).toFixed(2));
      
      // Zaman aralığına göre tüketim
      let deviceConsumption = 0;
      if (calcTimeRange === 'day') {
        deviceConsumption = dailyConsumption;
      } else if (calcTimeRange === 'week') {
        deviceConsumption = dailyConsumption * 7;
      } else if (calcTimeRange === 'month') {
        deviceConsumption = dailyConsumption * 30;
      } else { // year
        deviceConsumption = dailyConsumption * 365;
      }
      
      return total + deviceConsumption;
    }, 0);
  };
  
  const dailyConsumption = calculateTotalConsumption('day');
  const weeklyConsumption = calculateTotalConsumption('week');
  const monthlyConsumption = calculateTotalConsumption('month');
  const yearlyConsumption = calculateTotalConsumption('year');
  
  // Calculate average consumption based on device data
  const calculateAvgConsumption = (calcTimeRange: 'day' | 'week' | 'month' | 'year') => {
    if (!devices || devices.length === 0) return 0;
    
    const totalForRange = calculateTotalConsumption(calcTimeRange);
    
    if (calcTimeRange === 'day') {
      return Number((totalForRange / 24).toFixed(2)); // Saatlik ortalama
    } else if (calcTimeRange === 'week') {
      return Number((totalForRange / 7).toFixed(2)); // Günlük ortalama
    } else if (calcTimeRange === 'month') {
      return Number((totalForRange / 30).toFixed(2)); // Günlük ortalama
    } else { // year
      return Number((totalForRange / 12).toFixed(2)); // Aylık ortalama
    }
  };
  
  const avgDailyConsumption = calculateAvgConsumption('day');
  
  // Calculate trend (simulated trend based on device efficiency)
  const calculateTrend = () => {
    if (!devices || devices.length === 0) return 0;
    
    // Cihazların enerji verimliliğine göre trend hesaplama
    // A ve üzeri sınıfı cihazlar için negatif trend (enerji tasarrufu)
    // B ve altı sınıflar için pozitif trend (daha fazla tüketim)
    
    const efficiencyScore = devices.reduce((score, device) => {
      const efficiency = device.energy_efficiency_class || '';
      
      if (['A+++', 'A++', 'A+', 'A'].includes(efficiency)) {
        return score - 1; // Enerji tasarrufu
      } else if (['B', 'C', 'D', 'E', 'F', 'G'].includes(efficiency)) {
        return score + 1; // Daha fazla tüketim
      }
      
      return score;
    }, 0);
    
    // Trend hesabı - basit bir ölçekleme (-5 ile +5 arası)
    const normalizedScore = Math.min(Math.max(efficiencyScore, -5), 5);
    
    // Yüzdeye çevirme (-10% ile +10% arası)
    return normalizedScore * 2;
  };
  
  const trend = calculateTrend();

  // Prepare line/bar chart data
  const timeSeriesData = {
    labels: devices.map(device => device.name),
    datasets: [
      {
        label: t('consumption.energyUsage'),
        data: devices.map(device => {
          // kWh cinsinden günlük tüketim
          const powerKW = (device.power_consumption_watts || 0) / 1000;
          const hoursPerDay = Math.max(device.usage_hours_per_day || 0, 0.01);
          const daysPerWeek = device.usage_days_per_week || 7;
          
          // Günlük kWh hesabı
          const dailyConsumption = Number((powerKW * hoursPerDay * (daysPerWeek / 7)).toFixed(2));
          
          // Aylık tüketim olarak göster
          return dailyConsumption * 30;
        }),
        fill: false,
        backgroundColor: devices.map((_, index) => chartColors[index % chartColors.length]),
        borderColor: 'rgba(75, 192, 192, 1)',
      },
    ],
  };

  // Prepare pie chart data for consumption by device - doğrudan cihaz verilerinden hesapla
  const deviceConsumptionData = {
    labels: devices.map(device => device.name),
    datasets: [
      {
        label: t('consumption.energyByDevice'),
        data: devices.map(device => {
          // Günlük tüketimi hesapla: (Watt / 1000) * saat * (haftada günler / 7)
          const powerKW = (device.power_consumption_watts || 0) / 1000;
          // Eğer kullanım saati 0 ise minimum 0.01 olarak hesapla (boş dilim olmasın)
          const hoursPerDay = Math.max(device.usage_hours_per_day || 0, 0.01);
          const daysPerWeek = device.usage_days_per_week || 7;
          
          // Günlük kWh tüketimini hesapla ve aylık değer olarak göster
          return Number((powerKW * hoursPerDay * (daysPerWeek / 7) * 30).toFixed(2));
        }),
        backgroundColor: chartColors,
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions: ChartOptions<'line' | 'bar'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: t('consumption.consumptionByDevice'),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'kWh',
        },
      },
    },
  };

  // Pie chart options
  const pieChartOptions: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: t('consumption.consumptionByDevice'),
      },
    },
  };

  // Filter device data by selected device
  const filteredDevices = selectedDevice === 'all'
    ? devices
    : devices.filter(device => String(device.id) === selectedDevice);

  // Paginate device data
  const paginatedDevices = filteredDevices
    ? filteredDevices.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
      )
    : [];

  // Loading state
  if (isLoading && !devices.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <DashboardHeader title={t('energy.title')} />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={t('dashboard.daily')} 
              sx={{ textAlign: 'center' }} 
            />
            <Divider />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {Number(dailyConsumption).toFixed(2)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {t('consumption.forPeriod', { period: t('common.day') })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={t('dashboard.weekly')} 
              sx={{ textAlign: 'center' }} 
            />
            <Divider />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {Number(weeklyConsumption).toFixed(2)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {t('consumption.forPeriod', { period: t('common.week') })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={t('dashboard.monthly')} 
              sx={{ textAlign: 'center' }} 
            />
            <Divider />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {Number(monthlyConsumption).toFixed(2)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {t('consumption.forPeriod', { period: t('common.month') })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardHeader 
              title={t('energy.yearly')} 
              sx={{ textAlign: 'center' }} 
            />
            <Divider />
            <CardContent>
              <Typography variant="h3" component="div" align="center">
                {Number(yearlyConsumption).toFixed(2)} kWh
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                {t('consumption.forPeriod', { period: t('common.year') })}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {t('consumption.consumptionByDevice')}
              </Typography>
              <ButtonGroup size="small">
                <Button
                  onClick={() => handleChartTypeChange('bar')}
                  variant={chartType === 'bar' ? 'contained' : 'outlined'}
                  startIcon={<BarChartIcon />}
                >
                  {t('consumption.barChart')}
                </Button>
                <Button
                  onClick={() => handleChartTypeChange('line')}
                  variant={chartType === 'line' ? 'contained' : 'outlined'}
                  startIcon={<TrendingUpIcon />}
                >
                  {t('consumption.lineChart')}
                </Button>
              </ButtonGroup>
            </Box>
            <Box sx={{ height: 400 }}>
              {chartType === 'line' ? (
                <Line data={timeSeriesData} options={chartOptions} />
              ) : (
                <Bar data={timeSeriesData} options={chartOptions} />
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              {t('consumption.deviceConsumptionShare')}
            </Typography>
            <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {devices && devices.length > 0 ? (
                <Pie data={deviceConsumptionData} options={pieChartOptions} />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {t('consumption.noDeviceData')}
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Pie chart for device distribution */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('consumption.deviceDistribution')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" paragraph>
                {t('consumption.deviceDistribution')} {t('consumption.showsTypes')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {devices && devices.length > 0 
                  ? t('consumption.clickOnLegend')
                  : t('consumption.noDeviceData')
                }
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {devices && devices.length > 0 ? (
                <Pie 
                  data={{
                    labels: (() => {
                      // Cihazları tipine göre grupla
                      const deviceTypeMap = devices.reduce((acc, device) => {
                        const type = device.device_type || 'unknown';
                        acc[type] = (acc[type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>);
                      
                      // Tip adlarını terjcüme et 
                      return Object.keys(deviceTypeMap).map(type => 
                        t(`devices.deviceTypeOptions.${type}`) || type
                      );
                    })(),
                    datasets: [
                      {
                        label: t('consumption.deviceDistribution'),
                        data: (() => {
                          // Cihazları tipine göre say
                          const deviceTypeMap = devices.reduce((acc, device) => {
                            const type = device.device_type || 'unknown';
                            acc[type] = (acc[type] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>);
                          
                          return Object.values(deviceTypeMap);
                        })(),
                        backgroundColor: chartColors,
                        borderWidth: 1,
                      },
                    ],
                  }} 
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                      },
                      title: {
                        display: false,
                      },
                    },
                  }} 
                />
              ) : (
                <Typography variant="body1" color="text.secondary">
                  {t('consumption.noDeviceData')}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Consumption data table */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            {t('consumption.consumptionDetails')}
          </Typography>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="device-select-label">{t('consumption.filterByDevice')}</InputLabel>
            <Select
              labelId="device-select-label"
              value={selectedDevice}
              label={t('consumption.filterByDevice')}
              onChange={handleDeviceChange}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              {devices.map(device => (
                <MenuItem key={device.id} value={device.id}>
                  {device.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('consumption.device')}</TableCell>
                <TableCell>{t('consumption.powerWatts')}</TableCell>
                <TableCell>{t('consumption.usageHoursPerDay')}</TableCell>
                <TableCell>{t('consumption.usageDaysPerWeek')}</TableCell>
                <TableCell align="right">{t('consumption.dailyConsumption')} (kWh)</TableCell>
                <TableCell align="right">{t('consumption.weeklyConsumption')} (kWh)</TableCell>
                <TableCell align="right">{t('consumption.monthlyConsumption')} (kWh)</TableCell>
                <TableCell align="right">{t('consumption.yearlyConsumption')} (kWh)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDevices.length > 0 ? (
                filteredDevices
                  .map((device) => {
                    // Günlük, haftalık ve aylık tüketim hesapla
                    // Eğer kullanım saati 0 ise minimum 0.01 olarak hesapla (tüketim 0.00 göstermesin)
                    const hoursPerDay = Math.max(device.usage_hours_per_day || 0, 0.01);
                    const daysPerWeek = device.usage_days_per_week || 7;
                    const powerKW = (device.power_consumption_watts || 0) / 1000;
                    
                    const dailyUsage = powerKW * hoursPerDay * (daysPerWeek / 7);
                    const weeklyUsage = dailyUsage * 7;
                    const monthlyUsage = dailyUsage * 30;
                    const yearlyUsage = dailyUsage * 365;
                    
                    return (
                      <TableRow key={device.id}>
                        <TableCell>{device.name}</TableCell>
                        <TableCell>{device.power_consumption_watts || 0} W</TableCell>
                        <TableCell>{device.usage_hours_per_day || 0}</TableCell>
                        <TableCell>{daysPerWeek}</TableCell>
                        <TableCell align="right">{dailyUsage.toFixed(2)}</TableCell>
                        <TableCell align="right">{weeklyUsage.toFixed(2)}</TableCell>
                        <TableCell align="right">{monthlyUsage.toFixed(2)}</TableCell>
                        <TableCell align="right">{yearlyUsage.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    {t('consumption.noDeviceData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default EnergyConsumption; 