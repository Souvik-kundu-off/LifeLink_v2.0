import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Heart, 
  LogOut, 
  Clock, 
  Phone, 
  MapPin, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Users,
  Activity
} from 'lucide-react';
import { User, Recipient } from '../types';
import { mockApi } from '../services/mockApi';

interface RecipientAppProps {
  user: User;
  onLogout: () => void;
}

export default function RecipientApp({ user, onLogout }: RecipientAppProps) {
  const [recipientProfile, setRecipientProfile] = useState<Recipient | null>(null);
  const [loading, setLoading] = useState(true);
  const [matchingStatus, setMatchingStatus] = useState({
    potentialMatches: 3,
    activeSearches: 1,
    lastUpdate: '2 hours ago'
  });

  useEffect(() => {
    loadRecipientData();
  }, [user.id]);

  const loadRecipientData = async () => {
    try {
      const recipients = await mockApi.getRecipients();
      const recipient = recipients.find(r => r.userId === user.id);
      setRecipientProfile(recipient || null);
    } catch (error) {
      console.error('Failed to load recipient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-blue-100 text-blue-800';
      case 'matched': return 'bg-purple-100 text-purple-800';
      case 'transplanted': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateWaitTime = (registrationDate: string) => {
    const days = Math.floor((Date.now() - new Date(registrationDate).getTime()) / (1000 * 60 * 60 * 24));
    return { days, months: Math.floor(days / 30) };
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-red-600 text-white p-2 rounded-lg">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-semibold text-gray-900">LifeLink Recipient</h1>
                <p className="text-sm text-gray-600">Welcome, {user.name}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onLogout} className="flex items-center space-x-1">
              <LogOut className="h-3 w-3" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-4 space-y-6 max-w-6xl mx-auto">
        {recipientProfile ? (
          <>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">My Transplant Journey</h2>
              <p className="text-gray-600">Track your status and stay updated on potential matches</p>
            </div>

            {/* Status Alert */}
            {recipientProfile.urgencyLevel === 'critical' && (
              <Alert className="bg-red-50 border-red-200">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">
                  <strong>Critical Status:</strong> Your case has been marked as critical priority. Our team is actively searching for compatible donors.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Profile Information */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-blue-100 text-blue-700">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3>{recipientProfile.name}</h3>
                        <p className="text-sm text-gray-600">Transplant Recipient</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Age</label>
                        <p>{recipientProfile.age} years</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Blood Group</label>
                        <Badge variant="outline" className="font-mono">
                          {recipientProfile.bloodGroup}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Urgency Level</label>
                        <Badge className={getUrgencyColor(recipientProfile.urgencyLevel)}>
                          {recipientProfile.urgencyLevel}
                        </Badge>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Current Status</label>
                        <Badge className={getStatusColor(recipientProfile.status)}>
                          {recipientProfile.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Needed Organs/Tissues</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {recipientProfile.neededOrgans.map(organ => (
                          <Badge key={organ} variant="secondary">
                            {organ.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Medical Condition</label>
                      <p className="text-sm">{recipientProfile.medicalHistory}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Contact</label>
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{recipientProfile.contactNumber}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500">Location</label>
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{recipientProfile.address}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-500">Registration Date</label>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(recipientProfile.registrationDate).toLocaleDateString()}</span>
                        <span>({calculateWaitTime(recipientProfile.registrationDate).days} days ago)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Matching Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-blue-600" />
                      <span>Matching Progress</span>
                    </CardTitle>
                    <CardDescription>
                      Current status of donor matching and search activities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Match Compatibility</span>
                        <span>72%</span>
                      </div>
                      <Progress value={72} className="h-2" />
                      <p className="text-xs text-gray-600 mt-1">Based on blood type, organ availability, and proximity</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-xl font-bold text-blue-600">{matchingStatus.potentialMatches}</div>
                        <div className="text-xs text-gray-600">Potential Matches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-green-600">{matchingStatus.activeSearches}</div>
                        <div className="text-xs text-gray-600">Active Searches</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xl font-bold text-purple-600">{calculateWaitTime(recipientProfile.registrationDate).months}</div>
                        <div className="text-xs text-gray-600">Months Waiting</div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600 pt-4 border-t">
                      <p><strong>Last Update:</strong> {matchingStatus.lastUpdate}</p>
                      <p>Our matching system continuously searches for compatible donors in your area.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Wait Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Wait Time</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {calculateWaitTime(recipientProfile.registrationDate).days}
                    </div>
                    <div className="text-sm text-gray-600 mb-4">days on waiting list</div>
                    <div className="text-xs text-gray-500">
                      {calculateWaitTime(recipientProfile.registrationDate).months} months total
                    </div>
                  </CardContent>
                </Card>

                {/* Support */}
                <Card>
                  <CardHeader>
                    <CardTitle>Support & Resources</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Care Team
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="h-4 w-4 mr-2" />
                      Support Groups
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Heart className="h-4 w-4 mr-2" />
                      Educational Resources
                    </Button>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Emergency Contact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                        <Phone className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="font-medium">24/7 Transplant Hotline</p>
                      <p className="text-sm text-gray-600">1-800-TRANSPLANT</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Call Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Updates */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Updates</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Profile Updated</p>
                          <p className="text-gray-600 text-xs">Medical records synchronized</p>
                          <p className="text-gray-500 text-xs">2 hours ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Activity className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium">New Search Initiated</p>
                          <p className="text-gray-600 text-xs">Expanded search radius to 200km</p>
                          <p className="text-gray-500 text-xs">1 day ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Users className="h-4 w-4 text-purple-600 mt-0.5" />
                        <div>
                          <p className="font-medium">Care Team Meeting</p>
                          <p className="text-gray-600 text-xs">Status review completed</p>
                          <p className="text-gray-500 text-xs">3 days ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="font-medium text-gray-900 mb-2">Profile Not Found</h3>
              <p className="text-sm text-gray-600 mb-4">
                Your recipient profile hasn't been set up yet. Contact your hospital to complete registration.
              </p>
              <Button variant="outline">Contact Hospital</Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}