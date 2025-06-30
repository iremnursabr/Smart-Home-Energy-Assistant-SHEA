// Mock Authentication Service
// This service simulates API responses for authentication operations
// Used for development/testing when a real backend is not available

// Sample user database (in-memory)
const mockUsers = [
  {
    id: '1',
    username: 'demo',
    email: 'demo@example.com',
    password: 'password123',
    first_name: 'Demo',
    last_name: 'User',
    role: 'standard',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    username: 'admin',
    email: 'admin@example.com',
    password: 'adminpassword',
    first_name: 'Admin',
    last_name: 'User',
    role: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Session simulator
let isSessionActive: boolean = false;
let currentUserId: string | null = null;

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock login service
export const mockLogin = async (credentials: { email: string; password: string }) => {
  // Simulate network delay
  await delay(800);
  
  // Find user by email
  const user = mockUsers.find(user => user.email === credentials.email);
  
  // If user not found or password doesn't match
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.password !== credentials.password) {
    throw new Error('Invalid credentials');
  }
  
  // Simulate session creation
  isSessionActive = true;
  currentUserId = user.id;
  
  // Remove password from user object
  const { password, ...userWithoutPassword } = user;
  
  return { success: true, user: userWithoutPassword };
};

// Mock register service
export const mockRegister = async (userData: { 
  username: string; 
  email: string; 
  password: string; 
  first_name: string; 
  last_name: string;
  phone_number?: string;
}) => {
  // Simulate network delay
  await delay(1000);
  
  // Check if user already exists
  const userExists = mockUsers.some(
    user => user.email === userData.email || user.username === userData.username
  );
  
  if (userExists) {
    throw new Error('User with this email or username already exists');
  }
  
  // Create new user
  const newUser = {
    id: `${mockUsers.length + 1}`,
    ...userData,
    role: 'standard', // Default role for new users
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  
  // Add to mock database
  mockUsers.push(newUser);
  
  // Simulate session creation
  isSessionActive = true;
  currentUserId = newUser.id;
  
  // Remove password from user object
  const { password, ...userWithoutPassword } = newUser;
  
  console.log('Mock registration successful:', userWithoutPassword);
  return { success: true, user: userWithoutPassword };
};

// Mock logout service
export const mockLogout = async () => {
  await delay(300);
  
  // Destroy session
  isSessionActive = false;
  currentUserId = null;
  
  return { success: true };
};

// Mock fetch user profile
export const mockFetchUserProfile = async () => {
  await delay(500);
  
  // Check for active session
  if (!isSessionActive || !currentUserId) {
    throw new Error('Not authenticated');
  }
  
  // Find user by id
  const user = mockUsers.find(user => user.id === currentUserId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Remove password from user object
  const { password, ...userWithoutPassword } = user;
  
  // Add additional profile fields that might be needed
  return {
    ...userWithoutPassword,
    phone: '+90 555 123 4567',
    address: 'Örnek Mahallesi, 123 Sokak',
    city: 'İstanbul',
    country: 'Türkiye',
    postal_code: '34000',
    profile_picture: null,
    notification_settings: {
      emailNotifications: true,
      pushNotifications: true,
      monthlyReports: true,
      savingsTips: true
    }
  };
};

// Mock update user profile
export const mockUpdateProfile = async (profileData: any) => {
  // Simulate network delay
  await delay(800);
  
  // Check for active session
  if (!isSessionActive || !currentUserId) {
    throw new Error('Not authenticated');
  }
  
  // Find user by id
  const userIndex = mockUsers.findIndex(u => u.id === currentUserId);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  // Update the user
  const updatedUser = {
    ...mockUsers[userIndex],
    ...profileData,
    updated_at: new Date().toISOString()
  };
  
  // Update in "database"
  mockUsers[userIndex] = updatedUser;
  
  // Return user without password
  const { password, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
};

export default {
  login: mockLogin,
  register: mockRegister,
  logout: mockLogout,
  fetchUserProfile: mockFetchUserProfile,
  updateProfile: mockUpdateProfile
}; 