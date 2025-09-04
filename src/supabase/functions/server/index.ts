// supabase/functions/server/index.ts

import { Hono } from 'https://esm.sh/hono@4.4.13'
import { cors } from 'https://esm.sh/hono@4.4.13/cors'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.44.4'
import { KVStore } from './kv_store.ts' // This line is now correct

const app = new Hono()

// Apply CORS middleware to allow requests from any origin
app.use('*', cors())

app.post('/signup', async (c) => {
  const { 
    email, 
    password, 
    fullName, 
    phone, 
    role, 
    hospitalName 
  } = await c.req.json()

  // Use the service role key for admin-level operations like user creation
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { data: { user }, error: signUpError } = await supabaseAdmin.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone: phone,
        role: role,
        hospital_name: hospitalName,
      },
    },
  })

  if (signUpError) {
    console.error('Supabase signup error:', signUpError.message)
    return c.json({ error: `Signup failed: ${signUpError.message}` }, 400)
  }

  if (!user) {
    return c.json({ error: 'User not created after signup' }, 500)
  }

  // If a hospital is being registered, create a corresponding hospital entry in kv_store
  if (role === 'hospital_staff' && hospitalName) {
    const kvStore = new KVStore()
    const hospitalId = `hospital:${hospitalName.toLowerCase().replace(/\s+/g, '_')}_${user.id.slice(0, 4)}`
    
    await kvStore.put(hospitalId, {
      id: hospitalId,
      name: hospitalName,
      staff: [user.id],
    })

    // Update user metadata with the hospital ID
    const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { user_metadata: { hospital_id: hospitalId, role: 'hospital_staff' } }
    )

    if (updateUserError) {
      // This is not a fatal error for the user, but should be logged for admin.
      console.error(`Failed to update user ${user.id} with hospital ID:`, updateUserError.message)
    }
  }

  return c.json({ user })
})


app.get('/donors', async (c) => {
  const kvStore = new KVStore()
  const donors = await kvStore.scan('donor:')
  return c.json({ donors })
})

app.post('/donors', async (c) => {
  const kvStore = new KVStore()
  const donorData = await c.req.json()
  const key = `donor:${crypto.randomUUID()}`
  await kvStore.put(key, { ...donorData, id: key })
  return c.json({ ...donorData, id: key }, 201)
})

app.get('/recipients', async (c) => {
  const kvStore = new KVStore()
  const recipients = await kvStore.scan('recipient:')
  return c.json({ recipients })
})

app.post('/recipients', async (c) => {
  const kvStore = new KVStore()
  const recipientData = await c.req.json()
  const key = `recipient:${crypto.randomUUID()}`
  await kvStore.put(key, { ...recipientData, id: key })
  return c.json({ ...recipientData, id: key }, 201)
})

app.post('/find-matches', async (c) => {
  const kvStore = new KVStore()
  const { recipientId } = await c.req.json()
  const recipient = await kvStore.get(recipientId)
  if (!recipient) {
    return c.json({ error: 'Recipient not found' }, 404)
  }
  
  const allDonors = await kvStore.scan('donor:')
  // Basic blood group compatibility matching
  const matches = allDonors.filter(donor => donor.blood_group === recipient.blood_group && donor.is_active)

  return c.json({ matches })
})

app.post('/alerts', async (c) => {
  const kvStore = new KVStore()
  const alertData = await c.req.json()
  const key = `alert:${crypto.randomUUID()}`
  await kvStore.put(key, { ...alertData, id: key, timestamp: new Date().toISOString() })
  // In a real app, this would trigger push notifications, emails, etc.
  return c.json({ message: 'Alert sent successfully', alert: { ...alertData, id: key } })
})

app.get('/profile', async (c) => {
  const kvStore = new KVStore()
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: c.req.headers.get('Authorization')! } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  const profile = await kvStore.get(`user:${user.id}`)
  return c.json({ profile: profile || {} })
})

app.post('/profile', async (c) => {
  const kvStore = new KVStore()
   const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: c.req.headers.get('Authorization')! } } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return c.json({ error: 'Not authenticated' }, 401)
  }
  const profileData = await c.req.json()
  await kvStore.put(`user:${user.id}`, profileData)
  return c.json(profileData)
})

Deno.serve(app.fetch)

