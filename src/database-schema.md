# Blood Donation Platform - Database Schema

## Overview

Your blood donation platform uses Supabase with a flexible key-value store (`kv_store_8be7e5d1`) that provides all the functionality needed for a comprehensive blood donation management system. This approach is ideal for prototyping and can scale to handle complex relationships and data structures.

## Current Database Architecture

### 1. Authentication Layer
- **Supabase Auth**: Handles user authentication, sessions, and user metadata
- **User Metadata Storage**: Stores role information, hospital associations, and profile data

### 2. Key-Value Store Structure

The platform uses namespaced keys to organize different data types:

#### User Profiles
```
Key Pattern: user:{user_id}
Example: user:123e4567-e89b-12d3-a456-426614174000

Data Structure:
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.smith@email.com",
  "name": "John Smith",
  "phone": "+1-555-1001",
  "role": "individual|hospital_staff|admin",
  "hospital_id": "h1",
  "hospital_name": "City General Hospital",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### Donors
```
Key Pattern: donor:{unique_id}
Example: donor:1704096000000

Data Structure:
{
  "id": "donor:1704096000000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "hospital_id": "h1",
  "name": "John Smith",
  "age": 35,
  "blood_group": "O+|O-|A+|A-|B+|B-|AB+|AB-",
  "medical_history": "No significant medical history",
  "contact_number": "+1-555-1001",
  "address": "789 Pine St, New York, NY",
  "latitude": 40.7505,
  "longitude": -73.9934,
  "is_active": true,
  "verification_status": "pending|verified|rejected",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### Recipients
```
Key Pattern: recipient:{unique_id}
Example: recipient:1704096000001

Data Structure:
{
  "id": "recipient:1704096000001",
  "user_id": "456e7890-e89b-12d3-a456-426614174001",
  "hospital_id": "h1",
  "name": "Emily Davis",
  "age": 45,
  "blood_group": "O+",
  "urgency_level": "low|medium|high|critical",
  "medical_history": "Scheduled surgery requiring blood transfusion",
  "contact_number": "+1-555-2001",
  "address": "888 Cedar St, New York, NY",
  "latitude": 40.7489,
  "longitude": -73.9680,
  "status": "waiting|matched|completed|cancelled",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### Blood Donation Alerts
```
Key Pattern: alert:{unique_id}
Example: alert:1704096000002

Data Structure:
{
  "id": "alert:1704096000002",
  "hospital_id": "h1",
  "created_by": "staff_user_id",
  "title": "Urgent Blood Needed",
  "message": "Critical patient needs O+ blood immediately",
  "target_blood_groups": ["O+", "O-"],
  "urgency_level": "critical",
  "location": {
    "hospital_name": "City General Hospital",
    "address": "123 Main St, City Center",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "is_active": true,
  "expires_at": "2024-01-16T10:00:00Z",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### Donation Matches
```
Key Pattern: match:{unique_id}
Example: match:1704096000003_0

Data Structure:
{
  "id": "match:1704096000003_0",
  "donor_id": "donor:1704096000000",
  "recipient_id": "recipient:1704096000001",
  "match_score": 95,
  "distance": 12.5,
  "compatibility": "O+ → O+",
  "status": "pending|accepted|rejected|completed",
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

#### Individual Profiles (Donor/Recipient App)
```
Key Pattern: profile:{user_id}
Example: profile:123e4567-e89b-12d3-a456-426614174000

Data Structure:
{
  "id": "profile:123e4567-e89b-12d3-a456-426614174000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "blood_group": "O+",
  "date_of_birth": "1988-05-15",
  "emergency_contact": {
    "name": "Jane Smith",
    "phone": "+1-555-1002",
    "relationship": "spouse"
  },
  "medical_conditions": ["none"],
  "last_donation": "2024-01-10T14:00:00Z",
  "donation_history": [
    {
      "date": "2024-01-10T14:00:00Z",
      "location": "City General Hospital",
      "type": "whole_blood"
    }
  ],
  "preferences": {
    "notifications": true,
    "max_distance": 25,
    "available_times": ["morning", "afternoon"]
  },
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### 3. File Storage

**Supabase Storage Bucket**: `make-8be7e5d1-medical-files`
- Medical documents
- Verification files
- ID documents
- Medical certificates

## Key Features Supported

### 1. **User Management**
- Multi-role authentication (Hospital Staff, Individuals)
- Secure session management
- User metadata storage

### 2. **Donor Management**
- Complete donor profiles with medical history
- Geolocation for proximity matching
- Blood type compatibility tracking
- Verification status management

### 3. **Recipient Management**
- Recipient profiles with urgency levels
- Medical requirements tracking
- Status management (waiting, matched, completed)

### 4. **Blood Compatibility Matching**
- Automated blood type compatibility checking
- Distance-based matching
- Match scoring algorithm
- Status tracking for matches

### 5. **Alert System**
- Hospital-initiated blood alerts
- Targeted notifications by blood type
- Geographic targeting
- Alert expiration management

### 6. **Individual App Features**
- Personal donation history
- Preference management
- Emergency contact information
- Notification settings

## Why This Database Design Works

### 1. **Flexibility**
- JSON structure allows for easy schema evolution
- Can add new fields without migrations
- Supports complex nested data structures

### 2. **Performance**
- Key-based access is extremely fast
- Prefix-based queries for efficient data retrieval
- No complex JOIN operations needed

### 3. **Scalability**
- Supabase handles scaling automatically
- Can store millions of records efficiently
- Real-time capabilities built-in

### 4. **Security**
- Row-level security through Supabase Auth
- Encrypted data at rest
- Secure API endpoints with authentication

### 5. **Real-time Features**
- Can easily add real-time subscriptions
- Live updates for critical alerts
- Real-time matching notifications

## Blood Compatibility Rules Implemented

```javascript
const compatibility = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], // Universal donor
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'] // Universal recipient
};
```

## Sample Data Available

The system automatically creates sample data including:
- 3 demo user accounts (hospital staff, donors, recipients)
- Sample donors with different blood types
- Sample recipients with various urgency levels
- Geographic data for testing proximity features

## API Endpoints Available

- `POST /signup` - User registration
- `GET /donors` - Retrieve all donors
- `POST /donors` - Create new donor
- `GET /recipients` - Retrieve all recipients
- `POST /recipients` - Create new recipient
- `POST /find-matches` - Find compatible donor-recipient matches
- `POST /alerts` - Send blood donation alerts
- `GET /profile` - Get user profile
- `POST /profile` - Update user profile
- `POST /init-demo` - Initialize demo data

## Conclusion

This database design provides a robust, scalable foundation for your blood donation platform. The key-value approach offers flexibility while maintaining performance, and the Supabase integration provides enterprise-grade security and real-time capabilities. The structure supports all current features and can easily accommodate future enhancements.