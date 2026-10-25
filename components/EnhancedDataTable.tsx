'use client'

import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface Column {
  key: string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: any, row: any) => React.ReactNode
}

interface EnhancedDataTableProps {
  columns: Column[]
  data: any[]
  itemsPerPage?: number
  searchableFields?: string[]
  onRowClick?: (row: any) => void
  actions?: (row: any) => React.ReactNode
}

export default function EnhancedDataTable({
  columns,
  data,
  itemsPerPage = 10,
  searchableFields = [],
  onRowClick,
  actions
}: EnhancedDataTableProps) {
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data

    return data.filter(row => 
      searchableFields.some(field => {
        const value = row[field]?.toString().toLowerCase() || ''
        return value.includes(searchQuery.toLowerCase())
      })
    )
  }, [data, searchQuery, searchableFields])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortBy) return filteredData

    return [...filteredData].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    })
  }, [filteredData, sortBy, sortOrder])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage, itemsPerPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(columnKey)
      setSortOrder('asc')
    }
    setCurrentPage(1)
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchableFields.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto border border-slate-200 rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left font-semibold text-slate-900 ${
                    column.sortable ? 'cursor-pointer hover:bg-slate-100' : ''
                  }`}
                  onClick={() => column.sortable && handleSort(column.key)}
                  style={{ width: column.width }}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && sortBy === column.key && (
                      sortOrder === 'asc' 
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </th>
              ))}
              {actions && <th className="px-4 py-3 text-left font-semibold text-slate-900 w-32">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-4 py-8 text-center text-slate-500">
                  No data found
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-b border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map(column => (
                    <td key={column.key} className="px-4 py-3 text-slate-900">
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  {actions && (
                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                      {actions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-slate-600">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1 rounded-lg text-sm font-medium ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white'
                        : 'border border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              {totalPages > 5 && <span className="text-slate-400">...</span>}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
