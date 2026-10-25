import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { hashPassword } from '@/lib/crypto'
import { createSession, SESSION_COOKIE, sessionCookieOptions } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
    const body = await request.json()
    const required = ['token', 'name', 'phone', 'password', 'unitNumber', 'unitType', 'assignmentRole', 'bedroomCount']
    if (required.some((key) => !String(body[key] || '').trim())) return NextResponse.json({ error: 'Complete all required fields' }, { status: 400 })
    if (String(body.password).length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    if (!['villa', 'bungalow', 'flat'].includes(body.unitType)) return NextResponse.json({ error: 'Invalid property type' }, { status: 400 })
    if (!['owner', 'tenant'].includes(body.assignmentRole)) return NextResponse.json({ error: 'Choose owner or tenant' }, { status: 400 })
    const bedroomCount = Number(body.bedroomCount)
    if (!Number.isInteger(bedroomCount) || bedroomCount < 1 || bedroomCount > 5) return NextResponse.json({ error: 'Choose a valid BHK' }, { status: 400 })
    const floorMissing = body.floor === null || body.floor === undefined || String(body.floor).trim() === ''
    const floorNumber = floorMissing ? null : Number(body.floor)
    if (body.unitType === 'flat' && (floorMissing || !Number.isInteger(floorNumber) || Number(floorNumber) < 0)) return NextResponse.json({ error: 'Floor number is required for flats' }, { status: 400 })
    const vehicles = Array.isArray(body.vehicles) ? body.vehicles : []
    if (vehicles.length > 10) return NextResponse.json({ error: 'You can register up to 10 vehicles' }, { status: 400 })
    for (const vehicle of vehicles) {
      const registrationNumber = typeof vehicle?.registrationNumber === 'string' ? vehicle.registrationNumber.trim().toUpperCase().replace(/\s+/g, '') : ''
      if (!/^[A-Z0-9-]{4,20}$/.test(registrationNumber)) return NextResponse.json({ error: 'Enter a valid vehicle registration number' }, { status: 400 })
      if (!['car', 'bike', 'scooter', 'other'].includes(vehicle?.vehicleType)) return NextResponse.json({ error: 'Choose a valid vehicle type' }, { status: 400 })
      vehicle.registrationNumber = registrationNumber
      vehicle.makeModel = String(vehicle.makeModel || '').trim().slice(0, 100)
      vehicle.color = String(vehicle.color || '').trim().slice(0, 50)
      vehicle.parkingSlot = String(vehicle.parkingSlot || '').trim().slice(0, 50)
    }

    const { data, error } = await supabaseAdmin.rpc('redeem_resident_self_invitation_v2', {
      p_token_hash: crypto.createHash('sha256').update(String(body.token)).digest('hex'),
      p_name: String(body.name).trim(), p_phone: String(body.phone).trim(), p_email: String(body.email || '').trim(),
      p_password_hash: hashPassword(String(body.password)), p_unit_number: String(body.unitNumber).trim(),
      p_unit_type: body.unitType, p_floor: body.unitType === 'flat' ? floorNumber : null,
      p_area_sqft: null,
      p_bedroom_count: bedroomCount,
      p_bathroom_count: null,
      p_assignment_role: body.assignmentRole,
      p_vehicles: vehicles,
    })
    if (error || !data?.resident) return NextResponse.json({ error: error?.message || 'Could not create resident account' }, { status: error?.code === '23505' ? 409 : 400 })

    const session = await createSession('resident', data.resident.id, data.resident.society_id)
    const result = NextResponse.json({ success: true, resident: data.resident, unit: data.unit }, { status: 201 })
    result.cookies.set(SESSION_COOKIE, session.token, sessionCookieOptions(session.expiresAt))
    return result
  } catch (error) {
    console.error('[Resident signup] POST failed:', error)
    return NextResponse.json({ error: 'Could not create resident account' }, { status: 500 })
  }
}
