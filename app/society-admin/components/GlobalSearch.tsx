'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, Home, Car, Users, Wrench } from 'lucide-react'
import { Unit } from '@/types'

interface SearchResult {
  type: 'unit' | 'vehicle' | 'resident' | 'ticket'
  title: string
  subtitle: string
  icon: typeof Home
  data: any
}

interface GlobalSearchProps {
  societyId: string
  onSelectUnit?: (unit: Unit) => void
}

export default function GlobalSearch({ societyId, onSelectUnit }: GlobalSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchQuery = query.toLowerCase()
    const foundResults: SearchResult[] = []

    // Search units
    const units: Unit[] = JSON.parse(localStorage.getItem('units') || '[]')
      .filter((u: Unit) => u.societyId === societyId)

    units.forEach(unit => {
      // Match unit number
      if (unit.unitNumber.toLowerCase().includes(searchQuery)) {
        foundResults.push({
          type: 'unit',
          title: unit.unitNumber,
          subtitle: `${unit.unitType} - ${unit.status}`,
          icon: Home,
          data: unit
        })
      }

      // Match vehicle numbers
      unit.vehicles?.forEach(vehicle => {
        if (vehicle.number.toLowerCase().includes(searchQuery)) {
          foundResults.push({
            type: 'vehicle',
            title: vehicle.number,
            subtitle: `${vehicle.type === 'four-wheeler' ? 'Car' : 'Bike'} - ${unit.unitNumber}`,
            icon: Car,
            data: unit
          })
        }
      })

      // Match resident names
      unit.residents?.forEach(resident => {
        if (resident.name.toLowerCase().includes(searchQuery)) {
          foundResults.push({
            type: 'resident',
            title: resident.name,
            subtitle: `Resident - ${unit.unitNumber}`,
            icon: Users,
            data: unit
          })
        }
      })

      // Match owner/tenant phone
      if (unit.rentalInfo?.ownerPhone?.includes(searchQuery) || 
          unit.rentalInfo?.tenantPhone?.includes(searchQuery)) {
        foundResults.push({
          type: 'unit',
          title: unit.unitNumber,
          subtitle: `Phone match - ${unit.rentalInfo?.ownerName || 'Owner'}`,
          icon: Home,
          data: unit
        })
      }
    })

    // Search maintenance tickets
    const tickets = JSON.parse(localStorage.getItem('maintenanceTickets') || '[]')
    tickets.forEach((ticket: any) => {
      if (ticket.description?.toLowerCase().includes(searchQuery) ||
          ticket.category?.toLowerCase().includes(searchQuery)) {
        foundResults.push({
          type: 'ticket',
          title: ticket.category,
          subtitle: `Ticket - ${ticket.status}`,
          icon: Wrench,
          data: ticket
        })
      }
    })

    setResults(foundResults.slice(0, 8))
  }, [query, societyId])

  const handleSelect = (result: SearchResult) => {
    if (result.type === 'unit' || result.type === 'vehicle' || result.type === 'resident') {
      onSelectUnit?.(result.data)
    }
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search units, vehicles, residents..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full pl-12 pr-10 py-3 sm:py-3.5 text-sm sm:text-base border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
        />
        {query && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400 hover:text-slate-600" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      {isOpen && results.length > 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg border border-slate-200 shadow-lg z-50 max-h-96 overflow-y-auto">
            {results.map((result, index) => {
              const Icon = result.icon
              return (
                <button
                  key={index}
                  onClick={() => handleSelect(result)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 text-left border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <div className={`p-2 rounded-lg ${
                    result.type === 'unit' ? 'bg-indigo-100' :
                    result.type === 'vehicle' ? 'bg-green-100' :
                    result.type === 'resident' ? 'bg-purple-100' :
                    'bg-orange-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      result.type === 'unit' ? 'text-indigo-600' :
                      result.type === 'vehicle' ? 'text-green-600' :
                      result.type === 'resident' ? 'text-purple-600' :
                      'text-orange-600'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{result.title}</p>
                    <p className="text-xs text-slate-500 truncate">{result.subtitle}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </>
      )}

      {isOpen && query && results.length === 0 && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-50 p-4 text-center">
            <p className="text-sm text-slate-500">No results found for "{query}"</p>
          </div>
        </>
      )}
    </div>
  )
}
