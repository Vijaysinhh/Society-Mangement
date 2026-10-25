import { cache, CACHE_KEYS, CACHE_TTL } from '@/lib/cache'
import { errors, handleApiError } from '@/lib/errors'
import { supabaseAdmin } from '@/lib/db'

/**
 * GET /api/financial?society_id=xxx
 * Get financial summary for society (admin only)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const societyId = searchParams.get('society_id')

    if (!societyId) {
      throw errors.validation('society_id is required')
    }

    if (user.role !== 'admin' && user.role !== 'superadmin') {
      throw errors.forbidden('Only admins can view financial data')
    }

    const cacheKey = CACHE_KEYS.FINANCIAL_DATA(societyId)
    const cached = cache.get(cacheKey)
    if (cached) {
      return Response.json({ success: true, data: cached, fromCache: true })
    }

    // Get total bills
    const { data: billsData } = await supabaseAdmin
      .from('maintenance_bills')
      .select('amount, status')
      .eq('society_id', societyId)

    // Get confirmed payments
    const { data: paymentsData } = await supabaseAdmin
      .from('bill_payments')
      .select('amount, status')
      .eq('status', 'confirmed')

    // Calculate metrics
    const totalBillsAmount =
      billsData?.reduce((sum, b) => sum + (b.amount || 0), 0) || 0
    const unpaidAmount =
      billsData
        ?.filter(b => b.status === 'unpaid')
        .reduce((sum, b) => sum + (b.amount || 0), 0) || 0
    const paidAmount =
      billsData
        ?.filter(b => b.status === 'paid')
        .reduce((sum, b) => sum + (b.amount || 0), 0) || 0
    const totalPayments =
      paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    const financialData = {
      totalBillsAmount,
      paidAmount,
      unpaidAmount,
      collectionPercentage:
        totalBillsAmount > 0 ? (paidAmount / totalBillsAmount) * 100 : 0,
      totalPaymentsReceived: totalPayments,
      outstandingAmount: unpaidAmount,
      lastUpdated: new Date().toISOString()
    }

    cache.set(cacheKey, financialData, CACHE_TTL.SHORT)

    return Response.json({
      success: true,
      data: financialData,
      fromCache: false
    })
  } catch (error) {
    return handleApiError(error)
  }
}


