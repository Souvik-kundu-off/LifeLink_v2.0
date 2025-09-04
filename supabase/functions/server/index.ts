import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

// CORS configuration
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}));

// Logger
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Helper function to verify authentication
async function verifyAuth(c: any) {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return null;
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user) {
    return null;
  }
  
  return user;
}

// Storage bucket initialization removed (no files will be stored)

// Add a simple root endpoint for debugging
app.get('/', async (c) => {
  return c.json({ 
    message: 'LifeLink Server is running', 
    timestamp: new Date().toISOString(),
    endpoints: [
      '/make-server-8be7e5d1/health',
      '/make-server-8be7e5d1/demo-status',
      '/make-server-8be7e5d1/init-admin',
      '/make-server-8be7e5d1/init-demo'
    ]
  });
});

// Add better error handling with try-catch around the entire app
app.onError((err, c) => {
  console.error('Server error:', err);
  return c.json({ error: 'Internal server error', details: err.message }, 500);
});

// Health check endpoint
app.get('/make-server-8be7e5d1/health', async (c) => {
  try {
    return c.json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Health check error:', error);
    return c.json({ error: 'Health check failed' }, 500);
  }
});

// Check demo accounts status endpoint
app.get('/make-server-8be7e5d1/demo-status', async (c) => {
  try {
    const demoEmails = ['staff@citygeneral.com', 'john.smith@email.com', 'emily.davis@email.com'];
    const results = [];
    
    for (const email of demoEmails) {
      try {
        const { data: existingUser, error } = await supabase.auth.admin.getUserByEmail(email);
        
        if (error) {
          results.push({ email, status: 'error', error: error.message });
        } else if (existingUser.user) {
          results.push({ 
            email, 
            status: 'exists', 
            id: existingUser.user.id,
            confirmed: !!existingUser.user.email_confirmed_at,
            role: existingUser.user.user_metadata?.role
          });
        } else {
          results.push({ email, status: 'not_found' });
        }
      } catch (checkError) {
        results.push({ email, status: 'error', error: checkError.message });
      }
    }
    
    return c.json({ accounts: results });
  } catch (error) {
    console.error('Demo status check error:', error);
    return c.json({ error: 'Failed to check demo status' }, 500);
  }
});

// Admin account initialization endpoint
app.post('/make-server-8be7e5d1/init-admin', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role } = body;

    if (role !== 'admin') {
      return c.json({ error: 'Only admin role is allowed' }, 400);
    }

    // Check if admin already exists
    const { data: existingUser, error: checkError } = await supabase.auth.admin.getUserByEmail(email);
    
    if (checkError && !checkError.message?.includes('User not found')) {
      console.error('Error checking existing user:', checkError);
      return c.json({ error: 'Failed to check existing user' }, 500);
    }
    
    if (existingUser?.user) {
      // Update the existing admin user
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.user.id,
        {
          password: password,
          user_metadata: { 
            name: name,
            role: 'admin'
          }
        }
      );
      
      if (updateError) {
        console.error('Error updating admin user:', updateError);
        return c.json({ error: updateError.message }, 400);
      }
      
      // Update profile in KV store
      await kv.set(`user:${existingUser.user.id}`, {
        id: existingUser.user.id,
        email: email,
        name: name,
        role: 'admin',
        created_at: existingUser.user.created_at || new Date().toISOString()
      });
      
      return c.json({ 
        success: true,
        message: 'Admin user updated successfully', 
        status: 'updated' 
      });
    } else {
      // Create new admin user
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        user_metadata: { 
          name: name,
          role: 'admin'
        },
        email_confirm: true
      });

      if (error) {
        console.error('Error creating admin user:', error);
        return c.json({ error: error.message }, 400);
      }

      // Store admin profile in KV store
      await kv.set(`user:${data.user.id}`, {
        id: data.user.id,
        email: email,
        name: name,
        role: 'admin',
        created_at: new Date().toISOString()
      });

      return c.json({ 
        success: true,
        message: 'Admin user created successfully', 
        status: 'created' 
      });
    }
  } catch (error) {
    console.error('Admin initialization error:', error);
    return c.json({ 
      success: false,
      error: 'Failed to initialize admin user',
      details: error.message 
    }, 500);
  }
});

// Demo account initialization endpoint
app.post('/make-server-8be7e5d1/init-demo', async (c) => {
  try {
    const demoAccounts = [
      {
        email: 'staff@citygeneral.com',
        password: 'demo123',
        fullName: 'Dr. Jane Cooper',
        phone: '+1-555-0101',
        role: 'hospital_staff',
        hospitalName: 'City General Hospital'
      },
      {
        email: 'john.smith@email.com', 
        password: 'demo123',
        fullName: 'John Smith',
        phone: '+1-555-1001',
        role: 'individual'
      },
      {
        email: 'emily.davis@email.com',
        password: 'demo123', 
        fullName: 'Emily Davis',
        phone: '+1-555-2001',
        role: 'individual'
      }
    ];

    const results = [];
    
    for (const account of demoAccounts) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase.auth.admin.getUserByEmail(account.email);
        
        if (existingUser.user) {
          // Try to update the existing user with correct metadata and password
          const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.user.id,
            {
              password: account.password,
              user_metadata: { 
                name: account.fullName,
                phone: account.phone,
                role: account.role,
                hospital_name: account.hospitalName
              }
            }
          );
          
          if (updateError) {
            results.push({ email: account.email, status: 'update_failed', error: updateError.message });
          } else {
            results.push({ email: account.email, status: 'updated' });
            
            // Update profile in KV store
            await kv.set(`user:${existingUser.user.id}`, {
              id: existingUser.user.id,
              email: account.email,
              name: account.fullName,
              phone: account.phone,
              role: account.role,
              hospital_name: account.hospitalName,
              created_at: existingUser.user.created_at || new Date().toISOString()
            });
          }
          continue;
        }

        const { data, error } = await supabase.auth.admin.createUser({
          email: account.email,
          password: account.password,
          user_metadata: { 
            name: account.fullName,
            phone: account.phone,
            role: account.role,
            hospital_name: account.hospitalName
          },
          email_confirm: true
        });

        if (error) {
          results.push({ email: account.email, status: 'error', error: error.message });
        } else {
          results.push({ email: account.email, status: 'created', id: data.user.id });
          
          // Store user profile in KV store
          await kv.set(`user:${data.user.id}`, {
            id: data.user.id,
            email: account.email,
            name: account.fullName,
            phone: account.phone,
            role: account.role,
            hospital_name: account.hospitalName,
            created_at: new Date().toISOString()
          });

          // Create sample data for demo accounts
          if (account.role === 'individual' && account.email === 'john.smith@email.com') {
            // Create sample donor
            await kv.set(`donor:demo_${data.user.id}`, {
              id: `donor:demo_${data.user.id}`,
              user_id: data.user.id,
              hospital_id: 'h1',
              name: account.fullName,
              age: 35,
              blood_group: 'O+',
              medical_history: 'No significant medical history, regular blood donor',
              contact_number: account.phone,
              address: '789 Pine St, New York, NY',
              latitude: 40.7505,
              longitude: -73.9934,
              is_active: true,
              verification_status: 'verified',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }

          if (account.role === 'individual' && account.email === 'emily.davis@email.com') {
            // Create sample recipient
            await kv.set(`recipient:demo_${data.user.id}`, {
              id: `recipient:demo_${data.user.id}`,
              user_id: data.user.id,
              hospital_id: 'h1',
              name: account.fullName,
              age: 45,
              blood_group: 'O+',
              urgency_level: 'high',
              medical_history: 'Scheduled surgery requiring blood transfusion',
              contact_number: account.phone,
              address: '888 Cedar St, New York, NY',
              latitude: 40.7489,
              longitude: -73.9680,
              status: 'waiting',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
          }
        }
      } catch (userError) {
        results.push({ email: account.email, status: 'error', error: userError.message });
      }
    }

    // Create additional sample data for hospital dashboard
    const sampleDonors = [
      {
        id: 'donor:sample_1',
        user_id: 'sample_user_1',
        hospital_id: 'h1',
        name: 'Sarah Johnson',
        age: 28,
        blood_group: 'A+',
        medical_history: 'Healthy blood donor, regular contributor',
        contact_number: '+1-555-1002',
        address: '321 Elm St, New York, NY',
        latitude: 40.7614,
        longitude: -73.9776,
        is_active: true,
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: 'donor:sample_2',
        user_id: 'sample_user_2',
        hospital_id: 'h1',
        name: 'Michael Brown',
        age: 42,
        blood_group: 'B-',
        medical_history: 'Regular health checkups, available for blood donation',
        contact_number: '+1-555-1003',
        address: '555 Maple Ave, New York, NY',
        latitude: 40.7282,
        longitude: -74.0776,
        is_active: true,
        verification_status: 'verified',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const sampleRecipients = [
      {
        id: 'recipient:sample_1',
        user_id: 'sample_user_3',
        hospital_id: 'h1',
        name: 'Robert Wilson',
        age: 38,
        blood_group: 'A+',
        urgency_level: 'critical',
        medical_history: 'Emergency surgery requiring immediate blood transfusion',
        contact_number: '+1-555-2002',
        address: '999 Birch Ave, New York, NY',
        latitude: 40.7831,
        longitude: -73.9712,
        status: 'waiting',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    // Store sample data
    for (const donor of sampleDonors) {
      await kv.set(donor.id, donor);
    }

    for (const recipient of sampleRecipients) {
      await kv.set(recipient.id, recipient);
    }

    return c.json({ message: 'Demo accounts initialization completed', results, sampleDataCreated: true });
  } catch (error) {
    console.error('Demo initialization error:', error);
    return c.json({ error: 'Failed to initialize demo accounts' }, 500);
  }
});

// Authentication endpoints
app.post('/make-server-8be7e5d1/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, fullName, phone, role, hospitalId, hospitalName } = body;

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name: fullName,
        phone,
        role,
        hospital_id: hospitalId,
        hospital_name: hospitalName
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name: fullName,
      phone,
      role,
      hospital_id: hospitalId,
      hospital_name: hospitalName,
      created_at: new Date().toISOString()
    });

    return c.json({ 
      message: 'User created successfully',
      user: {
        id: data.user.id,
        email,
        name: fullName,
        role
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// Donors endpoints
app.get('/make-server-8be7e5d1/donors', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const donors = await kv.getByPrefix('donor:');
    return c.json({ donors });
  } catch (error) {
    console.error('Get donors error:', error);
    return c.json({ error: 'Failed to fetch donors' }, 500);
  }
});

app.post('/make-server-8be7e5d1/donors', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const donorId = `donor:${Date.now()}`;
    
    const donor = {
      id: donorId,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(donorId, donor);
    return c.json({ donor });
  } catch (error) {
    console.error('Create donor error:', error);
    return c.json({ error: 'Failed to create donor' }, 500);
  }
});

// Recipients endpoints
app.get('/make-server-8be7e5d1/recipients', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const recipients = await kv.getByPrefix('recipient:');
    return c.json({ recipients });
  } catch (error) {
    console.error('Get recipients error:', error);
    return c.json({ error: 'Failed to fetch recipients' }, 500);
  }
});

app.post('/make-server-8be7e5d1/recipients', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const recipientId = `recipient:${Date.now()}`;
    
    const recipient = {
      id: recipientId,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(recipientId, recipient);
    return c.json({ recipient });
  } catch (error) {
    console.error('Create recipient error:', error);
    return c.json({ error: 'Failed to create recipient' }, 500);
  }
});

// Matching endpoint
app.post('/make-server-8be7e5d1/find-matches', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const { recipientId } = body;

    // Get recipient data
    const recipient = await kv.get(`recipient:${recipientId}`);
    if (!recipient) {
      return c.json({ error: 'Recipient not found' }, 404);
    }

    // Get all donors
    const donors = await kv.getByPrefix('donor:');
    
    // Blood compatibility mapping
    const compatibility = {
      'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
      'O+': ['O+', 'A+', 'B+', 'AB+'],
      'A-': ['A-', 'A+', 'AB-', 'AB+'],
      'A+': ['A+', 'AB+'],
      'B-': ['B-', 'B+', 'AB-', 'AB+'],
      'B+': ['B+', 'AB+'],
      'AB-': ['AB-', 'AB+'],
      'AB+': ['AB+']
    };

    const matches = donors
      .filter(donor => {
        const canDonate = compatibility[donor.blood_group]?.includes(recipient.blood_group);
        return canDonate && donor.is_active;
      })
      .map((donor, index) => ({
        id: `match:${Date.now()}_${index}`,
        donor_id: donor.id,
        recipient_id: recipientId,
        match_score: Math.floor(Math.random() * 40) + 60,
        distance: Math.floor(Math.random() * 50) + 5,
        compatibility: `${donor.blood_group} → ${recipient.blood_group}`,
        status: 'pending',
        created_at: new Date().toISOString()
      }));

    return c.json({ matches });
  } catch (error) {
    console.error('Find matches error:', error);
    return c.json({ error: 'Failed to find matches' }, 500);
  }
});

// Alerts endpoint
app.post('/make-server-8be7e5d1/alerts', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const alertId = `alert:${Date.now()}`;
    
    const alert = {
      id: alertId,
      ...body,
      created_at: new Date().toISOString(),
      is_active: true
    };

    await kv.set(alertId, alert);
    
    // Find matching donors and simulate alert delivery
    const donors = await kv.getByPrefix('donor:');
    const matchingDonors = donors.filter(donor => 
      body.target_blood_groups.includes(donor.blood_group) && donor.is_active
    );

    console.log(`Alert sent to ${matchingDonors.length} matching donors`);
    
    return c.json({ alert, delivered_to: matchingDonors.length });
  } catch (error) {
    console.error('Send alert error:', error);
    return c.json({ error: 'Failed to send alert' }, 500);
  }
});

// Individual profiles endpoint
app.get('/make-server-8be7e5d1/profile', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const profile = await kv.get(`profile:${user.id}`);
    return c.json({ profile });
  } catch (error) {
    console.error('Get profile error:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

app.post('/make-server-8be7e5d1/profile', async (c) => {
  try {
    const user = await verifyAuth(c);
    if (!user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = await c.req.json();
    const profileId = `profile:${user.id}`;
    
    const profile = {
      id: profileId,
      user_id: user.id,
      ...body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await kv.set(profileId, profile);
    return c.json({ profile });
  } catch (error) {
    console.error('Update profile error:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

Deno.serve(app.fetch);