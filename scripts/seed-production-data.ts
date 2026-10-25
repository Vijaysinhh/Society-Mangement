import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const DEMO_CREDENTIALS = {
  superadmin: { email: 'superadmin@demo.com', password: 'Demo@123456' },
  admin: { email: 'admin@demo.com', password: 'Admin@123456' },
  resident1: { email: 'resident1@demo.com', password: 'Resident@123' },
  resident2: { email: 'resident2@demo.com', password: 'Resident@123' },
  resident3: { email: 'resident3@demo.com', password: 'Resident@123' },
  watchman1: { email: 'watchman1@demo.com', password: 'Watchman@123' },
  watchman2: { email: 'watchman2@demo.com', password: 'Watchman@123' },
}

async function seedDatabase() {
  console.log('Starting database seeding...')

  try {
    // 1. Create Society
    console.log('Creating society...')
    const { data: societyData, error: societyError } = await supabase
      .from('societies')
      .insert({
        id: randomUUID(),
        name: 'Sunrise Heights Society',
        slug: 'sunrise-heights',
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        total_units: 120,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (societyError) throw new Error(`Society creation failed: ${societyError.message}`)
    const societyId = societyData.id
    console.log('Society created:', societyId)

    // 2. Create SuperAdmin account
    console.log('Creating superadmin account...')
    const { data: superadminAuthData, error: superadminAuthError } = await supabase.auth.admin.createUser({
      email: DEMO_CREDENTIALS.superadmin.email,
      password: DEMO_CREDENTIALS.superadmin.password,
      email_confirm: true,
    })

    if (superadminAuthError) throw new Error(`SuperAdmin auth failed: ${superadminAuthError.message}`)
    const superadminUserId = superadminAuthData.user.id
    console.log('SuperAdmin auth created:', superadminUserId)

    // 3. Create Admin account
    console.log('Creating admin account...')
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.admin.createUser({
      email: DEMO_CREDENTIALS.admin.email,
      password: DEMO_CREDENTIALS.admin.password,
      email_confirm: true,
    })

    if (adminAuthError) throw new Error(`Admin auth failed: ${adminAuthError.message}`)
    const adminUserId = adminAuthData.user.id

    // Create admin profile
    const { error: adminProfileError } = await supabase
      .from('society_admins')
      .insert({
        id: adminUserId,
        society_id: societyId,
        name: 'Ramesh Kumar',
        email: DEMO_CREDENTIALS.admin.email,
        phone: '+91-9876543210',
        role: 'admin',
        created_at: new Date().toISOString(),
      })

    if (adminProfileError) throw new Error(`Admin profile failed: ${adminProfileError.message}`)
    console.log('Admin created:', adminUserId)

    // 4. Create Residents
    console.log('Creating resident accounts...')
    const residentsData = [
      { name: 'Rajesh Kumar', phone: '+91-9111111111', unit: 'A-101', email: DEMO_CREDENTIALS.resident1.email, password: DEMO_CREDENTIALS.resident1.password },
      { name: 'Priya Sharma', phone: '+91-9222222222', unit: 'B-202', email: DEMO_CREDENTIALS.resident2.email, password: DEMO_CREDENTIALS.resident2.password },
      { name: 'Amit Singh', phone: '+91-9333333333', unit: 'C-303', email: DEMO_CREDENTIALS.resident3.email, password: DEMO_CREDENTIALS.resident3.password },
    ]

    const residentIds: string[] = []

    for (const resident of residentsData) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: resident.email,
        password: resident.password,
        email_confirm: true,
      })

      if (authError) throw new Error(`Resident auth failed: ${authError.message}`)
      const residentUserId = authData.user.id
      residentIds.push(residentUserId)

      // Create property
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .insert({
          id: randomUUID(),
          society_id: societyId,
          resident_id: residentUserId,
          property_type: 'flat',
          unit_number: resident.unit,
          area_sqft: 1200,
          created_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (propertyError) throw new Error(`Property creation failed: ${propertyError.message}`)

      // Create resident profile
      const { error: profileError } = await supabase
        .from('residents')
        .insert({
          id: residentUserId,
          society_id: societyId,
          property_id: propertyData.id,
          name: resident.name,
          email: resident.email,
          phone: resident.phone,
          unit: resident.unit,
          created_at: new Date().toISOString(),
        })

      if (profileError) throw new Error(`Resident profile failed: ${profileError.message}`)
      console.log(`Resident created: ${resident.name}`)
    }

    // 5. Create Watchmen
    console.log('Creating watchman accounts...')
    const watchmenData = [
      { name: 'Suresh Kumar', phone: '+91-8111111111', email: DEMO_CREDENTIALS.watchman1.email, password: DEMO_CREDENTIALS.watchman1.password },
      { name: 'Vikram Patel', phone: '+91-8222222222', email: DEMO_CREDENTIALS.watchman2.email, password: DEMO_CREDENTIALS.watchman2.password },
    ]

    for (const watchman of watchmenData) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: watchman.email,
        password: watchman.password,
        email_confirm: true,
      })

      if (authError) throw new Error(`Watchman auth failed: ${authError.message}`)
      const watchmanUserId = authData.user.id

      const { error: profileError } = await supabase
        .from('watchmen')
        .insert({
          id: watchmanUserId,
          society_id: societyId,
          name: watchman.name,
          email: watchman.email,
          phone: watchman.phone,
          shift: '06:00-18:00',
          area_assigned: 'Main Gate',
          status: 'active',
          created_at: new Date().toISOString(),
        })

      if (profileError) throw new Error(`Watchman profile failed: ${profileError.message}`)
      console.log(`Watchman created: ${watchman.name}`)
    }

    // 6. Create Bills
    console.log('Creating bills...')
    const billsToCreate = [
      { resident_id: residentIds[0], amount: 6000, status: 'paid', dueDate: '2024-03-31' },
      { resident_id: residentIds[0], amount: 6000, status: 'pending', dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
      { resident_id: residentIds[1], amount: 6500, status: 'paid', dueDate: '2024-02-29' },
      { resident_id: residentIds[2], amount: 5500, status: 'pending', dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] },
    ]

    for (const bill of billsToCreate) {
      const propertyRes = await supabase
        .from('properties')
        .select('id')
        .eq('resident_id', bill.resident_id)
        .single()

      if (propertyRes.error) throw new Error(`Could not find property for resident`)

      const { error: billError } = await supabase
        .from('maintenance_bills')
        .insert({
          id: randomUUID(),
          society_id: societyId,
          property_id: propertyRes.data.id,
          resident_id: bill.resident_id,
          amount: bill.amount,
          bill_type: 'monthly',
          due_date: bill.dueDate,
          status: bill.status,
          created_at: new Date().toISOString(),
        })

      if (billError) throw new Error(`Bill creation failed: ${billError.message}`)
    }
    console.log('Bills created')

    // 7. Create Amenities
    console.log('Creating amenities...')
    const amenities = [
      { name: 'Swimming Pool', description: 'Olympic size swimming pool', capacity: 50, cost_per_hour: 200 },
      { name: 'Gym', description: 'Well-equipped fitness center', capacity: 20, cost_per_hour: 100 },
      { name: 'Community Hall', description: 'Multi-purpose community hall', capacity: 200, cost_per_hour: 500 },
      { name: 'Tennis Court', description: 'Professional tennis court', capacity: 4, cost_per_hour: 300 },
    ]

    for (const amenity of amenities) {
      const { error: amenityError } = await supabase
        .from('amenities')
        .insert({
          id: randomUUID(),
          society_id: societyId,
          name: amenity.name,
          description: amenity.description,
          capacity: amenity.capacity,
          cost_per_hour: amenity.cost_per_hour,
          available_hours_start: '06:00',
          available_hours_end: '22:00',
          created_at: new Date().toISOString(),
        })

      if (amenityError) throw new Error(`Amenity creation failed: ${amenityError.message}`)
    }
    console.log('Amenities created')

    // 8. Create Complaints
    console.log('Creating complaints...')
    const complaints = [
      { resident_id: residentIds[0], title: 'Water leakage in bathroom', description: 'There is a water leak from the ceiling', status: 'open' },
      { resident_id: residentIds[1], title: 'Noise complaint', description: 'Neighbors playing loud music', status: 'in_progress' },
      { resident_id: residentIds[2], title: 'Power outage', description: 'Frequent power cuts in unit', status: 'resolved' },
    ]

    for (const complaint of complaints) {
      const propertyRes = await supabase
        .from('properties')
        .select('id')
        .eq('resident_id', complaint.resident_id)
        .single()

      if (propertyRes.error) continue

      const { error: complaintError } = await supabase
        .from('complaints')
        .insert({
          id: randomUUID(),
          society_id: societyId,
          resident_id: complaint.resident_id,
          property_id: propertyRes.data.id,
          title: complaint.title,
          description: complaint.description,
          category: 'maintenance',
          priority: 'high',
          status: complaint.status,
          created_at: new Date().toISOString(),
        })

      if (complaintError) throw new Error(`Complaint creation failed: ${complaintError.message}`)
    }
    console.log('Complaints created')

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\nDemo credentials created:')
    console.log('SuperAdmin:', DEMO_CREDENTIALS.superadmin)
    console.log('Admin:', DEMO_CREDENTIALS.admin)
    console.log('Residents:', residentsData.map(r => ({ email: r.email, name: r.name, unit: r.unit })))
    console.log('Watchmen:', watchmenData.map(w => ({ email: w.email, name: w.name })))
  } catch (error) {
    console.error('❌ Seeding failed:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

seedDatabase()
