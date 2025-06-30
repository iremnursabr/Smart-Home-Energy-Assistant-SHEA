import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  useTheme,
} from '@mui/material';
import {
  ReceiptLong,
  Speed,
  MonitorWeight,
  Language,
  BarChart,
  Public,
  Settings,
  Cloud,
  ShowChart,
} from '@mui/icons-material';

const Home: React.FC = () => {
  const theme = useTheme();

  const features = [
    {
      icon: <ReceiptLong sx={{ fontSize: 40, color: '#4B9EF9' }} />,
      title: 'Invoice validation',
      description: 'Validate and analyze your energy invoices automatically',
    },
    {
      icon: <Speed sx={{ fontSize: 40, color: '#4B9EF9' }} />,
      title: 'Advantageous tariff determination',
      description: 'Find the most cost-effective energy tariffs for your business',
    },
    {
      icon: <MonitorWeight sx={{ fontSize: 40, color: '#4B9EF9' }} />,
      title: 'Consumption monitoring',
      description: 'Monitor your energy consumption in real-time',
    },
    {
      icon: <Public sx={{ fontSize: 40, color: '#4CAF50' }} />,
      title: 'Carbon emission calculation',
      description: 'Track and reduce your carbon footprint',
    },
    {
      icon: <ShowChart sx={{ fontSize: 40, color: '#4B9EF9' }} />,
      title: 'Invoice forecasting',
      description: 'Predict future energy costs with AI-powered analytics',
    },
    {
      icon: <BarChart sx={{ fontSize: 40, color: '#4B9EF9' }} />,
      title: 'Demand tracking',
      description: 'Track and optimize your energy demand patterns',
    },
    {
      icon: <Language sx={{ fontSize: 40, color: '#4B9EF9' }} />,
      title: 'PTF tracking',
      description: 'Monitor market clearing prices in real-time',
    },
    {
      icon: <Settings sx={{ fontSize: 40, color: '#4B9EF9' }} />,
      title: 'IoT',
      description: 'Connect and manage your IoT devices seamlessly',
    },
  ];

  const stats = [
    { number: '+50', label: 'Sectors', icon: <Public sx={{ color: theme.palette.primary.main }} /> },
    { number: '+1500', label: 'Facility', icon: <Cloud sx={{ color: theme.palette.primary.main }} /> },
    { number: '+500', label: 'Companies', icon: <BarChart sx={{ color: theme.palette.primary.main }} /> },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        mb: 6,
        background: '#fff',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    color: theme.palette.primary.main,
                    mb: 2,
                    fontWeight: 500 
                  }}
                >
                  Gain power with AI support and smart insights
                </Typography>
                <Typography 
                  variant="h1" 
                  sx={{ 
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 700,
                    mb: 3,
                    lineHeight: 1.2
                  }}
                >
                  Optimize the energy costs of your business and increase efficiency.
                </Typography>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'text.secondary',
                    mb: 4,
                    fontSize: '1.1rem',
                    maxWidth: 600
                  }}
                >
                  Reduce energy costs, increase efficiency, and effectively manage your carbon emissions with real-time monitoring and industry benchmarks for energy-conscious businesses.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    py: 1.5,
                    px: 4,
                    fontSize: '1.1rem',
                    borderRadius: 2
                  }}
                >
                  Request a demo
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                component="img"
                src="/assets/dashboard-preview.png"
                alt="Energy Dashboard"
                sx={{
                  width: '100%',
                  maxWidth: 600,
                  height: 'auto',
                  borderRadius: 2,
                  boxShadow: '0px 10px 40px rgba(0,0,0,0.1)',
                  transform: 'perspective(1000px) rotateY(-10deg)',
                }}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h2"
              component="h2"
              sx={{
                mb: 2,
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              Solutions that empower sustainability
            </Typography>
          </Box>
          <Grid container spacing={3}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    border: '1px solid #eee',
                    boxShadow: 'none',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0px 8px 24px rgba(0,0,0,0.05)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography
                      variant="h6"
                      component="h3"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      {feature.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: '#fff' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {stats.map((stat, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box
                  sx={{
                    textAlign: 'center',
                    p: 3,
                  }}
                >
                  {stat.icon}
                  <Typography
                    variant="h2"
                    sx={{
                      mt: 2,
                      mb: 1,
                      fontWeight: 700,
                      fontSize: { xs: '2.5rem', md: '3rem' }
                    }}
                  >
                    {stat.number}
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 800,
              mx: 'auto',
            }}
          >
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}
            >
              The Top Choice of Industry Leaders in Energy Management
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                mt: 4,
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                borderRadius: 2
              }}
            >
              Book a demo
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 