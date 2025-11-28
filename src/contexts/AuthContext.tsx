// import React, { createContext, useContext, useState, useEffect } from 'react';
// import { apiService } from '../services/api'; // Import apiService
// import { RegistrationData } from '../services/api'; // Import RegistrationData type

// interface User {
//   id: string;
//   username: string;
//   role: string;
//   command_number?: number;
//   operatorCategory?: string;
//   operatorCategoryName?: string;
//   command?: string;
//   commandName?: string;
//   division?: string;
//   divisionName?: string;
//   brigade?: string;
//   brigadeName?: string;
//   corps?: string;
//   corpsName?: string;
//   unit?: string;
// }

// interface AuthContextType {
//   user: User | null;
//   login: (username: string, password: string) => Promise<boolean>;
//   logout: () => void;
//   isLoading: boolean;
//   register: (registrationData: RegistrationData) => Promise<{ success: boolean; message: string }>;
//   getAllUsers: () => Promise<User[]>;
//   getAllDroneSpecs: () => Promise<any[]>;
//   getUserDroneSpecs: (userId: string) => Promise<any[]>;
//   getUserById: (userId: string) => Promise<User | null>;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     const initializeAuth = async () => {
//       try {
//         const token = localStorage.getItem('dms_token');
//         const savedUser = localStorage.getItem('dms_user');

//         if (token && savedUser) {
//           try {
//             const parsedUser = JSON.parse(savedUser);
//             // Use apiService to verify user
//             const fetchedUser = await apiService.getUserById(parsedUser.id);
//             if (fetchedUser) {
//               setUser(fetchedUser);
//             } else {
//               // Invalid user or token
//               localStorage.removeItem('dms_token');
//               localStorage.removeItem('dms_user');
//             }
//           } catch (error) {
//             console.error('Error validating user:', error);
//             localStorage.removeItem('dms_token');
//             localStorage.removeItem('dms_user');
//           }
//         }
//       } catch (error) {
//         console.error('Auth initialization failed:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     initializeAuth();
//   }, []);

//   const login = async (username: string, password: string): Promise<boolean> => {
//     try {
//       const { success, token, user, message } = await apiService.login(username, password);
//       if (success && token && user) {
//         setUser(user);
//         localStorage.setItem('dms_token', token);
//         localStorage.setItem('dms_user', JSON.stringify(user));
//         return true;
//       }
//       console.error('Login failed:', message);
//       return false;
//     } catch (error) {
//       console.error('Login failed:', error);
//       return false;
//     }
//   };

//   const register = async (registrationData: RegistrationData): Promise<{ success: boolean; message: string }> => {
//     try {
//       const response = await apiService.registerUser(registrationData);
//       return response;
//     } catch (error) {
//       console.error('Registration failed:', error);
//       return { success: false, message: 'Registration failed due to a system error' };
//     }
//   };

//  const getAllUsers = async (): Promise<User[]> => {
//   try {
//     const token = localStorage.getItem('dms_token');
//     if (!token) throw new Error('No authentication token');

//     const response = await fetch(`${API_BASE_URL}/users`, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });

//     if (!response.ok) {
//       if (response.status === 401) {
//         logout();
//         throw new Error('Session expired');
//       }
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     return await response.json();
//   } catch (error) {
//     console.error('Failed to get all users:', error);
//     return [];
//   }
// };

//   const getAllDroneSpecs = async (): Promise<any[]> => {
//     try {
//       return await apiService.getAllDroneSpecs();
//     } catch (error) {
//       console.error('Failed to get all drone specs:', error);
//       return [];
//     }
//   };

//   const getUserDroneSpecs = async (userId: string): Promise<any[]> => {
//     try {
//       return await apiService.getUserDroneSpecs(userId);
//     } catch (error) {
//       console.error('Failed to get user drone specs:', error);
//       return [];
//     }
//   };

//   const getUserById = async (userId: string): Promise<User | null> => {
//     try {
//       return await apiService.getUserById(userId);
//     } catch (error) {
//       console.error('Failed to get user by ID:', error);
//       return null;
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem('dms_token');
//     localStorage.removeItem('dms_user');
//     window.location.href = '/'; // Redirect to login page
//   };

//   return (
//     <AuthContext.Provider value={{
//       user,
//       login,
//       logout,
//       isLoading,
//       register,
//       getAllUsers,
//       getAllDroneSpecs,
//       getUserDroneSpecs,
//       getUserById
//     }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api'; // Import apiService
import { RegistrationData } from '../services/api'; // Import RegistrationData type

interface User {
  id: string;
  username: string;
  role: string;
  command_number?: number;
  operatorCategory?: string;
  operatorCategoryName?: string;
  command?: string;
  commandName?: string;
  division?: string;
  divisionName?: string;
  brigade?: string;
  brigadeName?: string;
  corps?: string;
  corpsName?: string;
  unit?: string;
  // New RBAC fields
  assigned_command?: string;
  can_access_all_commands?: boolean;
  accessibleCommands?: string[];
  rolePermissions?: {
    canAccessAllCommands?: boolean;
    assignedCommand?: string;
    assignedCommandName?: string;
  };
  is_active?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  register: (registrationData: RegistrationData) => Promise<{ success: boolean; message: string }>;
  getAllUsers: () => Promise<User[]>;
  getAllDroneSpecs: () => Promise<any[]>;
  getUserDroneSpecs: (userId: string) => Promise<any[]>;
  getUserById: (userId: string) => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('dms_token');
        const savedUser = localStorage.getItem('dms_user');

        if (token && savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('Initializing auth for saved user:', parsedUser.username, 'Role:', parsedUser.role);
            
            // Use apiService to verify user
            const fetchedUser = await apiService.getUserById(parsedUser.id);
            if (fetchedUser) {
              console.log('User validated successfully:', fetchedUser.username, 'Role:', fetchedUser.role);
              setUser(fetchedUser);
              // Update localStorage with fresh data
              localStorage.setItem('dms_user', JSON.stringify(fetchedUser));
            } else {
              console.log('User validation failed, clearing storage');
              // Invalid user or token
              localStorage.removeItem('dms_token');
              localStorage.removeItem('dms_user');
            }
          } catch (error) {
            console.error('Error validating user:', error);
            localStorage.removeItem('dms_token');
            localStorage.removeItem('dms_user');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('Attempting login for username:', username);
      
      const { success, token, user, message } = await apiService.login(username, password);
      
      console.log('Login response:', { success, hasToken: !!token, hasUser: !!user, message });
      
      if (success && token && user) {
        console.log('Login successful for user:', user.username, 'Role:', user.role);
        setUser(user);
        localStorage.setItem('dms_token', token);
        localStorage.setItem('dms_user', JSON.stringify(user));
        return true;
      } else {
        console.error('Login failed:', message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (registrationData: RegistrationData): Promise<{ success: boolean; message: string }> => {
    try {
      console.log('Attempting registration for username:', registrationData.username);
      const response = await apiService.registerUser(registrationData);
      console.log('Registration response:', response);
      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, message: 'Registration failed due to a system error' };
    }
  };

  // Fixed getAllUsers function using apiService
  const getAllUsers = async (): Promise<User[]> => {
    try {
      console.log('Fetching all users...');
      const response = await apiService.getAllUsers();
      console.log('getAllUsers response:', response);
      
      // Handle new RBAC response structure
      if (response && typeof response === 'object' && 'users' in response) {
        console.log('Found users in RBAC response:', response.users.length);
        return response.users || [];
      } else if (Array.isArray(response)) {
        console.log('Found users in array response:', response.length);
        return response;
      } else {
        console.log('No users found in response');
        return [];
      }
    } catch (error) {
      console.error('Failed to get all users:', error);
      return [];
    }
  };

  const getAllDroneSpecs = async (): Promise<any[]> => {
    try {
      console.log('Fetching all drone specs...');
      const response = await apiService.getAllDroneSpecs();
      console.log('getAllDroneSpecs response:', response);
      
      // Handle new RBAC response structure
      if (response && typeof response === 'object' && 'allSpecs' in response) {
        return response.allSpecs || [];
      } else if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to get all drone specs:', error);
      return [];
    }
  };

  const getUserDroneSpecs = async (userId: string): Promise<any[]> => {
    try {
      console.log('Fetching drone specs for user:', userId);
      const response = await apiService.getUserDroneSpecs(userId);
      console.log('getUserDroneSpecs response:', response);
      
      // Handle new RBAC response structure
      if (response && typeof response === 'object' && 'specs' in response) {
        return response.specs || [];
      } else if (Array.isArray(response)) {
        return response;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to get user drone specs:', error);
      return [];
    }
  };

  const getUserById = async (userId: string): Promise<User | null> => {
    try {
      console.log('Fetching user by ID:', userId);
      const response = await apiService.getUserById(userId);
      console.log('getUserById response:', response);
      return response;
    } catch (error) {
      console.error('Failed to get user by ID:', error);
      return null;
    }
  };

  const logout = () => {
    console.log('Logging out user:', user?.username);
    setUser(null);
    localStorage.removeItem('dms_token');
    localStorage.removeItem('dms_user');
    window.location.href = '/'; // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      register,
      getAllUsers,
      getAllDroneSpecs,
      getUserDroneSpecs,
      getUserById
    }}>
      {children}
    </AuthContext.Provider>
  );
};