import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Demo data structure
const demoData = {
  society: {
    name: 'Sunrise Heights Society',
    slug: 'sunrise-heights',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    total_units: 120,
  },
  superadmin: {
    email: 'superadmin@demo.com',
    password: 'Demo@123456',
    name: 'Super Admin',
  },
  admin: {
    email: 'admin@demo.com',
    password: 'Admin@123456',
    name: 'Society Admin',
    phone: '+91-9876543210',
  },
  residents: [
    {
      email: 'resident1@demo.com',
      password: 'Resident@123',
      name: 'Rajesh Kumar',
      phone: '+91-9111111111',
      unit: 'A-101',
      property_type: 'flat',
    },
    {
      email: 'resident2@demo.com',
      password: 'Resident@123',
      name: 'Priya Sharma',
      phone: '+91-9222222222',
      unit: 'B-202',
      property_type: 'flat',
    },
    {
      email: 'resident3@demo.com',
      password: 'Resident@123',
      name: 'Amit Patel',
      phone: '+91-9333333333',
      unit: 'C-501',
      property_type: 'villa',
    },
  ],
  watchmen: [
    {
      email: 'watchman1@demo.com',
      password: 'Watchman@123',
      name: 'Ramesh Singh',
      phone: '+91-9444444444',
    },
    {
      email: 'watchman2@demo.com',
      password: 'Watchman@123',
      name: 'Vikram Nair',
      phone: '+91-9555555555',
    },
  ],
}

async function seedDatabase() {
  try {
    console.log('Starting database seeding...\n')

    // 1. Create Society
    console.log('Creating society...')
    const { data: society, error: societyError } = await supabase
      .from('societies')
      .insert([demoData.society])
      .select()
      .single()

    if (societyError) throw new Error(`Society creation failed: ${societyError.message}`)
    const societyId = society.id
    console.log(`✓ Society created: ${societyId}\n`)

    // 2. Create SuperAdmin Auth Account
    console.log('Creating superadmin auth account...')
    const { data: superadminAuth, error: superadminAuthError } =
      await supabase.auth.admin.createUser({
        email: demoData.superadmin.email,
        password: demoData.superadmin.password,
        email_confirm: true,
      })

    if (superadminAuthError) throw new Error(`Superadmin auth failed: ${superadminAuthError.message}`)
    const superadminId = superadminAuth.user.id
    console.log(`✓ Superadmin auth account created: ${superadminId}\n`)

    // 3. Create Admin Auth Account
    console.log('Creating admin auth account...')
    const { data: adminAuth, error: adminAuthError } =
      await supabase.auth.admin.createUser({
        email: demoData.admin.email,
        password: demoData.admin.password,
        email_confirm: true,
      })

    if (adminAuthError) throw new Error(`Admin auth failed: ${adminAuthError.message}`)
    const adminId = adminAuth.user.id
    console.log(`✓ Admin auth account created: ${adminId}\n`)

    // 4. Create Admin in Database
    console.log('Creating admin in database...')
    const { error: adminDbError } = await supabase
      .from('society_admins')
      .insert([
        {
          id: adminId,
          society_id: societyId,
          email: demoData.admin.email,
          name: demoData.admin.name,
          phone: demoData.admin.phone,
          role: 'admin',
        },
      ])

    if (adminDbError) throw new Error(`Admin DB creation failed: ${adminDbError.message}`)
    console.log(`✓ Admin database record created\n`)

    // 5. Create Residents
    console.log('Creating resident auth accounts and database records...')
    const residentIds: string[] = []

    for (const resident of demoData.residents) {
      const { data: residentAuth, error: residentAuthError } =
        await supabase.auth.admin.createUser({
          email: resident.email,
          password: resident.password,
          email_confirm: true,
        })

      if (residentAuthError) throw new Error(`Resident auth failed: ${residentAuthError.message}`)
      const residentId = residentAuth.user.id
      residentIds.push(residentId)

      // Add to residents table
      const { error: residentDbError } = await supabase
        .from('residents')
        .insert([
          {
            id: residentId,
            society_id: societyId,
            email: resident.email,
            name: resident.name,
            phone: resident.phone,
            role: 'resident',
          },
        ])

      if (residentDbError) throw new Error(`Resident DB creation failed: ${residentDbError.message}`)

      // Create property for resident
      const { error: propertyError } = await supabase
        .from('properties')
        .insert([
          {
            society_id: societyId,
            resident_id: residentId,
            property_type: resident.property_type,
            unit_number: resident.unit,
            area_sqft: 1500,
          },
        ])

      if (propertyError) throw new Error(`Property creation failed: ${propertyError.message}`)

      console.log(`  ✓ Resident created: ${resident.name} (${resident.email})`)
    }
    console.log()

    // 6. Create Watchmen
    console.log('Creating watchman auth accounts and database records...')
    const watchmanIds: string[] = []

    for (const watchman of demoData.watchmen) {
      const { data: watchmanAuth, error: watchmanAuthError } =
        await supabase.auth.admin.createUser({
          email: watchman.email,
          password: watchman.password,
          email_confirm: true,
        })

      if (watchmanAuthError) throw new Error(`Watchman auth failed: ${watchmanAuthError.message}`)
      const watchmanId = watchmanAuth.user.id
      watchmanIds.push(watchmanId)

      // Add to watchmen table
      const { error: watchmanDbError } = await supabase
        .from('watchmen')
        .insert([
          {
            id: watchmanId,
            society_id: societyId,
            email: watchman.email,
            name: watchman.name,
            phone: watchman.phone,
            role: 'watchman',
          },
        ])

      if (watchmanDbError) throw new Error(`Watchman DB creation failed: ${watchmanDbError.message}`)

      console.log(`  ✓ Watchman created: ${watchman.name} (${watchman.email})`)
    }
    console.log()

    // 7. Create Demo Bills
    console.log('Creating demo bills...')
    const properties = await supabase
      .from('properties')
      .select('id, resident_id')
      .eq('society_id', societyId)

    if (properties.data) {
      for (const property of properties.data) {
        const { error: billError } = await supabase
          .from('maintenance_bills')
          .insert([
            {
              society_id: societyId,
              property_id: property.id,
              resident_id: property.resident_id,
              amount: 5000,
              bill_type: 'monthly',
              due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
              status: 'unpaid',
            },
          ])

        if (billError) throw new Error(`Bill creation failed: ${billError.message}`)
      }
      console.log(`✓ Demo bills created for ${properties.data.length} properties\n`)
    }

    // 8. Create Demo Amenities
    console.log('Creating demo amenities...')
    const amenities = [
      {
        name: 'Community Hall',
        description: 'For events and gatherings',
        capacity: 100,
        cost_per_hour: 500,
      },
      {
        name: 'Swimming Pool',
        description: 'Olympic sized pool',
        capacity: 50,
        cost_per_hour: 200,
      },
      {
        name: 'Gym',
        description: 'Fully equipped fitness center',
        capacity: 30,
        cost_per_hour: 300,
      },
    ]

    for (const amenity of amenities) {
      const { error: amenityError } = await supabase
        .from('amenities')
        .insert([
          {
            society_id: societyId,
            ...amenity,
            available_hours_start: '06:00',
            available_hours_end: '22:00',
          },
        ])

      if (amenityError) throw new Error(`Amenity creation failed: ${amenityError.message}`)
    }
    console.log(`✓ ${amenities.length} demo amenities created\n`)

    // 9. Create Demo Complaints
    console.log('Creating demo complaints...')
    for (let i = 0; i < residentIds.length; i++) {
      const property = properties.data?.[i]
      if (property) {
        const { error: complaintError } = await supabase
          .from('complaints')
          .insert([
            {
              society_id: societyId,
              resident_id: property.resident_id,
              property_id: property.id,
              title: `Water issue in unit ${i + 1}`,
              description: 'Water pressure is low in the unit',
              category: 'maintenance',
              priority: 'high',
              status: 'open',
            },
          ])

        if (complaintError) throw new Error(`Complaint creation failed: ${complaintError.message}`)
      }
    }
    console.log(`✓ Demo complaints created\n`)

    // 10. Create Financial Data
    console.log('Creating financial data...')
    const { error: financialError } = await supabase
      .from('financial_data')
      .insert([
        {
          society_id: societyId,
          period: 'November 2024',
          total_collected: 450000,
          total_expenses: 120000,
          balance: 330000,
          expense_breakdown: {
            maintenance: 50000,
            staff: 40000,
            utilities: 30000,
          },
        },
      ])

    if (financialError) throw new Error(`Financial data creation failed: ${financialError.message}`)
    console.log(`✓ Financial data created\n`)

    console.log('========================================')
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY')
    console.log('========================================\n')

    console.log('DEMO ACCOUNT CREDENTIALS:\n')
    console.log('SUPERADMIN:')
    console.log(`  Email: ${demoData.superadmin.email}`)
    console.log(`  Password: ${demoData.superadmin.password}\n`)

    console.log('SOCIETY ADMIN:')
    console.log(`  Email: ${demoData.admin.email}`)
    console.log(`  Password: ${demoData.admin.password}`)
    console.log(`  Society: ${demoData.society.name}\n`)

    console.log('RESIDENTS:')
    demoData.residents.forEach((resident) => {
      console.log(`  ${resident.name}`)
      console.log(`    Email: ${resident.email}`)
      console.log(`    Password: ${resident.password}`)
      console.log(`    Unit: ${resident.unit}\n`)
    })

    console.log('WATCHMEN:')
    demoData.watchmen.forEach((watchman) => {
      console.log(`  ${watchman.name}`)
      console.log(`    Email: ${watchman.email}`)
      console.log(`    Password: ${watchman.password}\n`)
    })
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  }
}

seedDatabase()
