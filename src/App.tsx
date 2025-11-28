// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import Index from "./pages/Index";
// import InsertPage from "./pages/InsertPage";
// import ViewPage from "./pages/ViewPage";
// import NotFound from "./pages/NotFound";
// import DroneRegistration from "./components/Drone_Registration";
// import AdminDashboard from "./components/AdminDashboard";
// import UserDashboard from "./components/UserDashboard";
// import FlightHistory from "./components/flight_history";
// import RegistrationDisplay from "./components/RegistrationDisplay";
// import Monitoring from "./components/monitring"; // Fixed import (assuming correct component name)
// import Airspace from "../src/components/Airspace_Status";
// import Flight  from "../src/components/flisht_status";


// const queryClient = new QueryClient();

// // Protected Route Component
// const ProtectedRoute = ({
//   children,
//   allowedRoles = []
// }: {
//   children: React.ReactNode;
//   allowedRoles?: string[]
// }) => {
//   const { user, isLoading } = useAuth();
  
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// };

// // Dashboard Route Component (role-based routing)
// const DashboardRoute = () => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   switch (user.role) {
//     case 'ADMINISTRATOR':
//       return <Monitoring />;
//     case 'CONTROLLER':
//       return <AdminDashboard />;
//     case 'OPERATOR':
//       return <UserDashboard />;
//     default:
//       return <Navigate to="/" replace />;
//   }
// };

// // Unauthorized Component
// const Unauthorized = () => (
//   <div className="min-h-screen flex items-center justify-center bg-gray-50">
//     <div className="text-center">
//       <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
//       <p className="text-xl text-gray-600 mb-4">Unauthorized Access</p>
//       <p className="text-gray-500 mb-8">You don't have permission to access this resource.</p>
//       <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
//         Return to Login
//       </a>
//     </div>
//   </div>
// );

// const AppRoutes = () => {
//   const { user } = useAuth();

//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route
//         path="/"
//         element={user ? <Navigate to="/dashboard" replace /> : <Index />}
//       />
//       <Route path="/drone-registration" element={<DroneRegistration />} />
//       <Route path="/unauthorized" element={<Unauthorized />} />
    
//       {/* Protected Routes */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <DashboardRoute />
//           </ProtectedRoute>
//         }
//       />
      
     
      
//       {/* Flight History Route */}
//       <Route
//         path="/flight-history"
//         element={
//           <ProtectedRoute allowedRoles={['OPERATOR']}>
//             <FlightHistory />
//           </ProtectedRoute>
//         }
//       />
//        <Route
//         path="/airspace"
//         element={
//           <ProtectedRoute allowedRoles={['OPERATOR']}>
//             <Airspace />
//           </ProtectedRoute>
//         }
//       />
    
//       {/* Admin Only Routes */}
//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute allowedRoles={['ADMINISTRATOR']}>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/registrations"
//         element={
//           <ProtectedRoute allowedRoles={['ADMINISTRATOR', 'CONTROLLER']}>
//             <RegistrationDisplay />
//           </ProtectedRoute>
//         }
//       />
      
//       <Route
//         path="/monitoring"
//         element={
//           <ProtectedRoute allowedRoles={['ADMINISTRATOR', 'CONTROLLER']}>
//             <Monitoring />
//           </ProtectedRoute>
//         }
//       />

// <Route
//         path="/flight_status"
//         element={
//           <ProtectedRoute allowedRoles={['ADMINISTRATOR', 'CONTROLLER']}>
//             <Flight />
//           </ProtectedRoute>
//         }
//       />
  
      


      
    
//       {/* Controller Routes */}
//       <Route
//         path="/controller"
//         element={
//           <ProtectedRoute allowedRoles={['ADMINISTRATOR', 'CONTROLLER']}>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />
    
//       {/* Legacy Routes */}
//       <Route
//         path="/insertCheck"
//         element={
//           <ProtectedRoute>
//             <InsertPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/viewCheck"
//         element={
//           <ProtectedRoute>
//             <ViewPage />
//           </ProtectedRoute>
//         }
//       />
    
//       {/* 404 Route */}
//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <AuthProvider>
//         <BrowserRouter>
//           <AppRoutes />
//         </BrowserRouter>
//       </AuthProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;




// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import { AuthProvider, useAuth } from "@/contexts/AuthContext";
// import Index from "./pages/Index";
// import InsertPage from "./pages/InsertPage";
// import ViewPage from "./pages/ViewPage";
// import NotFound from "./pages/NotFound";
// import DroneRegistration from "./components/Drone_Registration";
// import AdminDashboard from "./components/AdminDashboard";
// import UserDashboard from "./components/UserDashboard";
// import FlightHistory from "./components/flight_history";
// import RegistrationDisplay from "./components/RegistrationDisplay";
// import Monitoring from "./components/monitring";
// import Airspace from "../src/components/Airspace_Status";
// import Flight from "../src/components/flisht_status";

// const queryClient = new QueryClient();

// // Protected Route Component with enhanced role checking
// const ProtectedRoute = ({
//   children,
//   allowedRoles = []
// }: {
//   children: React.ReactNode;
//   allowedRoles?: string[]
// }) => {
//   const { user, isLoading } = useAuth();
  
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   // Enhanced role checking with debug logging
//   console.log('User role:', user.role, 'Allowed roles:', allowedRoles);

//   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/unauthorized" replace />;
//   }

//   return <>{children}</>;
// };

// // Dashboard Route Component with new RBAC roles
// const DashboardRoute = () => {
//   const { user } = useAuth();

//   if (!user) {
//     return <Navigate to="/" replace />;
//   }

//   console.log('Dashboard routing for user role:', user.role);

//   switch (user.role) {
//     case 'SUPER_ADMIN':
//       // Super admin gets full monitoring dashboard
//       return <Monitoring />;
//     case 'COMMAND_ADMIN':
//       // Command admin gets admin dashboard with command-specific data
//       return <AdminDashboard />;
//     case 'CONTROLLER':
//       // Controller gets admin dashboard with read-only access
//       return <AdminDashboard />;
//     case 'OPERATOR':
//       // Operator gets user dashboard
//       return <UserDashboard />;
//     default:
//       console.error('Unknown user role:', user.role);
//       return <Navigate to="/unauthorized" replace />;
//   }
// };

// // Enhanced Unauthorized Component with role info
// const Unauthorized = () => {
//   const { user } = useAuth();
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50">
//       <div className="text-center">
//         <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
//         <p className="text-xl text-gray-600 mb-4">Unauthorized Access</p>
//         <p className="text-gray-500 mb-4">You don't have permission to access this resource.</p>
//         {user && (
//           <p className="text-sm text-gray-400 mb-8">
//             Current role: <span className="font-medium">{user.role}</span>
//           </p>
//         )}
//         <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
//           Return to Login
//         </a>
//       </div>
//     </div>
//   );
// };

// // Role display helper component
// const RoleBasedWelcome = () => {
//   const { user } = useAuth();
  
//   if (!user) return null;

//   const getRoleDisplayName = (role: string) => {
//     switch (role) {
//       case 'SUPER_ADMIN': return 'Super Administrator';
//       case 'COMMAND_ADMIN': return 'Command Administrator';
//       case 'CONTROLLER': return 'Controller';
//       case 'OPERATOR': return 'Operator';
//       default: return role;
//     }
//   };

//   const getCommandDisplayName = (command: string) => {
//     const commands = {
//       'ec': 'Eastern Command',
//       'wc': 'Western Command',
//       'sc': 'Southern Command',
//       'nc': 'Northern Command',
//       'swc': 'South Western Command',
//       'anc': 'Central Command'
//     };
//     return commands[command as keyof typeof commands] || command;
//   };

//   return (
//     <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
//       <div className="text-sm">
//         <span className="font-medium text-blue-800">
//           {getRoleDisplayName(user.role)}
//         </span>
//         {user.assigned_command && (
//           <span className="text-blue-600 ml-2">
//             - {getCommandDisplayName(user.assigned_command)}
//           </span>
//         )}
//         {user.can_access_all_commands && (
//           <span className="text-green-600 ml-2 font-medium">
//             (All Commands Access)
//           </span>
//         )}
//       </div>
//     </div>
//   );
// };

// const AppRoutes = () => {
//   const { user, isLoading } = useAuth();

//   // Add loading state check
//   if (isLoading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//           <p className="mt-4 text-gray-600">Initializing...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* Public Routes */}
//       <Route
//         path="/"
//         element={user ? <Navigate to="/dashboard" replace /> : <Index />}
//       />
//       <Route path="/drone-registration" element={<DroneRegistration />} />
//       <Route path="/unauthorized" element={<Unauthorized />} />
    
//       {/* Protected Routes */}
//       <Route
//         path="/dashboard"
//         element={
//           <ProtectedRoute>
//             <div>
//               <RoleBasedWelcome />
//               <DashboardRoute />
//             </div>
//           </ProtectedRoute>
//         }
//       />
      
//       {/* Operator Routes */}
//       <Route
//         path="/flight-history"
//         element={
//           <ProtectedRoute allowedRoles={['OPERATOR', 'CONTROLLER', 'COMMAND_ADMIN', 'SUPER_ADMIN']}>
//             <FlightHistory />
//           </ProtectedRoute>
//         }
//       />
      
//       <Route
//         path="/airspace"
//         element={
//           <ProtectedRoute allowedRoles={['OPERATOR', 'CONTROLLER', 'COMMAND_ADMIN', 'SUPER_ADMIN']}>
//             <Airspace />
//           </ProtectedRoute>
//         }
//       />

//       {/* Admin and Controller Routes */}
//       <Route
//         path="/admin"
//         element={
//           <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN']}>
//             <AdminDashboard />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/registrations"
//         element={
//           <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER']}>
//             <RegistrationDisplay />
//           </ProtectedRoute>
//         }
//       />
      
//       <Route
//         path="/monitoring"
//         element={
//           <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER']}>
//             <div>
//               <RoleBasedWelcome />
//               <Monitoring />
//             </div>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/flight_status"
//         element={
//           <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER']}>
//             <Flight />
//           </ProtectedRoute>
//         }
//       />

//       {/* Super Admin Only Routes */}
//       <Route
//         path="/super-admin"
//         element={
//           <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
//             <div>
//               <RoleBasedWelcome />
//               <Monitoring />
//             </div>
//           </ProtectedRoute>
//         }
//       />

//       {/* Command Admin Routes */}
//       <Route
//         path="/command-admin"
//         element={
//           <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN']}>
//             <div>
//               <RoleBasedWelcome />
//               <AdminDashboard />
//             </div>
//           </ProtectedRoute>
//         }
//       />
    
//       {/* Controller Routes */}
//       <Route
//         path="/controller"
//         element={
//           <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER']}>
//             <div>
//               <RoleBasedWelcome />
//               <AdminDashboard />
//             </div>
//           </ProtectedRoute>
//         }
//       />
    
//       {/* Legacy Routes - Updated with new roles */}
//       <Route
//         path="/insertCheck"
//         element={
//           <ProtectedRoute>
//             <InsertPage />
//           </ProtectedRoute>
//         }
//       />
//       <Route
//         path="/viewCheck"
//         element={
//           <ProtectedRoute>
//             <ViewPage />
//           </ProtectedRoute>
//         }
//       />
    
//       {/* 404 Route */}
//       <Route path="*" element={<NotFound />} />
//     </Routes>
//   );
// };

// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <TooltipProvider>
//       <Toaster />
//       <Sonner />
//       <AuthProvider>
//         <BrowserRouter>
//           <AppRoutes />
//         </BrowserRouter>
//       </AuthProvider>
//     </TooltipProvider>
//   </QueryClientProvider>
// );

// export default App;






import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import InsertPage from "./pages/InsertPage";
import ViewPage from "./pages/ViewPage";
import NotFound from "./pages/NotFound";
import DroneRegistration from "./components/Drone_Registration";
import AdminDashboard from "./components/AdminDashboard";
import UserDashboard from "./components/UserDashboard";
import FlightHistory from "./components/flight_history";
import RegistrationDisplay from "./components/RegistrationDisplay";
import Monitoring from "./components/monitring";
import Airspace from "../src/components/Airspace_Status";
import Flight from "../src/components/flisht_status";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({
  children,
  allowedRoles = []
}: {
  children: React.ReactNode;
  allowedRoles?: string[]
}) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// Dashboard Route Component - Updated for new RBAC roles
const DashboardRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  console.log('Dashboard routing for user role:', user.role);

  switch (user.role) {
    // New RBAC roles
    case 'SUPER_ADMIN':
      return <Monitoring />; // Super admin gets monitoring dashboard
    case 'COMMAND_ADMIN':
      return <Monitoring />; // Command admin gets monitoring (filtered by command)
    case 'CONTROLLER':
      return <AdminDashboard />; // Controller gets admin dashboard
    case 'OPERATOR':
      return <UserDashboard />; // Operator gets user dashboard
    
    // Legacy roles (for backward compatibility)
    case 'ADMINISTRATOR':
      return <Monitoring />;
    default:
      return <Navigate to="/" replace />;
  }
};

// Unauthorized Component
const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl text-gray-600 mb-4">Unauthorized Access</p>
      <p className="text-gray-500 mb-8">You don't have permission to access this resource.</p>
      <a href="/" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
        Return to Login
      </a>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Index />}
      />
      <Route path="/drone-registration" element={<DroneRegistration />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRoute />
          </ProtectedRoute>
        }
      />
      
      {/* Flight History Route - Updated for new roles */}
      <Route
        path="/flight-history"
        element={
          <ProtectedRoute allowedRoles={['OPERATOR', 'CONTROLLER', 'COMMAND_ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR']}>
            <FlightHistory />
          </ProtectedRoute>
        }
      />
      
      {/* Airspace Route - Updated for new roles */}
      <Route
        path="/airspace"
        element={
          <ProtectedRoute allowedRoles={['OPERATOR', 'CONTROLLER', 'COMMAND_ADMIN', 'SUPER_ADMIN', 'ADMINISTRATOR']}>
            <Airspace />
          </ProtectedRoute>
        }
      />
    
      {/* Admin Routes - Updated for new roles */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'ADMINISTRATOR']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Registration Routes - Updated for new roles */}
      <Route
        path="/registrations"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER', 'ADMINISTRATOR']}>
            <RegistrationDisplay />
          </ProtectedRoute>
        }
      />
      
      {/* Monitoring Route - Updated for new roles */}
      <Route
        path="/monitoring"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER', 'ADMINISTRATOR']}>
            <Monitoring />
          </ProtectedRoute>
        }
      />

      {/* Flight Status Route - Updated for new roles */}
      <Route
        path="/flight_status"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER', 'ADMINISTRATOR']}>
            <Flight />
          </ProtectedRoute>
        }
      />
      
      {/* Controller Routes - Updated for new roles */}
      <Route
        path="/controller"
        element={
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMMAND_ADMIN', 'CONTROLLER', 'ADMINISTRATOR']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    
      {/* Legacy Routes */}
      <Route
        path="/insertCheck"
        element={
          <ProtectedRoute>
            <InsertPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/viewCheck"
        element={
          <ProtectedRoute>
            <ViewPage />
          </ProtectedRoute>
        }
      />
    
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;



