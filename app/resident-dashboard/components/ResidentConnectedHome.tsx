import { Building2, CircleDashed, Home, ShieldCheck, UserRound } from 'lucide-react'
import ResidentParcels from './ResidentParcels'

type Property = { id: string; unitNumber: string; floor: string; unitType: string; type: 'owner' | 'tenant' }

export default function ResidentConnectedHome({ firstName, societyName, property }: { firstName: string; societyName: string; property: Property }) {
  return <div className="space-y-6">
    <section><p className="text-sm font-semibold text-purple-700">{societyName}</p><h2 className="mt-1 text-2xl font-bold text-slate-950">Welcome, {firstName}</h2><p className="mt-2 text-sm text-slate-600">Your resident account and property connection are active.</p></section>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start"><div><div className="flex items-center gap-2"><Home className="h-5 w-5 text-purple-700" /><h3 className="text-lg font-bold">Unit {property.unitNumber}</h3></div><p className="mt-2 text-sm capitalize text-slate-600">{property.unitType}{property.floor ? ` · Floor ${property.floor}` : ''}</p></div><span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold capitalize text-emerald-800"><ShieldCheck className="h-3.5 w-3.5" />{property.type}</span></div>
    </section>
    <ResidentParcels />
    <section><h3 className="text-base font-bold text-slate-900">Services</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">
      {[['Payments and maintenance', Building2], ['Visitors and gate approvals', ShieldCheck], ['Issues and complaints', CircleDashed], ['Community updates', UserRound]].map(([label, Icon]) => <div key={String(label)} className="rounded-xl border border-dashed border-slate-300 bg-white p-4"><Icon className="h-5 w-5 text-slate-400" /><p className="mt-3 text-sm font-semibold text-slate-800">{label}</p><p className="mt-1 text-xs text-slate-500">Not configured yet</p></div>)}
    </div></section>
  </div>
}
