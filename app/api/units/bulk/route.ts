import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'
import * as response from '@/lib/api-response'

export async function POST(request: Request) {
  try {
    if (!supabaseAdmin) return response.error('Database not configured', 503)
    const session = await getRequestSession(request)
    if (!session || session.accountType !== 'society_admin' || !session.societyId) return response.unauthorized()
    const body = await request.json(); const rows = Array.isArray(body.units) ? body.units : []
    if (!rows.length || rows.length > 1000) return response.error('Provide between 1 and 1000 properties', 400)
    const errors: Array<{ row: number; message: string }> = []; const seen = new Set<string>()
    const units = rows.map((row: any, index: number) => {
      const unitNumber = String(row.unitNumber || '').trim(), unitType = String(row.unitType || '').toLowerCase(), bhk = Number(row.bedroomCount), floor = unitType === 'flat' ? Number(row.floor) : null
      if (!unitNumber) errors.push({ row: index + 2, message: 'Unit number is required' })
      if (seen.has(unitNumber.toLowerCase())) errors.push({ row: index + 2, message: 'Duplicate unit number in file' }); seen.add(unitNumber.toLowerCase())
      if (!['flat', 'villa', 'bungalow'].includes(unitType)) errors.push({ row: index + 2, message: 'Property type must be flat, villa, or bungalow' })
      if (!Number.isInteger(bhk) || bhk < 1 || bhk > 5) errors.push({ row: index + 2, message: 'BHK must be 1 to 5' })
      if (unitType === 'flat' && (!Number.isInteger(floor) || Number(floor) < 0)) errors.push({ row: index + 2, message: 'Floor is required for flats' })
      return { society_id: session.societyId, unit_number: unitNumber, unit_type: unitType, floor, bedroom_count: bhk, lifecycle_status: 'active', created_by: session.accountId }
    })
    if (errors.length) return response.error(JSON.stringify(errors), 400)
    const { data: existing } = await supabaseAdmin.from('units').select('unit_number').eq('society_id', session.societyId).in('unit_number', units.map((u: { unit_number: string }) => u.unit_number))
    if (existing?.length) return response.conflict(`Already exists: ${existing.map((u: { unit_number: string }) => u.unit_number).join(', ')}`)
    const { data, error } = await supabaseAdmin.from('units').insert(units).select('id, unit_number, unit_type, floor, bedroom_count, lifecycle_status')
    if (error) return response.error(error.message, 400)
    await supabaseAdmin.from('audit_events').insert({ society_id: session.societyId, actor_type: 'society_admin', actor_id: session.accountId, action: 'units.bulk_created', entity_type: 'unit', metadata: { count: data.length } })
    return response.created(data)
  } catch (error) { console.error('[Units bulk] POST failed:', error); return response.serverError() }
}
