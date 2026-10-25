import ResidentSignupForm from './ResidentSignupForm'

export default async function ResidentSignupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = '' } = await searchParams
  return <ResidentSignupForm token={token} />
}
