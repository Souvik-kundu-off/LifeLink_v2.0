import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { ArrowLeft, Lock, Mail, AlertTriangle, Shield } from 'lucide-react';
import { User } from '../types';
import { supabaseApi } from '../utils/supabase/client';
import { getDemoUser, isDemoCredentials } from '../utils/demoAuth';

interface AdminLoginProps {
  onLogin: (user: User) => void;
  onBack: () => void;
}

export default function AdminLogin({ onLogin, onBack }: AdminLoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      if (isLogin) {
        // Try demo authentication first
        if (isDemoCredentials(email, password)) {
          const demoUser = getDemoUser(email, password);
          if (demoUser && demoUser.role === 'admin') {
            console.log('Using demo admin login');
            onLogin(demoUser);
            return;
          }
        }

        // Try regular Supabase authentication
        try {
          const response = await supabaseApi.signIn(email, password);
          
          if (response.success && response.user) {
            // Verify admin role
            if (response.user.role !== 'admin') {
              setError('Access denied. Admin credentials required.');
              return;
            }
            onLogin(response.user);
          } else {
            setError(response.error || 'Invalid admin credentials');
          }
        } catch (networkError) {
          if (networkError.name === 'TypeError' && networkError.message === 'Failed to fetch') {
            setError('Backend server unavailable. Please use demo credentials: admin@lifelink.com / admin123');
          } else {
            throw networkError;
          }
        }
      } else {
        // Admin registration - restricted
        setError('Admin registration is restricted. Please contact system administrator.');
      }
    } catch (error) {
      console.error('Admin authentication error:', error);
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Main
        </Button>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto bg-red-600 text-white p-3 rounded-full w-16 h-16 flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl text-gray-900">
                {isLogin ? 'Admin Portal' : 'Admin Registration'}
              </CardTitle>
              <CardDescription className="text-gray-600">
                {isLogin 
                  ? 'Secure access to LifeLink administration panel'
                  : 'Create a new admin account'
                }
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>Admin Email</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@lifelink.com"
                  required
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span>Password</span>
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your secure password"
                  required
                  className="h-11"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-11 bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    {isLogin ? 'Access Admin Panel' : 'Create Admin Account'}
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <Lock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>This is a secure admin portal. All activities are logged and monitored. Unauthorized access attempts will be reported.</p>
                </div>
              </div>
            </div>

            {/* Toggle Auth Mode */}
            <div className="mt-6 text-center text-sm text-gray-600">
              {isLogin ? (
                <p>
                  Need admin access?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Contact Administrator
                  </button>
                </p>
              ) : (
                <p>
                  Already have admin access?{' '}
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className="text-red-600 hover:text-red-700 font-medium"
                  >
                    Sign In
                  </button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials Notice */}
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="text-xs text-yellow-700 text-center">
            <p className="font-medium mb-1">Demo Environment</p>
            <p>Use demo admin credentials for testing purposes</p>
          </div>
        </div>
      </div>
    </div>
  );
}