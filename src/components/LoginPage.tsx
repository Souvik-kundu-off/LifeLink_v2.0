import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Heart, Shield, Users } from 'lucide-react';
import { User } from '../types';
import { mockApi } from '../services/mockApi';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await mockApi.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoLogins = [
    { email: 'staff@citygeneral.com', password: 'demo123', role: 'Hospital Staff' },
    { email: 'john.smith@email.com', password: 'demo123', role: 'Donor' },
    { email: 'emily.davis@email.com', password: 'demo123', role: 'Recipient' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left side - Branding */}
        <div className="text-center lg:text-left space-y-6">
          <div className="flex items-center justify-center lg:justify-start space-x-3">
            <div className="bg-red-600 text-white p-3 rounded-full">
              <Heart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">LifeLink</h1>
              <p className="text-gray-600">Organ & Blood Donation Platform</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              Connecting Lives, Saving Futures
            </h2>
            <p className="text-gray-600 text-lg">
              A comprehensive platform connecting donors, recipients, and healthcare providers 
              to save lives through efficient organ and blood donation management.
            </p>
          </div>

          <div className="grid gap-4 max-w-md mx-auto lg:mx-0">
            <div className="flex items-center space-x-3 text-gray-700">
              <Shield className="h-5 w-5 text-red-600" />
              <span>Secure and compliant medical data handling</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Users className="h-5 w-5 text-red-600" />
              <span>Real-time matching and notification system</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-700">
              <Heart className="h-5 w-5 text-red-600" />
              <span>Streamlined donor-recipient coordination</span>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Access your account to manage donations and recipients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-700">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}

                <Button 
                  type="submit" 
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-gray-600 mb-3">Demo accounts:</p>
                <div className="space-y-2">
                  {demoLogins.map((demo, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-left"
                      onClick={() => {
                        setEmail(demo.email);
                        setPassword(demo.password);
                      }}
                    >
                      <span className="font-medium">{demo.role}</span>
                      <span className="ml-auto text-xs text-gray-500">{demo.email}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}