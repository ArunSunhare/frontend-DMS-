import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Shield, LogOut, Users, Plane, Sun, Moon } from 'lucide-react';
import profileImg from '@/assets/logo.png';
import logo from '@/assets/Logo1.png';

interface HeaderNavProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const HeaderNav: React.FC<HeaderNavProps> = ({ isDarkMode, toggleDarkMode }) => {
  const { user, logout } = useAuth() as { user: { username: string } | null; logout: () => void };

  return (
    <>
      <div className="bg-orange-500 h-1"></div>
      <header className="">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 dark:from-orange-900 dark:to-blue-900 rounded-full flex items-center justify-center shadow-md">
              <img src={profileImg} alt="Profile" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800 dark:text-gray-200"></h1>
              <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200">Indian Army</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400"></p>
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Central Command & Control System</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="bg-green-50 dark:bg-green-900 px-3 py-2 rounded-lg border border-green-200 dark:border-green-600">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
                <Users className="h-4 w-4" />
                <span className="font-medium">Active Operations: 0</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
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
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-blue-100 rounded-full flex items-center justify-center shadow-md">
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
    </>
  );
};

export default HeaderNav;