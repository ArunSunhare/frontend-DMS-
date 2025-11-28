import axios, { AxiosInstance, AxiosError } from 'axios';

const VITE_API_URL = 'https://backend-dms-production.up.railway.app/api';
// const VITE_API_URL = 'http://localhost:5002/api'; // Local development URL

export interface RegistrationData {
  username: string;
  password: string;
  role?: 'OPERATOR' | 'CONTROLLER' | 'COMMAND_ADMIN';
  operatorCategory: { key: string; name: string };
  command: { key: string; name: string };
  division: { key: string; name: string };
  brigade: { key: string; name: string };
  corps: { key: string; name: string };
  unit: string;
  assignedCommand?: string;
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
      baseURL: VITE_API_URL,
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000, // Increased timeout to 30 seconds
    });

    // Interceptor to add token to every request
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('dms_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Enhanced interceptor for handling 401/403 errors
    this.api.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.error('Authentication error:', error.response?.data);
          localStorage.removeItem('dms_token');
          localStorage.removeItem('dms_user');
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
      console.log('Attempting login for:', username);
      const response = await this.api.post('/auth/login', { username, password });
      console.log('Login response:', response.data);
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
      console.log('getUserDroneSpecs response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        if ('specs' in response.data) {
          return Array.isArray(response.data.specs) ? response.data.specs : [];
        }
        if ('droneSpecs' in response.data) {
          return Array.isArray(response.data.droneSpecs) ? response.data.droneSpecs : [];
        }
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
      console.log('getAllFlights response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        if ('allFlights' in response.data) {
          return Array.isArray(response.data.allFlights) ? response.data.allFlights : [];
        }
        if ('flights' in response.data) {
          return Array.isArray(response.data.flights) ? response.data.flights : [];
        }
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get all flights:', error.message, error.response?.data);
      return [];
    }
  }

  async getFlightWaypoints(flightId: string): Promise<any[]> {
    try {
      const response = await this.api.get(`/flights/${flightId}/waypoints`);
      console.log('getFlightWaypoints response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        if ('waypoints' in response.data) {
          return Array.isArray(response.data.waypoints) ? response.data.waypoints : [];
        }
      }
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
      console.log('Health check response:', response.data);
      return response.status === 200;
    } catch (error: any) {
      console.error('Health check failed:', error.message);
      return false;
    }
  }

  async getAllUsers(): Promise<any[]> {
    try {
      const response = await this.api.get('/users');
      console.log('getAllUsers response:', response.data);
      
      if (response.data && typeof response.data === 'object') {
        if ('users' in response.data) {
          return Array.isArray(response.data.users) ? response.data.users : [];
        }
      }
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      console.error('Failed to get all users:', error.message, error.response?.data);
      return [];
    }
  }

  async getAllDroneSpecs(): Promise<any[]> {
    try {
      console.log('Fetching all drone specs...');
      const response = await this.api.get('/drones/all', {
        timeout: 30000, // Explicit 30s timeout for this call
      });
      console.log('getAllDroneSpecs response:', response.data);
      
      // Handle multiple possible response structures
      if (response.data && typeof response.data === 'object') {
        // Check for 'allSpecs' property
        if ('allSpecs' in response.data) {
          const specs = response.data.allSpecs;
          console.log('Found allSpecs:', Array.isArray(specs) ? specs.length : 'not array');
          return Array.isArray(specs) ? specs : [];
        }
        // Check for 'specs' property
        if ('specs' in response.data) {
          const specs = response.data.specs;
          console.log('Found specs:', Array.isArray(specs) ? specs.length : 'not array');
          return Array.isArray(specs) ? specs : [];
        }
        // Check for 'droneSpecs' property
        if ('droneSpecs' in response.data) {
          const specs = response.data.droneSpecs;
          console.log('Found droneSpecs:', Array.isArray(specs) ? specs.length : 'not array');
          return Array.isArray(specs) ? specs : [];
        }
        // Check for 'data' property
        if ('data' in response.data) {
          const specs = response.data.data;
          console.log('Found data:', Array.isArray(specs) ? specs.length : 'not array');
          return Array.isArray(specs) ? specs : [];
        }
      }
      
      // If response.data is already an array
      if (Array.isArray(response.data)) {
        console.log('Response data is array:', response.data.length);
        return response.data;
      }
      
      console.warn('No drone specs found in response, returning empty array');
      return [];
    } catch (error: any) {
      // Enhanced error logging
      if (error.code === 'ECONNABORTED') {
        console.error('getAllDroneSpecs timeout error - Request took longer than 30 seconds');
      } else if (error.response) {
        console.error('getAllDroneSpecs server error:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('getAllDroneSpecs network error - No response received:', error.message);
      } else {
        console.error('getAllDroneSpecs error:', error.message);
      }
      
      // Return empty array instead of throwing to prevent app crash
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
    
    if (user.role === 'SUPER_ADMIN' && user.can_access_all_commands) {
      return true;
    }
    
    if (user.role === 'COMMAND_ADMIN' && user.assigned_command === commandCode) {
      return true;
    }
    
    if (user.command === commandCode) {
      return true;
    }
    
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