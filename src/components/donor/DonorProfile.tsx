import React from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Bell
} from 'lucide-react';
import { User, Donor } from '../../types';

interface DonorProfileProps {
  user: User;
  donorProfile: Donor | null;
  notifications: any[];
}

export default function DonorProfile({ user, donorProfile, notifications }: DonorProfileProps) {
  const getVerificationColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const urgentNotifications = notifications.filter(n => n.urgency === 'critical');

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">My Donor Profile</h2>
        <p className="text-gray-600">Manage your donor information and view your contribution status</p>
      </div>

      {/* Urgent Notifications */}
      {urgentNotifications.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Urgent:</strong> You have {urgentNotifications.length} critical match notification{urgentNotifications.length > 1 ? 's' : ''} requiring your response.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-red-100 text-red-700">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3>{user.name}</h3>
                    <p className="text-sm text-gray-600">Organ & Blood Donor</p>
                  </div>
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" />
                  Request Update
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {donorProfile ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Age</label>
                      <p>{donorProfile.age} years</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Blood Group</label>
                      <Badge variant="outline" className="font-mono">
                        {donorProfile.bloodGroup}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Contact</label>
                      <div className="flex items-center space-x-1 text-sm">
                        <Phone className="h-3 w-3" />
                        <span>{donorProfile.contactNumber}</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <div className="flex items-center space-x-2">
                        <Badge variant={donorProfile.isActive ? "default" : "secondary"}>
                          {donorProfile.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                        <Badge className={getVerificationColor(donorProfile.verificationStatus)}>
                          {donorProfile.verificationStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Address</label>
                    <div className="flex items-center space-x-1 text-sm">
                      <MapPin className="h-3 w-3" />
                      <span>{donorProfile.address}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Available for Donation</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {donorProfile.availableOrgans.map(organ => (
                        <Badge key={organ} variant="secondary">
                          {organ.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Medical History</label>
                    <p className="text-sm">{donorProfile.medicalHistory || 'No medical history provided'}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(donorProfile.lastUpdated).toLocaleDateString()}</span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="font-medium text-gray-900 mb-2">Profile Not Found</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Your donor profile hasn't been set up yet. Contact your hospital to complete registration.
                  </p>
                  <Button variant="outline">Contact Hospital</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">3</div>
                <div className="text-sm text-gray-600">Lives Potentially Saved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">1</div>
                <div className="text-sm text-gray-600">Active Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">2</div>
                <div className="text-sm text-gray-600">Years as Donor</div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {notifications.slice(0, 3).map(notification => (
                  <div key={notification.id} className="flex items-start space-x-3 p-2 rounded-lg bg-gray-50">
                    <div className="text-lg">{notification.title.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{notification.title.slice(2)}</p>
                      <p className="text-xs text-gray-500">{notification.timestamp}</p>
                    </div>
                    {!notification.responded && (
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    )}
                  </div>
                ))}
              </div>
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
                <p className="font-medium">24/7 Donor Hotline</p>
                <p className="text-sm text-gray-600">1-800-LIFELINE</p>
                <Button variant="outline" size="sm" className="w-full">
                  Call Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}