
// import React, { useState, useEffect, Component, ErrorInfo, useMemo, useCallback } from 'react';
// import { useAuth } from '@/contexts/AuthContext';
// import { Button } from '@/components/ui/button';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from '@/components/ui/card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogClose,
// } from '@/components/ui/dialog';
// import { Shield, LogOut, Users, Plane, MapPin, RefreshCw, Clock, Moon, Sun, BarChart, ChevronLeft, ChevronRight, User as UserIcon, Settings, Calendar, CheckCircle, Clock as ClockIcon, X, Filter, Search, TrendingUp, Activity, AlertCircle, Target, User } from 'lucide-react';
// import { Badge } from '@/components/ui/badge';
// import { toast } from 'sonner';
// import { apiService } from '@/services/api';
// import { Chart as ChartJS, BarElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
// import { Input } from '@/components/ui/input';
// import profileImg from '@/assets/logo.png';
// import armyBg from '../assets/hero 3.png';
// import PieChart from '../components/piechart';
// import logo from '../assets/Logo1.png';
// import CesiumMap, { Waypoint as CesiumWaypoint } from '../components/CesiumMap2';
// import {
//  HierarchyData,
//   DroneSpec,
//   Flight,
//   hierarchyData,
//   corpsNames,
//   commandNames,
//   COMMAND_CENTERS,
// } from '../components/hierarchy';


// ChartJS.register(BarElement, PointElement, LinearScale, CategoryScale);

// class MonitoringErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
//   state = { hasError: false };
//   static getDerivedStateFromError(error: Error) {
//     return { hasError: true };
//   }
//   componentDidCatch(error: Error, errorInfo: ErrorInfo) {
//     console.error('Error in Monitoring component:', error, errorInfo);
//     toast.error('An error occurred in the Monitoring dashboard. Please try refreshing.');
//   }
//   render() {
//     if (this.state.hasError) {
//       return (
//         <div className="text-center py-12">
//           <p className="text-red-600 dark:text-red-400 text-lg font-semibold">Something went wrong.</p>
//           <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page or contact support.</p>
//           <Button
//             variant="outline"
//             onClick={() => window.location.reload()}
//             className="mt-4 border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
//           >
//             <RefreshCw className="w-4 h-4 mr-2" />
//             Refresh Page
//           </Button>
//         </div>
//       );
//     }
//     return this.props.children;
//   }
// }

// const Monitoring: React.FC = () => {
//   const { user, logout } = useAuth() as { user: User | null; logout: () => void };
//   const [selectedCommandKey, setSelectedCommandKey] = useState<string>('all');
//   const [selectedDivision, setSelectedDivision] = useState<string>('');
//   const [selectedBrigade, setSelectedBrigade] = useState<string>('');
//   const [selectedCorps, setSelectedCorps] = useState<string>('');
//   const [selectedUnit, setSelectedUnit] = useState<string>('');
//   const [selectedStatus, setSelectedStatus] = useState<'all' | 'planned' | 'active' | 'completed'>('all');
//   const [searchTerm, setSearchTerm] = useState<string>('');
//   const [users, setUsers] = useState<User[]>([]);
//   const [droneSpecs, setDroneSpecs] = useState<DroneSpec[]>([]);
//   const [flights, setFlights] = useState<Flight[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
//     const savedTheme = localStorage.getItem('theme');
//     return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
//   });
//   const [currentPage, setCurrentPage] = useState(1);
//   const [currentDronePage, setCurrentDronePage] = useState(1);
//   const [selectedUser, setSelectedUser] = useState<User | null>(null);
//   const [selectedDrone, setSelectedDrone] = useState<DroneSpec | null>(null);
//   const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
//   const PAGE_SIZE = 50;

//   // New states for drone spec filters (single value per spec)
//   const [droneName, setDroneNameFilter] = useState<string>('');
//   const [speedFilter, setSpeedFilter] = useState<number | undefined>(undefined);
//   const [altitudeFilter, setAltitudeFilter] = useState<number | undefined>(undefined);
//   const [rangeFilter, setRangeFilter] = useState<number | undefined>(undefined);
//   const [durationFilter, setDurationFilter] = useState<number | undefined>(undefined);
//   const [gpsFilter, setGpsFilter] = useState<'all' | 'yes' | 'no'>('all');
//   const [autonomousFilter, setAutonomousFilter] = useState<'all' | 'yes' | 'no'>('all');
//   const [controlledFilter, setControlledFilter] = useState<'all' | 'yes' | 'no'>('all');
//   const [cameraFilter, setCameraFilter] = useState<'all' | 'yes' | 'no'>('all');
//   const [cameraResolution, setCameraResolution] = useState<string>('');
//   const [operatingFrequency, setOperatingFrequency] = useState<string>('');

//   // map visualization







//   const [allFlights, setAllFlights] = useState<Flight[]>([]);
//   const [waypoints, setWaypoints] = useState<Record<string, Waypoint[]>>({});
//   const [mapModalOpen, setMapModalOpen] = useState(false);
//   const [selectedFlightWaypoints, setSelectedFlightWaypoints] = useState<Waypoint[]>([]);
//   const [selectedFlightDetails, setSelectedFlightDetails] = useState<Flight | null>(null);
//   const [selectedFlightUser, setSelectedFlightUser] = useState<User | null>(null);
//   // const [loading, setLoading] = useState(true);
//   // const [selectedStatus, setSelectedStatus] = useState<string>('all');
//   const [statusFilter, setStatusFilter] = useState<string>('all');
//   const [dateFilter, setDateFilter] = useState<string>('all');
//   const [customStartDate, setCustomStartDate] = useState<string>('');
//   const [customEndDate, setCustomEndDate] = useState<string>('');
//   const [flightsPerPage] = useState(10);

//   const statColors = {
//     'Total Users': '#1E40AF',
//     'Total Drones': '#047857',
//     'Total Flights': '#7F1D1D',
//     'Planned Flights': '#92400E',
//     'Active Flights': '#1E3A8A',
//     'Completed Flights': '#166534',
//   };

//   const levelNames = {
//     command: 'Commands',
//     division: 'Corps',
//     brigade: 'Divisions',
//     corps: 'Brigades',
//     unit: 'Units',
//   };

//   const colors = ['#1E40AF', '#047857', '#7F1D1D', '#92400E', '#1E3A8A', '#166534', '#4B5563', '#065F46', '#1F2937', '#991B1B'];

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

//   // Set default command based on user
//   useEffect(() => {
//     if (user && user.command && selectedCommandKey === 'all') {
//       setSelectedCommandKey(user.command);
//       setSelectedDivision('');
//       setSelectedBrigade('');
//       setSelectedCorps('');
//       setSelectedUnit('');
//       setCurrentPage(1);
//       setCurrentDronePage(1);
//     }
//   }, [user]);

//   const handleCommandChange = (value: string) => {
//     // Prevent command change if user has a specific command
//     if (user && user.command) return;
//     setSelectedCommandKey(value);
//     setSelectedDivision('');
//     setSelectedBrigade('');
//     setSelectedCorps('');
//     setSelectedUnit('');
//     setCurrentPage(1);
//     setCurrentDronePage(1);
//   };

//   const handleDivisionChange = (value: string) => {
//     setSelectedDivision(value);
//     setSelectedBrigade('');
//     setSelectedCorps('');
//     setSelectedUnit('');
//     setCurrentPage(1);
//     setCurrentDronePage(1);
//   };

//   const handleBrigadeChange = (value: string) => {
//     setSelectedBrigade(value);
//     setSelectedCorps('');
//     setSelectedUnit('');
//     setCurrentPage(1);
//     setCurrentDronePage(1);
//   };

//   const handleCorpsChange = (value: string) => {
//     setSelectedCorps(value);
//     setSelectedUnit('');
//     setCurrentPage(1);
//     setCurrentDronePage(1);
//   };

//   const handleStatusChange = (value: string) => {
//     setSelectedStatus(value === 'all' ? 'all' : value as 'planned' | 'active' | 'completed');
//   };

//   // Reset drone filters
//   const resetDroneFilters = () => {
    
//     setSpeedFilter(undefined);
//     setAltitudeFilter(undefined);
//     setRangeFilter(undefined);
//     setDurationFilter(undefined);
//     setGpsFilter('all');
//     setAutonomousFilter('all');
//     setControlledFilter('all');
//     setCameraFilter('all');
//     setCameraResolution('');
//     setOperatingFrequency('');
//     setDroneNameFilter('');
//   };



// const openMapModal = async (flight: Flight) => {
//   try {
//     const flightWaypoints = waypoints[flight.id] || (await apiService.getFlightWaypoints(flight.id).catch(() => [])) || [];
//     const flightUser = users.find(u => u.id === flight.user_id) || null;
   
//     setSelectedFlightWaypoints(flightWaypoints);
//     setSelectedFlightDetails(flight);
//     setSelectedFlightUser(flightUser);
//     setWaypoints(prev => ({ ...prev, [flight.id]: flightWaypoints }));
//     setMapModalOpen(true);
//   } catch (error) {
//     console.error('Failed to load waypoints:', error);
//     toast.error('Failed to load flight details');

//   }
// };



// const getStatusBadgeClass = (status: string) => {
//   switch (status) {
//     case 'active': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600';
//     case 'planned': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600';
//     case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600';
//     default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
//   }
// };

// const transformWaypoints = (waypoints: Waypoint[]): CesiumWaypoint[] => {
//   return waypoints.map((wp, index) => ({
//     lat: parseFloat(wp.lat) || 0,
//     lng: parseFloat(wp.lng) || 0,
//     elev: wp.elev || 0,
//     sequence: index + 1,
//   }));
// };





//   const loadData = async () => {
//     try {
//       setLoading(true);
//       const [usersData, droneSpecsData, flightsData] = await Promise.all([
//         apiService.getAllUsers().catch(() => []),
//         apiService.getAllDroneSpecs().catch(() => []),
//         apiService.getAllFlights().catch(() => []),
//       ]);
//       const now = new Date();
//       const updatedFlights = (flightsData || []).map((f: Flight) => {
//         const start = new Date(f.start);
//         const end = new Date(f.end);
//         let status = f.status;
//         if (status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
//           status = 'active';
//         } else if (status === 'active' && !isNaN(end.getTime()) && end <= now) {
//           status = 'completed';
//         }
//         return { ...f, status };
//       });

//       // Enrich users with full names
//       const enrichedUsers = (usersData || []).map((u: User) => ({
//          ...u,
//         commandName: u.command ? (commandNames[u.command as keyof typeof commandNames] || u.command) : '',
//         divisionName: u.division && u.command && hierarchyData[u.command as keyof typeof hierarchyData]?.divisions?.[u.division as string]?.name ? hierarchyData[u.command as keyof typeof hierarchyData].divisions[u.division as string].name : (u.divisionName || u.division || ''),
//         brigadeName: u.brigade && u.command && u.division && hierarchyData[u.command as keyof typeof hierarchyData]?.divisions?.[u.division as string]?.brigades?.[u.brigade as string]?.name ? hierarchyData[u.command as keyof typeof hierarchyData].divisions[u.division as string].brigades[u.brigade as string].name : (u.brigadeName || u.brigade || ''),
//         corpsName: u.corps ? (corpsNames[u.corps as keyof typeof corpsNames] || u.corpsName || u.corps) : '',
//       }));

//       setUsers(enrichedUsers);
//       setDroneSpecs(droneSpecsData || []);
//       setFlights(updatedFlights);
//     } catch (error) {
//       console.error('Failed to load data:', error);
//       toast.error('Failed to load monitoring data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadData();
//   }, []);

//   useEffect(() => {
//     const checkMissionStatus = async () => {
//       const now = new Date();
//       let hasChanges = false;
//       const updatedFlights = await Promise.all(
//         flights.map(async (flight) => {
//           const start = new Date(flight.start);
//           const end = new Date(flight.end);
//           let newStatus = flight.status;
//           if (flight.status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
//             newStatus = 'active';
//           } else if (flight.status === 'active' && !isNaN(end.getTime()) && end <= now) {
//             newStatus = 'completed';
//           }
//           if (newStatus !== flight.status) {
//             try {
//               const result = await apiService.updateFlight(flight.id, { ...flight, status: newStatus });
//               if (result.success) {
//                 hasChanges = true;
//                 return { ...flight, status: newStatus };
//               }
//             } catch (error) {
//               console.error(`Failed to update flight ${flight.id} to ${newStatus}:`, error);
//             }
//           }
//           return flight;
//         })
//       );
//       if (hasChanges) {
//         setFlights(updatedFlights);
//         toast.info('Flight statuses updated');
//       }
//     };
//     const interval = setInterval(checkMissionStatus, 30000);
//     checkMissionStatus();
//     return () => clearInterval(interval);
//   }, [flights]);

//   const userMap = useMemo(() => new Map(users.map((u) => [String(u.id), u])), [users]);

//   const filteredUsers = useMemo(() => {
//     return users.filter((u) => {
//       if (u.role !== 'OPERATOR') return false;
//       if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
//       if (selectedDivision && u.division !== selectedDivision) return false;
//       if (selectedBrigade && u.brigade !== selectedBrigade) return false;
//       if (selectedCorps && u.corps !== selectedCorps) return false;
//       if (selectedUnit && (u as any).unit !== selectedUnit) return false;
//       if (selectedStatus !== 'all' && !flights.some((f: Flight) => String(f.user_id) === String(u.id) && f.status === selectedStatus)) return false;
//       if (searchTerm && !u.username.toLowerCase().includes(searchTerm.toLowerCase())) return false;
//       return true;
//     });
//   }, [users, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit, selectedStatus, flights, searchTerm]);

//   // Base filtered drone specs (without spec filters, for counts and pie)
//   const filteredDroneSpecsBase = useMemo(() => {
//     return droneSpecs.filter((d) => {
//       const user = userMap.get(String(d.user_id));
//       if (!user || user.role !== 'OPERATOR') return false;
//       if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
//       if (selectedDivision && user.division !== selectedDivision) return false;
//       if (selectedBrigade && user.brigade !== selectedBrigade) return false;
//       if (selectedCorps && user.corps !== selectedCorps) return false;
//       if (selectedUnit && (user as any).unit !== selectedUnit) return false;
//       if (selectedStatus !== 'all' && !flights.some((f: Flight) => String(f.user_id) === String(d.user_id) && f.status === selectedStatus)) return false;
//       if (searchTerm && !d.droneName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
//       return true;
//     });
//   }, [droneSpecs, userMap, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit, selectedStatus, flights, searchTerm]);

//   // Filtered drone specs for list (apply spec filters on base, with sorting for closeness)
//   const filteredDroneSpecs = useMemo(() => {
//     let list = filteredDroneSpecsBase.filter((d) => {
//       // Numeric filters: within +/-5 of target
//        if (droneName && !d.droneName?.toLowerCase().includes(droneName.toLowerCase())) return false;
//       if (speedFilter !== undefined && Math.abs((d.maxSpeed) - speedFilter) > 5) return false;
//       if (altitudeFilter !== undefined && Math.abs(d.maxHeight - altitudeFilter) > 500) return false;
//       if (rangeFilter !== undefined && Math.abs(d.maxRange - rangeFilter) > 5) return false;
//       if (durationFilter !== undefined && Math.abs(d.maxDuration - durationFilter) > 5) return false;
//       // Boolean filters
//       if (gpsFilter !== 'all' && d.gpsEnabled !== gpsFilter) return false;
//       if (autonomousFilter !== 'all' && d.autonomous !== autonomousFilter) return false;
//       if (controlledFilter !== 'all' && d.controlled !== controlledFilter) return false;
//       if (cameraFilter !== 'all' && d.cameraEnabled !== cameraFilter) return false;
//       // Text filters
//       if (cameraResolution && !d.cameraResolution?.toLowerCase().includes(cameraResolution.toLowerCase())) return false;
//       if (operatingFrequency && !d.operatingFrequency?.toLowerCase().includes(operatingFrequency.toLowerCase())) return false;
//       return true;
//     });

//     // Sort by closeness (sum of abs diffs for numeric filters, smaller first -> exact/closest first)
//     if (speedFilter !== undefined || altitudeFilter !== undefined || rangeFilter !== undefined || durationFilter !== undefined) {
//       list.sort((a, b) => {
//         let scoreA = 0;
//         let scoreB = 0;
//         if (speedFilter !== undefined) {
//           scoreA += Math.abs((a.maxSpeed) - speedFilter);
//           scoreB += Math.abs((b.maxSpeed) - speedFilter);
//         }
//         if (altitudeFilter !== undefined) {
//           scoreA += Math.abs(a.maxHeight - altitudeFilter);
//           scoreB += Math.abs(b.maxHeight - altitudeFilter);
//         }
//         if (rangeFilter !== undefined) {
//           scoreA += Math.abs(a.maxRange - rangeFilter);
//           scoreB += Math.abs(b.maxRange - rangeFilter);
//         }
//         if (durationFilter !== undefined) {
//           scoreA += Math.abs(a.maxDuration - durationFilter);
//           scoreB += Math.abs(b.maxDuration - durationFilter);
//         }
//         return scoreA - scoreB;
//       });
//     }

//     return list;
//   }, [filteredDroneSpecsBase,droneName, speedFilter, altitudeFilter, rangeFilter, durationFilter, gpsFilter, autonomousFilter, controlledFilter, cameraFilter, cameraResolution, operatingFrequency]);

//   const filteredFlights = useMemo(() => {
//     return flights.filter((f) => {
//       const user = userMap.get(String(f.user_id));
//       if (!user || user.role !== 'OPERATOR') return false;
//       if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
//       if (selectedDivision && user.division !== selectedDivision) return false;
//       if (selectedBrigade && user.brigade !== selectedBrigade) return false;
//       if (selectedCorps && user.corps !== selectedCorps) return false;
//       if (selectedUnit && (user as any).unit !== selectedUnit) return false;
//       if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
//       return true;
//     });
//   }, [flights, userMap, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit, selectedStatus]);

//   const statusCounts = useMemo(() => {
//     const counts = { planned: 0, active: 0, completed: 0 };
//     filteredFlights.forEach((f) => {
//       counts[f.status] = (counts[f.status] || 0) + 1;
//     });
//     return counts;
//   }, [filteredFlights]);

//   // Pie chart data without status filter, using base drone count (no spec filters)
//   const pieFilteredUsersCount = useMemo(() => {
//     return users.filter((u) => {
//       if (u.role !== 'OPERATOR') return false;
//       if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
//       if (selectedDivision && u.division !== selectedDivision) return false;
//       if (selectedBrigade && u.brigade !== selectedBrigade) return false;
//       if (selectedCorps && u.corps !== selectedCorps) return false;
//       if (selectedUnit && (u as any).unit !== selectedUnit) return false;
//       return true;
//     }).length;
//   }, [users, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit]);

//   const pieFilteredDronesCount = useMemo(() => {
//     return filteredDroneSpecsBase.length;
//   }, [filteredDroneSpecsBase]);

//   const pieStatusCounts = useMemo(() => {
//     const counts = { planned: 0, active: 0, completed: 0 };
//     flights.forEach((f) => {
//       const user = userMap.get(String(f.user_id));
//       if (!user || user.role !== 'OPERATOR') return;
//       if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return;
//       if (selectedDivision && user.division !== selectedDivision) return;
//       if (selectedBrigade && user.brigade !== selectedBrigade) return;
//       if (selectedCorps && user.corps !== selectedCorps) return;
//       if (selectedUnit && (user as any).unit !== selectedUnit) return;
//       if (f.status in counts) {
//         counts[f.status as keyof typeof counts]++;
//       }
//     });
//     return counts;
//   }, [flights, userMap, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit]);

//   const combinedPieData = useMemo(() => {
//     const labels = ['Total Users', 'Total Drones', 'Planned Flights', 'Active Flights', 'Completed Flights'];
//     const data = [pieFilteredUsersCount, pieFilteredDronesCount, pieStatusCounts.planned, pieStatusCounts.active, pieStatusCounts.completed];
//     const total = data.reduce((a, b) => a + b, 0);
//     if (total === 0) {
//       return null;
//     }
//     const bgColors = [
//       statColors['Total Users'],
//       statColors['Total Drones'],
//       statColors['Planned Flights'],
//       statColors['Active Flights'],
//       statColors['Completed Flights'],
//     ];
//     const hoverBgColors = bgColors.map(color => `${color}CC`);
//     return {
//       labels,
//       datasets: [
//         {
//           data,
//           backgroundColor: bgColors,
//           hoverBackgroundColor: hoverBgColors,
//           borderColor: isDarkMode ? '#ffffff' : '#000000',
//           borderWidth: 2,
//         },
//       ],
//     };
//   }, [pieFilteredUsersCount, pieFilteredDronesCount, pieStatusCounts, isDarkMode, statColors]);

//   const handlePieClick = useCallback((index: number) => {
//     if (index >= 2 && index <= 4) {
//       const statusMap: { [key: number]: 'planned' | 'active' | 'completed' } = {
//         2: 'planned',
//         3: 'active',
//         4: 'completed',
//       };
//       const newStatus = statusMap[index];
//       setSelectedStatus((prev) => (prev === newStatus ? 'all' : newStatus));
//       setCurrentPage(1);
//       setCurrentDronePage(1);
//     }
//   }, []);

//   const getAvailableDivisions = useMemo(() => {
//     if (selectedCommandKey !== 'all' && hierarchyData[selectedCommandKey as keyof typeof hierarchyData]) {
//       return Object.entries(hierarchyData[selectedCommandKey as keyof typeof hierarchyData].divisions || {}).map(([key, value]) => ({
//         value: key,
//         label: (value as any).name || key,
//       })).filter((div) => div.label.trim() !== '');
//     }
//     return [];
//   }, [selectedCommandKey]);

//   const getAvailableBrigades = useMemo(() => {
//     if (selectedCommandKey !== 'all' && selectedDivision && hierarchyData[selectedCommandKey as keyof typeof hierarchyData]?.divisions?.[selectedDivision]) {
//       return Object.entries(hierarchyData[selectedCommandKey as keyof typeof hierarchyData].divisions[selectedDivision].brigades || {}).map(([key, value]) => ({
//         value: key,
//         label: (value as any).name || key,
//       })).filter((bde) => bde.label.trim() !== '');
//     }
//     return [];
//   }, [selectedCommandKey, selectedDivision]);

//   const getAvailableCorps = useMemo(() => {
//     if (selectedCommandKey !== 'all' && selectedDivision && selectedBrigade) {
//       const brigade = hierarchyData[selectedCommandKey as keyof typeof hierarchyData]?.divisions?.[selectedDivision]?.brigades?.[selectedBrigade];
//       if (brigade) {
//         return (brigade as any).corps?.map((corpKey: string) => ({
//           value: corpKey,
//           label: corpsNames[corpKey as keyof typeof corpsNames] || corpKey,
//         })) || [];
//       }
//     }
//     return [];
//   }, [selectedCommandKey, selectedDivision, selectedBrigade]);

//   const getAvailableUnits = useMemo(() => {
//     if (!selectedCorps) return [];
//     const unitsInCorps = users.filter((u) => {
//       if (u.role !== 'OPERATOR') return false;
//       if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
//       if (selectedDivision && u.division !== selectedDivision) return false;
//       if (selectedBrigade && u.brigade !== selectedBrigade) return false;
//       if (u.corps !== selectedCorps) return false;
//       return true;
//     }).map((u) => (u as any).unit).filter(Boolean);
//     const uniqueUnits = [...new Set(unitsInCorps)];
//     return uniqueUnits.map((unit) => ({
//       value: unit,
//       label: unit,
//     }));
//   }, [selectedCorps, users, selectedCommandKey, selectedDivision, selectedBrigade]);

//   const getGroupingLevel = useCallback(() => {
//     if (selectedCommandKey === 'all') return 'command';
//     if (!selectedDivision) return 'division';
//     if (!selectedBrigade) return 'brigade';
//     if (!selectedCorps) return 'corps';
//     return 'unit';
//   }, [selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps]);

//   const paginatedUsers = useMemo(() => {
//     const startIndex = (currentPage - 1) * PAGE_SIZE;
//     return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
//   }, [filteredUsers, currentPage]);

//   const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

//   const handlePageChange = (page: number) => {
//     if (page >= 1 && page <= totalPages) {
//       setCurrentPage(page);
//       setSelectedUser(null); // Reset selection on page change
//     }
//   };

//   const renderPagination = () => {
//     if (totalPages <= 1) return null;
//     return (
//       <div className="flex items-center justify-between mt-4">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => handlePageChange(currentPage - 1)}
//           disabled={currentPage === 1}
//           className="border-gray-300 dark:border-gray-600"
//         >
//           <ChevronLeft className="w-4 h-4 mr-1" />
//           Previous
//         </Button>
//         <div className="flex items-center gap-1">
//           {currentPage > 3 && (
//             <>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(1)}
//                 className="border-gray-300 dark:border-gray-600"
//               >
//                 1
//               </Button>
//               <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
//             </>
//           )}
//           {currentPage > 2 && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handlePageChange(currentPage - 1)}
//               className="border-gray-300 dark:border-gray-600"
//             >
//               {currentPage - 1}
//             </Button>
//           )}
//           <Button
//             variant="default"
//             size="sm"
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             {currentPage}
//           </Button>
//           {currentPage < totalPages - 1 && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handlePageChange(currentPage + 1)}
//               className="border-gray-300 dark:border-gray-600"
//             >
//               {currentPage + 1}
//             </Button>
//           )}
//           {currentPage < totalPages - 2 && (
//             <>
//               <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handlePageChange(totalPages)}
//                 className="border-gray-300 dark:border-gray-600"
//               >
//                 {totalPages}
//               </Button>
//             </>
//           )}
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => handlePageChange(currentPage + 1)}
//           disabled={currentPage === totalPages}
//           className="border-gray-300 dark:border-gray-600"
//         >
//           Next
//           <ChevronRight className="w-4 h-4 ml-1" />
//         </Button>
//       </div>
//     );
//   };

//   const safeDateFormat = (dateStr: string, format: 'full' | 'date' = 'full') => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return 'N/A';
//     return format === 'date' ? date.toLocaleDateString('en-IN') : date.toLocaleString('en-IN');
//   };

//   const getTimeAgo = (dateStr: string) => {
//     if (!dateStr) return 'N/A';
//     const date = new Date(dateStr);
//     if (isNaN(date.getTime())) return 'N/A';
//     const now = new Date();
//     const diffMs = now.getTime() - date.getTime();
//     const diffMins = Math.floor(diffMs / 60000);
//     const diffHours = Math.floor(diffMs / 3600000);
//     const diffDays = Math.floor(diffMs / 86400000);
//     if (diffMins < 60) return `${diffMins} mins ago`;
//     if (diffHours < 24) return `${diffHours} hours ago`;
//     return `${diffDays} days ago`;
//   };

//   // User details modal content
//   const renderUserDetails = () => {
//     if (!selectedUser) return null;
//     const { divisionName, brigadeName, corpsName } = {
//       divisionName: selectedUser.divisionName || 'N/A',
//       brigadeName: selectedUser.brigadeName || 'N/A',
//       corpsName: selectedUser.corpsName || 'N/A',
//     };
//     const userDrones = droneSpecs.filter(d => String(d.user_id) === String(selectedUser.id));
//     const userFlights = flights.filter(f => String(f.user_id) === String(selectedUser.id));
//     const plannedFlights = userFlights.filter(f => f.status === 'planned');
//     const activeFlights = userFlights.filter(f => f.status === 'active');
//     const completedFlights = userFlights.filter(f => f.status === 'completed');
//     const unit = (selectedUser as any).unit;

//     return (
//       <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
//         <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <UserIcon className="w-6 h-6" />
//               User Details: {selectedUser.username}
//             </DialogTitle>
//             <DialogClose asChild>
//               <Button variant="ghost" size="sm" className="absolute right-4 top-4">
//                 <X className="w-4 h-4" />
//               </Button>
//             </DialogClose>
//           </DialogHeader>
//           <div className="space-y-6 py-4">
//             {/* User Basic Info */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Information</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">Username</p>
//                   <p className="font-semibold">{selectedUser.username}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Role</p>
//                   <p className="font-semibold">{selectedUser.role}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Command</p>
//                   <p className="font-semibold">{selectedUser.commandName || selectedUser.command || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Division</p>
//                   <p className="font-semibold">{divisionName}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Brigade</p>
//                   <p className="font-semibold">{brigadeName}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Corps</p>
//                   <p className="font-semibold">{corpsName}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Unit</p>
//                   <p className="font-semibold">{unit || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Created At</p>
//                   <p className="font-semibold">{safeDateFormat(selectedUser.createdAt)}</p>
//                 </div>
//               </CardContent>
//             </Card>

//             {/* Drone Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Drone Information</CardTitle>
//               </CardHeader>
//               <CardContent className="text-sm">
//                 {userDrones.length > 0 ? (
//                   <div className="space-y-4">
//                     {userDrones.map((drone, idx) => (
//                       <div key={drone.id || idx} className="p-4 border rounded bg-gray-50 dark:bg-gray-700">
//                         <h5 className="font-semibold mb-2">Drone Name: {drone.droneName}</h5>
//                         <div className="grid grid-cols-2 gap-4">
//                           <div>
//                             <p className="text-gray-500">Quantity</p>
//                             <p className="font-semibold">{drone.quantity}</p>
//                           </div>
//                           <div>
//                             <div className='flex flex-col'>
//                               <p className="text-gray-500">IDs</p>
//                               <p className="font-semibold">{drone.droneIds?.join(', ')|| 'N/A'}</p>
                             
//                             </div>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Max Speed (km/h)</p>
//                             <p className="font-semibold">{drone.maxSpeed}</p>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Max Altitude (m)</p>
//                             <p className="font-semibold">{drone.maxHeight}</p>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Max Range (km)</p>
//                             <p className="font-semibold">{drone.maxRange}</p>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Max Duration (min)</p>
//                             <p className="font-semibold">{drone.maxDuration}</p>
//                           </div>
//                                                   <div className="col-span-2">
//                             <p className="text-gray-500">Operating Frequency (GHz)</p>
//                             <p className="font-semibold">{drone.operatingFrequency || 'N/A'}</p>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Clock Drift</p>
//                             <p className="font-semibold">{drone.clockDrift || 'N/A'}</p>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Spectral Leakage</p>
//                             <p className="font-semibold">{drone.spectralLeakage || 'N/A'}</p>
//                           </div>
//                           <div className="col-span-2">
//                             <p className="text-gray-500">Modular Shape ID</p>
//                             <p className="font-semibold">{drone.modularshapeId || 'N/A'}</p>
//                           </div>
//                             <div>
//                             <p className="text-gray-500">GPS Enabled</p>
//                             <Badge variant={drone.gpsEnabled === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.gpsEnabled}</Badge>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Autonomous</p>
//                             <Badge variant={drone.autonomous === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.autonomous}</Badge>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Controlled</p>
//                             <Badge variant={drone.controlled === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.controlled}</Badge>
//                           </div>
//                           <div>
//                             <p className="text-gray-500">Camera Enabled</p>
//                             <Badge variant={drone.cameraEnabled === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.cameraEnabled}</Badge>
//                           </div>
//                           <div className="col-span-2">
//                             <p className="text-gray-500">Camera Resolution</p>
//                             <p className="font-semibold">{drone.cameraResolution || 'N/A'}</p>
//                           </div>

//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">No drones registered for this user.</p>
//                 )}
//               </CardContent>
//             </Card>

//             {/* Flight Information */}
//             <Card>
//               <CardHeader>
//                 <CardTitle>Flight Information</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-4 text-sm">
//                 <div className="grid grid-cols-3 gap-4">
//                   <div>
//                     <p className="text-gray-500">Total Flights</p>
//                     <p className="font-semibold text-blue-800">{userFlights.length}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Planned</p>
//                     <p className="font-semibold text-amber-800">{plannedFlights.length}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Active</p>
//                     <p className="font-semibold text-blue-900">{activeFlights.length}</p>
//                   </div>
//                   <div>
//                     <p className="text-gray-500">Completed</p>
//                     <p className="font-semibold text-green-900">{completedFlights.length}</p>
//                   </div>
//                 </div>

//                 {/* Planned Flights */}
//                 {plannedFlights.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold flex items-center gap-2 mb-2">
//                       <Calendar className="w-4 h-4" />
//                       Planned Flights ({plannedFlights.length})
//                     </h4>
//                     <div className="space-y-2 max-h-32 overflow-y-auto">
//                       {plannedFlights.map((f) => (
//                         <div key={f.id} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded border">
//                           <p className="font-medium">Flight ID: {f.id}</p>
//                           <p className="text-xs text-gray-600 dark:text-gray-400">
//                             Start: {safeDateFormat(f.start)} | End: {safeDateFormat(f.end)}
//                           </p>
//                           <Badge variant="secondary" className="mt-1">Planned</Badge>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Active Flights */}
//                 {activeFlights.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold flex items-center gap-2 mb-2">
//                       <ClockIcon className="w-4 h-4" />
//                       Active Flights ({activeFlights.length})
//                     </h4>
//                     <div className="space-y-2 max-h-32 overflow-y-auto">
//                       {activeFlights.map((f) => (
//                         <div key={f.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
//                           <p className="font-medium">Flight ID: {f.id}</p>
//                           <p className="text-xs text-gray-600 dark:text-gray-400">
//                             Start: {safeDateFormat(f.start)} | End: {safeDateFormat(f.end)}
//                           </p>
//                           <Badge variant="default" className="mt-1">Active</Badge>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Completed Flights */}
//                 {completedFlights.length > 0 && (
//                   <div>
//                     <h4 className="font-semibold flex items-center gap-2 mb-2">
//                       <CheckCircle className="w-4 h-4" />
//                       Completed Flights ({completedFlights.length})
//                     </h4>
//                     <div className="space-y-2 max-h-32 overflow-y-auto">
//                       {completedFlights.map((f) => (
//                         <div key={f.id} className="p-2 bg-green-50 dark:bg-green-900/20 rounded border">
//                           <p className="font-medium">Flight ID: {f.id}</p>
//                           <p className="text-xs text-gray-600 dark:text-gray-400">
//                             Start: {safeDateFormat(f.start)} | End: {safeDateFormat(f.end)}
//                           </p>
//                           <Badge variant="default" className="bg-green-900 mt-1">Completed</Badge>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {userFlights.length === 0 && (
//                   <p className="text-gray-500 italic">No flights recorded for this user.</p>
//                 )}
//               </CardContent>
//             </Card>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   // Flight details modal
//   const renderFlightDetails = () => {
//     if (!mapModalOpen) return null;
//     return (
//       <Dialog open={!!mapModalOpen} onOpenChange={() => setMapModalOpen(null)}>
        
//         {mapModalOpen && selectedFlightDetails && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex items-center justify-center z-50">
//           <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col">
//             <div className="flex justify-between items-center p-4 border-b bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
//               <div className="flex-1">
//                 <div className="flex items-start justify-between">
//                   <div className="flex-1">
//                     <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">Flight Route Visualization</h2>
//                     <div className="grid grid-cols-2 gap-4 text-sm">
//                       <div>
//                         <p className="font-medium text-gray-700 dark:text-gray-300">Mission Details:</p>
//                         <p className="text-gray-600 dark:text-gray-400">{selectedFlightDetails?.drone_model || 'N/A'} - {selectedFlightDetails?.purpose || 'N/A'}</p>
//                         <p className="text-gray-600 dark:text-gray-400">Status:
//                           <Badge className={`ml-2 text-xs ${getStatusBadgeClass(selectedFlightDetails.status)}`}>
//                             {selectedFlightDetails.status.toUpperCase()}
//                           </Badge>
//                         </p>
//                       </div>
//                       {selectedFlightUser && (
//                         <div>
//                           <p className="font-medium text-gray-700 dark:text-gray-300">Operator Details:</p>
//                           <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
//                             <User className="w-4 h-4" />
//                             <span>{selectedFlightUser.username}</span>
//                           </div>
//                           <p className="text-gray-600 dark:text-gray-400">{selectedFlightUser.commandName}</p>
//                           <p className="text-gray-600 dark:text-gray-400">{selectedFlightUser.unit || selectedFlightUser.corpsName}</p>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//               <Button variant="ghost" onClick={() => setMapModalOpen(false)} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
//                 <X className="w-5 h-5" />
//               </Button>
//             </div>
//             <div className="flex-1 p-4">
//               <CesiumMap
//                 waypoints={transformWaypoints(selectedFlightWaypoints)}
//                 center={selectedFlightWaypoints.length > 0 ? {
//                   lat: parseFloat(selectedFlightWaypoints[0].lat) || 28.12000,
//                   lng: parseFloat(selectedFlightWaypoints[0].lng) || 77.900,
//                 } : { lat: 28.12000, lng: 77.900 }}
//                 zoom={10}
//               />
//               {(!selectedFlightWaypoints || selectedFlightWaypoints.length === 0) && (
//                 <div className="flex items-center justify-center h-full">
//                   <div className="text-center text-gray-500 dark:text-gray-400">
//                     <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
//                     <p>No waypoints available for this flight</p>
//                   </div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//       </Dialog>
//     );
//   };

//   // New: Drone details modal
//   const renderDroneDetails = () => {
//     if (!selectedDrone) return null;
//     const user = userMap.get(String(selectedDrone.user_id));
//     const userFlights = flights.filter(f => String(f.user_id) === String(selectedDrone.user_id));
//     return (
//       <Dialog open={!!selectedDrone} onOpenChange={() => setSelectedDrone(null)}>
//         <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2">
//               <Plane className="w-6 h-6" />
//               Drone Details: {selectedDrone.droneName}
//             </DialogTitle>
//             <DialogClose asChild>
//               <Button variant="ghost" size="sm" className="absolute right-4 top-4">
//                 <X className="w-4 h-4" />
//               </Button>
//             </DialogClose>
//           </DialogHeader>
//           <div className="space-y-6 py-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle>User Information</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">Owner</p>
//                   <p className="font-semibold">{user?.username || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Drone Name</p>
//                   <p className="font-semibold">{selectedDrone.droneName}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Quantity</p>
//                   <p className="font-semibold">{selectedDrone.quantity}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Drone IDs</p>
//                   <p className="font-semibold">{selectedDrone.droneIds?.join(', ') || 'N/A'}</p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Mission Status</CardTitle>
//               </CardHeader>
//               <CardContent className="text-sm">
//                 {userFlights.length > 0 ? (
//                   <div className="space-y-3 max-h-48 overflow-y-auto">
//                     {userFlights.map((flight) => (
//                       <div
//                         key={flight.id}
//                         className="p-3 border rounded bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
//                         onClick={() => openMapModal(flight) }
                        
                        
//                       title={`View route for ${flight.drone_model} - ${flight.purpose}` }
                     

//                       >
                    
//                         <div className="flex items-center justify-between mb-2">
//                           <p className="font-medium text-gray-800 dark:text-gray-200">Drone Name: {flight.drone_model}</p>
//                           <Badge variant="default" className="text-xs">{flight.status}</Badge>
//                         </div>
//                         <p className="text-xs text-gray-600 dark:text-gray-400">
//                           Start: {safeDateFormat(flight.start)} | End: {safeDateFormat(flight.end)}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 ) : (
//                   <p className="text-gray-500 italic">No missions planned for this drone.</p>
//                 )}
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Drone Specs</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-2 gap-4 text-sm">
            
//                 <div>
//                   <p className="text-gray-500">Max Speed (KM/H)</p>
//                   <p className="font-semibold">{selectedDrone.maxSpeed}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Max Altitude (M)</p>
//                   <p className="font-semibold">{selectedDrone.maxHeight}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Max Range (KM)</p>
//                   <p className="font-semibold">{selectedDrone.maxRange}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Max Duration (min)</p>
//                   <p className="font-semibold">{selectedDrone.maxDuration}</p>
//                 </div>
             
//                 <div>
//                   <p className="text-gray-500">Clock Drift</p>
//                   <p className="font-semibold">{selectedDrone.clockDrift || 'N/A'}</p>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Spectral Leakage</p>
//                   <p className="font-semibold">{selectedDrone.spectralLeakage || 'N/A'}</p>
//                 </div>
//                 <div className="col-span-">
//                   <p className="text-gray-500">Modular Shape ID</p>
//                   <p className="font-semibold">{selectedDrone.modularshapeId || 'N/A'}</p>
//                 </div>
//                     <div className="col-span-2">
//                   <p className="text-gray-500">Operating Frequency (GHz)</p>
//                   <p className="font-semibold">{selectedDrone.operatingFrequency || 'N/A'}</p>
//                 </div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Features</CardTitle>
//               </CardHeader>
//               <CardContent className="grid grid-cols-2 gap-4 text-sm">
//                 <div>
//                   <p className="text-gray-500">GPS Enabled</p>
//                   <Badge variant={selectedDrone.gpsEnabled === 'yes' ? 'default' : 'secondary'}>{selectedDrone.gpsEnabled}</Badge>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Autonomous</p>
//                   <Badge variant={selectedDrone.autonomous === 'yes' ? 'default' : 'secondary'}>{selectedDrone.autonomous}</Badge>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Controlled</p>
//                   <Badge variant={selectedDrone.controlled === 'yes' ? 'default' : 'secondary'}>{selectedDrone.controlled}</Badge>
//                 </div>
//                 <div>
//                   <p className="text-gray-500">Camera Enabled</p>
//                   <Badge variant={selectedDrone.cameraEnabled === 'yes' ? 'default' : 'secondary'}>{selectedDrone.cameraEnabled}</Badge>
//                 </div>
//                 <div className="col-span-2">
//                   <p className="text-gray-500">Camera Resolution</p>
//                   <p className="font-semibold">{selectedDrone.cameraResolution || 'N/A'}</p>
//                 </div>
               
//               </CardContent>
//             </Card>
//           </div>
//         </DialogContent>
//       </Dialog>
//     );
//   };

//   const isCommandDisabled = !!user?.command;

//   const renderUsersList = () => {
//     const startItem = (currentPage - 1) * PAGE_SIZE + 1;
//     const endItem = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);
//     return (
//       <div className="space-y-1">
//         <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
//           Showing {startItem} to {endItem} of {filteredUsers.length} users
//         </p>
//         <div className="overflow-y-auto max-h-[40vh]">
//           {paginatedUsers.length > 0 ? (
//             paginatedUsers.map((u) => (
//               <Card
//                 key={u.id}
//                 className="mb-2 p-2 text-xs border border-gray-200 dark:border-gray-600 shadow-sm dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
//                 onClick={() => setSelectedUser(u)}
//               >
//                 <div className="font-semibold text-gray-800 dark:text-gray-200">{u.username}</div>
//                 <div className="text-gray-600 dark:text-gray-400">{u.commandName || u.command || 'N/A'}</div>
//                 <div className="text-gray-500 dark:text-gray-400">Created: {safeDateFormat(u.createdAt, 'date')}</div>
//               </Card>
//             ))
//           ) : (
//             <p className="text-gray-500 dark:text-gray-400 text-center">No data available</p>
//           )}
//         </div>
//         {renderPagination()}
//       </div>
//     );
//   };

//   // New: Render drone list with pagination (similar to users)
//   const paginatedDrones = useMemo(() => {
//     const startIndex = (currentDronePage - 1) * PAGE_SIZE;
//     return filteredDroneSpecs.slice(startIndex, startIndex + PAGE_SIZE);
//   }, [filteredDroneSpecs, currentDronePage]);

//   const totalDronePages = Math.ceil(filteredDroneSpecs.length / PAGE_SIZE);

//   const handleDronePageChange = (page: number) => {
//     if (page >= 1 && page <= totalDronePages) {
//       setCurrentDronePage(page);
//       setSelectedDrone(null);
//     }
//   };

//   const renderDronePagination = () => {
//     if (totalDronePages <= 1) return null;
//     return (
//       <div className="flex items-center justify-between mt-4">
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => handleDronePageChange(currentDronePage - 1)}
//           disabled={currentDronePage === 1}
//           className="border-gray-300 dark:border-gray-600"
//         >
//           <ChevronLeft className="w-4 h-4 mr-1" />
//           Previous
//         </Button>
//         <div className="flex items-center gap-1">
//           {currentDronePage > 3 && (
//             <>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleDronePageChange(1)}
//                 className="border-gray-300 dark:border-gray-600"
//               >
//                 1
//               </Button>
//               <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
//             </>
//           )}
//           {currentDronePage > 2 && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handleDronePageChange(currentDronePage - 1)}
//               className="border-gray-300 dark:border-gray-600"
//             >
//               {currentDronePage - 1}
//             </Button>
//           )}
//           <Button
//             variant="default"
//             size="sm"
//             className="bg-blue-600 hover:bg-blue-700"
//           >
//             {currentDronePage}
//           </Button>
//           {currentDronePage < totalDronePages - 1 && (
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => handleDronePageChange(currentDronePage + 1)}
//               className="border-gray-300 dark:border-gray-600"
//             >
//               {currentDronePage + 1}
//             </Button>
//           )}
//           {currentDronePage < totalDronePages - 2 && (
//             <>
//               <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => handleDronePageChange(totalDronePages)}
//                 className="border-gray-300 dark:border-gray-600"
//               >
//                 {totalDronePages}
//               </Button>
//             </>
//           )}
//         </div>
//         <Button
//           variant="outline"
//           size="sm"
//           onClick={() => handleDronePageChange(currentDronePage + 1)}
//           disabled={currentDronePage === totalDronePages}
//           className="border-gray-300 dark:border-gray-600"
//         >
//           Next
//           <ChevronRight className="w-4 h-4 ml-1" />
//         </Button>
//       </div>
//     );
//   };

//   const renderDronesList = () => {
//     const startItem = (currentDronePage - 1) * PAGE_SIZE + 1;
//     const endItem = Math.min(currentDronePage * PAGE_SIZE, filteredDroneSpecs.length);
//     return (
//       <div className="space-y-1">
//         <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
//           Showing {startItem} to {endItem} of {filteredDroneSpecs.length} drones
//         </p>
//         <div className="overflow-y-auto max-h-[30vh]">
//           {paginatedDrones.length > 0 ? (
//             <table className="w-full text-xs border-collapse border border-gray-300 dark:border-gray-600">
//               <thead>
//                 <tr className="bg-gray-50 dark:bg-gray-700">
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">User Name</th>
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Drone Name</th>
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Status</th>
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Flight Time</th>
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Frequency</th>
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Clock Drift</th>
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Spectral Leakage</th>
//                   <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Modular Shape ID</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {paginatedDrones.map((d, idx) => {
//                   const owner = userMap.get(String(d.user_id));
//                   const userFlights = flights.filter(f => String(f.user_id) === String(d.user_id));
//                   const latestFlight = userFlights.length > 0 ? userFlights.reduce((prev, current) => (new Date(current.end) > new Date(prev.end) ? current : prev)) : null;
//                   const status = latestFlight ? latestFlight.status : 'No Mission';
//                   const statusVariant = status === 'planned' ? 'secondary' : status === 'active' ? 'default' : status === 'completed' ? 'default' : 'outline';
//                   const flightTime = latestFlight ? safeDateFormat(latestFlight.start, 'date') : 'N/A';
//                   const frequency = d.operatingFrequency || 'N/A';
//                   const clockDrift = d.clockDrift || 'N/A';
//                   const spectralLeakage = d.spectralLeakage || 'N/A';
//                   const modularShapeId = d.modularshapeId || 'N/A';
//                   return (
//                     <tr key={d.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedDrone(d)}>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">{owner?.username || 'N/A'}</td>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">{d.droneName}</td>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">
//                         <Badge variant={statusVariant as any}>{status}</Badge>
//                       </td>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">{flightTime}</td>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">{frequency}</td>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">{clockDrift}</td>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">{spectralLeakage}</td>
//                       <td className="border border-gray-300 dark:border-gray-600 p-2">{modularShapeId}</td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           ) : (
//             <p className="text-gray-500 dark:text-gray-400 text-center">No drones match the filters</p>
//           )}
//         </div>
//         {renderDronePagination()}
//       </div>
//     );
//   };

//   const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string, onClick?: () => void) => (
//     <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={onClick}>
//       <CardContent className="p-6">
//         <div className="flex items-center justify-between">
//           <div>
//             <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
//             <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
//           </div>
//           <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
//             {icon}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   );

//   return (
//     <MonitoringErrorBoundary>
//       <div className="min-h-screen flex flex-col relative bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${armyBg})` }}>
//         <div className="absolute inset-0 bg-black/20"></div>
//         <div className="relative z-10 flex flex-col flex-1">
//           <div className="sticky top-0 z-50">
//             <div className="bg-blue-600 h-1"></div>
//             <header className="shadow-sm bg-white/75 backdrop-blur-sm">
//               <div className="container mx-auto px-4 py-4 flex justify-between items-center">
//                 <div className="flex items-center gap-4">
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-blue-900 dark:to-gray-900 rounded-full flex items-center justify-center shadow-md">
//                     <img src={profileImg} alt="Profile" />
//                   </div>
//                   <div>
//                     <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200"></h1>
//                     <h2 className="text-lg font-bold text-gray-800 dark:text-white-200">Indian Army</h2>
//                     <p className="text-sm text-gray-600 dark:text-gray-400"></p>
//                     <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Central Command & Control System</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-6">
//                   <div className="bg-green-50 dark:bg-green-900 px-3 py-2 rounded-lg border border-green-200 dark:border-green-600">
//                     <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
//                       <Users className="h-4 w-4" />
//                       <span className="font-medium">Active Operations: {statusCounts.active}</span>
//                     </div>
//                   </div>
//                   <div className="flex flex-col items-end gap-1">
//                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-300">
//                       <Users className="h-4 w-4" />
//                       <span>Administrator: {user?.username ?? 'Unknown'}</span>
//                     </div>
//                     <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
//                       <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
//                       <span className="text-green-600 dark:text-green-400">Secure Connection</span>
//                     </div>
//                   </div>
//                   <Button
//                     variant="outline"
//                     onClick={toggleDarkMode}
//                     className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
//                   >
//                     {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
//                     {isDarkMode ? 'Light Mode' : 'Dark Mode'}
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={logout}
//                     className="border-red-300 text-red-600 dark:border-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
//                   >
//                     <LogOut className="w-4 h-4 mr-2" />
//                     LOGOUT
//                   </Button>
//                   <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-gray-50 rounded-full flex items-center justify-center shadow-md">
//                     <img src={logo} alt="Profile" />
//                   </div>
//                 </div>
//               </div>
//             </header>
//             <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
//               <div className="container mx-auto px-4 flex justify-between items-center">
//                 <div className="flex space-x-1">
//                   <a href="/monitoring" className="py-3 px-4 text-sm hover:bg-slate-700 bg-slate-700 rounded-t-sm border-b-2 border-blue-400">
//                     Command Dashboard
//                   </a>
//                   <a href="/admin" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//                     Flight Monitoring
//                   </a>
//                   <a href="/registrations" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//                     Drone Registrations
//                   </a>
//                   <a href="/flight_status" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//                     Flight Status
//                   </a>
//                   <a href="#" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
//                     Settings
//                   </a>
//                 </div>
//                 <div className="text-xs text-gray-300 bg-slate-700 px-3 py-1 rounded">
//                   System Status: Online | Last Sync: {new Date().toLocaleTimeString('en-IN')}
//                 </div>
//               </div>
//             </nav>
//           </div>

//           <div className="flex-1">
//             <div className="container mx-auto p-4">
//               <div className="flex justify-between items-center mb-6">
//                 <div>
//                   <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
//                     <Plane className="w-8 h-8 text-blue-600 dark:text-blue-400" />
//                     Admin Dashboard - Flight Monitoring
//                   </h1>
//                 </div>
//                 <div className="flex items-center gap-2">
//                   <Input
//                     placeholder="Search users, drones, flights..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-64"
//                   />
//                   <Button
//                     variant="outline"
//                     onClick={loadData}
//                     className="border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
//                     disabled={loading}
//                   >
//                     <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
//                     Refresh Data
//                   </Button>
//                 </div>
//               </div>

//               {/* Stats Row - using base drone count */}
//               {!loading && (
//                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
//                   {renderStatCard('Total Users', filteredUsers.length, <Users className="w-6 h-6" />, 'blue', () => setSelectedStatus('all'))}
//                   {renderStatCard('Total Drones', filteredDroneSpecsBase.length, <Plane className="w-6 h-6" />, 'green', () => setSelectedStatus('all'))}
//                   {renderStatCard('Total Flights', filteredFlights.length, <TrendingUp className="w-6 h-6" />, 'red', () => setSelectedStatus('all'))}
//                   {renderStatCard('Planned', statusCounts.planned, <Calendar className="w-6 h-6" />, 'amber', () => setSelectedStatus('planned'))}
//                   {renderStatCard('Active', statusCounts.active, <Activity className="w-6 h-6" />, 'blue', () => setSelectedStatus('active'))}
//                   {renderStatCard('Completed', statusCounts.completed, <CheckCircle className="w-6 h-6" />, 'green', () => setSelectedStatus('completed'))}
//                 </div>
//               )}

//               <div className='flex flex-row gap-5'>
//                 <div className="flex flex-col gap-4 w-80">
//                   <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800">
//                     <CardHeader className="bg-gray-50 dark:bg-gray-700 space-y-2">
//                       <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
//                         <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                         <span>Hierarchy Filter</span>
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="p-4 space-y-4">
//                       <Select value={selectedCommandKey} onValueChange={handleCommandChange} disabled={isCommandDisabled}>
//                         <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
//                           <SelectValue placeholder="Select Command" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
//                           <SelectItem value="all">All Commands</SelectItem>
//                           {Object.entries(commandNames).map(([key, name]) => (
//                             <SelectItem key={key} value={key} className="text-gray-800 dark:text-gray-200">
//                               {name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <Select
//                         value={selectedDivision}
//                         onValueChange={handleDivisionChange}
//                         disabled={selectedCommandKey === 'all' || !selectedCommandKey}
//                       >
//                         <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
//                           <SelectValue placeholder="Select Corps" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
//                           {getAvailableDivisions.map((div) => (
//                             <SelectItem key={div.value} value={div.value} className="text-gray-800 dark:text-gray-200">
//                               {div.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <Select value={selectedBrigade} onValueChange={handleBrigadeChange} disabled={!selectedDivision}>
//                         <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
//                           <SelectValue placeholder="Select Div" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
//                           {getAvailableBrigades.map((bde) => (
//                             <SelectItem key={bde.value} value={bde.value} className="text-gray-800 dark:text-gray-200">
//                               {bde.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <Select value={selectedCorps} onValueChange={handleCorpsChange} disabled={!selectedBrigade}>
//                         <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
//                           <SelectValue placeholder="Select BDE" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
//                           {getAvailableCorps.map((cor) => (
//                             <SelectItem key={cor.value} value={cor.value} className="text-gray-800 dark:text-gray-200">
//                               {cor.label}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </CardContent>
//                   </Card>
//                   {/* New: Drone Spec Filters Card - single inputs */}
//                   <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800">
//                     <CardHeader className="bg-gray-50 dark:bg-gray-700 space-y-2">
//                       <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
//                         <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                         <span>Drone Spec Filters</span>
//                       </CardTitle>
//                     </CardHeader>
//                     <CardContent className="p-4 space-y-3 text-xs">
//                          <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Drone Name</label>
//                         <Input
//                           placeholder="mavic 3 pro"
//                           value={droneName}
//                           onChange={(e) => setDroneNameFilter(e.target.value)}
//                           className="h-8"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Speed (km/h)</label>
//                         <Input
//                           type="number"
//                           placeholder="e.g. 50"
//                           value={speedFilter ?? ''}
//                           onChange={(e) => setSpeedFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
//                           className="h-8"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Altitude (m)</label>
//                         <Input
//                           type="number"
//                           placeholder="e.g. 100"
//                           value={altitudeFilter ?? ''}
//                           onChange={(e) => setAltitudeFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
//                           className="h-8"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Range (km)</label>
//                         <Input
//                           type="number"
//                           placeholder="e.g. 10"
//                           value={rangeFilter ?? ''}
//                           onChange={(e) => setRangeFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
//                           className="h-8"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Duration (min)</label>
//                         <Input
//                           type="number"
//                           placeholder="e.g. 30"
//                           value={durationFilter ?? ''}
//                           onChange={(e) => setDurationFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
//                           className="h-8"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">GPS</label>
//                         <Select value={gpsFilter} onValueChange={(v) => setGpsFilter(v as 'all' | 'yes' | 'no')}>
//                           <SelectTrigger className="h-8">
//                             <SelectValue placeholder="All" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="all">All</SelectItem>
//                             <SelectItem value="yes">Yes</SelectItem>
//                             <SelectItem value="no">No</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Autonomous</label>
//                         <Select value={autonomousFilter} onValueChange={(v) => setAutonomousFilter(v as 'all' | 'yes' | 'no')}>
//                           <SelectTrigger className="h-8">
//                             <SelectValue placeholder="All" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="all">All</SelectItem>
//                             <SelectItem value="yes">Yes</SelectItem>
//                             <SelectItem value="no">No</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Controlled</label>
//                         <Select value={controlledFilter} onValueChange={(v) => setControlledFilter(v as 'all' | 'yes' | 'no')}>
//                           <SelectTrigger className="h-8">
//                             <SelectValue placeholder="All" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="all">All</SelectItem>
//                             <SelectItem value="yes">Yes</SelectItem>
//                             <SelectItem value="no">No</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Camera</label>
//                         <Select value={cameraFilter} onValueChange={(v) => setCameraFilter(v as 'all' | 'yes' | 'no')}>
//                           <SelectTrigger className="h-8">
//                             <SelectValue placeholder="All" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="all">All</SelectItem>
//                             <SelectItem value="yes">Yes</SelectItem>
//                             <SelectItem value="no">No</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Camera Resolution</label>
//                         <Input
//                           placeholder="e.g. 4K"
//                           value={cameraResolution}
//                           onChange={(e) => setCameraResolution(e.target.value)}
//                           className="h-8"
//                         />
//                       </div>
//                       <div>
//                         <label className="text-gray-600 dark:text-gray-300 block mb-1">Operating Freq (GHz)</label>
//                         <Input
//                           placeholder="e.g. 2.4-5.8"
//                           value={operatingFrequency}
//                           onChange={(e) => setOperatingFrequency(e.target.value)}
//                           className="h-8"
//                         />
//                       </div>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={resetDroneFilters}
//                         className="w-full"
//                       >
//                         Reset Filters
//                       </Button>
//                     </CardContent>
//                   </Card>
//                 </div>
//                 <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
//                   <div className="col-span-1">
//                     <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800">
//                       <CardHeader>
//                         <CardTitle className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
//                           <BarChart className="w-5 h-5" />
//                           Overview Analytics
//                         </CardTitle>
//                       </CardHeader>
//                       <CardContent>
//                         <PieChart
//                           statisticsChartData={combinedPieData}
//                           statisticsChartTitle="System Overview"
//                           onSliceClick={handlePieClick}
//                         />
//                       </CardContent>
//                     </Card>
//                   </div>
//                   <div className="col-span-1">
//                     <Card className="border-gray-300 dark:border-gray-600  shadow-sm dark:bg-gray-800 ">
//                       <CardHeader className="bg-gray-50 dark:bg-gray-700">
//                         <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
//                           <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
//                           <span>Users List</span>
//                         </CardTitle>
//                         <CardDescription className="text-xs text-blue-600 dark:text-blue-400 ">
//                           Paginated view of filtered users (Page {currentPage} of {totalPages})
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent className="p-4">
//                         {renderUsersList()}
//                       </CardContent>
//                     </Card>
//                   </div>
//                   <div className="col-span-1 lg:col-span-2">
//                     <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800 h-full">
//                       <CardHeader className="bg-gray-50 dark:bg-gray-700 ">
//                         <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
//                           <Plane className="w-4 h-4 text-green-600 dark:text-green-400" />
//                           <span>Drone Fleet Status</span>
//                         </CardTitle>
//                         <CardDescription className="text-xs text-green-600 dark:text-green-400">
//                           Paginated view of filtered drones (Page {currentDronePage} of {totalDronePages})
//                         </CardDescription>
//                       </CardHeader>
//                       <CardContent className="p-4">
//                         {renderDronesList()}
//                       </CardContent>
//                     </Card>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//           <footer className="mt-auto bg-slate-900 dark:bg-slate-950 text-white py-6 px-4">
//             <div className="container mx-auto">
//               <div className="flex justify-between items-center">
//                 <div className="flex items-center gap-2">
//                   <Plane className="h-6 w-6 text-blue-400" />
//                   <div>
//                     <div className="text-sm font-semibold">Drone Management System</div>
//                     <div className="text-xs text-gray-400">Ministry of Civil Aviation, Government of India</div>
//                   </div>
//                 </div>
//                 <div className="text-right">
//                   <div className="flex items-center gap-2 text-xs text-gray-400">
//                     <Shield className="h-4 w-4" />
//                     <span>Version 2.1.0 | Build: DMS-2025</span>
//                   </div>
//                   <div className="text-xs text-gray-500 mt-1">© 2025 All Rights Reserved | Designed & Maintained by NIC</div>
//                 </div>
//               </div>
//             </div>
//           </footer>
//         </div>
//         {renderUserDetails()}
//         {renderDroneDetails()}
//         {renderFlightDetails()}
//       </div>
//     </MonitoringErrorBoundary>
//   );
// };

// export default Monitoring;







import React, { useState, useEffect, Component, ErrorInfo, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import { Shield, LogOut, Users, Plane, MapPin, RefreshCw, Clock, Moon, Sun, BarChart, ChevronLeft, ChevronRight, User as UserIcon, Settings, Calendar, CheckCircle, Clock as ClockIcon, X, Filter, Search, TrendingUp, Activity, AlertCircle, Target, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { apiService } from '@/services/api';
import { Chart as ChartJS, BarElement, PointElement, LinearScale, CategoryScale } from 'chart.js';
import { Input } from '@/components/ui/input';
import profileImg from '@/assets/logo.png';
import armyBg from '../assets/hero 3.png';
import PieChart from '../components/piechart';
import logo from '../assets/Logo1.png';
import CesiumMap, { Waypoint as CesiumWaypoint } from '../components/CesiumMap2';
import {
 HierarchyData,
  DroneSpec,
  Flight,
  hierarchyData,
  corpsNames,
  commandNames,
  COMMAND_CENTERS,
} from '../components/hierarchy';


ChartJS.register(BarElement, PointElement, LinearScale, CategoryScale);

class MonitoringErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error in Monitoring component:', error, errorInfo);
    toast.error('An error occurred in the Monitoring dashboard. Please try refreshing.');
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-12">
          <p className="text-red-600 dark:text-red-400 text-lg font-semibold">Something went wrong.</p>
          <p className="text-gray-600 dark:text-gray-300">Please try refreshing the page or contact support.</p>
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="mt-4 border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Page
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Monitoring: React.FC = () => {
  const { user, logout } = useAuth() as { user: User | null; logout: () => void };
  const [selectedCommandKey, setSelectedCommandKey] = useState<string>('all');
  const [selectedDivision, setSelectedDivision] = useState<string>('');
  const [selectedBrigade, setSelectedBrigade] = useState<string>('');
  const [selectedCorps, setSelectedCorps] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'planned' | 'active' | 'completed'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [users, setUsers] = useState<User[]>([]);
  const [droneSpecs, setDroneSpecs] = useState<DroneSpec[]>([]);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentDronePage, setCurrentDronePage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDrone, setSelectedDrone] = useState<DroneSpec | null>(null);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const PAGE_SIZE = 50;

  // New states for drone spec filters (single value per spec)
  const [droneName, setDroneNameFilter] = useState<string>('');
  const [speedFilter, setSpeedFilter] = useState<number | undefined>(undefined);
  const [altitudeFilter, setAltitudeFilter] = useState<number | undefined>(undefined);
  const [rangeFilter, setRangeFilter] = useState<number | undefined>(undefined);
  const [durationFilter, setDurationFilter] = useState<number | undefined>(undefined);
  const [gpsFilter, setGpsFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [autonomousFilter, setAutonomousFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [controlledFilter, setControlledFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [cameraFilter, setCameraFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [cameraResolution, setCameraResolution] = useState<string>('');
  const [operatingFrequency, setOperatingFrequency] = useState<string>('');

  // map visualization







  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [waypoints, setWaypoints] = useState<Record<string, Waypoint[]>>({});
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [selectedFlightWaypoints, setSelectedFlightWaypoints] = useState<Waypoint[]>([]);
  const [selectedFlightDetails, setSelectedFlightDetails] = useState<Flight | null>(null);
  const [selectedFlightUser, setSelectedFlightUser] = useState<User | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [flightsPerPage] = useState(10);

  const statColors = {
    'Total Users': '#1E40AF',
    'Total Drones': '#047857',
    'Total Flights': '#7F1D1D',
    'Planned Flights': '#92400E',
    'Active Flights': '#1E3A8A',
    'Completed Flights': '#166534',
  };

  const levelNames = {
    command: 'Commands',
    division: 'Corps',
    brigade: 'Divisions',
    corps: 'Brigades',
    unit: 'Units',
  };

  const colors = ['#1E40AF', '#047857', '#7F1D1D', '#92400E', '#1E3A8A', '#166534', '#4B5563', '#065F46', '#1F2937', '#991B1B'];

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

  // Set default command based on user
  useEffect(() => {
    if (user && user.command && selectedCommandKey === 'all') {
      setSelectedCommandKey(user.command);
      setSelectedDivision('');
      setSelectedBrigade('');
      setSelectedCorps('');
      setSelectedUnit('');
      setCurrentPage(1);
      setCurrentDronePage(1);
    }
  }, [user]);

  // Hide body scroll when map modal is open
  useEffect(() => {
    if (mapModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mapModalOpen]);

  const handleCommandChange = (value: string) => {
    // Prevent command change if user has a specific command
    if (user && user.command) return;
    setSelectedCommandKey(value);
    setSelectedDivision('');
    setSelectedBrigade('');
    setSelectedCorps('');
    setSelectedUnit('');
    setCurrentPage(1);
    setCurrentDronePage(1);
  };

  const handleDivisionChange = (value: string) => {
    setSelectedDivision(value);
    setSelectedBrigade('');
    setSelectedCorps('');
    setSelectedUnit('');
    setCurrentPage(1);
    setCurrentDronePage(1);
  };

  const handleBrigadeChange = (value: string) => {
    setSelectedBrigade(value);
    setSelectedCorps('');
    setSelectedUnit('');
    setCurrentPage(1);
    setCurrentDronePage(1);
  };

  const handleCorpsChange = (value: string) => {
    setSelectedCorps(value);
    setSelectedUnit('');
    setCurrentPage(1);
    setCurrentDronePage(1);
  };

  const handleStatusChange = (value: string) => {
    setSelectedStatus(value === 'all' ? 'all' : value as 'planned' | 'active' | 'completed');
  };

  // Reset drone filters
  const resetDroneFilters = () => {
    
    setSpeedFilter(undefined);
    setAltitudeFilter(undefined);
    setRangeFilter(undefined);
    setDurationFilter(undefined);
    setGpsFilter('all');
    setAutonomousFilter('all');
    setControlledFilter('all');
    setCameraFilter('all');
    setCameraResolution('');
    setOperatingFrequency('');
    setDroneNameFilter('');
  };



const openMapModal = async (flight: Flight) => {
  try {
    const flightWaypoints = waypoints[flight.id] || (await apiService.getFlightWaypoints(flight.id).catch(() => [])) || [];
    const flightUser = users.find(u => u.id === flight.user_id) || null;
   
    setSelectedFlightWaypoints(flightWaypoints);
    setSelectedFlightDetails(flight);
    setSelectedFlightUser(flightUser);
    setWaypoints(prev => ({ ...prev, [flight.id]: flightWaypoints }));
    setMapModalOpen(true);
  } catch (error) {
    console.error('Failed to load waypoints:', error);
    toast.error('Failed to load flight details');

  }
};



const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'active': return 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-600';
    case 'planned': return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-600';
    case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-600';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600';
  }
};

const transformWaypoints = (waypoints: Waypoint[]): CesiumWaypoint[] => {
  return waypoints.map((wp, index) => ({
    lat: parseFloat(wp.lat) || 0,
    lng: parseFloat(wp.lng) || 0,
    elev: wp.elev || 0,
    sequence: index + 1,
  }));
};





  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, droneSpecsData, flightsData] = await Promise.all([
        apiService.getAllUsers().catch(() => []),
        apiService.getAllDroneSpecs().catch(() => []),
        apiService.getAllFlights().catch(() => []),
      ]);
      const now = new Date();
      const updatedFlights = (flightsData || []).map((f: Flight) => {
        const start = new Date(f.start);
        const end = new Date(f.end);
        let status = f.status;
        if (status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
          status = 'active';
        } else if (status === 'active' && !isNaN(end.getTime()) && end <= now) {
          status = 'completed';
        }
        return { ...f, status };
      });

      // Enrich users with full names
      const enrichedUsers = (usersData || []).map((u: User) => ({
         ...u,
        commandName: u.command ? (commandNames[u.command as keyof typeof commandNames] || u.command) : '',
        divisionName: u.division && u.command && hierarchyData[u.command as keyof typeof hierarchyData]?.divisions?.[u.division as string]?.name ? hierarchyData[u.command as keyof typeof hierarchyData].divisions[u.division as string].name : (u.divisionName || u.division || ''),
        brigadeName: u.brigade && u.command && u.division && hierarchyData[u.command as keyof typeof hierarchyData]?.divisions?.[u.division as string]?.brigades?.[u.brigade as string]?.name ? hierarchyData[u.command as keyof typeof hierarchyData].divisions[u.division as string].brigades[u.brigade as string].name : (u.brigadeName || u.brigade || ''),
        corpsName: u.corps ? (corpsNames[u.corps as keyof typeof corpsNames] || u.corpsName || u.corps) : '',
      }));

      setUsers(enrichedUsers);
      setDroneSpecs(droneSpecsData || []);
      setFlights(updatedFlights);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const checkMissionStatus = async () => {
      const now = new Date();
      let hasChanges = false;
      const updatedFlights = await Promise.all(
        flights.map(async (flight) => {
          const start = new Date(flight.start);
          const end = new Date(flight.end);
          let newStatus = flight.status;
          if (flight.status === 'planned' && !isNaN(start.getTime()) && start <= now && end > now) {
            newStatus = 'active';
          } else if (flight.status === 'active' && !isNaN(end.getTime()) && end <= now) {
            newStatus = 'completed';
          }
          if (newStatus !== flight.status) {
            try {
              const result = await apiService.updateFlight(flight.id, { ...flight, status: newStatus });
              if (result.success) {
                hasChanges = true;
                return { ...flight, status: newStatus };
              }
            } catch (error) {
              console.error(`Failed to update flight ${flight.id} to ${newStatus}:`, error);
            }
          }
          return flight;
        })
      );
      if (hasChanges) {
        setFlights(updatedFlights);
        toast.info('Flight statuses updated');
      }
    };
    const interval = setInterval(checkMissionStatus, 30000);
    checkMissionStatus();
    return () => clearInterval(interval);
  }, [flights]);

  const userMap = useMemo(() => new Map(users.map((u) => [String(u.id), u])), [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== 'OPERATOR') return false;
      if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
      if (selectedDivision && u.division !== selectedDivision) return false;
      if (selectedBrigade && u.brigade !== selectedBrigade) return false;
      if (selectedCorps && u.corps !== selectedCorps) return false;
      if (selectedUnit && (u as any).unit !== selectedUnit) return false;
      if (selectedStatus !== 'all' && !flights.some((f: Flight) => String(f.user_id) === String(u.id) && f.status === selectedStatus)) return false;
      if (searchTerm && !u.username.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [users, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit, selectedStatus, flights, searchTerm]);

  // Base filtered drone specs (without spec filters, for counts and pie)
  const filteredDroneSpecsBase = useMemo(() => {
    return droneSpecs.filter((d) => {
      const user = userMap.get(String(d.user_id));
      if (!user || user.role !== 'OPERATOR') return false;
      if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
      if (selectedDivision && user.division !== selectedDivision) return false;
      if (selectedBrigade && user.brigade !== selectedBrigade) return false;
      if (selectedCorps && user.corps !== selectedCorps) return false;
      if (selectedUnit && (user as any).unit !== selectedUnit) return false;
      if (selectedStatus !== 'all' && !flights.some((f: Flight) => String(f.user_id) === String(d.user_id) && f.status === selectedStatus)) return false;
      if (searchTerm && !d.droneName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [droneSpecs, userMap, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit, selectedStatus, flights, searchTerm]);

  // Filtered drone specs for list (apply spec filters on base, with sorting for closeness)
  const filteredDroneSpecs = useMemo(() => {
    let list = filteredDroneSpecsBase.filter((d) => {
      // Numeric filters: within +/-5 of target
       if (droneName && !d.droneName?.toLowerCase().includes(droneName.toLowerCase())) return false;
      if (speedFilter !== undefined && Math.abs((d.maxSpeed) - speedFilter) > 5) return false;
      if (altitudeFilter !== undefined && Math.abs(d.maxHeight - altitudeFilter) > 500) return false;
      if (rangeFilter !== undefined && Math.abs(d.maxRange - rangeFilter) > 5) return false;
      if (durationFilter !== undefined && Math.abs(d.maxDuration - durationFilter) > 5) return false;
      // Boolean filters
      if (gpsFilter !== 'all' && d.gpsEnabled !== gpsFilter) return false;
      if (autonomousFilter !== 'all' && d.autonomous !== autonomousFilter) return false;
      if (controlledFilter !== 'all' && d.controlled !== controlledFilter) return false;
      if (cameraFilter !== 'all' && d.cameraEnabled !== cameraFilter) return false;
      // Text filters
      if (cameraResolution && !d.cameraResolution?.toLowerCase().includes(cameraResolution.toLowerCase())) return false;
      if (operatingFrequency && !d.operatingFrequency?.toLowerCase().includes(operatingFrequency.toLowerCase())) return false;
      return true;
    });

    // Sort by closeness (sum of abs diffs for numeric filters, smaller first -> exact/closest first)
    if (speedFilter !== undefined || altitudeFilter !== undefined || rangeFilter !== undefined || durationFilter !== undefined) {
      list.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;
        if (speedFilter !== undefined) {
          scoreA += Math.abs((a.maxSpeed) - speedFilter);
          scoreB += Math.abs((b.maxSpeed) - speedFilter);
        }
        if (altitudeFilter !== undefined) {
          scoreA += Math.abs(a.maxHeight - altitudeFilter);
          scoreB += Math.abs(b.maxHeight - altitudeFilter);
        }
        if (rangeFilter !== undefined) {
          scoreA += Math.abs(a.maxRange - rangeFilter);
          scoreB += Math.abs(b.maxRange - rangeFilter);
        }
        if (durationFilter !== undefined) {
          scoreA += Math.abs(a.maxDuration - durationFilter);
          scoreB += Math.abs(b.maxDuration - durationFilter);
        }
        return scoreA - scoreB;
      });
    }

    return list;
  }, [filteredDroneSpecsBase,droneName, speedFilter, altitudeFilter, rangeFilter, durationFilter, gpsFilter, autonomousFilter, controlledFilter, cameraFilter, cameraResolution, operatingFrequency]);

  const filteredFlights = useMemo(() => {
    return flights.filter((f) => {
      const user = userMap.get(String(f.user_id));
      if (!user || user.role !== 'OPERATOR') return false;
      if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return false;
      if (selectedDivision && user.division !== selectedDivision) return false;
      if (selectedBrigade && user.brigade !== selectedBrigade) return false;
      if (selectedCorps && user.corps !== selectedCorps) return false;
      if (selectedUnit && (user as any).unit !== selectedUnit) return false;
      if (selectedStatus !== 'all' && f.status !== selectedStatus) return false;
      return true;
    });
  }, [flights, userMap, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit, selectedStatus]);

  const statusCounts = useMemo(() => {
    const counts = { planned: 0, active: 0, completed: 0 };
    filteredFlights.forEach((f) => {
      counts[f.status] = (counts[f.status] || 0) + 1;
    });
    return counts;
  }, [filteredFlights]);

  // Pie chart data without status filter, using base drone count (no spec filters)
  const pieFilteredUsersCount = useMemo(() => {
    return users.filter((u) => {
      if (u.role !== 'OPERATOR') return false;
      if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
      if (selectedDivision && u.division !== selectedDivision) return false;
      if (selectedBrigade && u.brigade !== selectedBrigade) return false;
      if (selectedCorps && u.corps !== selectedCorps) return false;
      if (selectedUnit && (u as any).unit !== selectedUnit) return false;
      return true;
    }).length;
  }, [users, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit]);

  const pieFilteredDronesCount = useMemo(() => {
    return filteredDroneSpecsBase.length;
  }, [filteredDroneSpecsBase]);

  const pieStatusCounts = useMemo(() => {
    const counts = { planned: 0, active: 0, completed: 0 };
    flights.forEach((f) => {
      const user = userMap.get(String(f.user_id));
      if (!user || user.role !== 'OPERATOR') return;
      if (selectedCommandKey !== 'all' && user.command !== selectedCommandKey) return;
      if (selectedDivision && user.division !== selectedDivision) return;
      if (selectedBrigade && user.brigade !== selectedBrigade) return;
      if (selectedCorps && user.corps !== selectedCorps) return;
      if (selectedUnit && (user as any).unit !== selectedUnit) return;
      if (f.status in counts) {
        counts[f.status as keyof typeof counts]++;
      }
    });
    return counts;
  }, [flights, userMap, selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps, selectedUnit]);

  const combinedPieData = useMemo(() => {
    const labels = ['Total Users', 'Total Drones', 'Planned Flights', 'Active Flights', 'Completed Flights'];
    const data = [pieFilteredUsersCount, pieFilteredDronesCount, pieStatusCounts.planned, pieStatusCounts.active, pieStatusCounts.completed];
    const total = data.reduce((a, b) => a + b, 0);
    if (total === 0) {
      return null;
    }
    const bgColors = [
      statColors['Total Users'],
      statColors['Total Drones'],
      statColors['Planned Flights'],
      statColors['Active Flights'],
      statColors['Completed Flights'],
    ];
    const hoverBgColors = bgColors.map(color => `${color}CC`);
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bgColors,
          hoverBackgroundColor: hoverBgColors,
          borderColor: isDarkMode ? '#ffffff' : '#000000',
          borderWidth: 2,
        },
      ],
    };
  }, [pieFilteredUsersCount, pieFilteredDronesCount, pieStatusCounts, isDarkMode, statColors]);

  const handlePieClick = useCallback((index: number) => {
    if (index >= 2 && index <= 4) {
      const statusMap: { [key: number]: 'planned' | 'active' | 'completed' } = {
        2: 'planned',
        3: 'active',
        4: 'completed',
      };
      const newStatus = statusMap[index];
      setSelectedStatus((prev) => (prev === newStatus ? 'all' : newStatus));
      setCurrentPage(1);
      setCurrentDronePage(1);
    }
  }, []);

  const getAvailableDivisions = useMemo(() => {
    if (selectedCommandKey !== 'all' && hierarchyData[selectedCommandKey as keyof typeof hierarchyData]) {
      return Object.entries(hierarchyData[selectedCommandKey as keyof typeof hierarchyData].divisions || {}).map(([key, value]) => ({
        value: key,
        label: (value as any).name || key,
      })).filter((div) => div.label.trim() !== '');
    }
    return [];
  }, [selectedCommandKey]);

  const getAvailableBrigades = useMemo(() => {
    if (selectedCommandKey !== 'all' && selectedDivision && hierarchyData[selectedCommandKey as keyof typeof hierarchyData]?.divisions?.[selectedDivision]) {
      return Object.entries(hierarchyData[selectedCommandKey as keyof typeof hierarchyData].divisions[selectedDivision].brigades || {}).map(([key, value]) => ({
        value: key,
        label: (value as any).name || key,
      })).filter((bde) => bde.label.trim() !== '');
    }
    return [];
  }, [selectedCommandKey, selectedDivision]);

  const getAvailableCorps = useMemo(() => {
    if (selectedCommandKey !== 'all' && selectedDivision && selectedBrigade) {
      const brigade = hierarchyData[selectedCommandKey as keyof typeof hierarchyData]?.divisions?.[selectedDivision]?.brigades?.[selectedBrigade];
      if (brigade) {
        return (brigade as any).corps?.map((corpKey: string) => ({
          value: corpKey,
          label: corpsNames[corpKey as keyof typeof corpsNames] || corpKey,
        })) || [];
      }
    }
    return [];
  }, [selectedCommandKey, selectedDivision, selectedBrigade]);

  const getAvailableUnits = useMemo(() => {
    if (!selectedCorps) return [];
    const unitsInCorps = users.filter((u) => {
      if (u.role !== 'OPERATOR') return false;
      if (selectedCommandKey !== 'all' && u.command !== selectedCommandKey) return false;
      if (selectedDivision && u.division !== selectedDivision) return false;
      if (selectedBrigade && u.brigade !== selectedBrigade) return false;
      if (u.corps !== selectedCorps) return false;
      return true;
    }).map((u) => (u as any).unit).filter(Boolean);
    const uniqueUnits = [...new Set(unitsInCorps)];
    return uniqueUnits.map((unit) => ({
      value: unit,
      label: unit,
    }));
  }, [selectedCorps, users, selectedCommandKey, selectedDivision, selectedBrigade]);

  const getGroupingLevel = useCallback(() => {
    if (selectedCommandKey === 'all') return 'command';
    if (!selectedDivision) return 'division';
    if (!selectedBrigade) return 'brigade';
    if (!selectedCorps) return 'corps';
    return 'unit';
  }, [selectedCommandKey, selectedDivision, selectedBrigade, selectedCorps]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / PAGE_SIZE);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setSelectedUser(null); // Reset selection on page change
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-gray-300 dark:border-gray-600"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {currentPage > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
                className="border-gray-300 dark:border-gray-600"
              >
                1
              </Button>
              <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
            </>
          )}
          {currentPage > 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              className="border-gray-300 dark:border-gray-600"
            >
              {currentPage - 1}
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentPage}
          </Button>
          {currentPage < totalPages - 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              className="border-gray-300 dark:border-gray-600"
            >
              {currentPage + 1}
            </Button>
          )}
          {currentPage < totalPages - 2 && (
            <>
              <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(totalPages)}
                className="border-gray-300 dark:border-gray-600"
              >
                {totalPages}
              </Button>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-gray-300 dark:border-gray-600"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  const safeDateFormat = (dateStr: string, format: 'full' | 'date' = 'full') => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return format === 'date' ? date.toLocaleDateString('en-IN') : date.toLocaleString('en-IN');
  };

  const getTimeAgo = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  // User details modal content
  const renderUserDetails = () => {
    if (!selectedUser) return null;
    const { divisionName, brigadeName, corpsName } = {
      divisionName: selectedUser.divisionName || 'N/A',
      brigadeName: selectedUser.brigadeName || 'N/A',
      corpsName: selectedUser.corpsName || 'N/A',
    };
    const userDrones = droneSpecs.filter(d => String(d.user_id) === String(selectedUser.id));
    const userFlights = flights.filter(f => String(f.user_id) === String(selectedUser.id));
    const plannedFlights = userFlights.filter(f => f.status === 'planned');
    const activeFlights = userFlights.filter(f => f.status === 'active');
    const completedFlights = userFlights.filter(f => f.status === 'completed');
    const unit = (selectedUser as any).unit;

    return (
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserIcon className="w-6 h-6" />
              User Details: {selectedUser.username}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="absolute right-4 top-4">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* User Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Username</p>
                  <p className="font-semibold">{selectedUser.username}</p>
                </div>
                <div>
                  <p className="text-gray-500">Role</p>
                  <p className="font-semibold">{selectedUser.role}</p>
                </div>
                <div>
                  <p className="text-gray-500">Command</p>
                  <p className="font-semibold">{selectedUser.commandName || selectedUser.command || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Division</p>
                  <p className="font-semibold">{divisionName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Brigade</p>
                  <p className="font-semibold">{brigadeName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Corps</p>
                  <p className="font-semibold">{corpsName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Unit</p>
                  <p className="font-semibold">{unit || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Created At</p>
                  <p className="font-semibold">{safeDateFormat(selectedUser.createdAt)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Drone Information */}
            <Card>
              <CardHeader>
                <CardTitle>Drone Information</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {userDrones.length > 0 ? (
                  <div className="space-y-4">
                    {userDrones.map((drone, idx) => (
                      <div key={drone.id || idx} className="p-4 border rounded bg-gray-50 dark:bg-gray-700">
                        <h5 className="font-semibold mb-2">Drone Name: {drone.droneName}</h5>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">Quantity</p>
                            <p className="font-semibold">{drone.quantity}</p>
                          </div>
                          <div>
                            <div className='flex flex-col'>
                              <p className="text-gray-500">IDs</p>
                              <p className="font-semibold">{drone.droneIds?.join(', ')|| 'N/A'}</p>
                             
                            </div>
                          </div>
                          <div>
                            <p className="text-gray-500">Max Speed (km/h)</p>
                            <p className="font-semibold">{drone.maxSpeed}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Max Altitude (m)</p>
                            <p className="font-semibold">{drone.maxHeight}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Max Range (km)</p>
                            <p className="font-semibold">{drone.maxRange}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Max Duration (min)</p>
                            <p className="font-semibold">{drone.maxDuration}</p>
                          </div>
                                                  <div className="col-span-2">
                            <p className="text-gray-500">Operating Frequency (GHz)</p>
                            <p className="font-semibold">{drone.operatingFrequency || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Clock Drift</p>
                            <p className="font-semibold">{drone.clockDrift || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Spectral Leakage</p>
                            <p className="font-semibold">{drone.spectralLeakage || 'N/A'}</p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">Modular Shape ID</p>
                            <p className="font-semibold">{drone.modularshapeId || 'N/A'}</p>
                          </div>
                            <div>
                            <p className="text-gray-500">GPS Enabled</p>
                            <Badge variant={drone.gpsEnabled === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.gpsEnabled}</Badge>
                          </div>
                          <div>
                            <p className="text-gray-500">Autonomous</p>
                            <Badge variant={drone.autonomous === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.autonomous}</Badge>
                          </div>
                          <div>
                            <p className="text-gray-500">Controlled</p>
                            <Badge variant={drone.controlled === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.controlled}</Badge>
                          </div>
                          <div>
                            <p className="text-gray-500">Camera Enabled</p>
                            <Badge variant={drone.cameraEnabled === 'yes' ? 'default' : 'secondary'} className="text-xs">{drone.cameraEnabled}</Badge>
                          </div>
                          <div className="col-span-2">
                            <p className="text-gray-500">Camera Resolution</p>
                            <p className="font-semibold">{drone.cameraResolution || 'N/A'}</p>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No drones registered for this user.</p>
                )}
              </CardContent>
            </Card>

            {/* Flight Information */}
            <Card>
              <CardHeader>
                <CardTitle>Flight Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-500">Total Flights</p>
                    <p className="font-semibold text-blue-800">{userFlights.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Planned</p>
                    <p className="font-semibold text-amber-800">{plannedFlights.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Active</p>
                    <p className="font-semibold text-blue-900">{activeFlights.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Completed</p>
                    <p className="font-semibold text-green-900">{completedFlights.length}</p>
                  </div>
                </div>

                {/* Planned Flights */}
                {plannedFlights.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4" />
                      Planned Flights ({plannedFlights.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {plannedFlights.map((f) => (
                        <div key={f.id} className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded border">
                          <p className="font-medium">Flight ID: {f.id}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Start: {safeDateFormat(f.start)} | End: {safeDateFormat(f.end)}
                          </p>
                          <Badge variant="secondary" className="mt-1">Planned</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Active Flights */}
                {activeFlights.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <ClockIcon className="w-4 h-4" />
                      Active Flights ({activeFlights.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {activeFlights.map((f) => (
                        <div key={f.id} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border">
                          <p className="font-medium">Flight ID: {f.id}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Start: {safeDateFormat(f.start)} | End: {safeDateFormat(f.end)}
                          </p>
                          <Badge variant="default" className="mt-1">Active</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed Flights */}
                {completedFlights.length > 0 && (
                  <div>
                    <h4 className="font-semibold flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4" />
                      Completed Flights ({completedFlights.length})
                    </h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {completedFlights.map((f) => (
                        <div key={f.id} className="p-2 bg-green-50 dark:bg-green-900/20 rounded border">
                          <p className="font-medium">Flight ID: {f.id}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            Start: {safeDateFormat(f.start)} | End: {safeDateFormat(f.end)}
                          </p>
                          <Badge variant="default" className="bg-green-900 mt-1">Completed</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {userFlights.length === 0 && (
                  <p className="text-gray-500 italic">No flights recorded for this user.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  // Flight details modal
  const renderFlightDetails = () => {
    if (!mapModalOpen) return null;
    return (
      <Dialog open={!!mapModalOpen} onOpenChange={() => setMapModalOpen(null)}>
        
        {mapModalOpen && selectedFlightDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-75 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-11/12 h-5/6 max-w-6xl flex flex-col relative z-[9999]">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 relative z-[9999]">
              <div className="flex-1 relative z-[9999]">
                <div className="flex items-start justify-between relative z-[9999]">
                  <div className="flex-1 relative z-[9999]">
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2 relative z-[9999]">Flight Route Visualization</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm relative z-[9999]">
                      <div className="relative z-[9999]">
                        <p className="font-medium text-gray-700 dark:text-gray-300 relative z-[9999]">Mission Details:</p>
                        <p className="text-gray-600 dark:text-gray-400 relative z-[9999]">{selectedFlightDetails?.drone_model || 'N/A'} - {selectedFlightDetails?.purpose || 'N/A'}</p>
                        <p className="text-gray-600 dark:text-gray-400 relative z-[9999]">Status:
                          <Badge className={`ml-2 text-xs ${getStatusBadgeClass(selectedFlightDetails.status)} relative z-[9999]`}>
                            {selectedFlightDetails.status.toUpperCase()}
                          </Badge>
                        </p>
                      </div>
                      {selectedFlightUser && (
                        <div className="relative z-[9999]">
                          <p className="font-medium text-gray-700 dark:text-gray-300 relative z-[9999]">Operator Details:</p>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 relative z-[9999]">
                            <User className="w-4 h-4 relative z-[9999]" />
                            <span className="relative z-[9999]">{selectedFlightUser.username}</span>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400 relative z-[9999]">{selectedFlightUser.commandName}</p>
                          <p className="text-gray-600 dark:text-gray-400 relative z-[9999]">{selectedFlightUser.unit || selectedFlightUser.corpsName}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setMapModalOpen(false)} className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 relative z-[9999]">
                <X className="w-5 h-5 relative z-[9999]" />
              </Button>
            </div>
            <div className="flex-1 p-4 relative z-[9999]">
              <CesiumMap
                waypoints={transformWaypoints(selectedFlightWaypoints)}
                center={selectedFlightWaypoints.length > 0 ? {
                  lat: parseFloat(selectedFlightWaypoints[0].lat) || 28.12000,
                  lng: parseFloat(selectedFlightWaypoints[0].lng) || 77.900,
                } : { lat: 28.12000, lng: 77.900 }}
                zoom={10}
              />
              {(!selectedFlightWaypoints || selectedFlightWaypoints.length === 0) && (
                <div className="flex items-center justify-center h-full relative z-[9999]">
                  <div className="text-center text-gray-500 dark:text-gray-400 relative z-[9999]">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50 relative z-[9999]" />
                    <p className="relative z-[9999]">No waypoints available for this flight</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </Dialog>
    );
  };

  // New: Drone details modal
  const renderDroneDetails = () => {
    if (!selectedDrone) return null;
    const user = userMap.get(String(selectedDrone.user_id));
    const userFlights = flights.filter(f => String(f.user_id) === String(selectedDrone.user_id));
    return (
      <Dialog open={!!selectedDrone} onOpenChange={() => setSelectedDrone(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plane className="w-6 h-6" />
              Drone Details: {selectedDrone.droneName}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="sm" className="absolute right-4 top-4">
                <X className="w-4 h-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Owner</p>
                  <p className="font-semibold">{user?.username || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Drone Name</p>
                  <p className="font-semibold">{selectedDrone.droneName}</p>
                </div>
                <div>
                  <p className="text-gray-500">Quantity</p>
                  <p className="font-semibold">{selectedDrone.quantity}</p>
                </div>
                <div>
                  <p className="text-gray-500">Drone IDs</p>
                  <p className="font-semibold">{selectedDrone.droneIds?.join(', ') || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Mission Status</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                {userFlights.length > 0 ? (
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {userFlights.map((flight) => (
                      <div
                        key={flight.id}
                        className="p-3 border rounded bg-gray-50 dark:bg-gray-700 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                        onClick={() => {
                          setSelectedDrone(null);
                          openMapModal(flight);
                        }}
                        
                        
                      title={`View route for ${flight.drone_model} - ${flight.purpose}` }
                     

                      >
                    
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium text-gray-800 dark:text-gray-200">Drone Name: {flight.drone_model}</p>
                          <Badge variant="default" className="text-xs">{flight.status}</Badge>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Start: {safeDateFormat(flight.start)} | End: {safeDateFormat(flight.end)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No missions planned for this drone.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Drone Specs</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
            
                <div>
                  <p className="text-gray-500">Max Speed (KM/H)</p>
                  <p className="font-semibold">{selectedDrone.maxSpeed}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Altitude (M)</p>
                  <p className="font-semibold">{selectedDrone.maxHeight}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Range (KM)</p>
                  <p className="font-semibold">{selectedDrone.maxRange}</p>
                </div>
                <div>
                  <p className="text-gray-500">Max Duration (min)</p>
                  <p className="font-semibold">{selectedDrone.maxDuration}</p>
                </div>
             
                <div>
                  <p className="text-gray-500">Clock Drift</p>
                  <p className="font-semibold">{selectedDrone.clockDrift || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-500">Spectral Leakage</p>
                  <p className="font-semibold">{selectedDrone.spectralLeakage || 'N/A'}</p>
                </div>
                <div className="col-span-">
                  <p className="text-gray-500">Modular Shape ID</p>
                  <p className="font-semibold">{selectedDrone.modularshapeId || 'N/A'}</p>
                </div>
                    <div className="col-span-2">
                  <p className="text-gray-500">Operating Frequency (GHz)</p>
                  <p className="font-semibold">{selectedDrone.operatingFrequency || 'N/A'}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">GPS Enabled</p>
                  <Badge variant={selectedDrone.gpsEnabled === 'yes' ? 'default' : 'secondary'}>{selectedDrone.gpsEnabled}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Autonomous</p>
                  <Badge variant={selectedDrone.autonomous === 'yes' ? 'default' : 'secondary'}>{selectedDrone.autonomous}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Controlled</p>
                  <Badge variant={selectedDrone.controlled === 'yes' ? 'default' : 'secondary'}>{selectedDrone.controlled}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Camera Enabled</p>
                  <Badge variant={selectedDrone.cameraEnabled === 'yes' ? 'default' : 'secondary'}>{selectedDrone.cameraEnabled}</Badge>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Camera Resolution</p>
                  <p className="font-semibold">{selectedDrone.cameraResolution || 'N/A'}</p>
                </div>
               
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const isCommandDisabled = !!user?.command;

  const renderUsersList = () => {
    const startItem = (currentPage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentPage * PAGE_SIZE, filteredUsers.length);
    return (
      <div className="space-y-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Showing {startItem} to {endItem} of {filteredUsers.length} users
        </p>
        <div className="overflow-y-auto max-h-[40vh]">
          {paginatedUsers.length > 0 ? (
            paginatedUsers.map((u) => (
              <Card
                key={u.id}
                className="mb-2 p-2 text-xs border border-gray-200 dark:border-gray-600 shadow-sm dark:bg-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setSelectedUser(u)}
              >
                <div className="font-semibold text-gray-800 dark:text-gray-200">{u.username}</div>
                <div className="text-gray-600 dark:text-gray-400">{u.commandName || u.command || 'N/A'}</div>
                <div className="text-gray-500 dark:text-gray-400">Created: {safeDateFormat(u.createdAt, 'date')}</div>
              </Card>
            ))
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No data available</p>
          )}
        </div>
        {renderPagination()}
      </div>
    );
  };

  // New: Render drone list with pagination (similar to users)
  const paginatedDrones = useMemo(() => {
    const startIndex = (currentDronePage - 1) * PAGE_SIZE;
    return filteredDroneSpecs.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredDroneSpecs, currentDronePage]);

  const totalDronePages = Math.ceil(filteredDroneSpecs.length / PAGE_SIZE);

  const handleDronePageChange = (page: number) => {
    if (page >= 1 && page <= totalDronePages) {
      setCurrentDronePage(page);
      setSelectedDrone(null);
    }
  };

  const renderDronePagination = () => {
    if (totalDronePages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDronePageChange(currentDronePage - 1)}
          disabled={currentDronePage === 1}
          className="border-gray-300 dark:border-gray-600"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {currentDronePage > 3 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDronePageChange(1)}
                className="border-gray-300 dark:border-gray-600"
              >
                1
              </Button>
              <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
            </>
          )}
          {currentDronePage > 2 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDronePageChange(currentDronePage - 1)}
              className="border-gray-300 dark:border-gray-600"
            >
              {currentDronePage - 1}
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            {currentDronePage}
          </Button>
          {currentDronePage < totalDronePages - 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDronePageChange(currentDronePage + 1)}
              className="border-gray-300 dark:border-gray-600"
            >
              {currentDronePage + 1}
            </Button>
          )}
          {currentDronePage < totalDronePages - 2 && (
            <>
              <span className="px-2 text-sm text-gray-500 dark:text-gray-400">...</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDronePageChange(totalDronePages)}
                className="border-gray-300 dark:border-gray-600"
              >
                {totalDronePages}
              </Button>
            </>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleDronePageChange(currentDronePage + 1)}
          disabled={currentDronePage === totalDronePages}
          className="border-gray-300 dark:border-gray-600"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    );
  };

  const renderDronesList = () => {
    const startItem = (currentDronePage - 1) * PAGE_SIZE + 1;
    const endItem = Math.min(currentDronePage * PAGE_SIZE, filteredDroneSpecs.length);
    return (
      <div className="space-y-1">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
          Showing {startItem} to {endItem} of {filteredDroneSpecs.length} drones
        </p>
        <div className="overflow-y-auto max-h-[30vh]">
          {paginatedDrones.length > 0 ? (
            <table className="w-full text-xs border-collapse border border-gray-300 dark:border-gray-600">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700">
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">User Name</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Drone Name</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Status</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Flight Time</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Frequency</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Clock Drift</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Spectral Leakage</th>
                  <th className="border border-gray-300 dark:border-gray-600 p-2 text-left">Modular Shape ID</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDrones.map((d, idx) => {
                  const owner = userMap.get(String(d.user_id));
                  const userFlights = flights.filter(f => String(f.user_id) === String(d.user_id));
                  const latestFlight = userFlights.length > 0 ? userFlights.reduce((prev, current) => (new Date(current.end) > new Date(prev.end) ? current : prev)) : null;
                  const status = latestFlight ? latestFlight.status : 'No Mission';
                  const statusVariant = status === 'planned' ? 'secondary' : status === 'active' ? 'default' : status === 'completed' ? 'default' : 'outline';
                  const flightTime = latestFlight ? safeDateFormat(latestFlight.start, 'date') : 'N/A';
                  const frequency = d.operatingFrequency || 'N/A';
                  const clockDrift = d.clockDrift || 'N/A';
                  const spectralLeakage = d.spectralLeakage || 'N/A';
                  const modularShapeId = d.modularshapeId || 'N/A';
                  return (
                    <tr key={d.id || idx} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => setSelectedDrone(d)}>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">{owner?.username || 'N/A'}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">{d.droneName}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">
                        <Badge variant={statusVariant as any}>{status}</Badge>
                      </td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">{flightTime}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">{frequency}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">{clockDrift}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">{spectralLeakage}</td>
                      <td className="border border-gray-300 dark:border-gray-600 p-2">{modularShapeId}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center">No drones match the filters</p>
          )}
        </div>
        {renderDronePagination()}
      </div>
    );
  };

  const renderStatCard = (title: string, value: number, icon: React.ReactNode, color: string, onClick?: () => void) => (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <MonitoringErrorBoundary>
      <div className="min-h-screen flex flex-col relative bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${armyBg})` }}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col flex-1">
          <div className="sticky top-0 z-50">
            <div className="bg-blue-600 h-1"></div>
            <header className="shadow-sm bg-white/75 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-gray-50 dark:from-blue-900 dark:to-gray-900 rounded-full flex items-center justify-center shadow-md">
                    <img src={profileImg} alt="Profile" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200"></h1>
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white-200">Indian Army</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400"></p>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Central Command & Control System</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="bg-green-50 dark:bg-green-900 px-3 py-2 rounded-lg border border-green-200 dark:border-green-600">
                    <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">Active Operations: {statusCounts.active}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-white-300">
                      <Users className="h-4 w-4" />
                      <span>Administrator: {user?.username ?? 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <Shield className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-green-600 dark:text-green-400">Secure Connection</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={toggleDarkMode}
                    className="border-gray-300 text-gray-600 dark:border-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={logout}
                    className="border-red-300 text-red-600 dark:border-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    LOGOUT
                  </Button>
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-50 to-gray-50 rounded-full flex items-center justify-center shadow-md">
                    <img src={logo} alt="Profile" />
                  </div>
                </div>
              </div>
            </header>
            <nav className="bg-gradient-to-r from-slate-800 to-slate-900 text-white shadow-lg">
              <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex space-x-1">
                  <a href="/monitoring" className="py-3 px-4 text-sm hover:bg-slate-700 bg-slate-700 rounded-t-sm border-b-2 border-blue-400">
                    Command Dashboard
                  </a>
                  <a href="/admin" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
                    Flight Monitoring
                  </a>
                  <a href="/registrations" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
                    Drone Registrations
                  </a>
                  <a href="/flight_status" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
                    Flight Status
                  </a>
                  <a href="#" className="py-3 px-4 text-sm hover:bg-slate-700 rounded-t-sm">
                    Settings
                  </a>
                </div>
                <div className="text-xs text-gray-300 bg-slate-700 px-3 py-1 rounded">
                  System Status: Online | Last Sync: {new Date().toLocaleTimeString('en-IN')}
                </div>
              </div>
            </nav>
          </div>

          <div className="flex-1">
            <div className="container mx-auto p-4">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-3">
                    <Plane className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    Admin Dashboard - Flight Monitoring
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search users, drones, flights..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                  <Button
                    variant="outline"
                    onClick={loadData}
                    className="border-blue-300 text-blue-600 dark:border-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900"
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Data
                  </Button>
                </div>
              </div>

              {/* Stats Row - using base drone count */}
              {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                  {renderStatCard('Total Users', filteredUsers.length, <Users className="w-6 h-6" />, 'blue', () => setSelectedStatus('all'))}
                  {renderStatCard('Total Drones', filteredDroneSpecsBase.length, <Plane className="w-6 h-6" />, 'green', () => setSelectedStatus('all'))}
                  {renderStatCard('Total Flights', filteredFlights.length, <TrendingUp className="w-6 h-6" />, 'red', () => setSelectedStatus('all'))}
                  {renderStatCard('Planned', statusCounts.planned, <Calendar className="w-6 h-6" />, 'amber', () => setSelectedStatus('planned'))}
                  {renderStatCard('Active', statusCounts.active, <Activity className="w-6 h-6" />, 'blue', () => setSelectedStatus('active'))}
                  {renderStatCard('Completed', statusCounts.completed, <CheckCircle className="w-6 h-6" />, 'green', () => setSelectedStatus('completed'))}
                </div>
              )}

              <div className='flex flex-row gap-5'>
                <div className="flex flex-col gap-4 w-80">
                  <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800">
                    <CardHeader className="bg-gray-50 dark:bg-gray-700 space-y-2">
                      <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Hierarchy Filter</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-4">
                      <Select value={selectedCommandKey} onValueChange={handleCommandChange} disabled={isCommandDisabled}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                          <SelectValue placeholder="Select Command" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <SelectItem value="all">All Commands</SelectItem>
                          {Object.entries(commandNames).map(([key, name]) => (
                            <SelectItem key={key} value={key} className="text-gray-800 dark:text-gray-200">
                              {name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select
                        value={selectedDivision}
                        onValueChange={handleDivisionChange}
                        disabled={selectedCommandKey === 'all' || !selectedCommandKey}
                      >
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                          <SelectValue placeholder="Select Corps" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          {getAvailableDivisions.map((div) => (
                            <SelectItem key={div.value} value={div.value} className="text-gray-800 dark:text-gray-200">
                              {div.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedBrigade} onValueChange={handleBrigadeChange} disabled={!selectedDivision}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                          <SelectValue placeholder="Select Div" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          {getAvailableBrigades.map((bde) => (
                            <SelectItem key={bde.value} value={bde.value} className="text-gray-800 dark:text-gray-200">
                              {bde.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={selectedCorps} onValueChange={handleCorpsChange} disabled={!selectedBrigade}>
                        <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400">
                          <SelectValue placeholder="Select BDE" />
                        </SelectTrigger>
                        <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          {getAvailableCorps.map((cor) => (
                            <SelectItem key={cor.value} value={cor.value} className="text-gray-800 dark:text-gray-200">
                              {cor.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>
                  {/* New: Drone Spec Filters Card - single inputs */}
                  <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800">
                    <CardHeader className="bg-gray-50 dark:bg-gray-700 space-y-2">
                      <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
                        <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Drone Spec Filters</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3 text-xs">
                         <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Drone Name</label>
                        <Input
                          placeholder="mavic 3 pro"
                          value={droneName}
                          onChange={(e) => setDroneNameFilter(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Speed (km/h)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 50"
                          value={speedFilter ?? ''}
                          onChange={(e) => setSpeedFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Altitude (m)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 100"
                          value={altitudeFilter ?? ''}
                          onChange={(e) => setAltitudeFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Range (km)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 10"
                          value={rangeFilter ?? ''}
                          onChange={(e) => setRangeFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Duration (min)</label>
                        <Input
                          type="number"
                          placeholder="e.g. 30"
                          value={durationFilter ?? ''}
                          onChange={(e) => setDurationFilter(e.target.value ? parseFloat(e.target.value) : undefined)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">GPS</label>
                        <Select value={gpsFilter} onValueChange={(v) => setGpsFilter(v as 'all' | 'yes' | 'no')}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Autonomous</label>
                        <Select value={autonomousFilter} onValueChange={(v) => setAutonomousFilter(v as 'all' | 'yes' | 'no')}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Controlled</label>
                        <Select value={controlledFilter} onValueChange={(v) => setControlledFilter(v as 'all' | 'yes' | 'no')}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Camera</label>
                        <Select value={cameraFilter} onValueChange={(v) => setCameraFilter(v as 'all' | 'yes' | 'no')}>
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="All" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="yes">Yes</SelectItem>
                            <SelectItem value="no">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Camera Resolution</label>
                        <Input
                          placeholder="e.g. 4K"
                          value={cameraResolution}
                          onChange={(e) => setCameraResolution(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <label className="text-gray-600 dark:text-gray-300 block mb-1">Operating Freq (GHz)</label>
                        <Input
                          placeholder="e.g. 2.4-5.8"
                          value={operatingFrequency}
                          onChange={(e) => setOperatingFrequency(e.target.value)}
                          className="h-8"
                        />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={resetDroneFilters}
                        className="w-full"
                      >
                        Reset Filters
                      </Button>
                    </CardContent>
                  </Card>
                </div>
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="col-span-1">
                    <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800">
                      <CardHeader>
                        <CardTitle className="text-gray-800 dark:text-gray-200 flex items-center gap-2">
                          <BarChart className="w-5 h-5" />
                          Overview Analytics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <PieChart
                          statisticsChartData={combinedPieData}
                          statisticsChartTitle="System Overview"
                          onSliceClick={handlePieClick}
                        />
                      </CardContent>
                    </Card>
                  </div>
                  <div className="col-span-1">
                    <Card className="border-gray-300 dark:border-gray-600  shadow-sm dark:bg-gray-800 ">
                      <CardHeader className="bg-gray-50 dark:bg-gray-700">
                        <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
                          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          <span>Users List</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-blue-600 dark:text-blue-400 ">
                          Paginated view of filtered users (Page {currentPage} of {totalPages})
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        {renderUsersList()}
                      </CardContent>
                    </Card>
                  </div>
                  <div className="col-span-1 lg:col-span-2">
                    <Card className="border-gray-300 dark:border-gray-600 shadow-sm dark:bg-gray-800 h-full">
                      <CardHeader className="bg-gray-50 dark:bg-gray-700 ">
                        <CardTitle className="text-gray-800 dark:text-gray-200 text-sm flex items-center space-x-2">
                          <Plane className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <span>Drone Fleet Status</span>
                        </CardTitle>
                        <CardDescription className="text-xs text-green-600 dark:text-green-400">
                          Paginated view of filtered drones (Page {currentDronePage} of {totalDronePages})
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="p-4">
                        {renderDronesList()}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <footer className="mt-auto bg-slate-900 dark:bg-slate-950 text-white py-6 px-4">
            <div className="container mx-auto">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Plane className="h-6 w-6 text-blue-400" />
                  <div>
                    <div className="text-sm font-semibold">Drone Management System</div>
                    <div className="text-xs text-gray-400">Ministry of Civil Aviation, Government of India</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="h-4 w-4" />
                    <span>Version 2.1.0 | Build: DMS-2025</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">© 2025 All Rights Reserved | Designed & Maintained by NIC</div>
                </div>
              </div>
            </div>
          </footer>
        </div>
        {renderUserDetails()}
        {renderDroneDetails()}
        {renderFlightDetails()}
      </div>
    </MonitoringErrorBoundary>
  );
};

export default Monitoring;