import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Heart, 
  Bell, 
  Settings, 
  LogOut,
  Droplets,
  MapPin,
  Clock,
  Plus,
  Users,
  Activity,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import { User } from '../types';
import { supabaseApi } from '../utils/supabase/client';
import { transformIndividualProfile } from '../utils/dataTransforms';

interface DonorRecipientAppProps {
  user: User;
  onLogout: () => void;
}

export default function DonorRecipientApp({ user, onLogout }: DonorRecipientAppProps) {
  const [activeView, setActiveView] = useState<'dashboard' | 'donate' | 'request' | 'profile'>('dashboard');
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setError('');
      console.log('Loading profile for user:', user.email);
      
      const profileResponse = await supabaseApi.getProfile();
      setProfile(profileResponse.profile);
      console.log('Profile loaded successfully:', profileResponse.profile);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load profile';
      console.error('Failed to load profile:', error);
      
      // If it's an authentication error, logout immediately
      if (errorMessage.includes('Authentication failed') || errorMessage.includes('No active session')) {
        console.log('Authentication error detected, logging out...');
        onLogout();
        return;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Use profile data if available, otherwise use defaults based on user data
  const displayProfile = profile || {
    name: user.name,
    age: null,
    blood_group: null,
    location: null,
    is_available_to_donate: false,
    verification_status: 'pending',
    total_donations: 0,
    last_donation: null
  };

  // For now, we'll use sample data. In a full implementation, these would come from the API
  const mockDonationRequests = profile?.donation_requests || [
    {
      id: '1',
      type: 'blood',
      blood_group: displayProfile.blood_group || 'O+',
      urgency: 'high' as const,
      hospital: 'City General Hospital',
      distance: '2.3 km',
      requested_at: '2 hours ago',
      description: 'Emergency surgery patient needs immediate blood transfusion'
    }
  ];

  const mockMyRequests = profile?.my_requests || [];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const renderNavigation = () => (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white p-2 rounded-lg">
              <Heart className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">LifeLink Portal</h1>
              <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-gray-700">{user.name}</span>
          </div>
          
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-1 mt-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'donate', label: 'Donate', icon: Heart },
          { id: 'request', label: 'Request Help', icon: Heart },
          { id: 'profile', label: 'Profile', icon: Settings }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeView === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveView(tab.id as any)}
              className={activeView === tab.id ? 'bg-red-600 text-white' : ''}
            >
              <Icon className="h-4 w-4 mr-2" />
              {tab.label}
            </Button>
          );
        })}
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="p-6 space-y-6">
      {/* Profile status alert */}
      {!profile && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700">
            Your profile is incomplete. Please complete your registration to access all features.
            <Button 
              variant="link" 
              size="sm" 
              className="ml-2 text-yellow-700 underline"
              onClick={() => setActiveView('profile')}
            >
              Complete Profile
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            {error}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-4"
              onClick={loadProfile}
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-600" />
              Donation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available to donate</span>
                <Badge variant={displayProfile.is_available_to_donate ? 'default' : 'secondary'}>
                  {displayProfile.is_available_to_donate ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total donations</span>
                <span className="font-semibold text-green-600">{displayProfile.total_donations || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last donation</span>
                <span className="text-sm">{displayProfile.last_donation || 'Never'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Heart className="h-5 w-5 mr-2 text-blue-600" />
              My Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active requests</span>
                <span className="font-semibold text-blue-600">{mockMyRequests.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total responses</span>
                <span className="font-semibold text-green-600">
                  {mockMyRequests.reduce((sum, req) => sum + (req.responses || 0), 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge variant="outline">Monitoring</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <Users className="h-5 w-5 mr-2 text-purple-600" />
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Blood group</span>
                <Badge variant="secondary">{displayProfile.blood_group || 'Not set'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verification</span>
                <Badge variant={displayProfile.verification_status === 'verified' ? 'default' : 'secondary'} 
                       className={displayProfile.verification_status === 'verified' ? 'bg-green-600' : ''}>
                  {displayProfile.verification_status || 'Pending'}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-3 w-3 mr-1" />
                {displayProfile.location || 'Not specified'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Donation Opportunities Near You</CardTitle>
            <CardDescription>Recent requests from nearby hospitals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockDonationRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {request.type === 'blood' ? (
                      <Droplets className="h-4 w-4 text-red-500" />
                    ) : (
                      <Heart className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="font-medium">
                      Blood {request.blood_group}
                    </span>
                  </div>
                  <Badge variant={
                    request.urgency === 'high' ? 'destructive' : 
                    request.urgency === 'medium' ? 'default' : 'secondary'
                  }>
                    {request.urgency} priority
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{request.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{request.hospital}</span>
                  <span>{request.distance} • {request.requested_at}</span>
                </div>
                <Button size="sm" className="w-full bg-red-600 hover:bg-red-700">
                  Respond to Request
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Active Requests</CardTitle>
            <CardDescription>Your current donation requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockMyRequests.map(request => (
              <div key={request.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {request.type === 'blood' ? (
                      <Droplets className="h-4 w-4 text-red-500" />
                    ) : (
                      <Heart className="h-4 w-4 text-blue-500" />
                    )}
                    <span className="font-medium">
                      Blood {request.blood_group}
                    </span>
                  </div>
                  <Badge variant="outline">{request.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">{request.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{request.responses || 0} responses</span>
                  <span>{request.created_at}</span>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    View Responses
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Edit Request
                  </Button>
                </div>
              </div>
            ))}
            
            {mockMyRequests.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No active donation requests</p>
                <Button 
                  className="mt-4" 
                  onClick={() => setActiveView('request')}
                >
                  Create Request
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderDonateSection = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Donation Opportunities</h2>
        <p className="text-gray-600">Help save lives by responding to nearby donation requests</p>
      </div>

      <div className="grid gap-6">
        {mockDonationRequests.map(request => (
          <Card key={request.id} className="border-l-4 border-red-500">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  {request.type === 'blood' ? (
                    <Droplets className="h-5 w-5 text-red-500" />
                  ) : (
                    <Heart className="h-5 w-5 text-blue-500" />
                  )}
                  <span>
                    Blood Donation ({request.blood_group})
                  </span>
                </CardTitle>
                <Badge variant={
                  request.urgency === 'high' ? 'destructive' : 
                  request.urgency === 'medium' ? 'default' : 'secondary'
                }>
                  {request.urgency} priority
                </Badge>
              </div>
              <CardDescription className="flex items-center space-x-4">
                <span className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {request.hospital}
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {request.requested_at}
                </span>
                <span>{request.distance}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">{request.description}</p>
              <div className="flex space-x-3">
                <Button className="bg-green-600 hover:bg-green-700">
                  Yes, I can help
                </Button>
                <Button variant="outline">
                  Maybe later
                </Button>
                <Button variant="ghost">
                  More details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderRequestSection = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Blood Donation Help</h2>
        <p className="text-gray-600">Create a request to find compatible blood donors in your area</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Droplets className="h-5 w-5 text-red-500" />
              <span>Request Blood Donation</span>
            </CardTitle>
            <CardDescription>
              Find compatible blood donors for transfusion or surgery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600 mb-4">
              <li>• Blood type compatibility matching</li>
              <li>• Emergency and planned procedure support</li>
              <li>• Local donor network access</li>
              <li>• Hospital coordination</li>
            </ul>
            <Button className="w-full bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              Create Blood Request
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* My Current Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Current Requests</CardTitle>
          <CardDescription>Manage your active blood donation requests</CardDescription>
        </CardHeader>
        <CardContent>
          {mockMyRequests.length > 0 ? (
            <div className="space-y-4">
              {mockMyRequests.map(request => (
                <div key={request.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Droplets className="h-4 w-4 text-red-500" />
                      <span className="font-medium">
                        Blood {request.bloodGroup}
                      </span>
                    </div>
                    <Badge variant="outline">{request.status}</Badge>
                  </div>
                  <p className="text-gray-600 mb-3">{request.description}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>{request.responses} responses received</span>
                    <span>Created {request.createdAt}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Responses ({request.responses})
                    </Button>
                    <Button size="sm" variant="outline">
                      Edit Request
                    </Button>
                    <Button size="sm" variant="destructive">
                      Cancel Request
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No active requests</p>
              <p className="text-sm">Create a request to start receiving help from donors</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderProfileSection = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h2>
        <p className="text-gray-600">Manage your donation preferences and personal information</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic profile details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{displayProfile.name}</h3>
                <p className="text-gray-600">{displayProfile.age ? `${displayProfile.age} years old` : 'Age not set'}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{displayProfile.blood_group || 'Not set'}</Badge>
                  <Badge variant={displayProfile.verification_status === 'verified' ? 'default' : 'secondary'} 
                         className={displayProfile.verification_status === 'verified' ? 'bg-green-600' : ''}>
                    {displayProfile.verification_status || 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                {displayProfile.location || 'Location not set'}
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Donation Preferences</CardTitle>
            <CardDescription>Configure your blood donation availability and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available to donate blood</span>
                <Badge variant={displayProfile.is_available_to_donate ? 'default' : 'secondary'}>
                  {displayProfile.is_available_to_donate ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Blood group:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="font-mono">{displayProfile.blood_group || 'Not set'}</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <span className="text-sm font-medium">Last donation:</span>
                <p className="text-sm text-gray-600">{displayProfile.last_donation || 'Never donated'}</p>
              </div>
            </div>
            
            <Button variant="outline" className="w-full">
              Update Preferences
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Donation History & Statistics</CardTitle>
          <CardDescription>Your contribution to the community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{displayProfile.total_donations || 0}</div>
              <div className="text-sm text-gray-600">Total Donations</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">15</div>
              <div className="text-sm text-gray-600">Lives Impacted</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <div className="text-sm text-gray-600">Response Rate</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">Gold</div>
              <div className="text-sm text-gray-600">Donor Level</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {renderNavigation()}
      
      <main className="max-w-7xl mx-auto">
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'donate' && renderDonateSection()}
        {activeView === 'request' && renderRequestSection()}
        {activeView === 'profile' && renderProfileSection()}
      </main>
    </div>
  );
}