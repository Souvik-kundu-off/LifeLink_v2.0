export type UserRole = 'admin' | 'hospital_staff' | 'individual';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  hospitalId?: string;
  createdAt: string;
}

export interface IndividualProfile {
  id: string;
  userId: string;
  name: string;
  age: number;
  bloodGroup: BloodGroup;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  medicalHistory: string;
  
  // Donor capabilities
  isAvailableToDonate: boolean;
  availableForBloodDonation: boolean;
  lastDonationDate?: string;
  
  // Recipient needs
  hasActiveDonationRequests: boolean;
  needsBloodDonation: boolean;
  urgencyLevel?: UrgencyLevel;
  
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface DonationRequest {
  id: string;
  requesterId: string; // Individual who needs donation
  type: 'blood';
  bloodGroup: BloodGroup;
  urgencyLevel: UrgencyLevel;
  description: string;
  medicalDetails: string;
  preferredHospital?: string;
  maxDistance: number; // in kilometers
  status: 'active' | 'fulfilled' | 'expired' | 'cancelled';
  createdAt: string;
  expiresAt: string;
}

// Hospital management types
export interface Hospital {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  latitude: number;
  longitude: number;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  createdAt: string;
}

export interface Donor {
  id: string;
  userId: string;
  hospitalId: string;
  name: string;
  age: number;
  bloodGroup: BloodGroup;
  medicalHistory: string;
  contactNumber: string;
  address: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  lastUpdated: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
}

export interface Recipient {
  id: string;
  userId: string;
  hospitalId: string;
  name: string;
  age: number;
  bloodGroup: BloodGroup;
  urgencyLevel: UrgencyLevel;
  medicalHistory: string;
  contactNumber: string;
  address: string;
  latitude: number;
  longitude: number;
  registrationDate: string;
  status: 'waiting' | 'matched' | 'completed';
}

export interface Match {
  id: string;
  donorId: string;
  recipientId: string;
  matchScore: number;
  distance: number;
  compatibility: string;
  reason: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  urgencyLevel: UrgencyLevel;
  targetBloodGroups: BloodGroup[];
  maxDistance: number;
  hospitalId: string;
  createdAt: string;
  isActive: boolean;
}

export interface AlertDelivery {
  id: string;
  alertId: string;
  donorId: string;
  method: 'push' | 'sms' | 'email';
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
}

export interface UpdateRequest {
  id: string;
  donorId: string;
  field: string;
  oldValue: string;
  newValue: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}