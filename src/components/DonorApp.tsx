import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { User, Donor } from '../types';
import { mockApi } from '../services/mockApi';
import { donorNavigationItems, mockDonorNotifications } from '../constants/donorConstants';
import DonorLayout from './donor/DonorLayout';
import DonorProfile from './donor/DonorProfile';
import DonorNotifications from './donor/DonorNotifications';

interface DonorAppProps {
  user: User;
  onLogout: () => void;
}

export default function DonorApp({ user, onLogout }: DonorAppProps) {
  const [donorProfile, setDonorProfile] = useState<Donor | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonorData();
  }, [user.id]);

  const loadDonorData = async () => {
    try {
      const donors = await mockApi.getDonors();
      const donor = donors.find(d => d.userId === user.id);
      setDonorProfile(donor || null);
      setNotifications(mockDonorNotifications);
    } catch (error) {
      console.error('Failed to load donor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationResponse = (notificationId: string, response: 'yes' | 'no' | 'unavailable') => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, responded: true, response }
          : notif
      )
    );
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
    <DonorLayout 
      user={user} 
      onLogout={onLogout}
      navigationItems={donorNavigationItems}
    >
      <Routes>
        <Route 
          path="/" 
          element={
            <DonorProfile 
              user={user}
              donorProfile={donorProfile}
              notifications={notifications.filter(n => !n.responded)}
            />
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <DonorNotifications 
              notifications={notifications}
              onResponse={handleNotificationResponse}
            />
          } 
        />
      </Routes>
    </DonorLayout>
  );
}