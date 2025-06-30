import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { USE_MOCK_SERVICES } from '../../services/api';
import { RootState } from '..';

// Consumption data interface
export interface ConsumptionData {
  id: string;
  deviceId: string;
  timestamp?: string;
  value?: number;
  reading_date: string;
  consumption_kwh: number;
  device_id?: string;
  user_id?: string;
  reading_time?: string;
  cost?: number;
}

// Device consumption summary interface
export interface DeviceConsumption {
  deviceId: string;
  deviceName: string;
  value: number;
  percentage: number;
}

// Consumption state interface
interface ConsumptionState {
  consumptionData: ConsumptionData[];
  consumptionByDevice: DeviceConsumption[];
  deviceConsumption: ConsumptionData[];
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: ConsumptionState = {
  consumptionData: [],
  consumptionByDevice: [],
  deviceConsumption: [],
  isLoading: false,
  error: null
};

// API base URL
const API_URL = 'http://localhost:5000/api/consumption';

// Mock data generator
const generateMockConsumptionData = (timeRange: string): ConsumptionData[] => {
  const data: ConsumptionData[] = [];
  const now = new Date();
  
  // Generate 30 data points for monthly, 7 for weekly, etc.
  const dataPoints = timeRange === 'month' ? 30 : timeRange === 'week' ? 7 : timeRange === 'year' ? 12 : 24;
  
  for (let i = 0; i < dataPoints; i++) {
    const date = new Date();
    
    if (timeRange === 'month') {
      date.setDate(date.getDate() - (dataPoints - i));
    } else if (timeRange === 'week') {
      date.setDate(date.getDate() - (dataPoints - i));
    } else if (timeRange === 'year') {
      date.setMonth(date.getMonth() - (dataPoints - i));
    } else { // day
      date.setHours(date.getHours() - (dataPoints - i));
    }
    
    const value = Math.floor(Math.random() * 200) + 50; // Random value between 50-250
    
    data.push({
      id: `mock-data-${i}`,
      deviceId: '',
      timestamp: date.toISOString(),
      value: value,
      reading_date: date.toISOString().split('T')[0], // YYYY-MM-DD format
      consumption_kwh: value,
      reading_time: date.toISOString().split('T')[1].substring(0, 8) // HH:MM:SS format
    });
  }
  
  return data;
};

// Mock data generator for devices
const generateMockConsumptionByDevice = (timeRange: string): DeviceConsumption[] => {
  const devices = [
    { id: 'device-1', name: 'Buzdolabı' },
    { id: 'device-2', name: 'Çamaşır Makinesi' },
    { id: 'device-3', name: 'Bulaşık Makinesi' },
    { id: 'device-4', name: 'Klima' },
    { id: 'device-5', name: 'Televizyon' }
  ];
  
  // Sabit tüketim değerleri
  const consumptionValues = [400, 250, 150, 120, 80]; // Toplam 1000
  const totalConsumption = 1000;
  
  return devices.map((device, index) => {
    const value = consumptionValues[index];
    
    return {
      deviceId: device.id,
      deviceName: device.name,
      value,
      percentage: (value / totalConsumption) * 100
    };
  });
};

// Async thunks
export const fetchConsumptionData = createAsyncThunk(
  'consumption/fetchConsumptionData',
  async (timeRange: 'day' | 'week' | 'month' | 'year', { rejectWithValue, getState }) => {
    try {
      // Cihaz verilerini state'den al
      const state = getState() as RootState;
      const devices = state.devices.devices;
      
      if (!devices || devices.length === 0) {
        console.warn('Cihaz verisi bulunamadı, tüketim verisi oluşturulamıyor');
        return [];
      }
      
      // Zaman serisi oluştur
      const data: ConsumptionData[] = [];
      const now = new Date();
      
      // Zaman aralığına göre veri noktaları oluştur
      const dataPoints = timeRange === 'month' ? 30 : 
                        timeRange === 'week' ? 7 : 
                        timeRange === 'year' ? 12 : 24;
      
      // Her gün için toplam tüketimi hesapla
      for (let i = 0; i < dataPoints; i++) {
        const date = new Date();
        
        if (timeRange === 'month') {
          date.setDate(date.getDate() - (dataPoints - i));
        } else if (timeRange === 'week') {
          date.setDate(date.getDate() - (dataPoints - i));
        } else if (timeRange === 'year') {
          date.setMonth(date.getMonth() - (dataPoints - i));
        } else { // day
          date.setHours(date.getHours() - (dataPoints - i));
        }
        
        // Tüm cihazların toplam tüketimini hesapla
        let totalConsumptionForDay = 0;
        
        devices.forEach(device => {
          // kWh cinsinden günlük tüketim - Tüketim Detayları tablosuyla aynı formül
          const powerKW = (device.power_consumption_watts || 0) / 1000;
          const hoursPerDay = Math.max(device.usage_hours_per_day || 0, 0.01);
          const daysPerWeek = device.usage_days_per_week || 7;
          
          // Günlük kWh hesabı (haftada kaç gün kullanıldığı dahil)
          const dailyConsumption = Number((powerKW * hoursPerDay * (daysPerWeek / 7)).toFixed(2));
          
          // Toplam tüketime ekle
          totalConsumptionForDay += dailyConsumption;
        });
        
        // Veri noktası oluştur
        data.push({
          id: `data-${date.getTime()}`,
          deviceId: '',
          reading_date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          consumption_kwh: totalConsumptionForDay,
          reading_time: date.toISOString().split('T')[1].substring(0, 8) // HH:MM:SS format
        });
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching consumption data:', error);
      return rejectWithValue('Failed to fetch consumption data');
    }
  }
);

// Async thunks for consumption by device
export const fetchConsumptionByDevice = createAsyncThunk(
  'consumption/fetchConsumptionByDevice',
  async (timeRange: 'day' | 'week' | 'month' | 'year', { rejectWithValue, getState }) => {
    try {
      // Cihaz verilerini state'den al
      const state = getState() as RootState;
      const devices = state.devices.devices;
      
      if (!devices || devices.length === 0) {
        console.warn('Cihaz verisi bulunamadı, cihaz tüketimi oluşturulamıyor');
        return [];
      }
      
      // Her cihaz için tüketimi hesapla
      const deviceConsumptions: DeviceConsumption[] = [];
      let totalConsumption = 0;
      
      devices.forEach(device => {
        // kWh cinsinden günlük tüketim - Tüketim Detayları tablosuyla aynı formül
        const powerKW = (device.power_consumption_watts || 0) / 1000;
        const hoursPerDay = Math.max(device.usage_hours_per_day || 0, 0.01);
        const daysPerWeek = device.usage_days_per_week || 7;
        
        // Günlük kWh hesabı
        const dailyConsumption = Number((powerKW * hoursPerDay * (daysPerWeek / 7)).toFixed(2));
        
        // Zaman aralığına göre toplam tüketim
        let deviceTotalConsumption = 0;
        if (timeRange === 'day') {
          deviceTotalConsumption = dailyConsumption;
        } else if (timeRange === 'week') {
          deviceTotalConsumption = dailyConsumption * 7;
        } else if (timeRange === 'month') {
          deviceTotalConsumption = dailyConsumption * 30; // Yaklaşık bir ay
        } else { // year
          deviceTotalConsumption = dailyConsumption * 365; // Yaklaşık bir yıl
        }
        
        deviceConsumptions.push({
          deviceId: device.id,
          deviceName: device.name,
          value: Number(deviceTotalConsumption.toFixed(2)),
          percentage: 0 // Yüzde değerleri sonradan hesaplanacak
        });
        
        totalConsumption += deviceTotalConsumption;
      });
      
      // Yüzde değerlerini hesapla
      if (totalConsumption > 0) {
        deviceConsumptions.forEach(item => {
          item.percentage = Number(((item.value / totalConsumption) * 100).toFixed(1));
        });
      }
      
      return deviceConsumptions;
    } catch (error) {
      console.error('Error fetching consumption by device:', error);
      return rejectWithValue('Failed to fetch consumption by device');
    }
  }
);

export const fetchDeviceConsumption = createAsyncThunk(
  'consumption/fetchDeviceConsumption',
  async ({ deviceId, timeRange }: { deviceId: string; timeRange: 'day' | 'week' | 'month' }, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Return mock data specific to the device
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return generateMockConsumptionData(timeRange).map(item => ({...item, deviceId}));
      }
      
      const response = await api.get(`${API_URL}/device/${deviceId}?timeRange=${timeRange}`);
      
      // API response yapısı: { success: true, data: [...] }
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      
      // If we get here, we have an unexpected response format
      console.error('Unexpected API response format:', response.data);
      return [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch device consumption');
    }
  }
);

// Consumption slice
const consumptionSlice = createSlice({
  name: 'consumption',
  initialState,
  reducers: {
    clearConsumptionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch consumption data
      .addCase(fetchConsumptionData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConsumptionData.fulfilled, (state, action: PayloadAction<ConsumptionData[]>) => {
        state.isLoading = false;
        state.consumptionData = action.payload;
      })
      .addCase(fetchConsumptionData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch consumption by device
      .addCase(fetchConsumptionByDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConsumptionByDevice.fulfilled, (state, action: PayloadAction<DeviceConsumption[]>) => {
        state.isLoading = false;
        state.consumptionByDevice = action.payload;
      })
      .addCase(fetchConsumptionByDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch device consumption
      .addCase(fetchDeviceConsumption.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeviceConsumption.fulfilled, (state, action: PayloadAction<ConsumptionData[]>) => {
        state.isLoading = false;
        state.deviceConsumption = action.payload;
      })
      .addCase(fetchDeviceConsumption.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearConsumptionError } = consumptionSlice.actions;
export default consumptionSlice.reducer; 