import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { CheckCircle, Clock, AlertTriangle, Bell, Heart, Check, X, Clock3 } from 'lucide-react';
import { urgencyColors, notificationTypeIcons } from '../../constants/donorConstants';

interface DonorNotificationsProps {
  notifications: any[];
  onResponse: (notificationId: string, response: 'yes' | 'no' | 'unavailable') => void;
}

export default function DonorNotifications({ notifications, onResponse }: DonorNotificationsProps) {
  const [responding, setResponding] = useState<string | null>(null);

  const handleResponse = async (notificationId: string, response: 'yes' | 'no' | 'unavailable') => {
    setResponding(notificationId);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onResponse(notificationId, response);
    setResponding(null);
  };

  const pendingNotifications = notifications.filter(n => !n.responded);
  const respondedNotifications = notifications.filter(n => n.responded);
  const urgentNotifications = notifications.filter(n => n.urgency === 'critical' && !n.responded);

  const getResponseIcon = (response: string) => {
    switch (response) {
      case 'yes': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'no': return <X className="h-4 w-4 text-red-600" />;
      case 'unavailable': return <Clock3 className="h-4 w-4 text-yellow-600" />;
      default: return null;
    }
  };

  const getResponseText = (response: string) => {
    switch (response) {
      case 'yes': return 'Available';
      case 'no': return 'Not Available';
      case 'unavailable': return 'Unavailable';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
        <p className="text-gray-600">Stay updated with donor requests and important information</p>
      </div>

      {/* Urgent Alert */}
      {urgentNotifications.length > 0 && (
        <Alert className="bg-red-50 border-red-200">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-700">
            <strong>Urgent:</strong> You have {urgentNotifications.length} critical notification{urgentNotifications.length > 1 ? 's' : ''} requiring immediate response.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Pending ({pendingNotifications.length})</span>
          </TabsTrigger>
          <TabsTrigger value="responded" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Responded ({respondedNotifications.length})</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingNotifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="font-medium text-gray-900 mb-2">No Pending Notifications</h3>
                <p className="text-sm text-gray-600">
                  You're all caught up! We'll notify you when there are new donor requests.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingNotifications.map(notification => (
              <Card key={notification.id} className={urgencyColors[notification.urgency as keyof typeof urgencyColors]}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="text-2xl">
                        {notificationTypeIcons[notification.type as keyof typeof notificationTypeIcons]}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{notification.title.slice(2)}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="capitalize">
                            {notification.urgency}
                          </Badge>
                          <span className="text-sm text-gray-600">{notification.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    {notification.urgency === 'critical' && (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{notification.message}</p>
                  
                  {notification.recipientInfo && (
                    <div className="bg-white rounded-lg p-3 mb-4 border">
                      <h4 className="font-medium mb-2">Recipient Information</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Age:</span> {notification.recipientInfo.age}
                        </div>
                        <div>
                          <span className="text-gray-500">Condition:</span> {notification.recipientInfo.condition}
                        </div>
                        <div>
                          <span className="text-gray-500">Wait Time:</span> {notification.recipientInfo.waitTime} months
                        </div>
                      </div>
                    </div>
                  )}

                  {notification.type === 'urgent_match' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => handleResponse(notification.id, 'yes')}
                        disabled={responding === notification.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {responding === notification.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        I'm Available
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResponse(notification.id, 'unavailable')}
                        disabled={responding === notification.id}
                      >
                        <Clock3 className="h-4 w-4 mr-1" />
                        Not Available Now
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResponse(notification.id, 'no')}
                        disabled={responding === notification.id}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cannot Donate
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="responded" className="space-y-4">
          {respondedNotifications.map(notification => (
            <Card key={notification.id} className="bg-gray-50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl opacity-60">
                      {notificationTypeIcons[notification.type as keyof typeof notificationTypeIcons]}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-gray-700">{notification.title.slice(2)}</CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="secondary" className="capitalize">
                          {notification.urgency}
                        </Badge>
                        <span className="text-sm text-gray-500">{notification.timestamp}</span>
                        {notification.response && (
                          <div className="flex items-center space-x-1">
                            {getResponseIcon(notification.response)}
                            <span className="text-sm font-medium">{getResponseText(notification.response)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}