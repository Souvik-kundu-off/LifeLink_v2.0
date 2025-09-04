import { UserIcon, Bell, Heart, Settings } from 'lucide-react';

export const donorNavigationItems = [
  { path: '/donor', label: 'Profile', icon: UserIcon },
  { path: '/donor/notifications', label: 'Notifications', icon: Bell },
  { path: '/donor/history', label: 'History', icon: Heart },
  { path: '/donor/settings', label: 'Settings', icon: Settings }
];

export const mockDonorNotifications = [
  {
    id: '1',
    title: '🚨 Urgent: B+ Blood Donor Needed',
    message: 'A patient in critical condition needs B+ blood. You are a compatible match!',
    urgency: 'critical',
    timestamp: '2 minutes ago',
    type: 'urgent_match',
    responded: false,
    recipientInfo: {
      age: 45,
      condition: 'Emergency surgery requiring blood transfusion',
      waitTime: 2 // hours
    }
  },
  {
    id: '2',
    title: '📋 Profile Verification Complete',
    message: 'Your donor profile has been verified by City General Hospital.',
    urgency: 'low',
    timestamp: '2 hours ago',
    type: 'verification',
    responded: true
  },
  {
    id: '3',
    title: '❤️ Thank You for Your Service',
    message: 'Your recent blood donation helped save a life. Thank you for being a hero!',
    urgency: 'low',
    timestamp: '1 day ago',
    type: 'appreciation',
    responded: true
  },
  {
    id: '4',
    title: '🩸 Blood Drive Reminder',
    message: 'There is a blood drive happening at your registered hospital next week.',
    urgency: 'medium',
    timestamp: '3 hours ago',
    type: 'reminder',
    responded: false
  }
];

export const urgencyColors = {
  critical: 'bg-red-50 border-red-200 text-red-800',
  high: 'bg-orange-50 border-orange-200 text-orange-800',
  medium: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  low: 'bg-green-50 border-green-200 text-green-800'
};

export const notificationTypeIcons = {
  urgent_match: '🚨',
  verification: '📋',
  appreciation: '❤️',
  reminder: '🩸'
};