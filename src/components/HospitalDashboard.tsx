import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Heart, 
  MapPin, 
  Bell, 
  UserPlus, 
  Search, 
  Activity,
  LogOut,
  Hospital,
  AlertTriangle
} from 'lucide-react';
import { User, Donor, Recipient } from '../types';
import { supabaseApi } from '../utils/supabase/client';
import { transformDonor, transformRecipient } from '../utils/dataTransforms';
import DonorManagement from './hospital/DonorManagement';
import RecipientManagement from './hospital/RecipientManagement';
import MatchingEngine from './hospital/MatchingEngine';
import DonorMap from './hospital/DonorMap';
import AlertSystem from './hospital/AlertSystem';

interface HospitalDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function HospitalDashboard({ user, onLogout }: HospitalDashboardProps) {
  const location = useLocation();
  const [donors, setDonors] = useState<Donor[]>([]);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Only load data if user is authenticated
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async (retryCount = 0) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError('');
      console.log(`Loading data (attempt ${retryCount + 1})...`);
      
      const [donorsResponse, recipientsResponse] = await Promise.all([
        supabaseApi.getDonors(),
        supabaseApi.getRecipients()
      ]);
      
      // Transform server data to frontend types
      const transformedDonors = (donorsResponse.donors || []).map(transformDonor);
      const transformedRecipients = (recipientsResponse.recipients || []).map(transformRecipient);
      
      setDonors(transformedDonors);
      setRecipients(transformedRecipients);
      console.log(`Data loaded successfully: ${donorsResponse.donors?.length || 0} donors, ${recipientsResponse.recipients?.length || 0} recipients`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      console.error(`Failed to load data (attempt ${retryCount + 1}):`, error);
      
      // If it's a network error, use mock data instead of showing error
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        console.log('Network error detected, using offline mock data');
        
        // Use offline mock data
        const mockDonors: Donor[] = [
          {
            id: 'donor:offline_1',
            userId: 'demo_user_1',
            hospitalId: 'h1',
            name: 'John Smith',
            age: 35,
            bloodGroup: 'O+',
            medicalHistory: 'No significant medical history, regular blood donor',
            contactNumber: '+1-555-1001',
            address: '789 Pine St, New York, NY',
            latitude: 40.7505,
            longitude: -73.9934,
            isActive: true,
            lastUpdated: new Date().toISOString(),
            verificationStatus: 'verified'
          },
          {
            id: 'donor:offline_2',
            userId: 'demo_user_2',
            hospitalId: 'h1',
            name: 'Sarah Johnson',
            age: 28,
            bloodGroup: 'A+',
            medicalHistory: 'Healthy blood donor, regular contributor',
            contactNumber: '+1-555-1002',
            address: '321 Elm St, New York, NY',
            latitude: 40.7614,
            longitude: -73.9776,
            isActive: true,
            lastUpdated: new Date().toISOString(),
            verificationStatus: 'verified'
          }
        ];

        const mockRecipients: Recipient[] = [
          {
            id: 'recipient:offline_1',
            userId: 'demo_user_3',
            hospitalId: 'h1',
            name: 'Emily Davis',
            age: 45,
            bloodGroup: 'O+',
            urgencyLevel: 'high',
            medicalHistory: 'Scheduled surgery requiring blood transfusion',
            contactNumber: '+1-555-2001',
            address: '888 Cedar St, New York, NY',
            latitude: 40.7489,
            longitude: -73.9680,
            registrationDate: new Date().toISOString(),
            status: 'waiting'
          }
        ];

        setDonors(mockDonors);
        setRecipients(mockRecipients);
        console.log('Using offline mock data: 2 donors, 1 recipient');
        return;
      }
      
      // If it's an authentication error, logout immediately
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('No active session')) {
        console.log('Authentication error detected, logging out...');
        onLogout();
        return;
      }
      
      // For other errors, try to retry once
      if (retryCount < 1) {
        console.log('Retrying data load...');
        setTimeout(() => loadData(retryCount + 1), 1000);
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const navigationItems = [
    { path: '/hospital', label: 'Dashboard', icon: Activity },
    { path: '/hospital/donors', label: 'Donors', icon: Users },
    { path: '/hospital/recipients', label: 'Recipients', icon: Heart },
    { path: '/hospital/matching', label: 'Matching', icon: Search },
    { path: '/hospital/map', label: 'Map View', icon: MapPin },
    { path: '/hospital/alerts', label: 'Alerts', icon: Bell }
  ];

  const activeRecipients = recipients.filter(r => r.status === 'waiting');
  const activeDonors = donors.filter(d => d.isActive);
  const criticalCases = recipients.filter(r => r.urgencyLevel === 'critical');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-red-600 text-white p-2 rounded-lg">
                <Hospital className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Hospital Portal
                  {(donors.length > 0 && donors[0].id.includes('offline')) && (
                    <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                      Offline Demo
                    </Badge>
                  )}
                </h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-sm min-h-screen">
          <nav className="p-4 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-700">
                {error}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={loadData}
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          )}
          <Routes>
            <Route path="/" element={
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard Overview</h2>
                  <p className="text-gray-600">Manage donors, recipients, and coordinate life-saving matches.</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{activeDonors.length}</div>
                      <p className="text-xs text-muted-foreground">
                        {donors.length} total registered
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Waiting Recipients</CardTitle>
                      <Heart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">{activeRecipients.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Need immediate attention
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{criticalCases.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Requires urgent matching
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                      <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">94%</div>
                      <p className="text-xs text-muted-foreground">
                        Match success this month
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity and Critical Cases */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Critical Cases */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        <span>Critical Cases</span>
                      </CardTitle>
                      <CardDescription>
                        Recipients requiring immediate attention
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {criticalCases.length === 0 ? (
                          <p className="text-gray-500">No critical cases at the moment</p>
                        ) : (
                          criticalCases.map((recipient) => (
                            <div key={recipient.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{recipient.name}</p>
                                <p className="text-sm text-gray-600">
                                  Blood Type: {recipient.bloodGroup} | Age: {recipient.age}
                                </p>
                              </div>
                              <Badge variant="destructive">Critical</Badge>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                      <CardDescription>
                        Common tasks and operations
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        <Link to="/hospital/donors">
                          <Button variant="outline" className="w-full h-20 flex-col">
                            <UserPlus className="h-6 w-6 mb-2" />
                            <span>Add Donor</span>
                          </Button>
                        </Link>
                        <Link to="/hospital/recipients">
                          <Button variant="outline" className="w-full h-20 flex-col">
                            <Heart className="h-6 w-6 mb-2" />
                            <span>Add Recipient</span>
                          </Button>
                        </Link>
                        <Link to="/hospital/matching">
                          <Button variant="outline" className="w-full h-20 flex-col">
                            <Search className="h-6 w-6 mb-2" />
                            <span>Find Matches</span>
                          </Button>
                        </Link>
                        <Link to="/hospital/alerts">
                          <Button variant="outline" className="w-full h-20 flex-col">
                            <Bell className="h-6 w-6 mb-2" />
                            <span>Send Alert</span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            } />
            <Route path="/donors" element={<DonorManagement donors={donors} onUpdate={loadData} />} />
            <Route path="/recipients" element={<RecipientManagement recipients={recipients} onUpdate={loadData} />} />
            <Route path="/matching" element={<MatchingEngine recipients={recipients} />} />
            <Route path="/map" element={<DonorMap donors={donors} recipients={recipients} />} />
            <Route path="/alerts" element={<AlertSystem donors={donors} recipients={recipients} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}