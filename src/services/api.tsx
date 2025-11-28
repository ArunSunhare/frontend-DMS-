import axios, { AxiosInstance, AxiosError } from 'axios';

const VITE_API_URL =
  (import.meta.env.VITE_API_URL as string) || 'http://localhost:5002/api';
 // Changed port to 5000 for new backend

export interface RegistrationData {
  username: string;
  password: string;
  role?: 'OPERATOR' | 'CONTROLLER' | 'COMMAND_ADMIN'; // Added role field
  operatorCategory: { key: string; name: string };
  command: { key: string; name: string };
  division: { key: string; name: string };
  brigade: { key: string; name: string };
  corps: { key: string; name: string };
  unit: string;
  assignedCommand?: string; // For command admins
  droneSpecs: Array<{
    droneName: string;
    droneIds: string[];
    quantity: number;
    frequency: number;
    clockDrift: number;
    spectralLeakage: number;
    modularshapeId: number;
    maxHeight: number;
    maxSpeed: number;
    maxRange: number;
    maxDuration: number;
    gpsEnabled: string;
    autonomous: string;
    controlled: string;
    cameraEnabled: string;
    cameraResolution: string;
    operatingFrequency: string;
  }>;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL:  VITE_API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000, // Added timeout
    });

    // Interceptor to add token to every request
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('dms_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Enhanced interceptor for handling 401/403 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication error:', error.response?.data);
          localStorage.removeItem('dms_token');
          localStorage.removeItem('dms_user');
          // Redirect to login page
          window.location.href = '/';
        }
        return Promise.reject(error);
      }
    );
  }

  async registerUser(registrationData: RegistrationData): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const response = await this.api.post('/auth/register', registrationData);
      return response.data;
    } catch (error: any) {
      console.error('Registration API error:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please check your connection and try again.',
      };
    }
  }

  async login(username: string, password: string): Promise<{ success: boolean; token?: string; user?: any; message?: string }> {
    try {
      console.log('Attempting login for:', username); // Debug log
      const response = await this.api.post('/auth/login', { username, password });
      console.log('Login response:', response.data); // Debug log
      return response.data;
    } catch (error: any) {
      console.error('Login API error:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please check your connection and try again.',
      };
    }
  }

  async getUserDroneSpecs(userId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/drones/user/${userId}`);
      // Handle new RBAC response structure
      if (response.data && typeof response.data === 'object' && 'specs' in response.data) {
        return response.data.specs || [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get user drone specs:', error.message, error.response?.data);
      return [];
    }
  }

  async getAllFlights(): Promise<any[]> {
    try {
      const response = await this.api.get('/flights');
      console.log("getAllFlights response:", response.data); // Debug log
      
      // Handle new RBAC response structure
      if (response.data && typeof response.data === 'object' && 'allFlights' in response.data) {
        return response.data.allFlights || [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get all flights:', error.message, error.response?.data);
      throw error; // Propagate error for debugging
    }
  }

  async getFlightWaypoints(flightId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/flights/${flightId}/waypoints`);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get flight waypoints:', error.message, error.response?.data);
      return [];
    }
  }

  async createFlight(flightData: any, waypoints: any[]): Promise<{ success: boolean; flightId?: string; message?: string }> {
    try {
      const response = await this.api.post('/flights', { flight: flightData, waypoints });
      return response.data;
    } catch (error: any) {
      console.error('Failed to create flight:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please try again.',
      };
    }
  }

  async updateFlight(flightId: string, updates: any): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.api.put(`/flights/${flightId}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Failed to update flight:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please try again.',
      };
    }
  }

  async requestCancelFlight(flightId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.api.post(`/flights/${flightId}/cancel`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to request cancel:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Network error. Please try again.',
      };
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.api.get('/health');
      console.log('Health check response:', response.data); // Debug log
      return response.status === 200;
    } catch (error: any) {
      console.error('Health check failed:', error.message);
      return false;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const response = await this.api.get('/users');
      console.log('getAllUsers response:', response.data); // Debug log
      
      // Handle new RBAC response structure
      if (response.data && typeof response.data === 'object' && 'users' in response.data) {
        return response.data.users || [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get all users:', error.message, error.response?.data);
      return [];
    }
  }

  async getAllDroneSpecs(): Promise<any[]> {
    try {
      const response = await this.api.get('/drones/all');
      console.log('getAllDroneSpecs response:', response.data); // Debug log
      
      // Handle new RBAC response structure
      if (response.data && typeof response.data === 'object' && 'allSpecs' in response.data) {
        return response.data.allSpecs || [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get all drone specs:', error.message, error.response?.data);
      return [];
    }
  }

  async getUserById(userId: string): Promise<any | null> {
    try {
      const response = await this.api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get user by ID:', error.message, error.response?.data);
      return null;
    }
  }

  // New helper methods for RBAC
  async getUserProfile(): Promise<any | null> {
    try {
      const response = await this.api.get('/users/profile');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get user profile:', error.message, error.response?.data);
      return null;
    }
  }

  async createCommandAdmin(adminData: {
    username: string;
    password: string;
    assignedCommand: string;
    commandName: string;
  }): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      const response = await this.api.post('/auth/create-admin', adminData);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create command admin:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create command admin.',
      };
    }
  }

  async getCommands(): Promise<any[]> {
    try {
      const response = await this.api.get('/commands');
      if (response.data && typeof response.data === 'object' && 'commands' in response.data) {
        return response.data.commands || [];
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get commands:', error.message, error.response?.data);
      return [];
    }
  }

  // Flight management methods
  async approveFlight(flightId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.api.post(`/flights/${flightId}/approve`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to approve flight:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to approve flight.',
      };
    }
  }

  async deleteFlight(flightId: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await this.api.delete(`/flights/${flightId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete flight:', error.message, error.response?.data);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete flight.',
      };
    }
  }

  // Permission helper methods
  canUserAccessCommand(user: any | null, commandCode: string): boolean {
    if (!user) return false;
    
    // Super admin with all access can access any command
    if (user.role === 'SUPER_ADMIN' && user.can_access_all_commands) {
      return true;
    }
    
    // Command admin can access their assigned command
    if (user.role === 'COMMAND_ADMIN' && user.assigned_command === commandCode) {
      return true;
    }
    
    // Users can access their own command
    if (user.command === commandCode) {
      return true;
    }
    
    // Check accessible commands array
    return user.accessibleCommands?.includes(commandCode) || false;
  }

  canUserModifyData(user: any | null): boolean {
    if (!user) return false;
    return ['SUPER_ADMIN', 'COMMAND_ADMIN'].includes(user.role);
  }

  canUserDeleteData(user: any | null): boolean {
    if (!user) return false;
    return ['SUPER_ADMIN', 'COMMAND_ADMIN'].includes(user.role);
  }

  canUserCreateAdmins(user: any | null): boolean {
    if (!user) return false;
    return user.role === 'SUPER_ADMIN';
  }

  getUserRoleDisplayName(role: string): string {
    const roleNames = {
      'SUPER_ADMIN': 'Super Administrator',
      'COMMAND_ADMIN': 'Command Administrator',
      'CONTROLLER': 'Controller',
      'OPERATOR': 'Operator'
    };
    return roleNames[role as keyof typeof roleNames] || role;
  }

  getCommandDisplayName(commandCode: string): string {
    const commandNames = {
      'ec': 'Eastern Command',
      'wc': 'Western Command',
      'sc': 'Southern Command',
      'nc': 'Northern Command',
      'swc': 'South Western Command',
      'anc': 'Central Command'
    };
    return commandNames[commandCode as keyof typeof commandNames] || commandCode.toUpperCase();
  }
}

export const apiService = new ApiService();
export default apiService;