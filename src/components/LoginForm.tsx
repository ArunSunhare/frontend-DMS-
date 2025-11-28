import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, User, Lock, Globe, Plane, UserPlus, LogIn, UserCog } from 'lucide-react';
import profileImg from '../assets/logo.png';
import armyBg from '../assets/indian-army-bg.jpg.jpg'; // Assuming this asset exists; place a suitable Indian Army background image here
import { Link } from "react-router-dom";
import logo from '../assets/Logo1.png';

const LoginForm = () => {
  const { login } = useAuth();

  // Separate states for operator login
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Separate states for admin login
  const [adusername, setAdUsername] = useState('');
  const [adpassword, setAdPassword] = useState('');
  const [adError, setAdError] = useState('');
  const [adIsLoading, setAdIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(username, password);

    if (!success) {
      setError('Invalid credentials. Please check your username and password.');
    }

    setIsLoading(false);
  };

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdError('');
    setAdIsLoading(true);

    const success = await login(adusername, adpassword);

    if (!success) {
      setAdError('Invalid credentials. Please check your username and password.');
    }

    setAdIsLoading(false);
  };

  const handleRegistration = () => {
    window.location.href = "/drone-registration";
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative bg-cover bg-center bg-fixed" 
      style={{ backgroundImage: `url(${armyBg})` }}
    >
      {/* Overlay for better readability across the entire page */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Orange Top Bar */}
      <div className="bg-orange-500 h-1 relative z-10"></div>

      {/* Government Header */}
      <header className="relative z-10 shadow-sm bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* Left - Logo + Titles */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <img src={profileImg} alt="Profile" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800"></h1>
              <h2 className="text-lg font-bold text-gray-800">
              Indian Army
              </h2>
              <p className="text-sm text-gray-600"></p>
              <p className="text-sm text-blue-600 font-medium">
                Drone Management Portal
              </p>
            </div>
          </div>

          {/* Right - Info */}
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {/* <Globe className="h-4 w-4" />
              <span>www.gov.in</span> */}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              {/* <Shield className="h-4 w-4" />
              <span>Secure Portal</span>  */}
             
            </div>
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <img src={logo} alt="digs_logo" />
            </div>
            
          </div>
       
        </div>
      </header>


      {/* Navigation Bar */}
      <nav className="relative z-10 bg-slate-800/90 backdrop-blur-sm text-white">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex space-x-8">
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Home
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Portal Services
            </a>
            <Link to="/drone-registration" className="py-3 px-2 text-sm hover:bg-slate-700">
              Drone Registration
            </Link>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Flight Permissions
            </a>
            <a href="#" className="py-3 px-2 text-sm hover:bg-slate-700">
              Contact Us
            </a>
          </div>
          <div className="text-xs text-gray-300">
            Last Updated: {new Date().toLocaleDateString('en-IN')}
          </div>
        </div>
      </nav>

      {/* Main Content Area - Compact to fit without scrolling */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Page Title - Reduced padding, lower opacity */}
          <div className="text-center mb-6  rounded-lg p-4">
            <h2 className="text-3xl font-bold text-white mb-2">
              Access Control Center
            </h2>
            <p className="text-lg text-white max-w-2xl mx-auto">
              Select your access level to begin managing drone operations
            </p>
          </div>

          {/* Three Cards Side by Side - Reduced height, lower opacity */}
          <div className="grid grid-cols-1  md:grid-cols-3 gap-6 justify-center max-w-5xl mx-auto">
            {/* Drone Registration */}
            <DroneRegistrationCard onRegistration={handleRegistration} />

            {/* Operator Login */}
            <LoginCard
              title="Operator Login"
              username={username}
              password={password}
              onUsernameChange={setUsername}
              onPasswordChange={setPassword}
              onSubmit={handleSubmit}
              error={error}
              isLoading={isLoading}
              variant="operator"
            />

            {/* Controller Login */}
            <LoginCard
              title="Controller Login"
              username={adusername}
              password={adpassword}
              onUsernameChange={setAdUsername}
              onPasswordChange={setAdPassword}
              onSubmit={handleAdSubmit}
              error={adError}
              isLoading={adIsLoading}
              variant="controller"
            />
          </div>
        </div>
      </div>

      {/* Footer - Reduced padding */}
      <footer className="relative z-10 bg-slate-900/90 backdrop-blur-sm text-white py-4 px-4">
        <div className="container mx-auto text-center space-y-1">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Plane className="h-6 w-6 text-orange-400" />
            <span className="text-lg font-semibold">
              Drone Management System
            </span>
          </div>
          <p className="text-gray-400 text-sm">
            Indian Army, Ministry of Defence
          </p>
          <p className="text-gray-500 text-xs">
            © 2025 All Rights Reserved | Designed & Maintained by ACCCS
          </p>
        </div>
      </footer>
    </div>
  );
};

interface LoginCardProps {
  title: string;
  username: string;
  password: string;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string;
  isLoading: boolean;
  variant: 'operator' | 'controller';
}

const LoginCard: React.FC<LoginCardProps> = ({
  title,
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  error,
  isLoading,
  variant,
}) => {
  const isController = variant === 'controller';
  
  return (
    <Card className="w-full bg-white/70 backdrop-blur-sm shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2">
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto w-16 h-16 ${isController ? 'bg-orange-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mb-3`}>
          {isController ? (
            <UserCog className={`w-8 h-8 text-orange-600`} />
          ) : (
            <LogIn className={`w-8 h-8 text-blue-600`} />
          )}
        </div>
        <CardTitle className={`text-xl font-bold ${isController ? 'text-gray-800' : 'text-gray-800'}`}>
          {title}
        </CardTitle>
        <CardDescription className="text-gray-700 text-sm">
          Secure Access - DMS
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4">
        <form onSubmit={onSubmit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => onUsernameChange(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-gray-800"
              required
            />
          </div>

          {error && (
            <Alert className="border-red-300 bg-red-50">
              <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className={`w-full font-semibold text-white ${
              isController 
                ? 'bg-orange-800 hover:bg-orange-700' 
                : 'bg-blue-800 hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

interface DroneRegistrationCardProps {
  onRegistration: () => void;
}

const DroneRegistrationCard: React.FC<DroneRegistrationCardProps> = ({
  onRegistration,
}) => {
  return (
    <Card className="w-full bg-white/70 backdrop-blur-sm shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl hover:scale-105 hover:-translate-y-2">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
          <Plane className="w-8 h-8 text-gray-600" />
        </div>
        <CardTitle className="text-xl font-bold text-gray-800">
          Drone Registration
        </CardTitle>
        <CardDescription className="text-gray-700 text-sm">
          New Drone Setup - DMS
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 flex flex-col justify-center items-center min-h-[180px]">
        <div className="text-center space-y-3 mb-6">
          <UserPlus className="w-10 h-10 text-gray-600 mx-auto" />
        </div>
        
        <Button
          onClick={onRegistration}
          className="w-full bg-green-800 hover:bg-green-700 text-white font-semibold"
        >
          REGISTRATION
        </Button>
      </CardContent>
    </Card>
  );
};

export default LoginForm;