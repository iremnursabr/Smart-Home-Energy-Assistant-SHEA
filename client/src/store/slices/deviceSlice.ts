import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api, { USE_MOCK_SERVICES } from '../../services/api';

// Device interface
export interface Device {
  id: string;
  user_id: string;
  name: string;
  device_type: string;
  brand?: string;
  model?: string;
  energy_efficiency_class?: string;
  power_consumption_watts?: number;
  usage_hours_per_day?: number;
  usage_days_per_week?: number;
  purchase_date?: string;
  created_at?: string;
  updated_at?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  location?: string;
}

// Device state interface
interface DeviceState {
  devices: Device[];
  selectedDevice: Device | null;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: DeviceState = {
  devices: [],
  selectedDevice: null,
  isLoading: false,
  error: null
};

// API base URL
const API_URL = 'http://localhost:5000/api/devices';

// Mock devices data
const mockDevices: Device[] = [
  {
    id: '1',
    user_id: 'user1',
    name: 'Buzdolabı',
    device_type: 'refrigerator',
    status: 'active',
    brand: 'Samsung',
    model: 'BZ-2000',
    energy_efficiency_class: 'A+',
    power_consumption_watts: 120,
    usage_hours_per_day: 24,
    usage_days_per_week: 7,
    purchase_date: '2023-01-15',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    user_id: 'user1',
    name: 'Çamaşır Makinesi',
    device_type: 'washing_machine',
    status: 'active',
    brand: 'Bosch',
    model: 'CM-1500',
    energy_efficiency_class: 'A++',
    power_consumption_watts: 85,
    usage_hours_per_day: 2,
    usage_days_per_week: 1,
    purchase_date: '2023-03-22',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    user_id: 'user1',
    name: 'Bulaşık Makinesi',
    device_type: 'dishwasher',
    status: 'inactive',
    brand: 'Arçelik',
    model: 'BM-1200',
    energy_efficiency_class: 'A',
    power_consumption_watts: 95,
    usage_hours_per_day: 1.5,
    usage_days_per_week: 1,
    purchase_date: '2022-11-10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    user_id: 'user1',
    name: 'Klima',
    device_type: 'air_conditioner',
    status: 'active',
    brand: 'Mitsubishi',
    model: 'KL-3000',
    energy_efficiency_class: 'B',
    power_consumption_watts: 200,
    usage_hours_per_day: 8,
    usage_days_per_week: 5,
    purchase_date: '2022-07-05',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    user_id: 'user1',
    name: 'Televizyon',
    device_type: 'television',
    status: 'active',
    brand: 'LG',
    model: 'TV-4K',
    energy_efficiency_class: 'A+',
    power_consumption_watts: 75,
    usage_hours_per_day: 5,
    usage_days_per_week: 5,
    purchase_date: '2023-05-18',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Async thunks
export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (_, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Return mock data
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        return mockDevices;
      }
      
      const response = await api.get(API_URL);
      return response.data.data.devices;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch devices');
    }
  }
);

export const fetchDeviceById = createAsyncThunk(
  'devices/fetchDeviceById',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Return mock data
        await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
        const device = mockDevices.find(d => d.id === id);
        if (!device) {
          throw new Error('Device not found');
        }
        return device;
      }
      
      const response = await api.get(`${API_URL}/${id}`);
      return response.data.data.device;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch device');
    }
  }
);

export const createDevice = createAsyncThunk(
  'devices/createDevice',
  async (deviceData: Omit<Device, 'id'>, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Create mock device
        await new Promise(resolve => setTimeout(resolve, 700)); // Simulate API delay
        const newDevice = {
          ...deviceData,
          id: `${mockDevices.length + 1}` // Simple ID generation
        };
        return newDevice;
      }
      
      const response = await api.post(API_URL, deviceData);
      return response.data.data.device;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create device');
    }
  }
);

export const updateDevice = createAsyncThunk(
  'devices/updateDevice',
  async ({ id, deviceData }: { id: string; deviceData: Partial<Device> }, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Update mock device
        await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
        const deviceIndex = mockDevices.findIndex(d => d.id === id);
        if (deviceIndex === -1) {
          throw new Error('Device not found');
        }
        
        const updatedDevice = {
          ...mockDevices[deviceIndex],
          ...deviceData
        };
        
        return updatedDevice;
      }
      
      const response = await api.put(`${API_URL}/${id}`, deviceData);
      return response.data.data.device;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update device');
    }
  }
);

export const deleteDevice = createAsyncThunk(
  'devices/deleteDevice',
  async (id: string, { rejectWithValue }) => {
    try {
      if (USE_MOCK_SERVICES) {
        // Simulate deletion
        await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
        return id;
      }
      
      await api.delete(`${API_URL}/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete device');
    }
  }
);

// Device slice
const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    clearDeviceError: (state) => {
      state.error = null;
    },
    clearSelectedDevice: (state) => {
      state.selectedDevice = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch devices
      .addCase(fetchDevices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action: PayloadAction<Device[]>) => {
        state.isLoading = false;
        state.devices = action.payload;
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch device by ID
      .addCase(fetchDeviceById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeviceById.fulfilled, (state, action: PayloadAction<Device>) => {
        state.isLoading = false;
        state.selectedDevice = action.payload;
      })
      .addCase(fetchDeviceById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Create device
      .addCase(createDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createDevice.fulfilled, (state, action: PayloadAction<Device>) => {
        state.isLoading = false;
        state.devices.push(action.payload);
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Update device
      .addCase(updateDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateDevice.fulfilled, (state, action: PayloadAction<Device>) => {
        state.isLoading = false;
        const index = state.devices.findIndex(device => device.id === action.payload.id);
        if (index !== -1) {
          state.devices[index] = action.payload;
        }
        if (state.selectedDevice && state.selectedDevice.id === action.payload.id) {
          state.selectedDevice = action.payload;
        }
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Delete device
      .addCase(deleteDevice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteDevice.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false;
        state.devices = state.devices.filter(device => device.id !== action.payload);
        if (state.selectedDevice && state.selectedDevice.id === action.payload) {
          state.selectedDevice = null;
        }
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearDeviceError, clearSelectedDevice } = deviceSlice.actions;
export default deviceSlice.reducer; 