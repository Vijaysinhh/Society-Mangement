import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { getSessionByToken, SESSION_COOKIE } from '@/lib/session'

export default async function ResidentDashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = await getSessionByToken(cookieStore.get(SESSION_COOKIE)?.value)
  if (!session || session.accountType !== 'resident') redirect('/resident-login')
  return children
}
