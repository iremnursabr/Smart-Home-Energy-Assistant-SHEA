// Mock Dashboard Service
// This service simulates API responses for dashboard operations
// Used for development/testing when a real backend is not available

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock dashboard data
const mockDashboardData = {
  consumption: {
    total: 0,
    average: 0,
    change: 0,
    unit: 'kWh'
  },
  carbonFootprint: {
    total: 0,
    average: 0,
    change: 0,
    unit: 'kg CO2'
  },
  energyUsage: [
    { date: '2023-01-01', value: 0 },
    { date: '2023-01-02', value: 0 },
    { date: '2023-01-03', value: 0 },
    { date: '2023-01-04', value: 0 },
    { date: '2023-01-05', value: 0 },
    { date: '2023-01-06', value: 0 },
    { date: '2023-01-07', value: 0 }
  ],
  devices: [],
  invoices: [],
  savingsTips: []
};

// Mock fetch dashboard data
export const mockFetchDashboardData = async () => {
  await delay(800);
  return mockDashboardData;
};

export default {
  fetchDashboardData: mockFetchDashboardData
}; 