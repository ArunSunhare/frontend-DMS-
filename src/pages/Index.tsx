
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/LoginForm';
import UserDashboard from '@/components/UserDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background tactical-grid">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-tactical-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-tactical-blue font-mono">INITIALIZING SYSTEM...</div>
        </div>
      </div>
    );
  }

  

  if (!user) {
    return <LoginForm />;
  }

  return user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />;
};

export default Index;
