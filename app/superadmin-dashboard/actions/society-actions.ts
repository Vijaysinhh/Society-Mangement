'use server'

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export async function createSocietyAction(societyData: {
  name: string
  slug: string
  address: string
  city: string
  state: string
  phone: string
  contactPerson: string
  villas: number
  bungalows: number
  flats: number
}) {
  try {
    console.log('[v0] Creating society with data:', societyData)

    const { data, error } = await supabase
      .from('societies')
      .insert([
        {
          name: societyData.name,
          slug: societyData.slug,
          address: societyData.address,
          city: societyData.city,
          state: societyData.state,
          phone: societyData.phone,
          contact_person: societyData.contactPerson,
          villas: societyData.villas,
          bungalows: societyData.bungalows,
          flats: societyData.flats,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('[v0] Supabase error creating society:', error)
      throw error
    }

    console.log('[v0] Society created successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('[v0] Error creating society:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
