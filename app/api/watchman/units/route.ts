import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/db'
import { getRequestSession } from '@/lib/session'

export async function GET(request: Request) {
  if (!supabaseAdmin) return NextResponse.json({ error: 'Database not configured' }, { status: 503 })
  const session = await getRequestSession(request)
  if (!session?.societyId || session.accountType !== 'watchman') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabaseAdmin.from('units').select('id, unit_number, unit_type, unit_assignments!inner(status, residents(name))').eq('society_id', session.societyId).eq('lifecycle_status', 'active').eq('unit_assignments.status', 'active').order('unit_number')
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ units: (data || []).map((unit) => ({ id: unit.id, unitNumber: unit.unit_number, unitType: unit.unit_type, residents: (unit.unit_assignments || []).map((assignment: any) => { const resident = Array.isArray(assignment.residents) ? assignment.residents[0] : assignment.residents; return resident?.name }).filter(Boolean) })) })
}
