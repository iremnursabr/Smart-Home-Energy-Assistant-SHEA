import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  useTheme,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

const Reports: React.FC = () => {
  const theme = useTheme();

  const reports = [
    {
      id: 1,
      name: 'Monthly Energy Consumption Report',
      date: '2024-03-01',
      type: 'Consumption Analysis',
      size: '2.4 MB',
    },
    {
      id: 2,
      name: 'Carbon Footprint Assessment',
      date: '2024-03-01',
      type: 'Environmental',
      size: '1.8 MB',
    },
    {
      id: 3,
      name: 'Cost Analysis Report',
      date: '2024-03-01',
      type: 'Financial',
      size: '3.1 MB',
    },
    {
      id: 4,
      name: 'Energy Efficiency Recommendations',
      date: '2024-03-01',
      type: 'Advisory',
      size: '1.5 MB',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h2" gutterBottom>
          Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access and download your energy management reports
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Quick Stats */}
        <Grid item xs={12}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Reports
                  </Typography>
                  <Typography variant="h4">24</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Generated This Month
                  </Typography>
                  <Typography variant="h4">8</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Shared Reports
                  </Typography>
                  <Typography variant="h4">12</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Storage Used
                  </Typography>
                  <Typography variant="h4">45.2 MB</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Reports Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">Recent Reports</Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<DownloadIcon />}
                >
                  Download All
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ boxShadow: 'none' }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Report Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Size</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>{report.name}</TableCell>
                        <TableCell>{report.date}</TableCell>
                        <TableCell>{report.type}</TableCell>
                        <TableCell>{report.size}</TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            sx={{ color: theme.palette.primary.main }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: theme.palette.secondary.main }}
                          >
                            <ShareIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Report Categories */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Report Categories
          </Typography>
          <Grid container spacing={3}>
            {[
              {
                title: 'Consumption Reports',
                description: 'Detailed analysis of energy usage patterns',
                count: 8,
              },
              {
                title: 'Financial Reports',
                description: 'Cost analysis and budget tracking',
                count: 6,
              },
              {
                title: 'Environmental Reports',
                description: 'Carbon footprint and sustainability metrics',
                count: 5,
              },
              {
                title: 'Custom Reports',
                description: 'Tailored reports for specific needs',
                count: 5,
              },
            ].map((category, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: theme.shadows[4],
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {category.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {category.description}
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {category.count}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Reports; 