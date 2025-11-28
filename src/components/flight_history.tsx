import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { dbManager, User, DroneSpec } from '@/lib/database';
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
import {
  Plane,
  User as UserIcon,
  Shield,
  LogOut,
  Search,
  Filter,
  Download,
  RefreshCw,
  Globe,
  Database,
  Radio,
  Camera,
  Navigation,
  Settings,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Calendar,
  MapPin,
  Activity,
  Gauge,
  Wifi,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  FileText,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface DroneRegistrationData extends DroneSpec {
  username: string;
  userUnit: string;
  userRole: string;
  userCommandName?: string;
  userDivisionName?: string;
  userBrigadeName?: string;
  userCorpsName?: string;
  userCreatedAt?: string;
}

const DroneRegistrationManagement = () => {
  const { user, logout } = useAuth();
  
  // State management
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allDroneSpecs, setAllDroneSpecs] = useState<DroneRegistrationData[]>([]);
  const [filteredData, setFilteredData] = useState<DroneRegistrationData[]>([]);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [commandFilter, setCommandFilter] = useState('all');
  const [droneModelFilter, setDroneModelFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Unique values for filters
  const [uniqueCommands, setUniqueCommands] = useState<string[]>([]);
  const [uniqueModels, setUniqueModels] = useState<string[]>([]);

  // Load all registration data
  const loadRegistrationData = async () => {
    setLoading(true);
    try {
      await dbManager.initialize();
      
      // Get all users
      const users = dbManager.getAllUsers();
      setAllUsers(users);
      
      // Get all drone specs with user information
      const droneSpecs = dbManager.getAllDroneSpecs();
      
      // Enhance drone specs with additional user details
      const enhancedSpecs = droneSpecs.map(spec => {
        const specUser = users.find(u => u.id === spec.user_id);
        return {
          ...spec,
          userRole: specUser?.role || 'UNKNOWN',
          userCommandName: specUser?.commandName || 'N/A',
          userDivisionName: specUser?.divisionName || 'N/A',
          userBrigadeName: specUser?.brigadeName || 'N/A',
          userCorpsName: specUser?.corpsName || 'N/A',
          userCreatedAt: specUser?.createdAt || 'N/A'
        };
      });
      
      setAllDroneSpecs(enhancedSpecs);
      setFilteredData(enhancedSpecs);
      
      // Extract unique values for filters
      const commands = [...new Set(enhancedSpecs.map(spec => spec.userCommandName).filter(Boolean))];
      const models = [...new Set(enhancedSpecs.map(spec => spec.droneName).filter(Boolean))];
      
      setUniqueCommands(commands);
      setUniqueModels(models);
      
    } catch (error) {
      console.error('Failed to load registration data:', error);
      toast.error('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && (user.role === 'ADMINISTRATOR' || user.role === 'CONTROLLER')) {
      loadRegistrationData();
    }
  }, [user]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allDroneSpecs];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(spec =>
        spec.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.droneName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.userUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.droneIds.some(id => id.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(spec => spec.userRole === roleFilter);
    }

    // Command filter
    if (commandFilter !== 'all') {
      filtered = filtered.filter(spec => spec.userCommandName === commandFilter);
    }

    // Drone model filter
    if (droneModelFilter !== 'all') {
      filtered = filtered.filter(spec => spec.droneName === droneModelFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          filtered = filtered.filter(spec => {
            const specDate = new Date(spec.createdAt);
            return specDate.toDateString() === now.toDateString();
          });
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(spec => new Date(spec.createdAt) >= weekAgo);
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter(spec => new Date(spec.createdAt) >= monthAgo);
          break;
      }
    }

    setFilteredData(filtered);
  }, [allDroneSpecs, searchTerm, roleFilter, commandFilter, droneModelFilter, dateFilter]);

  // Toggle card expansion
  const toggleCardExpansion = (specId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(specId)) {
      newExpanded.delete(specId);
    } else {
      newExpanded.add(specId);
    }
    setExpandedCards(newExpanded);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setCommandFilter('all');
    setDroneModelFilter('all');
    setDateFilter('all');
    setStatusFilter('all');
  };

  // Get role badge styling
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'ADMINISTRATOR': return 'bg-red-100 text-red-800 border-red-300';
      case 'CONTROLLER': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'OPERATOR': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Check authorization
  if (!user || (user.role !== 'ADMINISTRATOR' && user.role !== 'CONTROLLER')) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-96 shadow-lg">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600">This page is restricted to administrators and controllers only.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Orange Top Bar */}
      <div className="bg-orange-500 h-1"></div>

      {/* Government Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Left - Logo + Titles */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <img src={profileImg} alt="Profile" className="w-12 h-12" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">रक्षा मंत्रालय</h1>
              <h2 className="text-lg font-bold text-gray-800">Ministry of Defence</h2>
              <p className="text-sm text-gray-600">Indian Army</p>
              <p className="text-sm text-blue-600 font-medium">
                Drone Registration Management Portal
              </p>
            </div>
          </div>

          {/* Right - User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>{user.role}: {user.username}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Database className="h-4 w-4" />
                <span>Total Registrations: {filteredData.length}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>Active Users: {allUsers.length}</span>
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
          </div>
        </div>
      </header>

      {/* Navigation Bar */}
      <nav className="bg-slate-800 text-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-8">
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              User Management
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700 bg-slate-700">
              Drone Registrations
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Flight Operations
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              System Logs
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Reports
            </a>
          </div>
          <div className="text-xs text-gray-300">
            Last Updated: {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-4">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
         
                Drone Registration Management
              </h1>
              <p className="text-gray-600 mt-1">
                Complete overview of all registered drones and operator details
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={loadRegistrationData}
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
                Export Data
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <Card className="mb-6 border-gray-300 shadow-sm">
          <CardHeader className="bg-gray-50 rounded-t-lg">
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Filter className="w-5 h-5 text-blue-600" />
              <span>Search & Filter Options</span>
              <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-600 border-blue-300">
                {filteredData.length} / {allDroneSpecs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Search */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users, drones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Role</label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ADMINISTRATOR">Administrator</SelectItem>
                    <SelectItem value="CONTROLLER">Controller</SelectItem>
                    <SelectItem value="OPERATOR">Operator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Command Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Command</label>
                <Select value={commandFilter} onValueChange={setCommandFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Commands</SelectItem>
                    {uniqueCommands.map(cmd => (
                      <SelectItem key={cmd} value={cmd}>{cmd}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Drone Model Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Drone Model</label>
                <Select value={droneModelFilter} onValueChange={setDroneModelFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Models</SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>{model}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">Registration Date</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-gray-50 border-gray-300">
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

              {/* Clear Filters */}
              <div>
                <label className="text-sm font-semibold mb-2 block text-gray-700">&nbsp;</label>
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Registration Data Cards */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <RefreshCw className="w-8 h-8 mx-auto mb-4 text-blue-600 animate-spin" />
              <p className="text-gray-600">Loading registration data...</p>
            </div>
          ) : filteredData.length > 0 ? (
            filteredData.map(spec => (
              <Card key={spec.id} className="border-gray-300 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Card Header */}
                  <div
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleCardExpansion(spec.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="font-semibold text-gray-800 text-lg">
                            {spec.droneName}
                          </div>
                          <Badge className={`text-xs ${getRoleBadgeClass(spec.userRole)}`}>
                            {spec.userRole}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-300 text-xs">
                            QTY: {spec.quantity}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <UserIcon className="w-4 h-4" />
                            <span>{spec.username}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{spec.userUnit}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Radio className="w-4 h-4" />
                            <span>{spec.frequency} MHz</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(spec.createdAt).toLocaleDateString('en-IN')}</span>
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
                          {expandedCards.has(spec.id) ? 'Less' : 'Details'}
                        </Button>
                        {expandedCards.has(spec.id) ?
                          <ChevronUp className="w-5 h-5 text-gray-400" /> :
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedCards.has(spec.id) && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="p-6 space-y-6">
                        {/* Four Card Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
                          
                          {/* Card 1: User Information */}
                          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                              <UserIcon className="w-5 h-5 text-green-600" />
                              <span className="font-semibold text-gray-800">User Information</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Username:</span>
                                <span className="font-medium text-gray-800">{spec.username}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Role:</span>
                                <Badge className={`text-xs ${getRoleBadgeClass(spec.userRole)}`}>
                                  {spec.userRole}
                                </Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Unit:</span>
                                <span className="font-medium text-gray-800 text-right max-w-20 truncate" title={spec.userUnit}>
                                  {spec.userUnit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Command:</span>
                                <span className="font-medium text-gray-800 text-right max-w-20 truncate" title={spec.userCommandName}>
                                  {spec.userCommandName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Division:</span>
                                <span className="font-medium text-gray-800 text-right max-w-20 truncate" title={spec.userDivisionName}>
                                  {spec.userDivisionName}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Registered:</span>
                                <span className="font-medium text-gray-800 text-xs">
                                  {new Date(spec.userCreatedAt).toLocaleDateString('en-IN')}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card 2: Drone Specifications */}
                          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                              <Settings className="w-5 h-5 text-blue-600" />
                              <span className="font-semibold text-gray-800">Drone Specifications</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Model:</span>
                                <span className="font-medium text-gray-800">{spec.droneName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Quantity:</span>
                                <span className="font-medium text-gray-800">{spec.quantity}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Max Height:</span>
                                <span className="font-medium text-gray-800">{spec.maxHeight}m</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Max Speed:</span>
                                <span className="font-medium text-gray-800">{spec.maxSpeed} km/h</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Max Range:</span>
                                <span className="font-medium text-gray-800">{spec.maxRange} km</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Duration:</span>
                                <span className="font-medium text-gray-800">{spec.maxDuration} min</span>
                              </div>
                            </div>
                          </div>

                          {/* Card 3: Technical Parameters */}
                          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                              <Radio className="w-5 h-5 text-purple-600" />
                              <span className="font-semibold text-gray-800">Technical Parameters</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Frequency:</span>
                                <span className="font-medium text-gray-800">{spec.frequency} MHz</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Clock Drift:</span>
                                <span className="font-medium text-gray-800">{spec.clockDrift} PPM</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Spectral Leakage:</span>
                                <span className="font-medium text-gray-800">{spec.spectralLeakage} MHz</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Modular Shape ID:</span>
                                <span className="font-medium text-gray-800">{spec.modularshapeId}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Operating Freq:</span>
                                <span className="font-medium text-gray-800 text-right max-w-24 truncate" title={spec.operatingFrequency}>
                                  {spec.operatingFrequency || 'N/A'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Camera Resolution:</span>
                                <span className="font-medium text-gray-800 text-right max-w-24 truncate" title={spec.cameraResolution}>
                                  {spec.cameraResolution || 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card 4: Capabilities & IDs */}
                          <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                            <div className="flex items-center space-x-2 mb-4">
                              <Activity className="w-5 h-5 text-orange-600" />
                              <span className="font-semibold text-gray-800">Capabilities & IDs</span>
                            </div>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">GPS Enabled:</span>
                                {spec.gpsEnabled === 'yes' ? 
                                  <CheckCircle className="w-4 h-4 text-green-500" /> :
                                  <XCircle className="w-4 h-4 text-red-500" />
                                }
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Autonomous:</span>
                                {spec.autonomous === 'yes' ? 
                                  <CheckCircle className="w-4 h-4 text-green-500" /> :
                                  <XCircle className="w-4 h-4 text-red-500" />
                                }
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Controlled:</span>
                                {spec.controlled === 'yes' ? 
                                  <CheckCircle className="w-4 h-4 text-green-500" /> :
                                  <XCircle className="w-4 h-4 text-red-500" />
                                }
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">Camera:</span>
                                {spec.cameraEnabled === 'yes' ? 
                                  <CheckCircle className="w-4 h-4 text-green-500" /> :
                                  <XCircle className="w-4 h-4 text-red-500" />
                                }
                              </div>
                              <div className="pt-2 border-t border-gray-100">
                                <span className="text-gray-600 block mb-2">Drone IDs:</span>
                                <div className="space-y-1 max-h-20 overflow-y-auto">
                                  {spec.droneIds.slice(0, 3).map((droneId, idx) => (
                                    <div key={idx} className="text-xs bg-gray-50 p-1 rounded font-mono">
                                      {droneId}
                                    </div>
                                  ))}
                                  {spec.droneIds.length > 3 && (
                                    <div className="text-xs text-blue-600">
                                      +{spec.droneIds.length - 3} more IDs
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Registered: {new Date(spec.createdAt).toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="w-4 h-4" />
                              <span>ID: {spec.id.substring(0, 8)}...</span>
                            </div>
                          </div>
                          
                          <div className="flex space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-300 text-green-600 hover:bg-green-50"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                            >
                              <AlertTriangle className="w-4 h-4 mr-1" />
                              Flag
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Full Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-gray-300 shadow-sm">
              <CardContent className="text-center py-12">
                
                <h3 className="text-lg font-medium text-gray-500 mb-2">
                  {allDroneSpecs.length === 0 ? 'No drone registrations found' : 'No registrations match your filters'}
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  {allDroneSpecs.length === 0
                    ? 'Registered drones will appear here once users submit their registrations'
                    : 'Try adjusting your search criteria or filters'
                  }
                </p>
                {allDroneSpecs.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="border-blue-300 text-blue-600 hover:bg-blue-50"
                  >
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Summary Statistics */}
        {allDroneSpecs.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-gray-300 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{allUsers.length}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </CardContent>
            </Card>

            <Card className="border-gray-300 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
               
                </div>
                <div className="text-2xl font-bold text-gray-800">{allDroneSpecs.length}</div>
                <div className="text-sm text-gray-600">Drone Registrations</div>
              </CardContent>
            </Card>

            <Card className="border-gray-300 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">
                  {allDroneSpecs.reduce((sum, spec) => sum + spec.quantity, 0)}
                </div>
                <div className="text-sm text-gray-600">Total Drones</div>
              </CardContent>
            </Card>

            <Card className="border-gray-300 shadow-sm">
              <CardContent className="p-6 text-center">
                <div className="flex items-center justify-center mb-2">
                  <MapPin className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-gray-800">{uniqueCommands.length}</div>
                <div className="text-sm text-gray-600">Active Commands</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity */}
        {allDroneSpecs.length > 0 && (
          <Card className="mt-6 border-gray-300 shadow-sm">
            <CardHeader className="bg-gray-50 rounded-t-lg">
              <CardTitle className="flex items-center space-x-2 text-gray-800">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Recent Registrations</span>
                <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-300">
                  Last 7 Days
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 bg-white">
              <div className="space-y-3">
                {allDroneSpecs
                  .filter(spec => {
                    const specDate = new Date(spec.createdAt);
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    return specDate >= weekAgo;
                  })
                  .slice(0, 5)
                  .map(spec => (
                    <div key={spec.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          spec.userRole === 'ADMINISTRATOR' ? 'bg-red-500' :
                          spec.userRole === 'CONTROLLER' ? 'bg-blue-500' :
                          'bg-green-500'
                        }`}></div>
                        <div>
                          <span className="font-medium text-gray-800">{spec.username}</span>
                          <span className="text-gray-500 text-sm"> registered </span>
                          <span className="font-medium text-gray-800">{spec.droneName}</span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(spec.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </div>
                  ))}
                {allDroneSpecs.filter(spec => {
                  const specDate = new Date(spec.createdAt);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return specDate >= weekAgo;
                }).length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    No registrations in the last 7 days
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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
  );
};

export default DroneRegistrationManagement;