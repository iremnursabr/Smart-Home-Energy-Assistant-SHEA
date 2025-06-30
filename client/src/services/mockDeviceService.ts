// Mock Device Service
// This service simulates API responses for device operations
// Used for development/testing when a real backend is not available

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Device interface
interface Device {
  id: string;
  name: string;
  type: string;
  status: string;
  location: string;
  consumption?: number;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

// Mock device data
const mockDevices: Device[] = [];

// Mock fetch devices
export const mockFetchDevices = async (): Promise<Device[]> => {
  await delay(800);
  return [...mockDevices];
};

// Mock fetch device by ID
export const mockFetchDeviceById = async (id: string): Promise<Device> => {
  await delay(500);
  const device = mockDevices.find(device => device.id === id);
  
  if (!device) {
    throw new Error('Device not found');
  }
  
  return { ...device };
};

// Mock add device
export const mockAddDevice = async (deviceData: Partial<Device>): Promise<Device> => {
  await delay(1000);
  
  // Generate a new ID
  const newId = `device-${Date.now()}`;
  
  // Create new device
  const newDevice: Device = {
    id: newId,
    name: deviceData.name || '',
    type: deviceData.type || '',
    status: deviceData.status || 'inactive',
    location: deviceData.location || '',
    ...deviceData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Add to mock data
  mockDevices.push(newDevice);
  
  return { ...newDevice };
};

// Mock update device
export const mockUpdateDevice = async (id: string, deviceData: Partial<Device>): Promise<Device> => {
  await delay(1000);
  
  const deviceIndex = mockDevices.findIndex(device => device.id === id);
  
  if (deviceIndex === -1) {
    throw new Error('Device not found');
  }
  
  // Update device
  const updatedDevice: Device = {
    ...mockDevices[deviceIndex],
    ...deviceData,
    updatedAt: new Date().toISOString()
  };
  
  // Update in mock data
  mockDevices[deviceIndex] = updatedDevice;
  
  return { ...updatedDevice };
};

// Mock delete device
export const mockDeleteDevice = async (id: string): Promise<{ success: boolean }> => {
  await delay(800);
  
  const deviceIndex = mockDevices.findIndex(device => device.id === id);
  
  if (deviceIndex === -1) {
    throw new Error('Device not found');
  }
  
  // Remove from mock data
  mockDevices.splice(deviceIndex, 1);
  
  return { success: true };
};

export default {
  fetchDevices: mockFetchDevices,
  fetchDeviceById: mockFetchDeviceById,
  addDevice: mockAddDevice,
  updateDevice: mockUpdateDevice,
  deleteDevice: mockDeleteDevice
}; 