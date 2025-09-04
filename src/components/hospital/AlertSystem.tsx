import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Alert, AlertDescription } from '../ui/alert';
import { Bell, Send, Users, Clock, CheckCircle, AlertTriangle, Smartphone, MessageSquare } from 'lucide-react';
import { Donor, Recipient, BloodGroup, UrgencyLevel } from '../../types';
import { supabaseApi } from '../../utils/supabase/client';

interface AlertSystemProps {
  donors: Donor[];
  recipients: Recipient[];
}

export default function AlertSystem({ donors, recipients }: AlertSystemProps) {
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [selectedRecipient, setSelectedRecipient] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState(0);

  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const urgencyLevels: UrgencyLevel[] = ['low', 'medium', 'high', 'critical'];

  const criticalRecipients = recipients.filter(r => r.urgencyLevel === 'critical' && r.status === 'waiting');

  const calculateEstimatedReach = (formData: FormData) => {
    const selectedBloodGroups = bloodGroups.filter(group => 
      formData.get(`blood_${group}`) === 'on'
    );
    const radius = parseInt(formData.get('radius') as string) || 50;

    const compatibleDonors = donors.filter(donor => {
      const bloodMatch = selectedBloodGroups.length === 0 || selectedBloodGroups.includes(donor.bloodGroup);
      // Mock distance calculation (in real app, would use geospatial queries)
      const withinRadius = true; // Simplified for demo
      
      return bloodMatch && donor.isActive && withinRadius;
    });

    return compatibleDonors.length;
  };

  const handleCreateAlert = async (formData: FormData) => {
    setLoading(true);
    try {
      const selectedBloodGroups = bloodGroups.filter(group => 
        formData.get(`blood_${group}`) === 'on'
      );

      const recipientId = formData.get('recipientId') as string;
      const newAlert = {
        hospitalId: 'h1',
        recipientId: recipientId === 'none' ? '' : recipientId,
        title: formData.get('title') as string,
        message: formData.get('message') as string,
        urgencyLevel: formData.get('urgencyLevel') as UrgencyLevel,
        targetBloodGroups: selectedBloodGroups,
        maxDistance: parseInt(formData.get('radius') as string),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };

      await supabaseApi.sendAlert(newAlert);
      setAlertSent(true);
      setShowCreateAlert(false);
      
      // Reset after showing success
      setTimeout(() => setAlertSent(false), 5000);
    } catch (error) {
      console.error('Failed to send alert:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Alert System</h2>
          <p className="text-gray-600">Send urgent notifications to compatible donors for critical cases</p>
        </div>
        
        <Dialog open={showCreateAlert} onOpenChange={setShowCreateAlert}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Bell className="h-4 w-4 mr-2" />
              Create New Alert
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Urgent Alert</DialogTitle>
              <DialogDescription>
                Send immediate notifications to compatible donors via push notifications and SMS
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateAlert(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="recipientId">Associated Recipient (Optional)</Label>
                <Select name="recipientId" value={selectedRecipient} onValueChange={setSelectedRecipient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select recipient for this alert..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">General Alert (No specific recipient)</SelectItem>
                    {recipients.filter(r => r.status === 'waiting').map(recipient => (
                      <SelectItem key={recipient.id} value={recipient.id}>
                        {recipient.name} - {recipient.bloodGroup} - Blood donation needed
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Alert Title</Label>
                  <Input 
                    id="title" 
                    name="title" 
                    placeholder="e.g., Urgent: Blood Donor Needed"
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="urgencyLevel">Urgency Level</Label>
                  <Select name="urgencyLevel" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      {urgencyLevels.map(level => (
                        <SelectItem key={level} value={level} className="capitalize">
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="message">Alert Message</Label>
                <Textarea 
                  id="message" 
                  name="message" 
                  placeholder="Detailed message to donors..."
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label>Target Blood Groups</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {bloodGroups.map(group => (
                    <div key={group} className="flex items-center space-x-2">
                      <Checkbox id={`blood_${group}`} name={`blood_${group}`} />
                      <Label htmlFor={`blood_${group}`} className="font-mono text-sm">
                        {group}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="radius">Search Radius (km)</Label>
                <Select name="radius" defaultValue="50">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25 km</SelectItem>
                    <SelectItem value="50">50 km</SelectItem>
                    <SelectItem value="100">100 km</SelectItem>
                    <SelectItem value="200">200 km</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {estimatedReach > 0 && (
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertDescription>
                    This alert will reach approximately <strong>{estimatedReach} donors</strong> based on your criteria.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowCreateAlert(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading} className="bg-red-600 hover:bg-red-700">
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Alert
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Success Message */}
      {alertSent && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Alert sent successfully! Compatible donors will receive push notifications and SMS messages.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions for Critical Cases */}
      {criticalRecipients.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <span>Critical Cases - Quick Alert</span>
            </CardTitle>
            <CardDescription>
              Send immediate alerts for patients with critical urgency levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalRecipients.map((recipient) => (
                <div key={recipient.id} className="border rounded-lg p-4 bg-red-50 border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-red-900">{recipient.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-red-700 mt-1">
                        <span>Age: {recipient.age}</span>
                        <Badge variant="outline" className="font-mono text-red-800 border-red-300">
                          {recipient.bloodGroup}
                        </Badge>
                        <span>Needs: Blood donation</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-red-600 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>Waiting {Math.floor((Date.now() - new Date(recipient.registrationDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700"
                      onClick={() => {
                        setSelectedRecipient(recipient.id);
                        setShowCreateAlert(true);
                      }}
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Send Alert
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-blue-600" />
              <span>Push Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sent Today</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivered</span>
                <span className="font-medium text-green-600">22</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Responses</span>
                <span className="font-medium text-blue-600">8</span>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                Response Rate: 36%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span>SMS Messages</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sent Today</span>
                <span className="font-medium">18</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Delivered</span>
                <span className="font-medium text-green-600">17</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Responses</span>
                <span className="font-medium text-blue-600">6</span>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                Response Rate: 35%
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Donor Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Active Donors</span>
                <span className="font-medium">{donors.filter(d => d.isActive).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Responded Today</span>
                <span className="font-medium text-green-600">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Available Now</span>
                <span className="font-medium text-blue-600">8</span>
              </div>
              <div className="text-xs text-gray-500 pt-2 border-t">
                Availability Rate: 67%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alert Activity</CardTitle>
          <CardDescription>
            Track recent alerts and their delivery status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock recent alerts */}
            {[
              {
                id: '1',
                title: 'Urgent: B+ Blood Donor Needed',
                recipient: 'Robert Wilson',
                sent: '2 hours ago',
                delivered: 15,
                responses: 4,
                urgency: 'critical'
              },
              {
                id: '2',
                title: 'A+ Blood Donation Required',
                recipient: 'Emily Davis',
                sent: '6 hours ago',
                delivered: 23,
                responses: 7,
                urgency: 'high'
              },
              {
                id: '3',
                title: 'O- Universal Blood Donor Request',
                recipient: 'General Alert',
                sent: '1 day ago',
                delivered: 45,
                responses: 12,
                urgency: 'medium'
              }
            ].map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{alert.title}</h4>
                  <Badge variant={
                    alert.urgency === 'critical' ? 'destructive' :
                    alert.urgency === 'high' ? 'default' : 'secondary'
                  }>
                    {alert.urgency}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  For: {alert.recipient} • Sent {alert.sent}
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Send className="h-3 w-3 text-blue-600" />
                    <span>{alert.delivered} delivered</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="h-3 w-3 text-green-600" />
                    <span>{alert.responses} responses</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-purple-600" />
                    <span>{Math.round((alert.responses / alert.delivered) * 100)}% response rate</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}