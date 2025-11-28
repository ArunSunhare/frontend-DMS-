import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, User, Lock } from 'lucide-react';
import backgroundVideo from '@/assets/dms_video.mp4';

const SignUpForm = () => {
  const { login } = useAuth();

    // UserName
    // Password
    // Unit
    // Command


  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={backgroundVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-60 z-10" />

      {/* Login Cards Side by Side */}
      <div className="relative z-20 flex flex-col md:flex-row gap-6 p-6">
        <IndependentLoginCard title="Operator Login" />
        <IndependentLoginCard title="Controller Login" />
        <IndependentLoginCard title="Super Admin Login" />
      </div>
    </div>
  );
};

interface IndependentLoginCardProps {
  title: string;
}

const IndependentLoginCard: React.FC<IndependentLoginCardProps> = ({ title }) => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <Card className="w-full max-w-md glow-blue border-tactical-blue/30 backdrop-blur-md bg-white/10">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-tactical-blue/20 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-tactical-blue" />
        </div>
        <CardTitle className="text-2xl font-bold text-tactical-blue">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          Secure Access - DMS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="pl-10 bg-secondary/50 border-secondary focus:border-tactical-blue"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 bg-secondary/50 border-secondary focus:border-tactical-blue"
              required
            />
          </div>

          {error && (
            <Alert className="border-tactical-red/30 bg-tactical-red/10">
              <AlertDescription className="text-tactical-red">{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full bg-tactical-blue hover:bg-tactical-blue/80 text-black font-semibold scan-line"
            disabled={isLoading}
          >
            {isLoading ? 'AUTHENTICATING...' : 'ACCESS SYSTEM'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
