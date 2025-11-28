import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
 Card,
 CardContent,
 CardHeader,
 CardTitle,
} from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import profileImg from '../assets/logo.png';
import logo  from '../assets/Logo1.png';
import {
 Plane,
 MapPin,
 Clock,
 AlertTriangle,
 LogOut,
 Shield,
 ChevronDown,
 ChevronUp,
 Globe,
 User,
 Database,
 Edit,
 Save,
 X,
 Filter,
 Search,
 Calendar,
 FileText,
 Eye,
 Download,
 RefreshCw,
 Settings,
 Activity,
 Target,
 Map
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/services/api';

// ── SIX PREDEFINED COMMAND CENTERS ─────────────────────
const COMMANDS = [
 { name: 'Command 1', lat: 28.6139, lng: 77.2090 }, // New Delhi
 { name: 'Command 2', lat: 19.0760, lng: 72.8777 }, // Mumbai
 { name: 'Command 3', lat: 13.0827, lng: 80.2707 }, // Chennai
 { name: 'Command 4', lat: 22.5726, lng: 88.3639 }, // Kolkata
 { name: 'Command 5', lat: 12.9716, lng: 77.5946 }, // Bengaluru
 { name: 'Command 6', lat: 17.3850, lng: 78.4867 }, // Hyderabad
];

// Map Modal Component
const MapModal = ({ isOpen, onClose, waypoints, flightDetails }) => {
 useEffect(() => {
   if (isOpen && waypoints?.length > 0) {
     const mapContainer = document.getElementById('waypoint-map');
     if (mapContainer && window.google) {
       const map = new window.google.maps.Map(mapContainer, {
         zoom: 10,
         center: { lat: parseFloat(waypoints[0].lat) || 0, lng: parseFloat(waypoints[0].lng) || 0 },
         mapTypeId: 'satellite'
       });

       waypoints.forEach((waypoint, index) => {
         const marker = new window.google.maps.Marker({
           position: { lat: parseFloat(waypoint.lat) || 0, lng: parseFloat(waypoint.lng) || 0 },
           map: map,
           title: `Waypoint ${index + 1} - Alt: ${waypoint.elev || 0}m`,
           label: (index + 1).toString(),
           icon: {
             path: window.google.maps.SymbolPath.CIRCLE,
             scale: 8,
             fillColor: '#ff6b35',
             fillOpacity: 1,
             strokeColor: '#ffffff',
             strokeWeight: 2
           }
         });

         const infoWindow = new window.google.maps.InfoWindow({
           content: `
             <div class="p-2">
               <h3 class="font-semibold">Waypoint ${index + 1}</h3>
               <p><strong>Latitude:</strong> ${(parseFloat(waypoint.lat) || 0).toFixed(6)}</p>
               <p><strong>Longitude:</strong> ${(parseFloat(waypoint.lng) || 0).toFixed(6)}</p>
               <p><strong>Altitude:</strong> ${waypoint.elev || 0}m</p>
             </div>
           `
         });

         marker.addListener('click', () => {
           infoWindow.open(map, marker);
         });
       });

       if (waypoints.length > 1) {
         const flightPath = new window.google.maps.Polyline({
           path: waypoints.map(wp => ({ lat: parseFloat(wp.lat) || 0, lng: parseFloat(wp.lng) || 0 })),
           geodesic: true,
           strokeColor: '#ff6b35',
           strokeOpacity: 1.0,
           strokeWeight: 3
         });
         flightPath.setMap(map);
       }
     }
   }
 }, [isOpen, waypoints]);

 if (!isOpen) return null;

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl flex flex-col">
       <div className="flex justify-between items-center p-4 border-b">
         <div>
           <h2 className="text-xl font-semibold text-gray-800">Flight Route Visualization</h2>
           <p className="text-sm text-gray-600">{flightDetails?.drone_model || 'N/A'} - {flightDetails?.purpose || 'N/A'}</p>
         </div>
         <Button variant="ghost" onClick={onClose}>
           <X className="w-5 h-5" />
         </Button>
       </div>
       <div className="flex-1 p-4">
         <div id="waypoint-map" className="w-full h-full rounded-lg border border-gray-300"></div>
         {(!waypoints || waypoints.length === 0) && (
           <div className="flex items-center justify-center h-full">
             <div className="text-center text-gray-500">
               <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
               <p>No waypoints available for this flight</p>
             </div>
           </div>
         )}
       </div>
     </div>
   </div>
 );
};

class ErrorBoundary extends React.Component {
 state = { hasError: false, error: null };

 static getDerivedStateFromError(error) {
   return { hasError: true, error };
 }

 render() {
   if (this.state.hasError) {
     return (
       <div className="text-center py-4 text-red-600">
         Something went wrong: {this.state.error?.message || 'Unknown error'}
       </div>
     );
   }
   return this.props.children;
 }
}

const FlightHistory = () => {
 const { user, logout } = useAuth();
 // ─── state management ─────────────────────
 const [myFlights, setMyFlights] = useState([]);
 const [filteredFlights, setFilteredFlights] = useState([]);
 const [expandedCards, setExpandedCards] = useState(new Set());
 const [loading, setLoading] = useState(true);
 const [waypoints, setWaypoints] = useState({});
 const [statusFilter, setStatusFilter] = useState('all');
 const [searchTerm, setSearchTerm] = useState('');
 const [dateFilter, setDateFilter] = useState('all');
 const [commandFilter, setCommandFilter] = useState('all');
 const [mapModalOpen, setMapModalOpen] = useState(false);
 const [selectedFlightWaypoints, setSelectedFlightWaypoints] = useState([]);
 const [selectedFlightDetails, setSelectedFlightDetails] = useState(null);
 const [editingMission, setEditingMission] = useState(null);
 const [editForm, setEditForm] = useState({
   drone_model: '',
   command_name: '',
   purpose: '',
   start: '',
   end: ''
 });

 // Utility Functions
 const safeDateFormat = (dateStr, format = 'full') => {
   if (!dateStr) return 'N/A';
   const date = new Date(dateStr);
   if (isNaN(date.getTime())) return 'N/A';
   return format === 'date' ? date.toLocaleDateString('en-IN') : date.toLocaleString('en-IN');
 };

 const calculateDuration = (startStr, endStr) => {
   if (!startStr || !endStr) return 'N/A';
   const start = new Date(startStr);
   const end = new Date(endStr);
   if (isNaN(start.getTime()) || isNaN(end.getTime())) return 'N/A';
   return Math.round((end.getTime() - start.getTime()) / (1000 * 60)) + ' min';
 };

 // Load Flights and Waypoints
 const loadMyFlights = async () => {
   setLoading(true);
   try {
     const all = await apiService.getAllFlights();
     console.log("Server flights:", all);
     const userFlights = all.filter(f => f.user_id === user?.id).map(f => {
       const now = new Date();
       const start = new Date(f.start);
       const end = new Date(f.end);
       let status = f.status;
       if (status === 'planned' && start <= now && end > now) {
         status = 'active';
       } else if (status === 'active' && end <= now) {
         status = 'completed';
       }
       return {
         id: String(f.id || 'unknown'),
         drone_model: f.drone_model || 'N/A',
         drone_class: f.drone_class || 'N/A',
         frequency: f.frequency || 0,
         clockDrift: f.clockDrift || 0,
         spectralLeakage: f.spectralLeakage || 0,
         modularshapeId: f.modularshapeId || 0,
         command_name: f.command_name || 'N/A',
         purpose: f.purpose || 'N/A',
         start: f.start || '',
         end: f.end || '',
         status,
         cancel_requested: f.cancel_requested || false
       };
     });

     console.log("Filtered user flights:", userFlights);
     setMyFlights(userFlights);
     setFilteredFlights(userFlights);

     const waypointData = {};
     for (const flight of userFlights) {
       waypointData[flight.id] = await apiService.getFlightWaypoints(flight.id) || [];
       console.log(`Waypoints for flight ${flight.id}:`, waypointData[flight.id]);
     }
     setWaypoints(waypointData);
   } catch (error) {
     console.error('Failed to load flight history:', error);
     toast.error('Failed to load flight history');
   } finally {
     setLoading(false);
   }
 };

 useEffect(() => {
   if (user?.id) {
     loadMyFlights();
   }
 }, [user?.id]);

 // Auto-update mission status based on start and end times
 useEffect(() => {
   const checkMissionStatus = async () => {
     if (!user?.id) return;

     const now = new Date();
     let hasChanges = false;

     const updatedFlights = await Promise.all(
       myFlights.map(async (flight) => {
         const start = new Date(flight.start);
         const end = new Date(flight.end);
         let newStatus = flight.status;

         if (flight.status === 'planned' && start <= now && end > now) {
           newStatus = 'active';
         } else if (flight.status === 'active' && end <= now) {
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
       setMyFlights(updatedFlights);
       setFilteredFlights(updatedFlights);
       toast.info('Mission statuses updated');
     }
   };

   // Check every 30 seconds
   const interval = setInterval(checkMissionStatus, 30000);

   // Run immediately on mount
   checkMissionStatus();

   return () => clearInterval(interval);
 }, [myFlights, user?.id]);

 // Filtering Logic
 useEffect(() => {
   let filtered = [...myFlights];

   if (statusFilter !== 'all') {
     filtered = filtered.filter(f => f.status === statusFilter);
   }

   if (searchTerm) {
     filtered = filtered.filter(f =>
       (f.drone_model || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (f.purpose || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
       (f.command_name || '').toLowerCase().includes(searchTerm.toLowerCase())
     );
   }

   if (commandFilter !== 'all') {
     filtered = filtered.filter(f => f.command_name === commandFilter);
   }

   if (dateFilter !== 'all') {
     const now = new Date();
     switch (dateFilter) {
       case 'today':
         filtered = filtered.filter(f => {
           const flightDate = new Date(f.start);
           return !isNaN(flightDate.getTime()) && flightDate.toDateString() === now.toDateString();
         });
         break;
       case 'week':
         const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
         filtered = filtered.filter(f => {
           const flightDate = new Date(f.start);
           return !isNaN(flightDate.getTime()) && flightDate >= weekAgo;
         });
         break;
       case 'month':
         const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
         filtered = filtered.filter(f => {
           const flightDate = new Date(f.start);
           return !isNaN(flightDate.getTime()) && flightDate >= monthAgo;
         });
         break;
     }
   }

   setFilteredFlights(filtered);
 }, [myFlights, statusFilter, searchTerm, dateFilter, commandFilter]);

 // Card Expansion
 const toggleCardExpansion = (flightId) => {
   const idStr = String(flightId);
   const newExpanded = new Set(expandedCards);
   if (newExpanded.has(idStr)) {
     newExpanded.delete(idStr);
   } else {
     newExpanded.add(idStr);
   }
   setExpandedCards(newExpanded);
 };

 // Map Modal Functions
 const openMapModal = (flight) => {
   const flightWaypoints = waypoints[flight.id] || [];
   setSelectedFlightWaypoints(flightWaypoints);
   setSelectedFlightDetails(flight);
   setMapModalOpen(true);
 };

 // Edit Mission Functions
 const canEditMission = (flight) => {
   const hasAllDetails = flight.drone_model &&
     flight.command_name &&
     flight.purpose &&
     flight.start &&
     flight.end &&
     flight.drone_model !== 'N/A' &&
     flight.command_name !== 'N/A' &&
     flight.purpose !== 'N/A';

   const editableStatus = ['planned'].includes(flight.status);
   const noCancelRequest = !flight.cancel_requested;
   const startDate = new Date(flight.start);
   const futureStart = !isNaN(startDate.getTime()) && startDate > new Date();

   return hasAllDetails && editableStatus && noCancelRequest && futureStart;
 };

 const startEditMission = (flight) => {
   if (!canEditMission(flight)) {
     toast.error('This mission cannot be edited at this time');
     return;
   }

   const startDate = new Date(flight.start);
   const endDate = new Date(flight.end);

   setEditingMission(flight.id);
   setEditForm({
     drone_model: flight.drone_model || 'N/A',
     command_name: flight.command_name || 'N/A',
     purpose: flight.purpose || 'N/A',
     start: isNaN(startDate.getTime()) ? '' : startDate.toISOString().slice(0, 16),
     end: isNaN(endDate.getTime()) ? '' : endDate.toISOString().slice(0, 16)
   });
 };

 const cancelEditMission = () => {
   setEditingMission(null);
   setEditForm({
     drone_model: '',
     command_name: '',
     purpose: '',
     start: '',
     end: ''
   });
 };

 const saveEditMission = async (flightId) => {
   if (!editForm.drone_model || !editForm.command_name || !editForm.purpose ||
       !editForm.start || !editForm.end) {
     toast.error('Please fill all fields');
     return;
   }
   const start = new Date(editForm.start);
   const end = new Date(editForm.end);
   if (start >= end) {
     toast.error('End time must be after start time');
     return;
   }
   if (start < new Date()) {
     toast.error('Start time cannot be in the past');
     return;
   }
   try {
     await apiService.updateFlight(flightId, {
       drone_model: editForm.drone_model,
       command_name: editForm.command_name,
       purpose: editForm.purpose,
       start: editForm.start,
       end: editForm.end,
       status: 'planned' // Ensure status is set to planned after edit
     });
     toast.success('Mission updated successfully');
     setEditingMission(null);
     setEditForm({
       drone_model: '',
       command_name: '',
       purpose: '',
       start: '',
       end: ''
     });
     loadMyFlights();
   } catch (error) {
     toast.error('Failed to update mission');
   }
 };

 const requestCancel = async (flightId) => {
   try {
     await apiService.requestCancelFlight(flightId);
     toast.success('Cancel requested');
     loadMyFlights();
   } catch (error) {
     toast.error('Failed to request cancellation');
   }
 };

 const getStatusBadgeClass = (status) => {
   switch (status) {
     case 'active': return 'bg-blue-100 text-blue-800 border-blue-300';
     case 'planned': return 'bg-purple-100 text-purple-800 border-purple-300';
     case 'completed': return 'bg-green-100 text-green-800 border-green-300';
     default: return 'bg-gray-100 text-gray-800 border-gray-300';
   }
 };

 const clearAllFilters = () => {
   setStatusFilter('all');
   setSearchTerm('');
   setDateFilter('all');
   setCommandFilter('all');
 };

 return (
   <ErrorBoundary>
     <div className="min-h-screen bg-gray-100">
       {/* Orange Top Bar */}
       <div className="bg-orange-500 h-1"></div>

       {/* Government Header */}
       <header className="bg-white shadow-sm">
         <div className="container mx-auto px-4 py-4 flex justify-between items-center">
           <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
               <img src={profileImg} alt="Profile" />
             </div>
             <div>
               <h1 className="text-lg font-bold text-gray-800"></h1>
               <h2 className="text-lg font-bold text-gray-800">Indian Army</h2>
               <p className="text-sm text-gray-600"></p>
               <p className="text-sm text-blue-600 font-medium">Drone Management Portal - Flight History</p>
             </div>
           </div>

           <div className="flex items-center gap-4">
             <div className="flex flex-col items-end gap-1">
               <div className="flex items-center gap-2 text-sm text-gray-600">
                 <User className="h-4 w-4" />
                 <span>Operator: {user?.username || 'N/A'}</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-gray-600">
                 <Shield className="h-4 h-4" />
                 <span>Unit: {user?.unit || 'Not specified'}</span>
               </div>
               <div className="flex items-center gap-2 text-sm text-gray-600">
                 <Database className="h-4 w-4" />
                 <span>Total Missions: {myFlights.length}</span>
               </div>
             </div>
             <Button
               variant="outline"
               onClick={logout}
               className="border-red-300 text-red-600 hover:bg-red-50"
             >
               <LogOut className="w-4 h-4 mr-2" />
               LOGOUT
             </Button>
             <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
               <img src={logo} alt="Profile" />
             </div>
           </div>
         </div>
       </header>

       {/* Navigation Bar */}
       <nav className="bg-slate-800 text-white">
         <div className="container mx-auto px-4 flex justify-between items-center">
           <div className="flex space-x-8">
             <a href="/" className="py-3 px-2 text-sm hover:bg-slate-700">Mission Planning</a>
             <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700 bg-slate-700">Flight History</a>
             <a href="Airspace" className="py-3 px-2 text-sm hover:bg-slate-700">Airspace Status</a>
             <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">Documentation</a>
             <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">Support</a>
           </div>
           <div className="text-xs text-gray-300">
             Last Updated: {new Date().toLocaleDateString('en-IN')}
           </div>
         </div>
       </nav>

       {/* Main Content */}
       <div className="container mx-auto p-4">
         <div className="mb-6">
           <div className="flex items-center justify-between">
             <div>
               <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                 <FileText className="w-8 h-8 text-blue-600" />
                 Flight History & Mission Records
               </h1>
               <p className="text-gray-600 mt-1">Complete history of your drone missions and operations</p>
             </div>
             <div className="flex items-center gap-3">
               <Button
                 variant="outline"
                 onClick={loadMyFlights}
                 className="border-blue-300 text-blue-600 hover:bg-blue-50"
                 disabled={loading}
               >
                 <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                 Refresh
               </Button>
               <Button
                 variant="outline"
                 className="border-green-300 text-green-600 hover:bg-green-50"
               >
                 <Download className="w-4 h-4 mr-2" />
                 Export
               </Button>
             </div>
           </div>
         </div>

         {/* Filters Section */}
         <Card className="mb-6 border-gray-300 shadow-sm">
           <CardHeader className="bg-gray-50 rounded-t-lg">
             <CardTitle className="flex items-center space-x-2 text-gray-800">
               <Filter className="w-5 h-5 text-blue-600" />
               <span>Filter & Search Options</span>
               <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-300">
                 {filteredFlights.length} / {myFlights.length}
               </Badge>
             </CardTitle>
           </CardHeader>
           <CardContent className="p-4 bg-white">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
               <div>
                 <label className="text-sm font-semibold mb-2 block text-gray-700">Search</label>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                   <Input
                     placeholder="Search missions..."
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500"
                   />
                 </div>
               </div>

               <div>
                 <label className="text-sm font-semibold mb-2 block text-gray-700">Status</label>
                 <Select value={statusFilter} onValueChange={setStatusFilter}>
                   <SelectTrigger className="bg-gray-50 border-gray-300 focus:border-blue-500">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Status</SelectItem>
                     <SelectItem value="planned">Planned</SelectItem>
                     <SelectItem value="active">Active</SelectItem>
                     <SelectItem value="completed">Completed</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div>
                 <label className="text-sm font-semibold mb-2 block text-gray-700">Command</label>
                 <Select value={commandFilter} onValueChange={setCommandFilter}>
                   <SelectTrigger className="bg-gray-50 border-gray-300 focus:border-blue-500">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Commands</SelectItem>
                     {COMMANDS.map(cmd => (
                       <SelectItem key={cmd.name} value={cmd.name}>{cmd.name}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>

               <div>
                 <label className="text-sm font-semibold mb-2 block text-gray-700">Date Range</label>
                 <Select value={dateFilter} onValueChange={setDateFilter}>
                   <SelectTrigger className="bg-gray-50 border-gray-300 focus:border-blue-500">
                     <SelectValue />
                   </SelectTrigger>
                   <SelectContent>
                     <SelectItem value="all">All Time</SelectItem>
                     <SelectItem value="today">Today</SelectItem>
                     <SelectItem value="week">Last Week</SelectItem>
                     <SelectItem value="month">Last Month</SelectItem>
                   </SelectContent>
                 </Select>
               </div>

               <div>
                 <label className="text-sm font-semibold mb-2 block text-gray-700">&nbsp;</label>
                 <Button
                   variant="outline"
                   onClick={clearAllFilters}
                   className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                 >
                   <X className="w-4 h-4 mr-2" />
                   Clear All
                 </Button>
               </div>
             </div>
           </CardContent>
         </Card>

         {/* Mission History Cards */}
         <div className="space-y-4">
           {loading ? (
             <div className="text-center py-12">
               <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
               <p className="text-gray-600">Loading flight history...</p>
             </div>
           ) : filteredFlights.length > 0 ? (
             filteredFlights.map(flight => (
               <ErrorBoundary key={flight.id}>
                 <Card className="border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                   <CardContent className="p-0">
                     <div
                       className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                       onClick={() => toggleCardExpansion(flight.id)}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex-1">
                           <div className="flex items-center space-x-3 mb-2">
                             <div className="font-semibold text-gray-800 text-lg">
                               {flight.drone_model || 'N/A'}
                             </div>
                             <Badge className={`text-xs ${getStatusBadgeClass(flight.status)}`}>
                               {(flight.status || 'unknown').toUpperCase()}
                             </Badge>
                             {flight.cancel_requested && (
                               <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-300 text-xs">
                                 Cancel Requested
                               </Badge>
                             )}
                           </div>

                           <div className="flex items-center space-x-6 text-sm text-gray-600">
                             <div className="flex items-center space-x-1">
                               <Clock className="w-4 h-4" />
                               <span>{safeDateFormat(flight.start, 'date')}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <MapPin className="w-4 h-4" />
                               <span>{flight.command_name || 'N/A'}</span>
                             </div>
                             <div className="flex items-center space-x-1">
                               <Target className="w-4 h-4" />
                               <span>{flight.purpose || 'N/A'}</span>
                             </div>
                           </div>
                         </div>

                         <div className="flex items-center space-x-2">
                           <Button
                             variant="ghost"
                             size="sm"
                             className="text-blue-600 hover:bg-blue-100"
                           >
                             <Eye className="w-4 h-4 mr-1" />
                             {expandedCards.has(flight.id) ? 'Less' : 'More'}
                           </Button>
                           {expandedCards.has(flight.id) ? (
                             <ChevronUp className="w-5 h-5 text-gray-400" />
                           ) : (
                             <ChevronDown className="w-5 h-5 text-gray-400" />
                           )}
                         </div>
                       </div>
                     </div>

                     {/* Expanded Content */}
                     {expandedCards.has(flight.id) && (
                       <div className="border-t border-gray-200 bg-gray-50 p-6">
                         {editingMission === flight.id ? (
                           <div className="space-y-4 bg-blue-50 p-6 rounded-lg">
                             <div className="flex items-center justify-between mb-4">
                               <h3 className="text-lg font-semibold text-blue-800">Edit Mission Details</h3>
                               <Badge className="bg-blue-100 text-blue-800">Editing Mode</Badge>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <label className="text-sm font-semibold text-gray-700 mb-2 block">Drone Model</label>
                                 <Input
                                   value={editForm.drone_model}
                                   onChange={e => setEditForm({ ...editForm, drone_model: e.target.value })}
                                   className="bg-white border-gray-300"
                                 />
                               </div>
                               <div>
                                 <label className="text-sm font-semibold text-gray-700 mb-2 block">Command Center</label>
                                 <Select
                                   value={editForm.command_name}
                                   onValueChange={value => setEditForm({ ...editForm, command_name: value })}
                                 >
                                   <SelectTrigger className="bg-white border-gray-300">
                                     <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent>
                                     {COMMANDS.map(c => (
                                       <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                                     ))}
                                   </SelectContent>
                                 </Select>
                               </div>
                             </div>

                             <div>
                               <label className="text-sm font-semibold text-gray-700 mb-2 block">Mission Purpose</label>
                               <Input
                                 value={editForm.purpose}
                                 onChange={e => setEditForm({ ...editForm, purpose: e.target.value })}
                                 className="bg-white border-gray-300"
                               />
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <div>
                                 <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Time</label>
                                 <Input
                                   type="datetime-local"
                                   value={editForm.start}
                                   onChange={e => setEditForm({ ...editForm, start: e.target.value })}
                                   className="bg-white border-gray-300"
                                 />
                               </div>
                               <div>
                                 <label className="text-sm font-semibold text-gray-700 mb-2 block">End Time</label>
                                 <Input
                                   type="datetime-local"
                                   value={editForm.end}
                                   onChange={e => setEditForm({ ...editForm, end: e.target.value })}
                                   className="bg-white border-gray-300"
                                 />
                               </div>
                             </div>

                             <div className="flex justify-end space-x-3 pt-4 border-t border-blue-200">
                               <Button
                                 variant="outline"
                                 onClick={cancelEditMission}
                                 className="border-gray-300 text-gray-600 hover:bg-gray-50"
                               >
                                 <X className="w-4 h-4 mr-1" />
                                 Cancel
                               </Button>
                               <Button
                                 onClick={() => saveEditMission(flight.id)}
                                 className="bg-green-600 hover:bg-green-700 text-white"
                               >
                                 <Save className="w-4 h-4 mr-1" />
                                 Save Changes
                               </Button>
                             </div>
                           </div>
                         ) : (
                           <div className="space-y-6">
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                               {/* Card 1: Drone Details */}
                               <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                 <div className="flex items-center space-x-2 mb-4">
                                   <Settings className="w-5 h-5 text-blue-600" />
                                   <span className="font-semibold text-gray-800">Drone Details</span>
                                 </div>
                                 <div className="space-y-3 text-sm">
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Model:</span>
                                     <span className="font-medium text-gray-800">{flight.drone_model || 'N/A'}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Class:</span>
                                     <span className="font-medium text-gray-800">{flight.drone_class || 'N/A'}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Frequency:</span>
                                     <span className="font-medium text-gray-800">{flight.frequency || 0} MHz</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Clock Drift:</span>
                                     <span className="font-medium text-gray-800">{flight.clockDrift || 0} PPM</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Spectral Leakage:</span>
                                     <span className="font-medium text-gray-800">{flight.spectralLeakage || 0} MHz</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Modular Shape ID:</span>
                                     <span className="font-medium text-gray-800">{flight.modularshapeId || 0}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Mission ID:</span>
                                     <span className="font-medium text-gray-800 text-xs">{String(flight.id).substring(0, 8)}...</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Purpose:</span>
                                     <span className="font-medium text-gray-800 text-right max-w-32 truncate" title={flight.purpose || ''}>
                                       {flight.purpose || 'N/A'}
                                     </span>
                                   </div>
                                 </div>
                               </div>

                               {/* Card 2: User Information */}
                               <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                 <div className="flex items-center space-x-2 mb-4">
                                   <User className="w-5 h-5 text-green-600" />
                                   <span className="font-semibold text-gray-800">User Information</span>
                                 </div>
                                 <div className="space-y-3 text-sm">
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Operator:</span>
                                     <span className="font-medium text-gray-800">{user?.username || 'N/A'}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Unit:</span>
                                     <span className="font-medium text-gray-800 text-right max-w-32 truncate" title={user?.unit || ''}>
                                       {user?.unit || 'N/A'}
                                     </span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Command:</span>
                                     <span className="font-medium text-gray-800">{flight.command_name || 'N/A'}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Role:</span>
                                     <span className="font-medium text-gray-800">{user?.role || 'OPERATOR'}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Status:</span>
                                     <Badge className={`text-xs ${getStatusBadgeClass(flight.status)}`}>
                                       {(flight.status || 'unknown').toUpperCase()}
                                     </Badge>
                                   </div>
                                 </div>
                               </div>

                               {/* Card 3: Timing & Waypoints */}
                               <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                                 <div className="flex items-center space-x-2 mb-4">
                                   <Map className="w-5 h-5 text-purple-600" />
                                   <span className="font-semibold text-gray-800">Timing & Waypoints</span>
                                 </div>
                                 <div className="space-y-3 text-sm">
                                   <div>
                                     <span className="text-gray-600 block mb-1">Start Time:</span>
                                     <span className="font-medium text-gray-800 text-xs">{safeDateFormat(flight.start)}</span>
                                   </div>
                                   <div>
                                     <span className="text-gray-600 block mb-1">End Time:</span>
                                     <span className="font-medium text-gray-800 text-xs">{safeDateFormat(flight.end)}</span>
                                   </div>
                                   <div className="flex justify-between">
                                     <span className="text-gray-600">Duration:</span>
                                     <span className="font-medium text-gray-800">{calculateDuration(flight.start, flight.end)}</span>
                                   </div>
                                   <div className="pt-2 border-t border-gray-100">
                                     <div className="flex justify-between items-center">
                                       <span className="text-gray-600">Waypoints:</span>
                                       <span className="font-medium text-gray-800">{waypoints[flight.id]?.length || 0} points</span>
                                     </div>
                                     {waypoints[flight.id]?.length > 0 && (
                                       <div className="mt-2 space-y-1 max-h-20 overflow-y-auto">
                                         {waypoints[flight.id].slice(0, 2).map((wp, idx) => (
                                           <div key={idx} className="text-xs text-gray-500 bg-gray-50 p-1 rounded">
                                             WP{idx + 1}: {(parseFloat(wp.lat) || 0).toFixed(4)}, {(parseFloat(wp.lng) || 0).toFixed(4)} ({wp.elev || 0}m)
                                           </div>
                                         ))}
                                         {waypoints[flight.id].length > 2 && (
                                           <div className="text-xs text-blue-600">
                                             +{waypoints[flight.id].length - 2} more waypoints
                                           </div>
                                         )}
                                       </div>
                                     )}
                                   </div>
                                 </div>
                               </div>
                             </div>

                             <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                               <div className="flex items-center space-x-2 text-sm text-gray-500">
                                 <Calendar className="w-4 h-4" />
                                 <span>Created: {safeDateFormat(flight.start, 'date')}</span>
                               </div>

                               <div className="flex space-x-3">
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   onClick={() => openMapModal(flight)}
                                   className="border-green-300 text-green-600 hover:bg-green-50"
                                 >
                                   <Map className="w-4 h-4 mr-1" />
                                   View Route
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   disabled={!canEditMission(flight)}
                                   onClick={() => startEditMission(flight)}
                                   className={`${canEditMission(flight)
                                     ? 'border-blue-300 text-blue-600 hover:bg-blue-50'
                                     : 'border-gray-200 text-gray-400 cursor-not-allowed'
                                   }`}
                                   title={
                                     !canEditMission(flight)
                                       ? `Cannot edit: ${flight.status === 'completed' ? 'Mission completed' :
                                           flight.status === 'active' ? 'Mission is active' :
                                           flight.cancel_requested ? 'Cancel requested' :
                                           new Date(flight.start) <= new Date() ? 'Mission has started' : 'Missing required details'
                                         }`
                                       : 'Edit mission details'
                                   }
                                 >
                                   <Edit className="w-4 h-4 mr-1" />
                                   Edit Mission
                                 </Button>
                                 <Button
                                   variant="outline"
                                   size="sm"
                                   disabled={flight.cancel_requested || ['completed', 'active'].includes(flight.status)}
                                   onClick={() => requestCancel(flight.id)}
                                   className={`${flight.cancel_requested || ['completed', 'active'].includes(flight.status)
                                     ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                     : 'border-red-300 text-red-600 hover:bg-red-50'
                                   }`}
                                   title={
                                     flight.cancel_requested ? 'Cancel request pending' :
                                     flight.status === 'completed' ? 'Cannot cancel completed mission' :
                                     flight.status === 'active' ? 'Cannot cancel active mission' :
                                     'Request mission cancellation'
                                   }
                                 >
                                   <AlertTriangle className="w-4 h-4 mr-1" />
                                   {flight.cancel_requested ? 'Cancel Pending' : 'Request Cancel'}
                                 </Button>
                               </div>
                             </div>
                           </div>
                         )}
                       </div>
                     )}
                   </CardContent>
                 </Card>
               </ErrorBoundary>
             ))
           ) : (
             <Card className="border-gray-300 shadow-sm">
               <CardContent className="text-center py-12">
                 <Plane className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                 <h3 className="text-lg font-medium text-gray-500 mb-2">
                   {myFlights.length === 0 ? 'No missions found' : 'No missions match your filters'}
                 </h3>
                 <p className="text-sm text-gray-400 mb-4">
                   {myFlights.length === 0
                     ? 'Your submitted flight plans will appear here'
                     : 'Try adjusting your search criteria or filters'
                   }
                 </p>
                 {myFlights.length > 0 && (
                   <Button
                     variant="outline"
                     onClick={clearAllFilters}
                     className="border-blue-300 text-blue-600 hover:bg-blue-50"
                   >
                     <X className="w-4 h-4 mr-2" />
                     Clear All Filters
                   </Button>
                 )}
               </CardContent>
             </Card>
           )}
         </div>

         {/* Summary Statistics */}
         {myFlights.length > 0 && (
           <Card className="mt-6 border-gray-300 shadow-sm">
             <CardHeader className="bg-gray-50 rounded-t-lg">
               <CardTitle className="flex items-center space-x-2 text-gray-800">
                 <Activity className="w-5 h-5 text-blue-600" />
                 <span>Mission Statistics</span>
               </CardTitle>
             </CardHeader>
             <CardContent className="p-6 bg-white">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {['planned', 'active', 'completed'].map(status => {
                   const count = myFlights.filter(f => f.status === status).length;
                   return (
                     <div key={status} className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                       <div className="text-2xl font-bold text-gray-800">{count}</div>
                       <div className={`text-sm font-medium capitalize ${status === 'active' ? 'text-blue-600' :
                         status === 'completed' ? 'text-green-600' :
                         status === 'planned' ? 'text-purple-600' : 'text-gray-600'
                       }`}>
                         {status}
                       </div>
                     </div>
                   );
                 })}
               </div>
             </CardContent>
           </Card>
         )}
       </div>

       {/* Map Modal */}
       <MapModal
         isOpen={mapModalOpen}
         onClose={() => setMapModalOpen(false)}
         waypoints={selectedFlightWaypoints}
         flightDetails={selectedFlightDetails}
       />

       {/* Government Footer */}
       <footer className="bg-slate-900 text-white py-6 px-4 mt-8">
         <div className="container mx-auto">
           <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
               <Plane className="h-6 w-6 text-orange-400" />
               <div>
                 <div className="text-sm font-semibold">Drone Management System</div>
                 <div className="text-xs text-gray-400">Ministry of Civil Aviation, Government of India</div>
               </div>
             </div>
             <div className="text-right">
               <div className="flex items-center gap-2 text-xs text-gray-400">
                 <Globe className="h-4 w-4" />
                 <span>Version 2.1.0 | Build: DMS-2025</span>
               </div>
               <div className="text-xs text-gray-500 mt-1">
                 © 2025 All Rights Reserved | Designed & Maintained by NIC
               </div>
             </div>
           </div>
         </div>
       </footer>
     </div>
   </ErrorBoundary>
 );
};

export default FlightHistory;

