import { createClient } from '@supabase/supabase-js';

// Get environment variables with proper null checking
const env = (import.meta as any).env || {};
const projectId = env.VITE_SUPABASE_PROJECT_ID || 'xyzylbeczwdfhxkkyqen';
const publicAnonKey = env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5enlsYmVjendkZmh4a2t5cWVuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5OTUyNTcsImV4cCI6MjA3MjU3MTI1N30.4NbJmr_hgbCXH7xyarAndxMoAgIT9V95qScOGlIXGZ0';

if (!projectId || !publicAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/server`;

// Helper function to make authenticated requests to our server
async function makeRequest(endpoint: string, options: RequestInit = {}) {
  // Handle offline mode for specific endpoints
  if (isOfflineMode) {
    console.log(`makeRequest: Using offline mode for ${endpoint}`);
    
    if (endpoint === '/donors') {
      return { donors: mockData.donors };
    }
    if (endpoint === '/recipients') {
      return { recipients: mockData.recipients };
    }
    if (endpoint === '/profile') {
      return { profile: null }; // No profile in offline mode
    }
    
    // Default offline response
    return { message: 'Offline mode - limited functionality' };
  }

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      throw new Error('Failed to get session. Please sign in again.');
    }
    
    if (!session?.access_token) {
      throw new Error('No active session. Please sign in to continue.');
    }
    
    const response = await fetch(`${SERVER_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
        ...options.headers,
      },
    });

    // Read response content once
    let responseText;
    try {
      responseText = await response.text();
    } catch (readError) {
      console.error('Failed to read response:', readError);
      throw new Error('Failed to read server response');
    }

    if (!response.ok) {
      let errorData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { error: responseText };
        }
      } else {
        errorData = { error: responseText };
      }
      
      console.error(`Request failed: ${endpoint}`, errorData);
      
      if (response.status === 401) {
        throw new Error('Authentication failed. Please sign in again.');
      }
      
      throw new Error(errorData.error || `Request failed: ${response.status} ${response.statusText}`);
    }

    // Parse successful response
    try {
      return JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      throw new Error('Invalid server response format');
    }
  } catch (error) {
    console.error(`makeRequest error for ${endpoint}:`, error);
    
    // If it's a network error, switch to offline mode and try again
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      console.log(`Network error detected for ${endpoint}, switching to offline mode`);
      isOfflineMode = true;
      return makeRequest(endpoint, options); // Retry with offline mode
    }
    
    throw error;
  }
}

// Offline/Mock mode flag
let isOfflineMode = false;

// Test basic network connectivity and determine if we should use offline mode
async function testConnectivity() {
  try {
    console.log('Testing basic connectivity...');
    console.log('Project ID:', projectId);
    console.log('Server URL:', SERVER_URL);
    
    // Test if we can reach the base Supabase URL with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    const baseResponse = await fetch(`https://${projectId}.supabase.co/`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    console.log('Base Supabase URL status:', baseResponse.status);
    
    return true;
  } catch (error) {
    console.warn('Basic connectivity test failed (this is expected if server is not deployed):', (error as Error).message);
    console.log('Switching to offline mode for better user experience...');
    isOfflineMode = true;
    return false;
  }
}

// Mock data for offline mode
const mockData = {
  admin: { success: true, message: 'Admin initialized in offline mode' },
  health: { status: 'ok (offline)', timestamp: new Date().toISOString() },
  demoStatus: { 
    accounts: [
      { email: 'staff@citygeneral.com', status: 'exists', role: 'hospital_staff' },
      { email: 'john.smith@email.com', status: 'exists', role: 'individual' },
      { email: 'emily.davis@email.com', status: 'exists', role: 'individual' }
    ]
  },
  donors: [
    {
      id: 'donor:offline_1',
      name: 'John Smith',
      age: 35,
      blood_group: 'O+',
      is_active: true,
      verification_status: 'verified'
    }
  ],
  recipients: [
    {
      id: 'recipient:offline_1',
      name: 'Emily Davis',
      age: 45,
      blood_group: 'O+',
      urgency_level: 'high',
      status: 'waiting'
    }
  ]
};

export const supabaseApi = {
 // Authentication
  signUp: async (userData: any) => {
    try {
      const response = await fetch(`${SERVER_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(userData),
      });

      // Read response content once
      let responseText;
      try {
        responseText = await response.text();
      } catch (readError) {
        console.error('Failed to read response:', readError);
        throw new Error('Failed to read server response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { error: responseText };
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  },

signIn: async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    // Debug: Log the user metadata to see what's actually stored
    console.log('SignIn Debug - User metadata:', data.user.user_metadata);
    console.log('SignIn Debug - User email:', data.user.email);

    // Determine the role with better logic
    let userRole = data.user.user_metadata?.role || 'individual';
    
    // Special check for admin email
    if (email === 'souvikkundu7880@gmail.com') {
      console.log('SignIn Debug - Admin email detected, forcing admin role');
      userRole = 'admin';
    }

    console.log('SignIn Debug - Final role:', userRole);

    // Transform the user data to include role information
    const transformedUser = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name || '',
      role: userRole,
      hospitalId: data.user.user_metadata?.hospital_id,
      createdAt: data.user.created_at || new Date().toISOString(),
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        role: userRole,
        hospitalId: data.user.user_metadata?.hospital_id,
        createdAt: data.user.created_at || new Date().toISOString()
      }
    };

    console.log('SignIn Debug - Transformed user:', transformedUser);
    return transformedUser;
  } catch (err: any) {
    console.warn('SignIn error:', err?.message || err);
    throw err;
  }
},

signOut: async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
},

getCurrentUser: async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
},

getSession: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
},
  // Donors
  getDonors: async () => {
    return makeRequest('/donors');
  },

  createDonor: async (donorData: any) => {
    return makeRequest('/donors', {
      method: 'POST',
      body: JSON.stringify(donorData),
    });
  },

  // Recipients
  getRecipients: async () => {
    return makeRequest('/recipients');
  },

  createRecipient: async (recipientData: any) => {
    return makeRequest('/recipients', {
      method: 'POST',
      body: JSON.stringify(recipientData),
    });
  },

  // Matching
  findMatches: async (recipientId: string) => {
    return makeRequest('/find-matches', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    });
  },

  // Alerts
  sendAlert: async (alertData: any) => {
    return makeRequest('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  // Profile
  getProfile: async () => {
    return makeRequest('/profile');
  },

  updateProfile: async (profileData: any) => {
    return makeRequest('/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Demo data initialization
  initializeDemo: async () => {
    if (isOfflineMode) {
      console.log('Demo initialization: Using offline mode');
      return { 
        message: 'Demo accounts initialized in offline mode', 
        results: mockData.demoStatus.accounts.map(acc => ({ ...acc, status: 'offline' })),
        sampleDataCreated: true 
      };
    }

    try {
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(`${SERVER_URL}/init-demo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Read response content once
      let responseText;
      try {
        responseText = await response.text();
      } catch (readError) {
        console.warn('Failed to read response (server may not be deployed):', (readError as Error).message);
        isOfflineMode = true;
        return { 
          message: 'Demo accounts initialized in offline mode (server unavailable)', 
          results: mockData.demoStatus.accounts.map(acc => ({ ...acc, status: 'offline' })),
          sampleDataCreated: true 
        };
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { error: responseText };
      }
      
      if (!response.ok) {
        console.warn('Demo initialization failed, falling back to offline mode:', data.error);
        isOfflineMode = true;
        return { 
          message: 'Demo accounts initialized in offline mode (server error)', 
          results: mockData.demoStatus.accounts.map(acc => ({ ...acc, status: 'offline' })),
          sampleDataCreated: true 
        };
      }

      console.log('Demo accounts initialized successfully via server');
      return data;
    } catch (error) {
      console.warn('Demo initialization error (falling back to offline mode):', (error as Error).message);
      
      // Always fall back to offline mode on any error
      isOfflineMode = true;
      return { 
        message: 'Demo accounts initialized in offline mode (network error)', 
        results: mockData.demoStatus.accounts.map(acc => ({ ...acc, status: 'offline' })),
        sampleDataCreated: true 
      };
    }
  },

  // Health check
  healthCheck: async () => {
    // Check if we should use offline mode
    if (isOfflineMode) {
      console.log('Health check: Using offline mode');
      return mockData.health;
    }

    try {
      console.log('Testing server connectivity...');
      console.log('Server URL:', `${SERVER_URL}/health`);
      
      // Test basic connectivity first
      const isConnected = await testConnectivity();
      if (!isConnected) {
        console.log('Health check: Connectivity failed, using offline mode');
        return mockData.health;
      }
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${SERVER_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Read response content once
      let responseText;
      try {
        responseText = await response.text();
      } catch (readError) {
        console.warn('Failed to read health check response:', (readError as Error).message);
        isOfflineMode = true;
        return mockData.health;
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { error: responseText };
      }
      
      if (!response.ok) {
        console.warn('Health check failed:', data.error);
        isOfflineMode = true;
        return mockData.health;
      }

      console.log('Health check successful');
      return data;
    } catch (error) {
      console.warn('Health check error (falling back to offline mode):', (error as Error).message);
      isOfflineMode = true;
      return mockData.health;
    }
  },

  // Check demo accounts status
  demoStatus: async () => {
    if (isOfflineMode) {
      console.log('Demo status: Using offline mode');
      return mockData.demoStatus;
    }

    try {
      const response = await fetch(`${SERVER_URL}/demo-status`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });

      // Read response content once
      let responseText;
      try {
        responseText = await response.text();
      } catch (readError) {
        console.error('Failed to read response:', readError);
        throw new Error('Failed to read server response');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        data = { error: responseText };
      }
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check demo status');
      }

      return data;
    } catch (error) {
      console.error('Demo status check error:', error);
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        console.log('Network error detected, switching to offline mode for demo status');
        isOfflineMode = true;
        return mockData.demoStatus;
      }
      
      throw error;
    }
  },

  // Debug: Test demo account login
  testDemoAccount: async (email: string, password: string) => {
    try {
      console.log(`Testing demo account: ${email}`);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Demo test failed:', error);
        return { success: false, error: error.message, data: null };
      }

      console.log('Demo test successful:', data.user);
      
      // Sign out immediately after test
      await supabase.auth.signOut();
      
      return { 
        success: true, 
        error: null, 
        data: {
          id: data.user.id,
          email: data.user.email,
          metadata: data.user.user_metadata,
          confirmed: data.user.email_confirmed_at ? true : false
        }
      };
    } catch (error) {
      console.error('Demo test error:', error);
      return { success: false, error: (error as Error).message, data: null };
    }
  },

  // Initialize admin user
  initializeAdmin: async () => {
    // Check if we should use offline mode
    if (isOfflineMode) {
      console.log('Admin initialization: Using offline mode');
      return mockData.admin;
    }

    try {
      const adminEmail = 'souvikkundu7880@gmail.com';
      const adminPassword = '7718427880';
      
      console.log('Attempting to initialize admin user...');
      console.log('Admin endpoint URL:', `${SERVER_URL}/init-admin`);
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${SERVER_URL}/init-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          email: adminEmail,
          password: adminPassword,
          name: 'System Administrator',
          role: 'admin'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // Read response content once
      let responseText;
      try {
        responseText = await response.text();
      } catch (readError) {
        console.warn('Failed to read response (server may not be deployed):', (readError as Error).message);
        isOfflineMode = true;
        return mockData.admin;
      }

      if (!response.ok) {
        // Try to parse as JSON for error message
        let errorMessage = 'Admin initialization failed';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
          // If we can't parse JSON, use the raw text
          errorMessage = responseText || errorMessage;
        }
        
        console.warn('Admin initialization failed:', errorMessage);
        console.log('Falling back to offline mode...');
        isOfflineMode = true;
        return mockData.admin;
      }

      // Try to parse successful response as JSON
      try {
        const data = JSON.parse(responseText);
        console.log('Admin initialized successfully via server');
        return data;
      } catch (parseError) {
        // If JSON parsing fails, return success based on status code
        console.log('Admin initialized successfully (parse issue, but status OK)');
        return { success: true, message: 'Admin initialized successfully' };
      }
    } catch (error) {
      console.warn('Admin initialization error (falling back to offline mode):', (error as Error).message);
      
      // Always fall back to offline mode on any error
      isOfflineMode = true;
      return mockData.admin;
    }
  },
};

