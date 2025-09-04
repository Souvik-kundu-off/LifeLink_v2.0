import { createClient } from '@supabase/supabase-js';

// 1. Paste your project URL and service_role key here
const supabaseUrl = 'https://xyzylbeczwdfhxkkyqen.supabase.co'; // This should be correct
const supabaseKey = 'YOUR_SECRET_SERVICE_ROLE_KEY'; // <-- PASTE YOUR SECRET SERVICE ROLE KEY HERE
const supabase = createClient(supabaseUrl, supabaseKey);

// 2. Paste the User ID of your admin account here
const adminUserId = '31691faf-1ffc-426a-860a-5a60238069e0'; // <-- PASTE THE USER ID YOU COPIED

async function setAdminRole() {
  if (!supabaseKey || supabaseKey.includes('SERVICE_ROLE')) {
    console.error('ERROR: Please replace "YOUR_SECRET_SERVICE_ROLE_KEY" with your actual key.');
    return;
  }
  if (!adminUserId || adminUserId.includes('USER_ID')) {
    console.error('ERROR: Please replace "YOUR_ADMIN_USER_ID" with your actual user ID.');
    return;
  }

  console.log(`Attempting to set 'admin' role for user: ${adminUserId}`);

  const { data, error } = await supabase.auth.admin.updateUserById(
    adminUserId,
    { 
      user_metadata: { 
        role: 'admin'
      } 
    }
  );

  if (error) {
    console.error('Error updating user metadata:', error.message);
  } else {
    console.log('Successfully updated user metadata:', data.user.user_metadata);
    console.log('SUCCESS! You can now log in to the admin panel.');
  }
}

setAdminRole();