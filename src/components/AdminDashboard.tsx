// import 'leaflet/dist/leaflet.css';
// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import CesiumMap from './CesiumMap2';
// import * as Cesium from 'cesium';
// import {
//   Shield,
//   Users,
//   Plane,
//   Eye,
//   User,
//   Search,
//   MapPin,
//   X,
//   Calendar,
// } from 'lucide-react';
// import { format, isValid, parseISO } from 'date-fns';
// import ErrorBoundary from './ErrorBoundary';
// import { apiService } from '../services/api';
// import HeaderNav from './Admin_Header&Nav/Header&Nav';

// const API_BASE_URL = 'http://localhost:5002/api';

// interface Flight {
//   id: string;
//   user_id: string;
//   drone_model: string;
//   drone_class: string;
//   command_name: string;
//   frequency: number;
//   clockDrift: number;
//   spectralLeakage: number;
//   modularshapeId: number;
//   purpose: string;
//   start: string;
//   end: string;
//   status: 'planned' | 'active' | 'completed';
//   cancel_requested: boolean;
// }

// interface Waypoint {
//   flight_id: string;
//   lat: number;
//   lng: number;
//   elev: number;
//   sequence: number;
// }

// interface FlightPath {
//   id: string;
//   waypoints: Waypoint[];
//   color: Cesium.Color;
//   status: string;
//   isSelected: boolean;
// }

// interface SearchLocation {
//   lat: number;
//   lng: number;
//   name?: string;
// }

// interface User {
//   id: string;
//   username: string;
//   operatorCategoryName?: string;
//   commandName?: string;
//   divisionName?: string;
//   brigadeName?: string;
//   corpsName?: string;
//   unit?: string;
// }

// const COMMAND_CENTERS = {
//   ALL: { name: 'ALL COMMANDS', lat: 23.1815, lng: 79.9864, shortName: 'ALL' },
//   'EASTERN COMMAND': { name: 'EASTERN COMMAND', lat: 33.7738, lng: 76.5762, shortName: 'EC' },
//   'WESTERN COMMAND': { name: 'WESTERN COMMAND', lat: 32.7266, lng: 74.8570, shortName: 'WC' },
//   'SOUTHERN COMMAND': { name: 'SOUTHERN COMMAND', lat: 18.5204, lng: 73.8567, shortName: 'SC' },
//   'NORTHERN COMMAND': { name: 'NORTHERN COMMAND', lat: 34.0837, lng: 74.7973, shortName: 'NC' },
//   'SOUTH WESTERN COMMAND': { name: 'SOUTH WESTERN COMMAND', lat: 26.9124, lng: 75.7873, shortName: 'SWC' },
//   'CENTRAL COMMAND': { name: 'CENTRAL COMMAND', lat: 23.1815, lng: 79.9864, shortName: 'CC' },
// };

// const AdminDashboard: React.FC = () => {
//   const { user, logout, getUserById } = useAuth();
//   const today = new Date().toISOString().split('T')[0];
//   const [flights, setFlights] = useState<Flight[]>([]);
//   const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [timeFilter, setTimeFilter] = useState<string>('all');
//   const [fromDate, setFromDate] = useState<string>(today);
//   const [toDate, setToDate] = useState<string>(today);
//   const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);
//   const [selectedWaypoints, setSelectedWaypoints] = useState<Waypoint[]>([]);
//   const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
//   const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
//   const [error, setError] = useState<string | null>(null);
//   const [searchLat, setSearchLat] = useState<string>('');
//   const [searchLng, setSearchLng] = useState<string>('');
//   const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
//   const [showSearch, setShowSearch] = useState<boolean>(false);
//   const [selectedCommand, setSelectedCommand] = useState<string>('');
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
//     const savedTheme = localStorage.getItem('theme');
//     return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 20;

//   const waypointsCache = useRef<Map<string, Waypoint[]>>(new Map());

//   const isDateSelected = fromDate && toDate;

//   // Initialize theme on mount
//   useEffect(() => {
//     if (isDarkMode) {
//       document.documentElement.classList.add('dark');
//       localStorage.setItem('theme', 'dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//       localStorage.setItem('theme', 'light');
//     }
//   }, [isDarkMode]);

//   // Toggle dark mode
//   const toggleDarkMode = () => {
//     const newTheme = !isDarkMode ? 'dark' : 'light';
//     setIsDarkMode(!isDarkMode);
//     localStorage.setItem('theme', newTheme);
//     if (newTheme === 'dark') {
//       document.documentElement.classList.add('dark');
//     } else {
//       document.documentElement.classList.remove('dark');
//     }
//   };

//   const availableCommands = Object.keys(COMMAND_CENTERS).sort();

//   const selectCommand = (cmd: string) => {
//     if (!isDateSelected) {
//       setError('Please select a date range first.');
//       return;
//     }
//     if (selectedCommand === cmd) {
//       setSelectedCommand('');
//       setMapCenter(undefined);
//       setMapZoom(undefined);
//     } else {
//       setSelectedCommand(cmd);
//       if (cmd === 'ALL') {
//         setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
//         setMapZoom(5);
//       } else {
//         setMapCenter({ lat: COMMAND_CENTERS[cmd].lat, lng: COMMAND_CENTERS[cmd].lng });
//         setMapZoom(10);
//       }
//     }
//     setSelectedFlight(null);
//     setSelectedWaypoints([]);
//     setSelectedUser(null);
//     setError(null);
//     setCurrentPage(1);
//   };

//   const fetchFlights = async (command?: string) => {
//     try {
//       const params = command ? { command } : undefined;
//       const data = await apiService.getAllFlights(params);
//       console.log('Fetched flights:', data);
//       if (!Array.isArray(data)) {
//         console.error('Expected an array of flights, got:', data);
//         setFlights([]);
//         setError('Invalid flight data received from server');
//         return;
//       }
//       setFlights(data);
//       setError(null);
//     } catch (error: any) {
//       console.error('Error fetching flights:', error.message, error.response?.data);
//       setFlights([]);
//       setError(error.response?.data?.message || 'Error fetching flights');
//     }
//   };

//   const fetchWaypoints = async (flightId: string): Promise<Waypoint[]> => {
//     if (waypointsCache.current.has(flightId)) {
//       return waypointsCache.current.get(flightId)!;
//     }
//     try {
//       const waypoints = await apiService.getFlightWaypoints(flightId);
//       console.log(`Waypoints for flight ${flightId}:`, waypoints);
//       if (!Array.isArray(waypoints)) {
//         console.error(`Expected an array of waypoints for flight ${flightId}, got:`, waypoints);
//         return [];
//       }
//       waypointsCache.current.set(flightId, waypoints);
//       return waypoints;
//     } catch (error: any) {
//       console.error(`Error fetching waypoints for flight ${flightId}:`, error.message, error.response?.data);
//       setError(error.response?.data?.message || `Error fetching waypoints for flight ${flightId}`);
//       return [];
//     }
//   };

//   const deleteFlight = async (flightId: string) => {
//     try {
//       const response = await apiService.deleteFlight(flightId);
//       if (response.success) {
//         await fetchFlights(selectedCommand);
//         waypointsCache.current.delete(flightId);
//         if (selectedFlight?.id === flightId) {
//           setSelectedFlight(null);
//           setSelectedWaypoints([]);
//           setSelectedUser(null);
//           if (selectedCommand) {
//             if (selectedCommand === 'ALL') {
//               setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
//               setMapZoom(5);
//             } else {
//               setMapCenter({ lat: COMMAND_CENTERS[selectedCommand].lat, lng: COMMAND_CENTERS[selectedCommand].lng });
//               setMapZoom(10);
//             }
//           } else {
//             setMapCenter(undefined);
//             setMapZoom(undefined);
//           }
//         }
//         setError(null);
//       } else {
//         console.error('Failed to delete flight:', response.message);
//         setError(response.message || 'Failed to delete flight');
//       }
//     } catch (error: any) {
//       console.error('Error deleting flight:', error.message, error.response?.data);
//       setError(error.response?.data?.message || 'Error deleting flight');
//     }
//   };

//   const handleSearch = () => {
//     const lat = parseFloat(searchLat);
//     const lng = parseFloat(searchLng);
//     if (!isNaN(lat) && !isNaN(lng)) {
//       setSearchLocation({ lat, lng });
//       setMapCenter({ lat, lng });
//       setMapZoom(12);
//     } else {
//       setError('Please enter valid coordinates');
//     }
//   };

//   const clearSearch = () => {
//     setSearchLocation(null);
//     setSearchLat('');
//     setSearchLng('');
//     if (selectedCommand) {
//       if (selectedCommand === 'ALL') {
//         setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
//         setMapZoom(5);
//       } else {
//         setMapCenter({ lat: COMMAND_CENTERS[selectedCommand].lat, lng: COMMAND_CENTERS[selectedCommand].lng });
//         setMapZoom(10);
//       }
//     } else if (selectedFlight && selectedWaypoints.length > 0) {
//       if (selectedWaypoints.length === 1) {
//         setMapCenter({ lat: selectedWaypoints[0].lat, lng: selectedWaypoints[0].lng });
//         setMapZoom(8);
//       } else {
//         const lats = selectedWaypoints.map((w) => w.lat);
//         const lngs = selectedWaypoints.map((w) => w.lng);
//         const minLat = Math.min(...lats);
//         const maxLat = Math.max(...lats);
//         const minLng = Math.min(...lngs);
//         const maxLng = Math.max(...lngs);
//         const centerLat = (minLat + maxLat) / 2;
//         const centerLng = (minLng + maxLng) / 2;
//         const latDiff = maxLat - minLat;
//         const lngDiff = maxLng - minLng;
//         const maxDiff = Math.max(latDiff, lngDiff);
//         let zoom = 10;
//         if (maxDiff < 0.01) zoom = 16;
//         else if (maxDiff < 0.05) zoom = 14;
//         else if (maxDiff < 0.1) zoom = 12;
//         else if (maxDiff < 0.5) zoom = 10;
//         else if (maxDiff < 1) zoom = 8;
//         else zoom = 6;
//         setMapCenter({ lat: centerLat, lng: centerLng });
//         setMapZoom(zoom);
//       }
//     } else {
//       setMapCenter(undefined);
//       setMapZoom(undefined);
//     }
//   };

//   const clearDateFilter = () => {
//     setFromDate(today);
//     setToDate(today);
//     setSelectedCommand('');
//     setFlights([]);
//     setFlightPaths([]);
//     setMapCenter(undefined);
//     setMapZoom(undefined);
//     setSelectedFlight(null);
//     setSelectedWaypoints([]);
//     setSelectedUser(null);
//     setCurrentPage(1);
//   };

//   // Polling for flights based on selected command
//   useEffect(() => {
//     if (!selectedCommand) {
//       setFlights([]);
//       setFlightPaths([]);
//       return;
//     }
//     const loadFlights = async () => {
//       await fetchFlights(selectedCommand);
//     };
//     loadFlights();
//     const intervalId = setInterval(loadFlights, 60000);
//     return () => clearInterval(intervalId);
//   }, [selectedCommand]);

//   // Reset page on filter or command change
//   useEffect(() => {
//     setCurrentPage(1);
//   }, [timeFilter, selectedCommand, fromDate, toDate]);

//   useEffect(() => {
//     if (selectedFlight) {
//       fetchWaypoints(selectedFlight.id).then((waypoints) => {
//         setSelectedWaypoints(waypoints);
//         if (waypoints.length > 0) {
//           if (waypoints.length === 1) {
//             setMapCenter({ lat: waypoints[0].lat, lng: waypoints[0].lng });
//             setMapZoom(8);
//           } else {
//             const lats = waypoints.map((w) => w.lat);
//             const lngs = waypoints.map((w) => w.lng);
//             const minLat = Math.min(...lats);
//             const maxLat = Math.max(...lats);
//             const minLng = Math.min(...lngs);
//             const maxLng = Math.max(...lngs);
//             const centerLat = (minLat + maxLat) / 2;
//             const centerLng = (minLng + maxLng) / 2;
//             const latDiff = maxLat - minLat;
//             const lngDiff = maxLng - minLng;
//             const maxDiff = Math.max(latDiff, lngDiff);
//             let zoom = 10;
//             if (maxDiff < 0.01) zoom = 16;
//             else if (maxDiff < 0.05) zoom = 14;
//             else if (maxDiff < 0.1) zoom = 12;
//             else if (maxDiff < 0.5) zoom = 10;
//             else if (maxDiff < 1) zoom = 8;
//             else zoom = 6;
//             setMapCenter({ lat: centerLat, lng: centerLng });
//             setMapZoom(zoom);
//           }
//         }
//       });
//       getUserById(selectedFlight.user_id).then((userData) => {
//         console.log('Fetched user for flight:', userData);
//         setSelectedUser(userData ?? null);
//       }).catch((error) => {
//         console.error('Error fetching user:', error);
//         setSelectedUser(null);
//         setError('Error fetching user data');
//       });
//     } else {
//       setSelectedWaypoints([]);
//       setSelectedUser(null);
//       if (selectedCommand) {
//         if (selectedCommand === 'ALL') {
//           setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
//           setMapZoom(5);
//         } else {
//           setMapCenter({ lat: COMMAND_CENTERS[selectedCommand].lat, lng: COMMAND_CENTERS[selectedCommand].lng });
//           setMapZoom(8);
//         }
//       } else {
//         setMapCenter(undefined);
//         setMapZoom(undefined);
//       }
//     }
//   }, [selectedFlight, getUserById, selectedCommand]);

//   const buildPaths = async (fls: Flight[]) => {
//     const now = new Date();
//     const paths = await Promise.all(
//       fls.map(async (f) => {
//         const waypoints = await fetchWaypoints(f.id);
//         let color = Cesium.Color.GRAY;
//         const startDate = new Date(f.start);
//         let hours = NaN;
//         if (isValid(startDate)) {
//           hours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
//         }

//         if (f.status === 'active') {
//           if (hours <= 1) color = Cesium.Color.RED;
//           else if (hours <= 6) color = Cesium.Color.ORANGE;
//           else if (hours <= 24) color = Cesium.Color.YELLOW;
//           else color = Cesium.Color.GREEN;
//         } else if (f.status === 'planned') {
//           color = Cesium.Color.CYAN;
//         }

//         const path: FlightPath = {
//           id: f.id,
//           waypoints: waypoints ?? [],
//           color,
//           status: f.status,
//           isSelected: selectedFlight?.id === f.id,
//         };
//         console.log(`Built path for flight ${f.id}:`, path);
//         return path;
//       })
//     );
//     console.log('All flight paths:', paths);
//     setFlightPaths(paths);
//     setError(null);
//   };

//   useEffect(() => {
//     const updatePaths = async () => {
//       if (!selectedCommand || flights.length === 0) {
//         setFlightPaths([]);
//         return;
//       }
//       const now = new Date();
//       const toShow = flights.filter((f) => {
//         // Date range filter
//         if (fromDate && toDate) {
//           const startDate = new Date(f.start);
//           if (!isValid(startDate)) return false;
//           const from = new Date(fromDate);
//           const to = new Date(toDate);
//           to.setHours(23, 59, 59, 999); // End of day
//           if (startDate < from || startDate > to) return false;
//         }

//         if (timeFilter === 'all') return true;
//         if (timeFilter === 'active') return f.status === 'active';
//         if (timeFilter === 'planned') return f.status === 'planned';

//         const startDate = new Date(f.start);
//         if (!isValid(startDate)) return false;
//         const hours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
//         switch (timeFilter) {
//           case '1h':
//             return hours >= 0 && hours <= 1;
//           case '6h':
//             return hours >= 0 && hours <= 6;
//           case '12h':
//             return hours >= 0 && hours <= 12;
//           case '24h':
//             return hours >= 0 && hours <= 24;
//           case 'week':
//             return hours >= 0 && hours <= 24 * 7;
//           case 'month':
//             return hours >= 0 && hours <= 24 * 30;
//           default:
//             return true;
//         }
//       });
//       // Sort by start date descending and limit to recent flights for performance
//       const MAX_PATHS = 500;
//       const sorted = toShow.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
//       const limited = sorted.slice(0, MAX_PATHS);
//       console.log(`Building paths for ${limited.length} out of ${toShow.length} filtered flights (limited to ${MAX_PATHS})`);
//       await buildPaths(limited);
//     };
//     updatePaths().catch((error) => {
//       console.error('Error updating paths:', error);
//       setError('Error updating flight paths');
//     });
//   }, [flights, timeFilter, selectedCommand, selectedFlight, fromDate, toDate]);

//   const filteredFlights = useMemo(() => {
//     const now = new Date();
//     return flights
//       .filter((f) => {
//         // Date range filter
//         if (fromDate && toDate) {
//           const startDate = new Date(f.start);
//           if (!isValid(startDate)) return false;
//           const from = new Date(fromDate);
//           const to = new Date(toDate);
//           to.setHours(23, 59, 59, 999); // End of day
//           if (startDate < from || startDate > to) return false;
//         }

//         // Time filter
//         if (timeFilter === 'all') return true;
//         if (timeFilter === 'active') return f.status === 'active';
//         if (timeFilter === 'planned') return f.status === 'planned';

//         const startDate = new Date(f.start);
//         if (!isValid(startDate)) return false;
//         const hours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
//         switch (timeFilter) {
//           case '1h':
//             return hours >= 0 && hours <= 1;
//           case '6h':
//             return hours >= 0 && hours <= 6;
//           case '12h':
//             return hours >= 0 && hours <= 12;
//           case '24h':
//             return hours >= 0 && hours <= 24;
//           case 'week':
//             return hours >= 0 && hours <= 24 * 7;
//           case 'month':
//             return hours >= 0 && hours <= 24 * 30;
//           default:
//             return true;
//         }
//       })
//       .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
//   }, [flights, timeFilter, fromDate, toDate]);

//   const activeCount = useMemo(() => filteredFlights.filter((f) => f.status === 'active').length, [filteredFlights]);
//   const plannedCount = useMemo(() => filteredFlights.filter((f) => f.status === 'planned').length, [filteredFlights]);

//   const cancelReqs = useMemo(() => filteredFlights.filter((f) => f.cancel_requested), [filteredFlights]);

//   const paginatedFlights = useMemo(() => 
//     filteredFlights.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
//     [filteredFlights, currentPage, itemsPerPage]
//   );

//   const getStatusBadge = (status: string) => {
//     const variants = {
//       active: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-600',
//       planned: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-600',
//       completed: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
//     };
//     return (
//       <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}>
//         {status.toUpperCase()}
//       </Badge>
//     );
//   };

//   const getTimeAgo = (date: string) => {
//     const d = new Date(date);
//     if (!isValid(d)) return 'Unknown';
//     const diff = Date.now() - d.getTime();
//     const absDiff = Math.abs(diff);
//     const h = Math.floor(absDiff / 3_600_000);
//     const m = Math.floor((absDiff % 3_600_000) / 60_000);
//     const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
//     return diff > 0 ? `${timeStr} ago` : `in ${timeStr}`;
//   };

//   const safeFormat = (dateStr: string, fmt: string) => {
//     const d = new Date(dateStr);
//     return isValid(d) ? format(d, fmt) : 'Invalid date';
//   };

//   const approveCancel = (id: string) => {
//     deleteFlight(id);
//   };

//   return (
//     <ErrorBoundary>
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//         <HeaderNav isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
//         {error && (
//           <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-200 p-4 m-4 rounded">
//             <p>{error}</p>
//             <Button onClick={() => setError(null)} className="mt-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white">
//               Clear Error
//             </Button>
//           </div>
//         )}
//         <div className="flex h-[calc(100vh-140px)]">
//           <div className="flex-1 p-4">
//             <Card className="h-full border-blue-200 dark:border-gray-600 shadow-lg dark:bg-gray-800">
//               <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-1000">
//                 <CardTitle className="flex items-center justify-between">
//                   <div className="flex items-center space-x-2">
//                     <Plane className="w-5 h-5 text-blue-700 dark:text-blue-300" />
//                     <span className="text-blue-900 dark:text-blue-200">OPERATIONAL OVERVIEW</span>
//                   </div>
//                   <div className="flex items-center space-x-4">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setShowSearch(!showSearch)}
//                       className={`border-blue-300 dark:border-blue-600 ${
//                         showSearch ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-blue-600 dark:text-blue-400'
//                       } hover:bg-blue-50 dark:hover:bg-blue-700`}
//                     >
//                       <Search className="w-4 h-4 mr-1" />
//                       Search Location
//                     </Button>
//                     <Select value={timeFilter} onValueChange={setTimeFilter}>
//                       <SelectTrigger className="w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
//                         <SelectValue placeholder="Filter flights" />
//                       </SelectTrigger>
//                       <SelectContent className="z-50 bg-white text-color-white dark:bg-gray-800">
//                         <SelectItem value="all">All Flights</SelectItem>
//                         <SelectItem value="1h">Last 1h</SelectItem>
//                         <SelectItem value="6h">Last 6h</SelectItem>
//                         <SelectItem value="12h">Last 12h</SelectItem>
//                         <SelectItem value="24h">Last 24h</SelectItem>
//                         <SelectItem value="week">Past Week</SelectItem>
//                         <SelectItem value="month">Past Month</SelectItem>
//                         <SelectItem value="active">Active Only</SelectItem>
//                         <SelectItem value="planned">Planned Only</SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </CardTitle>
//                 {showSearch && (
//                   <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-600 rounded-lg">
//                     <div className="flex items-center gap-3">
//                       <div className="flex items-center gap-2">
//                         <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                         <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Search by Coordinates:</span>
//                       </div>
//                       <Input
//                         type="number"
//                         placeholder="Latitude (e.g., 28.6139)"
//                         value={searchLat ?? ''}
//                         onChange={(e) => setSearchLat(e.target.value)}
//                         className="w-32 text-sm border-blue-300 dark:border-blue-600 dark:bg-gray-700 dark:text-gray-200"
//                         step="any"
//                       />
//                       <Input
//                         type="number"
//                         placeholder="Longitude (e.g., 77.2090)"
//                         value={searchLng ?? ''}
//                         onChange={(e) => setSearchLng(e.target.value)}
//                         className="w-32 text-sm border-blue-300 dark:border-blue-600 dark:bg-gray-700 dark:text-gray-200"
//                         step="any"
//                       />
//                       <Button
//                         size="sm"
//                         onClick={handleSearch}
//                         className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
//                       >
//                         <Search className="w-4 h-4 mr-1" />
//                         Find
//                       </Button>
//                       {searchLocation && (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={clearSearch}
//                           className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
//                         >
//                           <X className="w-4 h-4 mr-1" />
//                           Clear
//                         </Button>
//                       )}
//                     </div>
//                   </div>
//                 )}
//                 <CardDescription className="text-gray-600 dark:text-gray-300">
//                   Real-time flight monitoring with color-coded trajectories
//                   {selectedCommand && (
//                     <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
//                       - Showing: {COMMAND_CENTERS[selectedCommand].name}
//                     </span>
//                   )}
//                 </CardDescription>
//               </CardHeader>
//               <CardContent className="h-[calc(100%-120px)]">
//                 <ErrorBoundary>
//                   <CesiumMap
//                     flightPaths={flightPaths ?? []}
//                     waypoints={selectedWaypoints ?? []}
//                     center={mapCenter ?? { lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng }}
//                     zoom={mapZoom ?? 5}
//                     searchLocation={searchLocation ?? null}
//                     selectedUser={selectedUser ?? null}
//                   />
//                 </ErrorBoundary>
//               </CardContent>
//             </Card>
//           </div>

//           <div className="w-96 p-4 space-y-4 overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
//             <div className="p-3 bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-600 rounded-lg">
//               <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Date Range Filter</h3>
//               <div className="flex flex-wrap items-center gap-3">
//                 <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//                 <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">From:</span>
//                 <Input
//                   type="date"
//                   value={fromDate}
//                   onChange={(e) => setFromDate(e.target.value)}
//                   className="w-40 text-sm border-indigo-300 dark:border-indigo-600 dark:bg-gray-700 dark:text-gray-200"
//                 />
//                 <span className="text-sm text-indigo-600 dark:text-indigo-400">to</span>
//                 <Input
//                   type="date"
//                   value={toDate}
//                   onChange={(e) => setToDate(e.target.value)}
//                   className="w-40 text-sm border-indigo-300 dark:border-indigo-600 dark:bg-gray-700 dark:text-gray-200"
//                 />
//                 {(fromDate !== today || toDate !== today) && (
//                   <Button
//                     size="sm"
//                     variant="outline"
//                     onClick={clearDateFilter}
//                     className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
//                   >
//                     <X className="w-4 h-4 mr-1" />
//                     Clear
//                   </Button>
//                 )}
//               </div>
//             </div>

//             <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-600 rounded-lg p-3">
//               <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Command Centers</h3>
//               {!isDateSelected && (
//                 <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">Select a date range first to enable command selection.</p>
//               )}
//               <div className="flex flex-wrap gap-2">
//                 {availableCommands.map((cmd) => (
//                   <button
//                     key={cmd}
//                     onClick={() => selectCommand(cmd)}
//                     disabled={!isDateSelected}
//                     className={`
//                       px-3 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
//                       ${
//                         selectedCommand === cmd
//                           ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-300 dark:ring-orange-600'
//                           : 'bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200 hover:bg-orange-300 dark:hover:bg-orange-600'
//                       }
//                     `}
//                   >
//                     {COMMAND_CENTERS[cmd]?.shortName || cmd.split(' ')[0]}
//                   </button>
//                 ))}
//               </div>
//               {selectedCommand && (
//                 <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded border">
//                   <strong>Selected:</strong> {COMMAND_CENTERS[selectedCommand].name}
//                   <button
//                     onClick={() => selectCommand('')}
//                     className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
//                   >
//                     (Clear)
//                   </button>
//                 </div>
//               )}
//             </div>

//             <Card className="border-blue-200 dark:border-blue-600 shadow-sm dark:bg-gray-800">
//               <CardHeader className="bg-blue-50 dark:bg-blue-900">
//                 <CardTitle className="text-blue-900 dark:text-blue-200 text-sm">FLIGHT STATUS OVERVIEW</CardTitle>
//                 {selectedCommand && (
//                   <CardDescription className="text-xs text-blue-600 dark:text-blue-400">
//                     Showing data for: {COMMAND_CENTERS[selectedCommand].name}
//                   </CardDescription>
//                 )}
//               </CardHeader>
//               <CardContent className="p-4">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg text-center border border-green-200 dark:border-green-600">
//                     <div className="text-2xl font-bold text-green-700 dark:text-green-300">{activeCount}</div>
//                     <div className="text-xs text-green-600 dark:text-green-400 font-medium">ACTIVE OPERATIONS</div>
//                   </div>
//                   <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-600">
//                     <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{plannedCount}</div>
//                     <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">PLANNED MISSIONS</div>
//                   </div>
//                 </div>
//               </CardContent>
//             </Card>

//             <Card className="border-red-200 dark:border-red-600 shadow-sm dark:bg-gray-800">
//               <CardHeader className="bg-red-50 dark:bg-red-900">
//                 <CardTitle className="text-red-800 dark:text-red-200 text-sm">
//                   CANCELLATION REQUESTS ({cancelReqs.length})
//                 </CardTitle>
//               </CardHeader>
//               <CardContent className="p-4">
//                 {cancelReqs.map((f) => (
//                   <div
//                     key={f.id}
//                     className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-red-100 dark:border-red-600 rounded mb-2"
//                   >
//                     <div>
//                       <div className="font-semibold text-gray-800 dark:text-gray-200">{f.drone_model ?? 'Unknown'}</div>
//                       <div className="text-xs text-gray-600 dark:text-gray-400">Command: {f.command_name ?? 'N/A'}</div>
//                       <div className="text-xs text-gray-500 dark:text-gray-400">
//                         {safeFormat(f.start, 'MMM dd, HH:mm')} – {safeFormat(f.end, 'MMM dd, HH:mm')}
//                       </div>
//                     </div>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => approveCancel(f.id)}
//                       className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
//                     >
//                       Approve
//                     </Button>
//                   </div>
//                 ))}
//                 {cancelReqs.length === 0 && (
//                   <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No pending cancellation requests.</p>
//                 )}
//               </CardContent>
//             </Card>

//             <Card className="border-blue-200 dark:border-blue-600 shadow-sm dark:bg-gray-800">
//               <CardHeader className="bg-blue-50 dark:bg-blue-900">
//                 <CardTitle className="text-blue-900 dark:text-blue-200 text-sm">MISSION LIST ({filteredFlights.length})</CardTitle>
//               </CardHeader>
//               <CardContent className="p-4">
//                 <div className="space-y-3 max-h-96 overflow-y-auto">
//                   {paginatedFlights.map((f) => (
//                     <div
//                       key={f.id}
//                       className={`p-3 rounded border cursor-pointer transition-all hover:shadow-md ${
//                         selectedFlight?.id === f.id
//                           ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 shadow-md'
//                           : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
//                       }`}
//                       onClick={() => setSelectedFlight(f)}
//                     >
//                       <div className="flex items-center justify-between mb-2">
//                         {getStatusBadge(f.status)}
//                         <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(f.start)}</span>
//                       </div>
//                       <div className="text-sm space-y-1">
//                         <div className="font-semibold text-blue-700 dark:text-blue-300">{f.drone_model ?? 'Unknown'}</div>
//                         <div className="text-xs text-gray-600 dark:text-gray-400">{f.purpose?.slice(0, 50) ?? 'No purpose'}…</div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">Class: {f.drone_class ?? 'N/A'}</div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">Command: {f.command_name ?? 'N/A'}</div>
//                         <div className="text-xs text-gray-500 dark:text-gray-400">
//                           Freq: {typeof f.frequency === 'number' ? f.frequency.toFixed(1) : 'N/A'} MHz
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {filteredFlights.length === 0 && (
//                     <div className="text-center text-gray-500 dark:text-gray-400 py-8">
//                       {!selectedCommand ? 'Select a command center to view flights' : 'No flights match current filters.'}
//                     </div>
//                   )}
//                 </div>
//                 {filteredFlights.length > itemsPerPage && (
//                   <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
//                       disabled={currentPage === 1}
//                       className="px-3"
//                     >
//                       Previous
//                     </Button>
//                     <span className="text-sm text-gray-600 dark:text-gray-300">
//                       Page {currentPage} of {Math.ceil(filteredFlights.length / itemsPerPage)}
//                     </span>
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredFlights.length / itemsPerPage)))}
//                       disabled={currentPage * itemsPerPage >= filteredFlights.length}
//                       className="px-3"
//                     >
//                       Next
//                     </Button>
//                   </div>
//                 )}
//               </CardContent>
//             </Card>

//             {selectedFlight && (
//               <Card className="border-green-200 dark:border-green-600 shadow-sm dark:bg-gray-800">
//                 <CardHeader className="bg-green-50 dark:bg-green-900">
//                   <CardTitle className="text-green-800 dark:text-green-200 text-sm flex items-center space-x-2">
//                     <Eye className="w-4 h-4" />
//                     <span>FLIGHT DETAILS</span>
//                   </CardTitle>
//                 </CardHeader>
//                 <CardContent className="p-4 space-y-3">
//                   <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
//                     <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mission Purpose</div>
//                     <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedFlight.purpose ?? 'No purpose provided'}</div>
//                   </div>
//                   <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
//                     <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Timeline</div>
//                     <div className="text-xs space-y-1 mt-1">
//                       <div className="text-gray-600 dark:text-gray-400">
//                         Start: {safeFormat(selectedFlight.start, 'MMM dd, yyyy HH:mm')}
//                       </div>
//                       <div className="text-gray-600 dark:text-gray-400">
//                         End: {safeFormat(selectedFlight.end, 'MMM dd, yyyy HH:mm')}
//                       </div>
//                     </div>
//                   </div>
//                   <div className="grid grid-cols-2 gap-2">
//                     <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
//                       <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Waypoints</div>
//                       <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedWaypoints.length} total</div>
//                     </div>
//                     <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
//                       <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Class</div>
//                       <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedFlight.drone_class ?? 'N/A'}</div>
//                     </div>
//                   </div>
//                   <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
//                     <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Command Center</div>
//                     <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedFlight.command_name ?? 'N/A'}</div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )}
//           </div>
//         </div>
//       </div>
//     </ErrorBoundary>
//   );
// };

// export default AdminDashboard;





import 'leaflet/dist/leaflet.css';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import CesiumMap from './CesiumMap2';
import {
  Shield,
  Users,
  Plane,
  Eye,
  User,
  Search,
  MapPin,
  X,
  Calendar,
} from 'lucide-react';
import { format, isValid, parseISO } from 'date-fns';
import ErrorBoundary from './ErrorBoundary';
import { apiService } from '../services/api';
import HeaderNav from './Admin_Header&Nav/Header&Nav';

const API_BASE_URL = 'https://backend-dms-production.up.railway.app/api';

interface Flight {
  id: string;
  user_id: string;
  drone_model: string;
  drone_class: string;
  command_name: string;
  frequency: number;
  clockDrift: number;
  spectralLeakage: number;
  modularshapeId: number;
  purpose: string;
  start: string;
  end: string;
  status: 'planned' | 'active' | 'completed';
  cancel_requested: boolean;
}

interface Waypoint {
  flight_id: string;
  lat: number;
  lng: number;
  elev: number;
  sequence: number;
}

interface FlightPath {
  id: string;
  waypoints: Waypoint[];
  color: string;
  status: string;
  isSelected: boolean;
}

interface SearchLocation {
  lat: number;
  lng: number;
  name?: string;
}

interface User {
  id: string;
  username: string;
  operatorCategoryName?: string;
  commandName?: string;
  divisionName?: string;
  brigadeName?: string;
  corpsName?: string;
  unit?: string;
}

const COMMAND_CENTERS = {
  ALL: { name: 'ALL COMMANDS', lat: 23.1815, lng: 79.9864, shortName: 'ALL' },
  'EASTERN COMMAND': { name: 'EASTERN COMMAND', lat: 33.7738, lng: 76.5762, shortName: 'EC' },
  'WESTERN COMMAND': { name: 'WESTERN COMMAND', lat: 32.7266, lng: 74.8570, shortName: 'WC' },
  'SOUTHERN COMMAND': { name: 'SOUTHERN COMMAND', lat: 18.5204, lng: 73.8567, shortName: 'SC' },
  'NORTHERN COMMAND': { name: 'NORTHERN COMMAND', lat: 34.0837, lng: 74.7973, shortName: 'NC' },
  'SOUTH WESTERN COMMAND': { name: 'SOUTH WESTERN COMMAND', lat: 26.9124, lng: 75.7873, shortName: 'SWC' },
  'CENTRAL COMMAND': { name: 'CENTRAL COMMAND', lat: 23.1815, lng: 79.9864, shortName: 'CC' },
};

const AdminDashboard: React.FC = () => {
  const { user, logout, getUserById } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [timeFilter, setTimeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'planned'>('all');
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);
  const [selectedWaypoints, setSelectedWaypoints] = useState<Waypoint[]>([]);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [searchLat, setSearchLat] = useState<string>('');
  const [searchLng, setSearchLng] = useState<string>('');
  const [searchLocation, setSearchLocation] = useState<SearchLocation | null>(null);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [selectedCommand, setSelectedCommand] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const waypointsCache = useRef<Map<string, Waypoint[]>>(new Map());

  const isDateSelected = fromDate && toDate;

  // Initialize theme on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newTheme = !isDarkMode ? 'dark' : 'light';
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const availableCommands = Object.keys(COMMAND_CENTERS).sort();

  const selectCommand = (cmd: string) => {
    if (!isDateSelected) {
      setError('Please select a date range first.');
      return;
    }
    if (selectedCommand === cmd) {
      setSelectedCommand('');
      setMapCenter(undefined);
      setMapZoom(undefined);
    } else {
      setSelectedCommand(cmd);
      if (cmd === 'ALL') {
        setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
        setMapZoom(5);
      } else {
        setMapCenter({ lat: COMMAND_CENTERS[cmd].lat, lng: COMMAND_CENTERS[cmd].lng });
        setMapZoom(10);
      }
    }
    setSelectedFlight(null);
    setSelectedWaypoints([]);
    setSelectedUser(null);
    setError(null);
    setCurrentPage(1);
  };

  const fetchFlights = async (command?: string, from?: string, to?: string) => {
    try {
      const params: any = {};
      if (command) params.command = command;
      if (from) params.fromDate = from;
      if (to) params.toDate = to;
      const data = await apiService.getAllFlights(params);
      console.log('Fetched flights:', data);
      if (!Array.isArray(data)) {
        console.error('Expected an array of flights, got:', data);
        setFlights([]);
        setError('Invalid flight data received from server');
        return;
      }
      setFlights(data);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching flights:', error.message, error.response?.data);
      setFlights([]);
      setError(error.response?.data?.message || 'Error fetching flights');
    }
  };

  const fetchWaypoints = async (flightId: string): Promise<Waypoint[]> => {
    if (waypointsCache.current.has(flightId)) {
      return waypointsCache.current.get(flightId)!;
    }
    try {
      const waypoints = await apiService.getFlightWaypoints(flightId);
      console.log(`Waypoints for flight ${flightId}:`, waypoints);
      if (!Array.isArray(waypoints)) {
        console.error(`Expected an array of waypoints for flight ${flightId}, got:`, waypoints);
        return [];
      }
      waypointsCache.current.set(flightId, waypoints);
      return waypoints;
    } catch (error: any) {
      console.error(`Error fetching waypoints for flight ${flightId}:`, error.message, error.response?.data);
      setError(error.response?.data?.message || `Error fetching waypoints for flight ${flightId}`);
      return [];
    }
  };

  const deleteFlight = async (flightId: string) => {
    try {
      const response = await apiService.deleteFlight(flightId);
      if (response.success) {
        await fetchFlights(selectedCommand, fromDate, toDate);
        waypointsCache.current.delete(flightId);
        if (selectedFlight?.id === flightId) {
          setSelectedFlight(null);
          setSelectedWaypoints([]);
          setSelectedUser(null);
          if (selectedCommand) {
            if (selectedCommand === 'ALL') {
              setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
              setMapZoom(5);
            } else {
              setMapCenter({ lat: COMMAND_CENTERS[selectedCommand].lat, lng: COMMAND_CENTERS[selectedCommand].lng });
              setMapZoom(10);
            }
          } else {
            setMapCenter(undefined);
            setMapZoom(undefined);
          }
        }
        setError(null);
      } else {
        console.error('Failed to delete flight:', response.message);
        setError(response.message || 'Failed to delete flight');
      }
    } catch (error: any) {
      console.error('Error deleting flight:', error.message, error.response?.data);
      setError(error.response?.data?.message || 'Error deleting flight');
    }
  };

  const handleSearch = () => {
    const lat = parseFloat(searchLat);
    const lng = parseFloat(searchLng);
    if (!isNaN(lat) && !isNaN(lng)) {
      setSearchLocation({ lat, lng });
      setMapCenter({ lat, lng });
      setMapZoom(12);
    } else {
      setError('Please enter valid coordinates');
    }
  };

  const clearSearch = () => {
    setSearchLocation(null);
    setSearchLat('');
    setSearchLng('');
    if (selectedCommand) {
      if (selectedCommand === 'ALL') {
        setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
        setMapZoom(5);
      } else {
        setMapCenter({ lat: COMMAND_CENTERS[selectedCommand].lat, lng: COMMAND_CENTERS[selectedCommand].lng });
        setMapZoom(10);
      }
    } else if (selectedFlight && selectedWaypoints.length > 0) {
      if (selectedWaypoints.length === 1) {
        setMapCenter({ lat: selectedWaypoints[0].lat, lng: selectedWaypoints[0].lng });
        setMapZoom(8);
      } else {
        const lats = selectedWaypoints.map((w) => w.lat);
        const lngs = selectedWaypoints.map((w) => w.lng);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);
        const minLng = Math.min(...lngs);
        const maxLng = Math.max(...lngs);
        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;
        const latDiff = maxLat - minLat;
        const lngDiff = maxLng - minLng;
        const maxDiff = Math.max(latDiff, lngDiff);
        let zoom = 10;
        if (maxDiff < 0.01) zoom = 16;
        else if (maxDiff < 0.05) zoom = 14;
        else if (maxDiff < 0.1) zoom = 12;
        else if (maxDiff < 0.5) zoom = 10;
        else if (maxDiff < 1) zoom = 8;
        else zoom = 6;
        setMapCenter({ lat: centerLat, lng: centerLng });
        setMapZoom(zoom);
      }
    } else {
      setMapCenter(undefined);
      setMapZoom(undefined);
    }
  };

  const clearDateFilter = () => {
    setFromDate(today);
    setToDate(today);
    setSelectedCommand('');
    setFlights([]);
    setFlightPaths([]);
    setMapCenter(undefined);
    setMapZoom(undefined);
    setSelectedFlight(null);
    setSelectedWaypoints([]);
    setSelectedUser(null);
    setCurrentPage(1);
  };

  // Fetch flights on command, date changes
  useEffect(() => {
    if (selectedCommand) {
      fetchFlights(selectedCommand, fromDate, toDate);
    } else {
      setFlights([]);
      setFlightPaths([]);
    }
  }, [selectedCommand, fromDate, toDate]);

  // Polling for flights
  useEffect(() => {
    if (!selectedCommand) return;
    const loadFlights = async () => {
      await fetchFlights(selectedCommand, fromDate, toDate);
    };
    loadFlights();
    const intervalId = setInterval(loadFlights, 60000);
    return () => clearInterval(intervalId);
  }, [selectedCommand, fromDate, toDate]);

  // Reset page on filter or command change
  useEffect(() => {
    setCurrentPage(1);
  }, [timeFilter, statusFilter, selectedCommand, fromDate, toDate]);

  useEffect(() => {
    if (selectedFlight) {
      fetchWaypoints(selectedFlight.id).then((waypoints) => {
        setSelectedWaypoints(waypoints);
        if (waypoints.length > 0) {
          if (waypoints.length === 1) {
            setMapCenter({ lat: waypoints[0].lat, lng: waypoints[0].lng });
            setMapZoom(8);
          } else {
            const lats = waypoints.map((w) => w.lat);
            const lngs = waypoints.map((w) => w.lng);
            const minLat = Math.min(...lats);
            const maxLat = Math.max(...lats);
            const minLng = Math.min(...lngs);
            const maxLng = Math.max(...lngs);
            const centerLat = (minLat + maxLat) / 2;
            const centerLng = (minLng + maxLng) / 2;
            const latDiff = maxLat - minLat;
            const lngDiff = maxLng - minLng;
            const maxDiff = Math.max(latDiff, lngDiff);
            let zoom = 10;
            if (maxDiff < 0.01) zoom = 16;
            else if (maxDiff < 0.05) zoom = 14;
            else if (maxDiff < 0.1) zoom = 12;
            else if (maxDiff < 0.5) zoom = 10;
            else if (maxDiff < 1) zoom = 8;
            else zoom = 6;
            setMapCenter({ lat: centerLat, lng: centerLng });
            setMapZoom(zoom);
          }
        }
      });
      getUserById(selectedFlight.user_id).then((userData) => {
        console.log('Fetched user for flight:', userData);
        setSelectedUser(userData ?? null);
      }).catch((error) => {
        console.error('Error fetching user:', error);
        setSelectedUser(null);
        setError('Error fetching user data');
      });
    } else {
      setSelectedWaypoints([]);
      setSelectedUser(null);
      if (selectedCommand) {
        if (selectedCommand === 'ALL') {
          setMapCenter({ lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng });
          setMapZoom(5);
        } else {
          setMapCenter({ lat: COMMAND_CENTERS[selectedCommand].lat, lng: COMMAND_CENTERS[selectedCommand].lng });
          setMapZoom(8);
        }
      } else {
        setMapCenter(undefined);
        setMapZoom(undefined);
      }
    }
  }, [selectedFlight, getUserById, selectedCommand]);

  const buildPaths = async (fls: Flight[]) => {
    const now = new Date();
    const paths = await Promise.all(
      fls.map(async (f) => {
        const waypoints = await fetchWaypoints(f.id);
        let color = '#808080'; // gray
        const startDate = new Date(f.start);
        let hours = NaN;
        if (isValid(startDate)) {
          hours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        }

        if (f.status === 'active') {
          if (hours <= 1) color = '#FF0000';
          else if (hours <= 6) color = '#FFA500';
          else if (hours <= 24) color = '#FFFF00';
          else color = '#008000';
        } else if (f.status === 'planned') {
          color = '#00FFFF';
        }

        const path: FlightPath = {
          id: f.id,
          waypoints: waypoints ?? [],
          color,
          status: f.status,
          isSelected: selectedFlight?.id === f.id,
        };
        console.log(`Built path for flight ${f.id}:`, path);
        return path;
      })
    );
    console.log('All flight paths:', paths);
    setFlightPaths(paths);
    setError(null);
  };

  useEffect(() => {
    const updatePaths = async () => {
      if (!selectedCommand || flights.length === 0) {
        setFlightPaths([]);
        return;
      }
      const now = new Date();
      const toShow = flights.filter((f) => {
        // Date range filter (but since API now filters, this is redundant but keep for safety)
        if (fromDate && toDate) {
          const startDate = new Date(f.start);
          if (!isValid(startDate)) return false;
          const from = new Date(fromDate);
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999); // End of day
          if (startDate < from || startDate > to) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'active' && f.status !== 'active') return false;
          if (statusFilter === 'planned' && f.status !== 'planned') return false;
        }

        // Time filter
        if (timeFilter === 'all') return true;

        const startDate = new Date(f.start);
        if (!isValid(startDate)) return false;
        const hours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        switch (timeFilter) {
          case '1h':
            return hours >= 0 && hours <= 1;
          case '6h':
            return hours >= 0 && hours <= 6;
          case '12h':
            return hours >= 0 && hours <= 12;
          case '24h':
            return hours >= 0 && hours <= 24;
          case 'week':
            return hours >= 0 && hours <= 24 * 7;
          case 'month':
            return hours >= 0 && hours <= 24 * 30;
          default:
            return true;
        }
      });
      // Sort by start date descending and limit to recent flights for performance
      const MAX_PATHS = 500;
      const sorted = toShow.sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
      const limited = sorted.slice(0, MAX_PATHS);
      console.log(`Building paths for ${limited.length} out of ${toShow.length} filtered flights (limited to ${MAX_PATHS})`);
      await buildPaths(limited);
    };
    updatePaths().catch((error) => {
      console.error('Error updating paths:', error);
      setError('Error updating flight paths');
    });
  }, [flights, timeFilter, statusFilter, selectedCommand, selectedFlight, fromDate, toDate]);

  const filteredFlights = useMemo(() => {
    const now = new Date();
    return flights
      .filter((f) => {
        // Date range filter
        if (fromDate && toDate) {
          const startDate = new Date(f.start);
          if (!isValid(startDate)) return false;
          const from = new Date(fromDate);
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999); // End of day
          if (startDate < from || startDate > to) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'active' && f.status !== 'active') return false;
          if (statusFilter === 'planned' && f.status !== 'planned') return false;
        }

        // Time filter
        if (timeFilter === 'all') return true;

        const startDate = new Date(f.start);
        if (!isValid(startDate)) return false;
        const hours = (now.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        switch (timeFilter) {
          case '1h':
            return hours >= 0 && hours <= 1;
          case '6h':
            return hours >= 0 && hours <= 6;
          case '12h':
            return hours >= 0 && hours <= 12;
          case '24h':
            return hours >= 0 && hours <= 24;
          case 'week':
            return hours >= 0 && hours <= 24 * 7;
          case 'month':
            return hours >= 0 && hours <= 24 * 30;
          default:
            return true;
        }
      })
      .sort((a, b) => new Date(b.start).getTime() - new Date(a.start).getTime());
  }, [flights, timeFilter, statusFilter, fromDate, toDate]);

  const activeCount = useMemo(() => filteredFlights.filter((f) => f.status === 'active').length, [filteredFlights]);
  const plannedCount = useMemo(() => filteredFlights.filter((f) => f.status === 'planned').length, [filteredFlights]);

  const cancelReqs = useMemo(() => filteredFlights.filter((f) => f.cancel_requested), [filteredFlights]);

  const paginatedFlights = useMemo(() => 
    filteredFlights.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [filteredFlights, currentPage, itemsPerPage]
  );

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-600',
      planned: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-600',
      completed: 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600',
    };
    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-600 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTimeAgo = (date: string) => {
    const d = new Date(date);
    if (!isValid(d)) return 'Unknown';
    const diff = Date.now() - d.getTime();
    const absDiff = Math.abs(diff);
    const h = Math.floor(absDiff / 3_600_000);
    const m = Math.floor((absDiff % 3_600_000) / 60_000);
    const timeStr = h > 0 ? `${h}h ${m}m` : `${m}m`;
    return diff > 0 ? `${timeStr} ago` : `in ${timeStr}`;
  };

  const safeFormat = (dateStr: string, fmt: string) => {
    const d = new Date(dateStr);
    return isValid(d) ? format(d, fmt) : 'Invalid date';
  };

  const approveCancel = (id: string) => {
    deleteFlight(id);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HeaderNav isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        {error && (
          <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-600 text-red-800 dark:text-red-200 p-4 m-4 rounded">
            <p>{error}</p>
            <Button onClick={() => setError(null)} className="mt-2 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white">
              Clear Error
            </Button>
          </div>
        )}
        <div className="flex h-[calc(100vh-140px)]">
          <div className="flex-1 p-4">
            <Card className="h-full border-blue-200 dark:border-gray-600 shadow-lg dark:bg-gray-800">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-1000">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Plane className="w-5 h-5 text-blue-700 dark:text-blue-300" />
                    <span className="text-blue-900 dark:text-blue-200">OPERATIONAL OVERVIEW</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSearch(!showSearch)}
                      className={`border-blue-300 dark:border-blue-600 ${
                        showSearch ? 'bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200' : 'text-blue-600 dark:text-blue-400'
                      } hover:bg-blue-50 dark:hover:bg-blue-700`}
                    >
                      <Search className="w-4 h-4 mr-1" />
                      Search Location
                    </Button>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="w-48 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Time Filter" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white dark:bg-gray-800">
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="1h">Last 1h</SelectItem>
                        <SelectItem value="6h">Last 6h</SelectItem>
                        <SelectItem value="12h">Last 12h</SelectItem>
                        <SelectItem value="24h">Last 24h</SelectItem>
                        <SelectItem value="week">Past Week</SelectItem>
                        <SelectItem value="month">Past Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'planned')}>
                      <SelectTrigger className="w-40 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white dark:bg-gray-800">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active Only</SelectItem>
                        <SelectItem value="planned">Planned Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
                {showSearch && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-600 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-blue-900 dark:text-blue-200">Search by Coordinates:</span>
                      </div>
                      <Input
                        type="number"
                        placeholder="Latitude (e.g., 28.6139)"
                        value={searchLat ?? ''}
                        onChange={(e) => setSearchLat(e.target.value)}
                        className="w-32 text-sm border-blue-300 dark:border-blue-600 dark:bg-gray-700 dark:text-gray-200"
                        step="any"
                      />
                      <Input
                        type="number"
                        placeholder="Longitude (e.g., 77.2090)"
                        value={searchLng ?? ''}
                        onChange={(e) => setSearchLng(e.target.value)}
                        className="w-32 text-sm border-blue-300 dark:border-blue-600 dark:bg-gray-700 dark:text-gray-200"
                        step="any"
                      />
                      <Button
                        size="sm"
                        onClick={handleSearch}
                        className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                      >
                        <Search className="w-4 h-4 mr-1" />
                        Find
                      </Button>
                      {searchLocation && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={clearSearch}
                          className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          <X className="w-4 h-4 mr-1" />
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Real-time flight monitoring with color-coded trajectories
                  {selectedCommand && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400 font-medium">
                      - Showing: {COMMAND_CENTERS[selectedCommand].name}
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[calc(100%-120px)]">
                <ErrorBoundary>
                  <CesiumMap
                    flightPaths={flightPaths ?? []}
                    waypoints={selectedWaypoints ?? []}
                    center={mapCenter ?? { lat: COMMAND_CENTERS['ALL'].lat, lng: COMMAND_CENTERS['ALL'].lng }}
                    zoom={mapZoom ?? 5}
                    searchLocation={searchLocation ?? null}
                    selectedUser={selectedUser ?? null}
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>

          <div className="w-96 p-4 space-y-4 overflow-y-auto border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-900 border border-indigo-200 dark:border-indigo-600 rounded-lg">
              <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Date Range Filter</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">From:</span>
                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-40 text-sm border-indigo-300 dark:border-indigo-600 dark:bg-gray-700 dark:text-gray-200"
                />
                <span className="text-sm text-indigo-600 dark:text-indigo-400">to</span>
                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-40 text-sm border-indigo-300 dark:border-indigo-600 dark:bg-gray-700 dark:text-gray-200"
                />
                {(fromDate !== today || toDate !== today) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearDateFilter}
                    className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-600 rounded-lg p-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Command Centers</h3>
              {!isDateSelected && (
                <p className="text-xs text-orange-600 dark:text-orange-400 mb-2">Select a date range first to enable command selection.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {availableCommands.map((cmd) => (
                  <button
                    key={cmd}
                    onClick={() => selectCommand(cmd)}
                    disabled={!isDateSelected}
                    className={`
                      px-3 py-1 rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                      ${
                        selectedCommand === cmd
                          ? 'bg-orange-500 text-white shadow-md ring-2 ring-orange-300 dark:ring-orange-600'
                          : 'bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-200 hover:bg-orange-300 dark:hover:bg-orange-600'
                      }
                    `}
                  >
                    {COMMAND_CENTERS[cmd]?.shortName || cmd.split(' ')[0]}
                  </button>
                ))}
              </div>
              {selectedCommand && (
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded border">
                  <strong>Selected:</strong> {COMMAND_CENTERS[selectedCommand].name}
                  <button
                    onClick={() => selectCommand('')}
                    className="ml-2 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    (Clear)
                  </button>
                </div>
              )}
            </div>

            <Card className="border-blue-200 dark:border-blue-600 shadow-sm dark:bg-gray-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900">
                <CardTitle className="text-blue-900 dark:text-blue-200 text-sm">FLIGHT STATUS OVERVIEW</CardTitle>
                {selectedCommand && (
                  <CardDescription className="text-xs text-blue-600 dark:text-blue-400">
                    Showing data for: {COMMAND_CENTERS[selectedCommand].name}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900 p-3 rounded-lg text-center border border-green-200 dark:border-green-600">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">{activeCount}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">ACTIVE OPERATIONS</div>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900 p-3 rounded-lg text-center border border-blue-200 dark:border-blue-600">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{plannedCount}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">PLANNED MISSIONS</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 dark:border-red-600 shadow-sm dark:bg-gray-800">
              <CardHeader className="bg-red-50 dark:bg-red-900">
                <CardTitle className="text-red-800 dark:text-red-200 text-sm">
                  CANCELLATION REQUESTS ({cancelReqs.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {cancelReqs.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-700 border border-red-100 dark:border-red-600 rounded mb-2"
                  >
                    <div>
                      <div className="font-semibold text-gray-800 dark:text-gray-200">{f.drone_model ?? 'Unknown'}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Command: {f.command_name ?? 'N/A'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {safeFormat(f.start, 'MMM dd, HH:mm')} – {safeFormat(f.end, 'MMM dd, HH:mm')}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => approveCancel(f.id)}
                      className="border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      Approve
                    </Button>
                  </div>
                ))}
                {cancelReqs.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No pending cancellation requests.</p>
                )}
              </CardContent>
            </Card>

            <Card className="border-blue-200 dark:border-blue-600 shadow-sm dark:bg-gray-800">
              <CardHeader className="bg-blue-50 dark:bg-blue-900">
                <CardTitle className="text-blue-900 dark:text-blue-200 text-sm">MISSION LIST ({filteredFlights.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {paginatedFlights.map((f) => (
                    <div
                      key={f.id}
                      className={`p-3 rounded border cursor-pointer transition-all hover:shadow-md ${
                        selectedFlight?.id === f.id
                          ? 'bg-blue-50 dark:bg-blue-900 border-blue-300 dark:border-blue-600 shadow-md'
                          : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedFlight(f)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        {getStatusBadge(f.status)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(f.start)}</span>
                      </div>
                      <div className="text-sm space-y-1">
                        <div className="font-semibold text-blue-700 dark:text-blue-300">{f.drone_model ?? 'Unknown'}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">{f.purpose?.slice(0, 50) ?? 'No purpose'}…</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Class: {f.drone_class ?? 'N/A'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Command: {f.command_name ?? 'N/A'}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Freq: {typeof f.frequency === 'number' ? f.frequency.toFixed(1) : 'N/A'} MHz
                        </div>
                      </div>
                    </div>
                  ))}
                  {filteredFlights.length === 0 && (
                    <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                      {!selectedCommand ? 'Select a command center to view flights' : 'No flights match current filters.'}
                    </div>
                  )}
                </div>
                {filteredFlights.length > itemsPerPage && (
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3"
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Page {currentPage} of {Math.ceil(filteredFlights.length / itemsPerPage)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, Math.ceil(filteredFlights.length / itemsPerPage)))}
                      disabled={currentPage * itemsPerPage >= filteredFlights.length}
                      className="px-3"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {selectedFlight && (
              <Card className="border-green-200 dark:border-green-600 shadow-sm dark:bg-gray-800">
                <CardHeader className="bg-green-50 dark:bg-green-900">
                  <CardTitle className="text-green-800 dark:text-green-200 text-sm flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>FLIGHT DETAILS</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3">
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mission Purpose</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedFlight.purpose ?? 'No purpose provided'}</div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Timeline</div>
                    <div className="text-xs space-y-1 mt-1">
                      <div className="text-gray-600 dark:text-gray-400">
                        Start: {safeFormat(selectedFlight.start, 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        End: {safeFormat(selectedFlight.end, 'MMM dd, yyyy HH:mm')}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Waypoints</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedWaypoints.length} total</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Class</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedFlight.drone_class ?? 'N/A'}</div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-3 rounded border border-gray-100 dark:border-gray-600">
                    <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">Command Center</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{selectedFlight.command_name ?? 'N/A'}</div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;