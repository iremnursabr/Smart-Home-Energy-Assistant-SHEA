import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  useTheme,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Analytics: React.FC = () => {
  const theme = useTheme();

  // Sample data - replace with real data from your API
  const energyConsumptionData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 450 },
  ];

  const energySourceData = [
    { name: 'Solar', value: 400 },
    { name: 'Wind', value: 300 },
    { name: 'Grid', value: 300 },
  ];

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.error.main];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" gutterBottom>
        Energy Analytics Dashboard
      </Typography>
      
      <Grid container spacing={4}>
        {/* Energy Consumption Trend */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Energy Consumption Trend" />
            <CardContent>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={energyConsumptionData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={theme.palette.primary.main}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Energy Source Distribution */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Energy Source Distribution" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={energySourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: { name: string; percent: number }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {energySourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Daily Usage Pattern */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Daily Usage Pattern" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { time: '00:00', usage: 30 },
                      { time: '04:00', usage: 20 },
                      { time: '08:00', usage: 80 },
                      { time: '12:00', usage: 100 },
                      { time: '16:00', usage: 90 },
                      { time: '20:00', usage: 60 },
                    ]}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="usage"
                      fill={theme.palette.secondary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Cards */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Consumption
                  </Typography>
                  <Typography variant="h4">
                    3,450 kWh
                  </Typography>
                  <Typography color="primary" sx={{ mt: 1 }}>
                    +12% vs last month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Cost
                  </Typography>
                  <Typography variant="h4">
                    $425.50
                  </Typography>
                  <Typography color="error" sx={{ mt: 1 }}>
                    +8% vs last month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Carbon Footprint
                  </Typography>
                  <Typography variant="h4">
                    2.4 tons
                  </Typography>
                  <Typography color="secondary" sx={{ mt: 1 }}>
                    -5% vs last month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Efficiency Score
                  </Typography>
                  <Typography variant="h4">
                    85/100
                  </Typography>
                  <Typography color="primary" sx={{ mt: 1 }}>
                    +3 points vs last month
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics; 