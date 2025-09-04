import { 
  Donor, 
  Recipient, 
  Match, 
  Alert, 
  AlertDelivery, 
  UpdateRequest, 
  Hospital, 
  User, 
  IndividualProfile,
  DonationRequest
} from '../types';

// Transform snake_case server response to camelCase frontend types

export function transformUser(serverUser: any): User {
  return {
    id: serverUser.id,
    email: serverUser.email,
    name: serverUser.name,
    role: serverUser.role,
    hospitalId: serverUser.hospital_id,
    createdAt: serverUser.created_at
  };
}

export function transformHospital(serverHospital: any): Hospital {
  return {
    id: serverHospital.id,
    name: serverHospital.name,
    address: serverHospital.address,
    phone: serverHospital.phone,
    email: serverHospital.email,
    latitude: serverHospital.latitude,
    longitude: serverHospital.longitude,
    verificationStatus: serverHospital.verification_status,
    createdAt: serverHospital.created_at
  };
}

export function transformIndividualProfile(serverProfile: any): IndividualProfile {
  return {
    id: serverProfile.id,
    userId: serverProfile.user_id,
    name: serverProfile.name,
    age: serverProfile.age,
    bloodGroup: serverProfile.blood_group,
    phone: serverProfile.phone,
    address: serverProfile.address,
    latitude: serverProfile.latitude,
    longitude: serverProfile.longitude,
    medicalHistory: serverProfile.medical_history,
    isAvailableToDonate: serverProfile.is_available_to_donate,
    availableForBloodDonation: serverProfile.available_for_blood_donation,
    lastDonationDate: serverProfile.last_donation_date,
    hasActiveDonationRequests: serverProfile.has_active_donation_requests,
    needsBloodDonation: serverProfile.needs_blood_donation,
    urgencyLevel: serverProfile.urgency_level,
    verificationStatus: serverProfile.verification_status,
    createdAt: serverProfile.created_at,
    updatedAt: serverProfile.updated_at
  };
}

export function transformDonationRequest(serverRequest: any): DonationRequest {
  return {
    id: serverRequest.id,
    requesterId: serverRequest.requester_id,
    type: serverRequest.type,
    bloodGroup: serverRequest.blood_group,
    urgencyLevel: serverRequest.urgency_level,
    description: serverRequest.description,
    medicalDetails: serverRequest.medical_details,
    preferredHospital: serverRequest.preferred_hospital,
    maxDistance: serverRequest.max_distance,
    status: serverRequest.status,
    createdAt: serverRequest.created_at,
    expiresAt: serverRequest.expires_at
  };
}

export function transformDonor(serverDonor: any): Donor {
  return {
    id: serverDonor.id,
    userId: serverDonor.user_id,
    hospitalId: serverDonor.hospital_id,
    name: serverDonor.name,
    age: serverDonor.age,
    bloodGroup: serverDonor.blood_group,
    medicalHistory: serverDonor.medical_history,
    contactNumber: serverDonor.contact_number,
    address: serverDonor.address,
    latitude: serverDonor.latitude,
    longitude: serverDonor.longitude,
    isActive: serverDonor.is_active,
    lastUpdated: serverDonor.updated_at || serverDonor.created_at,
    verificationStatus: serverDonor.verification_status
  };
}

export function transformRecipient(serverRecipient: any): Recipient {
  return {
    id: serverRecipient.id,
    userId: serverRecipient.user_id,
    hospitalId: serverRecipient.hospital_id,
    name: serverRecipient.name,
    age: serverRecipient.age,
    bloodGroup: serverRecipient.blood_group,
    urgencyLevel: serverRecipient.urgency_level,
    medicalHistory: serverRecipient.medical_history,
    contactNumber: serverRecipient.contact_number,
    address: serverRecipient.address,
    latitude: serverRecipient.latitude,
    longitude: serverRecipient.longitude,
    registrationDate: serverRecipient.created_at,
    status: serverRecipient.status
  };
}

export function transformMatch(serverMatch: any): Match {
  return {
    id: serverMatch.id,
    donorId: serverMatch.donor_id,
    recipientId: serverMatch.recipient_id,
    matchScore: serverMatch.match_score,
    distance: serverMatch.distance,
    compatibility: serverMatch.compatibility,
    reason: serverMatch.reason,
    status: serverMatch.status,
    createdAt: serverMatch.created_at
  };
}

export function transformAlert(serverAlert: any): Alert {
  return {
    id: serverAlert.id,
    title: serverAlert.title,
    message: serverAlert.message,
    urgencyLevel: serverAlert.urgency_level,
    targetBloodGroups: serverAlert.target_blood_groups || [],
    maxDistance: serverAlert.max_distance,
    hospitalId: serverAlert.hospital_id,
    createdAt: serverAlert.created_at,
    isActive: serverAlert.is_active
  };
}

export function transformAlertDelivery(serverDelivery: any): AlertDelivery {
  return {
    id: serverDelivery.id,
    alertId: serverDelivery.alert_id,
    donorId: serverDelivery.donor_id,
    method: serverDelivery.method,
    status: serverDelivery.status,
    sentAt: serverDelivery.sent_at,
    deliveredAt: serverDelivery.delivered_at
  };
}

export function transformUpdateRequest(serverRequest: any): UpdateRequest {
  return {
    id: serverRequest.id,
    donorId: serverRequest.donor_id,
    field: serverRequest.field,
    oldValue: serverRequest.old_value,
    newValue: serverRequest.new_value,
    reason: serverRequest.reason,
    status: serverRequest.status,
    requestedAt: serverRequest.requested_at,
    reviewedAt: serverRequest.reviewed_at,
    reviewedBy: serverRequest.reviewed_by
  };
}

// Transform camelCase frontend types to snake_case server format

export function transformUserToServer(user: Partial<User>): any {
  const serverUser: any = {};
  if (user.id !== undefined) serverUser.id = user.id;
  if (user.email !== undefined) serverUser.email = user.email;
  if (user.name !== undefined) serverUser.name = user.name;
  if (user.role !== undefined) serverUser.role = user.role;
  if (user.hospitalId !== undefined) serverUser.hospital_id = user.hospitalId;
  return serverUser;
}

export function transformHospitalToServer(hospital: Partial<Hospital>): any {
  const serverHospital: any = {};
  if (hospital.id !== undefined) serverHospital.id = hospital.id;
  if (hospital.name !== undefined) serverHospital.name = hospital.name;
  if (hospital.address !== undefined) serverHospital.address = hospital.address;
  if (hospital.phone !== undefined) serverHospital.phone = hospital.phone;
  if (hospital.email !== undefined) serverHospital.email = hospital.email;
  if (hospital.latitude !== undefined) serverHospital.latitude = hospital.latitude;
  if (hospital.longitude !== undefined) serverHospital.longitude = hospital.longitude;
  if (hospital.verificationStatus !== undefined) serverHospital.verification_status = hospital.verificationStatus;
  return serverHospital;
}

export function transformIndividualProfileToServer(profile: Partial<IndividualProfile>): any {
  const serverProfile: any = {};
  if (profile.id !== undefined) serverProfile.id = profile.id;
  if (profile.userId !== undefined) serverProfile.user_id = profile.userId;
  if (profile.name !== undefined) serverProfile.name = profile.name;
  if (profile.age !== undefined) serverProfile.age = profile.age;
  if (profile.bloodGroup !== undefined) serverProfile.blood_group = profile.bloodGroup;
  if (profile.phone !== undefined) serverProfile.phone = profile.phone;
  if (profile.address !== undefined) serverProfile.address = profile.address;
  if (profile.latitude !== undefined) serverProfile.latitude = profile.latitude;
  if (profile.longitude !== undefined) serverProfile.longitude = profile.longitude;
  if (profile.medicalHistory !== undefined) serverProfile.medical_history = profile.medicalHistory;
  if (profile.isAvailableToDonate !== undefined) serverProfile.is_available_to_donate = profile.isAvailableToDonate;
  if (profile.availableForBloodDonation !== undefined) serverProfile.available_for_blood_donation = profile.availableForBloodDonation;
  if (profile.lastDonationDate !== undefined) serverProfile.last_donation_date = profile.lastDonationDate;
  if (profile.hasActiveDonationRequests !== undefined) serverProfile.has_active_donation_requests = profile.hasActiveDonationRequests;
  if (profile.needsBloodDonation !== undefined) serverProfile.needs_blood_donation = profile.needsBloodDonation;
  if (profile.urgencyLevel !== undefined) serverProfile.urgency_level = profile.urgencyLevel;
  if (profile.verificationStatus !== undefined) serverProfile.verification_status = profile.verificationStatus;
  return serverProfile;
}

export function transformDonationRequestToServer(request: Partial<DonationRequest>): any {
  const serverRequest: any = {};
  if (request.id !== undefined) serverRequest.id = request.id;
  if (request.requesterId !== undefined) serverRequest.requester_id = request.requesterId;
  if (request.type !== undefined) serverRequest.type = request.type;
  if (request.bloodGroup !== undefined) serverRequest.blood_group = request.bloodGroup;
  if (request.urgencyLevel !== undefined) serverRequest.urgency_level = request.urgencyLevel;
  if (request.description !== undefined) serverRequest.description = request.description;
  if (request.medicalDetails !== undefined) serverRequest.medical_details = request.medicalDetails;
  if (request.preferredHospital !== undefined) serverRequest.preferred_hospital = request.preferredHospital;
  if (request.maxDistance !== undefined) serverRequest.max_distance = request.maxDistance;
  if (request.status !== undefined) serverRequest.status = request.status;
  if (request.expiresAt !== undefined) serverRequest.expires_at = request.expiresAt;
  return serverRequest;
}

export function transformDonorToServer(donor: Partial<Donor>): any {
  const serverDonor: any = {};
  if (donor.id !== undefined) serverDonor.id = donor.id;
  if (donor.userId !== undefined) serverDonor.user_id = donor.userId;
  if (donor.hospitalId !== undefined) serverDonor.hospital_id = donor.hospitalId;
  if (donor.name !== undefined) serverDonor.name = donor.name;
  if (donor.age !== undefined) serverDonor.age = donor.age;
  if (donor.bloodGroup !== undefined) serverDonor.blood_group = donor.bloodGroup;
  if (donor.medicalHistory !== undefined) serverDonor.medical_history = donor.medicalHistory;
  if (donor.contactNumber !== undefined) serverDonor.contact_number = donor.contactNumber;
  if (donor.address !== undefined) serverDonor.address = donor.address;
  if (donor.latitude !== undefined) serverDonor.latitude = donor.latitude;
  if (donor.longitude !== undefined) serverDonor.longitude = donor.longitude;
  if (donor.isActive !== undefined) serverDonor.is_active = donor.isActive;
  if (donor.verificationStatus !== undefined) serverDonor.verification_status = donor.verificationStatus;
  return serverDonor;
}

export function transformRecipientToServer(recipient: Partial<Recipient>): any {
  const serverRecipient: any = {};
  if (recipient.id !== undefined) serverRecipient.id = recipient.id;
  if (recipient.userId !== undefined) serverRecipient.user_id = recipient.userId;
  if (recipient.hospitalId !== undefined) serverRecipient.hospital_id = recipient.hospitalId;
  if (recipient.name !== undefined) serverRecipient.name = recipient.name;
  if (recipient.age !== undefined) serverRecipient.age = recipient.age;
  if (recipient.bloodGroup !== undefined) serverRecipient.blood_group = recipient.bloodGroup;
  if (recipient.urgencyLevel !== undefined) serverRecipient.urgency_level = recipient.urgencyLevel;
  if (recipient.medicalHistory !== undefined) serverRecipient.medical_history = recipient.medicalHistory;
  if (recipient.contactNumber !== undefined) serverRecipient.contact_number = recipient.contactNumber;
  if (recipient.address !== undefined) serverRecipient.address = recipient.address;
  if (recipient.latitude !== undefined) serverRecipient.latitude = recipient.latitude;
  if (recipient.longitude !== undefined) serverRecipient.longitude = recipient.longitude;
  if (recipient.status !== undefined) serverRecipient.status = recipient.status;
  return serverRecipient;
}

export function transformMatchToServer(match: Partial<Match>): any {
  const serverMatch: any = {};
  if (match.id !== undefined) serverMatch.id = match.id;
  if (match.donorId !== undefined) serverMatch.donor_id = match.donorId;
  if (match.recipientId !== undefined) serverMatch.recipient_id = match.recipientId;
  if (match.matchScore !== undefined) serverMatch.match_score = match.matchScore;
  if (match.distance !== undefined) serverMatch.distance = match.distance;
  if (match.compatibility !== undefined) serverMatch.compatibility = match.compatibility;
  if (match.reason !== undefined) serverMatch.reason = match.reason;
  if (match.status !== undefined) serverMatch.status = match.status;
  return serverMatch;
}

export function transformAlertToServer(alert: Partial<Alert>): any {
  const serverAlert: any = {};
  if (alert.id !== undefined) serverAlert.id = alert.id;
  if (alert.title !== undefined) serverAlert.title = alert.title;
  if (alert.message !== undefined) serverAlert.message = alert.message;
  if (alert.urgencyLevel !== undefined) serverAlert.urgency_level = alert.urgencyLevel;
  if (alert.targetBloodGroups !== undefined) serverAlert.target_blood_groups = alert.targetBloodGroups;
  if (alert.maxDistance !== undefined) serverAlert.max_distance = alert.maxDistance;
  if (alert.hospitalId !== undefined) serverAlert.hospital_id = alert.hospitalId;
  if (alert.isActive !== undefined) serverAlert.is_active = alert.isActive;
  return serverAlert;
}

export function transformAlertDeliveryToServer(delivery: Partial<AlertDelivery>): any {
  const serverDelivery: any = {};
  if (delivery.id !== undefined) serverDelivery.id = delivery.id;
  if (delivery.alertId !== undefined) serverDelivery.alert_id = delivery.alertId;
  if (delivery.donorId !== undefined) serverDelivery.donor_id = delivery.donorId;
  if (delivery.method !== undefined) serverDelivery.method = delivery.method;
  if (delivery.status !== undefined) serverDelivery.status = delivery.status;
  if (delivery.sentAt !== undefined) serverDelivery.sent_at = delivery.sentAt;
  if (delivery.deliveredAt !== undefined) serverDelivery.delivered_at = delivery.deliveredAt;
  return serverDelivery;
}

export function transformUpdateRequestToServer(request: Partial<UpdateRequest>): any {
  const serverRequest: any = {};
  if (request.id !== undefined) serverRequest.id = request.id;
  if (request.donorId !== undefined) serverRequest.donor_id = request.donorId;
  if (request.field !== undefined) serverRequest.field = request.field;
  if (request.oldValue !== undefined) serverRequest.old_value = request.oldValue;
  if (request.newValue !== undefined) serverRequest.new_value = request.newValue;
  if (request.reason !== undefined) serverRequest.reason = request.reason;
  if (request.status !== undefined) serverRequest.status = request.status;
  if (request.requestedAt !== undefined) serverRequest.requested_at = request.requestedAt;
  if (request.reviewedAt !== undefined) serverRequest.reviewed_at = request.reviewedAt;
  if (request.reviewedBy !== undefined) serverRequest.reviewed_by = request.reviewedBy;
  return serverRequest;
}

// Utility function to transform arrays
export function transformArray<T>(serverArray: any[], transformFn: (item: any) => T): T[] {
  return Array.isArray(serverArray) ? serverArray.map(transformFn) : [];
}