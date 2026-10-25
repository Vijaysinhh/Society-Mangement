'use client'

import { useState } from 'react'
import { Download, ChevronDown, FileText, File } from 'lucide-react'
import { exportToCSV, exportToJSON, exportToPDF, printData } from '@/lib/reportExport'

interface ExportButtonProps {
  filename: string
  data: any[]
  columns: { key: string; label: string }[]
  title?: string
}

export default function ExportButton({
  filename,
  data,
  columns,
  title = 'Report'
}: ExportButtonProps) {
  const [showMenu, setShowMenu] = useState(false)

  const handleExport = (format: 'csv' | 'json' | 'pdf' | 'print') => {
    if (format === 'csv') {
      exportToCSV({ filename, data, columns })
    } else if (format === 'json') {
      exportToJSON({ filename, data, columns })
    } else if (format === 'pdf') {
      exportToPDF({ filename, data, columns })
    } else if (format === 'print') {
      printData(title, data, columns)
    }
    setShowMenu(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
      >
        <Download className="w-4 h-4" />
        Export
        <ChevronDown className="w-3 h-3 ml-1" />
      </button>

      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 min-w-48">
          <button
            onClick={() => handleExport('csv')}
            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-900 border-b border-slate-100"
          >
            <File className="w-4 h-4" />
            Export to CSV
          </button>
          <button
            onClick={() => handleExport('json')}
            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-900 border-b border-slate-100"
          >
            <FileText className="w-4 h-4" />
            Export to JSON
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-900 border-b border-slate-100"
          >
            <FileText className="w-4 h-4" />
            Export to PDF
          </button>
          <button
            onClick={() => handleExport('print')}
            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-900"
          >
            <Download className="w-4 h-4" />
            Print
          </button>
        </div>
      )}
    </div>
  )
}
