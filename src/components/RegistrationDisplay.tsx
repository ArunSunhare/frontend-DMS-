import React, { useState, useEffect, Component, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import profileImg from '../assets/logo.png';
import {
  Shield,
  User,
  Plane,
  MapPin,
  Settings,
  Search,
  Download,
  Eye,
  Users,
  Database,
  RefreshCw,
  LogOut,
} from 'lucide-react';
import { Alert, AlertDescription } from '../components/ui/alert';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/Logo1.png';
import HeaderNav from './Admin_Header&Nav/Header&Nav';

const CACHE_KEY = 'registration_data_cache';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1 hour in ms

// Error Boundary Component
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="dark:bg-red-900 dark:border-red-700">
          <AlertDescription className="dark:text-red-200">
            Something went wrong: {this.state.error?.message || 'Unknown error'}. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      );
    }
    return this.props.children;
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function RegistrationDisplay() {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const ITEMS_PER_PAGE = 20; // Adjustable based on performance

  useEffect(() => {
    console.log('User object:', user); // Debug: Log user object
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode, user]);

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

  // Temporary bypass for testing (remove after fixing auth)
  const isAuthorized = true; // Set to true for now, replace with actual check later
  // const isAuthorized = user?.role && ['ADMINISTRATOR', 'CONTROLLER'].includes(user.role);

  const getCachedData = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > CACHE_EXPIRY) {
        localStorage.removeItem(CACHE_KEY);
        return null;
      }
      return data;
    } catch (err) {
      console.error('Cache read error:', err);
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
  }, []);

  const setCachedData = useCallback((data) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (err) {
      console.error('Cache write error:', err);
    }
  }, []);

  const fetchData = async (forceRefresh = false) => {
    if (!isAuthorized) {
      setError('Unauthorized access. Admin or Controller role required.');
      setLoading(false);
      return;
    }

    if (!forceRefresh) {
      const cachedData = getCachedData();
      if (cachedData) {
        setUsers(cachedData);
        setLoading(false);
        toast.info('Loaded from cache');
        return;
      }
    }

    setLoading(true);
    setError(null);
    try {
      const [usersData, allDroneSpecsData] = await Promise.all([
        apiService.getAllUsers(),
        apiService.getAllDroneSpecs(), // Assuming this exists; fetches all at once for optimization
      ]);

      if (!Array.isArray(usersData)) {
        throw new Error('Invalid users data received from API');
      }

      if (!Array.isArray(allDroneSpecsData)) {
        throw new Error('Invalid drone specs data received from API');
      }

      // Map drone specs to users efficiently
      const droneMap = new Map(allDroneSpecsData.map(spec => [spec.user_id, spec]));
      const usersWithDrones = usersData
        .filter(user => user?.role === 'OPERATOR')
        .map(user => ({
          ...user,
          droneSpecs: [droneMap.get(user.id)].filter(Boolean), // Assuming one spec per user; adjust if multiple
        }));

      setUsers(usersWithDrones);
      setCachedData(usersWithDrones);

      toast.success('Data loaded successfully');
    } catch (error) {
      console.error('Error fetching registration data:', error);
      setError('Failed to load registration data. Please try again later.');
      toast.error('Failed to load registration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    } else {
      setError('User not authenticated');
      setLoading(false);
    }
  }, [user]);

  const refreshData = async () => {
    if (!isAuthorized) {
      toast.error('Unauthorized action');
      return;
    }
    localStorage.removeItem(CACHE_KEY); // Invalidate cache on manual refresh
    setCurrentPage(1);
    await fetchData(true);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      [
        user?.username?.toLowerCase(),
        user?.unit?.toLowerCase(),
        user?.commandName?.toLowerCase(),
      ].some((field) => field?.includes(searchTerm.toLowerCase()))
    );
  }, [users, searchTerm]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = useMemo(() => Math.ceil(filteredUsers.length / ITEMS_PER_PAGE), [filteredUsers.length]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setSelectedUser(null); // Reset selection on page change
  }, []);

  const pieData = useMemo(() => {
    const operatorCommandCounts = users.reduce((acc, user) => {
      const command = user?.commandName || 'Unknown Command';
      acc[command] = (acc[command] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(operatorCommandCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [users]);

  const totalDrones = useMemo(() => {
    return users.reduce((acc, user) => acc + (user?.droneSpecs?.reduce((droneAcc, spec) => droneAcc + (spec?.quantity || 0), 0) || 0), 0);
  }, [users]);

  const totalCommands = useMemo(() => {
    return new Set(users.map((user) => user?.commandName)).size;
  }, [users]);

  const exportToPDF = useCallback(() => {
    try {
      const doc = new jsPDF();
     
      doc.setFontSize(18);
      doc.text('Drone Management System', 20, 20);
      doc.setFontSize(14);
      doc.text('Drone Operator Registration Data', 20, 30);
      doc.setFontSize(10);
      doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, 40);
      doc.text(`Total Operators: ${users.length} | Total Drones: ${totalDrones}`, 20, 50);
     
      autoTable(doc, {
        head: [['Username', 'Unit', 'Command', 'Category', 'Division', 'Brigade', 'Corps', 'Drone Qty']],
        body: users.map((user) => [
          user?.username || 'N/A',
          user?.unit || 'N/A',
          user?.commandName || 'N/A',
          user?.operatorCategoryName || 'N/A',
          user?.divisionName || 'N/A',
          user?.brigadeName || 'N/A',
          user?.corpsName || 'N/A',
          user?.droneSpecs?.length || 0,
        ]),
        startY: 60,
        theme: 'striped',
        headStyles: { fillColor: [0, 102, 204], textColor: [255, 255, 255] },
        styles: { fontSize: 8 },
      });

      let currentY = doc.lastAutoTable.finalY + 10;
      users.forEach((user) => {
        if (user?.droneSpecs?.length > 0) {
          doc.setFontSize(12);
          doc.text(`Drone Specifications for ${user?.username || 'N/A'}`, 20, currentY);
          currentY += 10;

          const droneTableData = user.droneSpecs.map((drone) => [
            drone?.droneName || 'N/A',
            drone?.quantity || 0,
            drone?.droneIds?.join(', ') || 'N/A',
            drone?.frequency ? `${drone.frequency} MHz` : 'N/A',
            drone?.maxHeight ? `${drone.maxHeight}m` : 'N/A',
            drone?.maxSpeed ? `${drone.maxSpeed} m/s` : 'N/A',
            drone?.maxRange ? `${drone.maxRange} km` : 'N/A',
            drone?.maxDuration ? `${drone.maxDuration} min` : 'N/A',
            [
              drone?.gpsEnabled === 'yes' ? 'GPS' : '',
              drone?.autonomous === 'yes' ? 'Autonomous' : '',
              drone?.controlled === 'yes' ? 'Controlled' : '',
              drone?.cameraEnabled === 'yes' ? `Camera (${drone?.cameraResolution || 'N/A'})` : '',
            ]
              .filter(Boolean)
              .join(', ') || 'N/A',
          ]);

          autoTable(doc, {
            head: [['Drone Name', 'Quantity', 'Drone IDs', 'Frequency', 'Max Height', 'Max Speed', 'Max Range', 'Max Duration', 'Capabilities']],
            body: droneTableData,
            startY: currentY,
            theme: 'grid',
            headStyles: { fillColor: [0, 153, 76], textColor: [255, 255, 255] },
            styles: { fontSize: 8 },
          });

          currentY = doc.lastAutoTable.finalY + 10;
        }
      });

      doc.setFontSize(8);
      doc.text('© 2025 Government of India - Ministry of Defence | All Rights Reserved', 20, doc.internal.pageSize.height - 10);

      doc.save(`Drone_Operator_Registration_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to export PDF');
    }
  }, [users, totalDrones]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? 'Invalid Date'
      : date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMINISTRATOR':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200 dark:border-red-700';
      case 'CONTROLLER':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'OPERATOR':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200 dark:border-green-600';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600';
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-6 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="border-slate-300 dark:border-slate-600"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const page = currentPage > 3 ? totalPages - 2 + i : i + 1;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="border-slate-300 dark:border-slate-600"
              >
                {page}
              </Button>
            );
          })}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="border-slate-300 dark:border-slate-600"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
        <span className="text-sm text-slate-600 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Alert variant="destructive" className="dark:bg-red-900 dark:border-red-700">
          <AlertDescription className="dark:text-red-200">User not authenticated. Please log in.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <HeaderNav isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <div className="bg-yellow-600 text-gray-800 dark:bg-yellow-900 dark:text-gray-200 py-2">
          <div className="max-w-screen-2xl mx-auto px-4">
            <div className="flex items-center justify-center gap-2 text-sm font-medium">
              <Database className="h-4 w-4" />
              OFFICIAL REGISTRATION DATABASE - CLASSIFIED INFORMATION
            </div>
          </div>
        </div>

        {loading ? (
          <div className="max-w-screen-2xl mx-auto px-4 py-12">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-12 w-12 text-gray-600 dark:text-gray-400 animate-spin mx-auto mb-4" />
                <p className="text-xl font-semibold text-gray-700 dark:text-gray-200">Loading Registration Data...</p>
                <p className="text-gray-500 dark:text-gray-400">Please wait while we fetch the latest information</p>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="max-w-screen-2xl mx-auto px-4 py-12">
            <Alert variant="destructive" className="dark:bg-red-900 dark:border-red-700">
              <AlertDescription className="dark:text-red-200">{error}</AlertDescription>
            </Alert>
          </div>
        ) : (
          <main className="max-w-screen-2xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 order-last lg:order-first">
              <Card className="border-slate-300 dark:border-slate-700 shadow-lg mb-6 dark:bg-gray-800">
                <CardHeader className="bg-slate-200 dark:bg-slate-700">
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    Graphical Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg border dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Users</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{users.length}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg border dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Plane className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Drones</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {totalDrones}
                      </p>
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-700 p-4 rounded-lg border dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">Total Commands</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {totalCommands}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-300 dark:border-slate-700 shadow-lg dark:bg-gray-800">
                <CardHeader className="bg-slate-200 dark:bg-slate-700">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    Operator Distribution by Command
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-500 dark:text-gray-400 text-center">No data available for the chart</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-700 rounded-lg p-6 mb-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200 tracking-wide">
                      DRONE OPERATOR REGISTRATION DATABASE
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400">Complete listing of registered personnel and equipment specifications</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <Button
                      onClick={refreshData}
                      className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 dark:bg-blue-700 dark:hover:bg-blue-800"
                      disabled={loading}
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      Refresh
                    </Button>
                    <Button
                      onClick={exportToPDF}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 dark:bg-green-700 dark:hover:bg-green-800"
                      disabled={loading}
                    >
                      <Download className="h-4 w-4" />
                      Export
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <Input
                        placeholder="Search by username, unit, or command..."
                        className="pl-10 border-slate-400 dark:border-slate-700 focus:border-slate-800 dark:focus:border-slate-600 h-12 dark:bg-gray-700 dark:text-gray-200"
                        value={searchTerm}
                        onChange={(e) => {
                          setSearchTerm(e.target.value);
                          setCurrentPage(1);
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <span>Showing {paginatedUsers.length} of {filteredUsers.length} results</span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-lg p-6 max-h-[600px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-slate-400 dark:text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-gray-300 mb-2">No Registration Data Found</h3>
                    <p className="text-slate-500 dark:text-gray-400">
                      {searchTerm ? 'Try adjusting your search criteria.' : 'No operators have registered yet.'}
                    </p>
                  </div>
                ) : (
                  <>
                    {paginatedUsers.map((user) => (
                      <Card key={user?.id || Math.random()} className="border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg transition-shadow duration-300 mb-4 dark:bg-gray-700">
                        <CardHeader className="bg-slate-800 text-white">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="bg-yellow-600 dark:bg-yellow-900 text-slate-800 dark:text-gray-200 rounded-full w-12 h-12 flex items-center justify-center font-bold">
                                {user?.commandNumber || 'N/A'}
                              </div>
                              <div>
                                <CardTitle className="text-xl font-bold">{user?.username || 'N/A'}</CardTitle>
                                <CardDescription className="text-slate-300 dark:text-gray-400">
                                  {user?.unit || 'N/A'} • {user?.commandName || 'N/A'}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`${getRoleBadgeColor(user?.role)} font-semibold px-3 py-1`}>
                                {user?.role || 'N/A'}
                              </Badge>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                                onClick={() => setSelectedUser(selectedUser === user?.id ? null : user?.id)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {selectedUser === user?.id ? 'Hide' : 'View'} Details
                              </Button>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="p-6">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                            <div>
                              <h4 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Personal Information
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Category:</span> {user?.operatorCategoryName || 'N/A'}</p>
                                <p><span className="font-medium">Unit:</span> {user?.unit || 'N/A'}</p>
                                <p><span className="font-medium">Registered:</span> {formatDate(user?.createdAt)}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                Command Structure
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Command:</span> {user?.commandName || 'N/A'}</p>
                                <p><span className="font-medium">Corps:</span> {user?.divisionName || 'N/A'}</p>
                                <p><span className="font-medium">Division:</span> {user?.brigadeName || 'N/A'}</p>
                                <p><span className="font-medium">Brigade:</span> {user?.corpsName || 'N/A'}</p>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold text-slate-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Plane className="h-4 w-4" />
                                Equipment Summary
                              </h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Drone Models:</span> {user?.droneSpecs?.length || 0}</p>
                                <p>
                                  <span className="font-medium">Total Aircraft:</span>{' '}
                                  {user?.droneSpecs?.reduce((acc, spec) => acc + (spec?.quantity || 0), 0) || 0}
                                </p>
                                <p>
                                  <span className="font-medium">Unique IDs:</span>{' '}
                                  {user?.droneSpecs?.reduce((acc, spec) => acc + (spec?.droneIds?.length || 0), 0) || 0}
                                </p>
                              </div>
                            </div>
                          </div>

                          {selectedUser === user?.id && (
                            <div className="border-t pt-6 animate-fade-in dark:border-gray-600">
                              <h4 className="font-semibold text-slate-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                <Settings className="h-4 w-4" />
                                Detailed Drone Specifications
                              </h4>
                              <div className="space-y-4">
                                {user?.droneSpecs?.length > 0 ? (
                                  user.droneSpecs.map((drone) => (
                                    <div key={drone?.id || Math.random()} className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-gray-600 rounded-lg p-4">
                                      <div className="flex items-center justify-between mb-3">
                                        <h5 className="font-semibold text-slate-800 dark:text-gray-200 text-lg flex items-center gap-2">
                                          <Plane className="h-5 w-5" />
                                          {drone?.droneName || 'N/A'}
                                        </h5>
                                        <Badge className="bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700">
                                          Qty: {drone?.quantity || 0}
                                        </Badge>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                        <div>
                                          <p className="font-medium text-slate-700 dark:text-gray-300 mb-1">Drone IDs:</p>
                                          <div className="space-y-1">
                                            {drone?.droneIds?.length > 0 ? (
                                              drone.droneIds.map((id, idx) => (
                                                <Badge key={idx} className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs mr-1 mb-1">
                                                  {id || 'N/A'}
                                                </Badge>
                                              ))
                                            ) : (
                                              <p className="text-gray-500 dark:text-gray-400">N/A</p>
                                            )}
                                          </div>
                                        </div>
                                        <div>
                                          <p className="font-medium text-slate-700 dark:text-gray-300 mb-1">Technical Specs:</p>
                                          <div className="space-y-1">
                                            <p>Frequency: {drone?.frequency ? `${drone.frequency} MHz` : 'N/A'}</p>
                                            <p>Clock Drift: {drone?.clockDrift || 'N/A'}</p>
                                            <p>Spectral Leakage: {drone?.spectralLeakage || 'N/A'}</p>
                                            <p>Modular Shape ID: {drone?.modularshapeId || 'N/A'}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="font-medium text-slate-700 dark:text-gray-300 mb-1">Performance:</p>
                                          <div className="space-y-1">
                                            <p>Max Height: {drone?.maxHeight ? `${drone.maxHeight}m` : 'N/A'}</p>
                                            <p>Max Speed: {drone?.maxSpeed ? `${drone.maxSpeed} m/s` : 'N/A'}</p>
                                            <p>Max Range: {drone?.maxRange ? `${drone.maxRange} km` : 'N/A'}</p>
                                            <p>Max Duration: {drone?.maxDuration ? `${drone.maxDuration} min` : 'N/A'}</p>
                                          </div>
                                        </div>
                                        <div>
                                          <p className="font-medium text-slate-700 dark:text-gray-300 mb-1">Capabilities:</p>
                                          <div className="flex flex-wrap gap-1">
                                            {drone?.gpsEnabled === 'yes' && (
                                              <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs">GPS</Badge>
                                            )}
                                            {drone?.autonomous === 'yes' && (
                                              <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs">Autonomous</Badge>
                                            )}
                                            {drone?.controlled === 'yes' && (
                                              <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-xs">Controlled</Badge>
                                            )}
                                            {drone?.cameraEnabled === 'yes' && (
                                              <Badge className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 text-xs">Camera</Badge>
                                            )}
                                          </div>
                                        </div>
                                        {drone?.cameraEnabled === 'yes' && (
                                          <div>
                                            <p className="font-medium text-slate-700 dark:text-gray-300 mb-1">Camera:</p>
                                            <p>Resolution: {drone?.cameraResolution || 'N/A'}</p>
                                          </div>
                                        )}
                                        <div>
                                          <p className="font-medium text-slate-700 dark:text-gray-300 mb-1">Operating Frequency:</p>
                                          <p>{drone?.operatingFrequency || 'N/A'}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-500 dark:text-gray-400">No drones registered for this user.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                    {renderPagination()}
                  </>
                )}
              </div>
            </div>
          </main>
        )}

        <footer className="bg-slate-800 text-white py-4 mt-12 dark:bg-gray-900">
          <div className="max-w-screen-2xl mx-auto px-4 text-center">
            <p className="text-sm">
              © 2025 Government of India - Ministry of Defence | All Rights Reserved |{' '}
              <span className="text-yellow-400 dark:text-yellow-600 ml-2">Classification: CONFIDENTIAL</span>
            </p>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}