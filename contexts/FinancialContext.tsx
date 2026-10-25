'use client'

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

// Financial Data Types
export interface Transaction {
  id: string
  societyId: string
  unitId: string
  type: 'payment' | 'expense' | 'adjustment'
  amount: number
  description: string
  date: Date
  createdAt: Date
  updatedAt: Date
  status: 'completed' | 'pending' | 'failed'
  paymentMethod?: string
  referenceNumber?: string
}

export interface Payment {
  id: string
  societyId: string
  unitId: string
  amount: number
  date: Date
  description: string
  paymentMethod: 'cash' | 'check' | 'bank-transfer' | 'online'
  referenceNumber: string
  recordedBy: string
  status: 'completed' | 'pending'
  createdAt: Date
}

export interface Expense {
  id: string
  societyId: string
  amount: number
  category: string
  description: string
  date: Date
  attachmentUrl?: string
  approvedBy?: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
}

export interface FilterState {
  dateFrom?: Date
  dateTo?: Date
  typeFilter?: string[]
  unitFilter?: string[]
  statusFilter?: string[]
  searchQuery?: string
}

export interface BulkActionState {
  selectedIds: Set<string>
  isSelectAll: boolean
  actionInProgress: boolean
}

interface FinancialContextType {
  // Data
  transactions: Transaction[]
  payments: Payment[]
  expenses: Expense[]
  
  // Real-time sync hooks
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt'>) => void
  updatePayment: (id: string, updates: Partial<Payment>) => void
  deletePayment: (id: string) => void
  
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  
  // Filtering & Search
  filters: FilterState
  setFilters: (filters: FilterState) => void
  getFilteredTransactions: () => Transaction[]
  saveFilterPreset: (name: string, filters: FilterState) => void
  loadFilterPreset: (name: string) => void
  filterPresets: Map<string, FilterState>
  
  // Bulk operations
  bulkState: BulkActionState
  toggleSelectItem: (id: string) => void
  toggleSelectAll: () => void
  clearSelection: () => void
  bulkDelete: () => void
  bulkMarkAsPaid: () => void
  bulkExport: () => void
  
  // Calculated values
  getTotalTransactions: (societyId: string) => number
  getTotalPayments: (societyId: string) => number
  getTotalExpenses: (societyId: string) => number
  getOutstandingBalance: (societyId: string) => number
  getMonthlyCollectionRate: (societyId: string) => number
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined)

export function FinancialProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [filters, setFilters] = useState<FilterState>({})
  const [bulkState, setBulkState] = useState<BulkActionState>({
    selectedIds: new Set(),
    isSelectAll: false,
    actionInProgress: false,
  })
  const [filterPresets, setFilterPresets] = useState<Map<string, FilterState>>(new Map())

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('financial_transactions')
      const storedPayments = localStorage.getItem('financial_payments')
      const storedExpenses = localStorage.getItem('financial_expenses')
      const storedPresets = localStorage.getItem('financial_presets')

      if (storedTransactions) {
        const parsed = JSON.parse(storedTransactions).map((t: any) => ({
          ...t,
          date: new Date(t.date),
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
        }))
        setTransactions(parsed)
      }

      if (storedPayments) {
        const parsed = JSON.parse(storedPayments).map((p: any) => ({
          ...p,
          date: new Date(p.date),
          createdAt: new Date(p.createdAt),
        }))
        setPayments(parsed)
      }

      if (storedExpenses) {
        const parsed = JSON.parse(storedExpenses).map((e: any) => ({
          ...e,
          date: new Date(e.date),
          createdAt: new Date(e.createdAt),
        }))
        setExpenses(parsed)
      }

      if (storedPresets) {
        const presets = JSON.parse(storedPresets)
        setFilterPresets(new Map(Object.entries(presets)))
      }
    } catch (error) {
      console.error('Failed to load financial data:', error)
    }
  }, [])

  // Persist transactions to localStorage (real-time sync)
  useEffect(() => {
    if (transactions.length > 0) {
      localStorage.setItem('financial_transactions', JSON.stringify(transactions))
      // Dispatch custom event for real-time updates
      window.dispatchEvent(new CustomEvent('financial-sync', { detail: { type: 'transactions', data: transactions } }))
    }
  }, [transactions])

  useEffect(() => {
    if (payments.length >= 0) {
      localStorage.setItem('financial_payments', JSON.stringify(payments))
      window.dispatchEvent(new CustomEvent('financial-sync', { detail: { type: 'payments', data: payments } }))
    }
  }, [payments])

  useEffect(() => {
    if (expenses.length >= 0) {
      localStorage.setItem('financial_expenses', JSON.stringify(expenses))
      window.dispatchEvent(new CustomEvent('financial-sync', { detail: { type: 'expenses', data: expenses } }))
    }
  }, [expenses])

  // Transaction operations with real-time sync
  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setTransactions(prev => [newTransaction, ...prev])
  }, [])

  const updateTransaction = useCallback((id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
      )
    )
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id))
  }, [])

  // Payment operations
  const addPayment = useCallback((payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: `pay-${Date.now()}`,
      createdAt: new Date(),
    }
    setPayments(prev => [newPayment, ...prev])
    // Also add as transaction
    addTransaction({
      societyId: payment.societyId,
      unitId: payment.unitId,
      type: 'payment',
      amount: payment.amount,
      description: payment.description,
      date: payment.date,
      status: payment.status === 'completed' ? 'completed' : 'pending',
    })
  }, [addTransaction])

  const updatePayment = useCallback((id: string, updates: Partial<Payment>) => {
    setPayments(prev =>
      prev.map(p => (p.id === id ? { ...p, ...updates } : p))
    )
  }, [])

  const deletePayment = useCallback((id: string) => {
    setPayments(prev => prev.filter(p => p.id !== id))
  }, [])

  // Expense operations
  const addExpense = useCallback((expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: new Date(),
    }
    setExpenses(prev => [newExpense, ...prev])
    // Also add as transaction
    addTransaction({
      societyId: expense.societyId,
      unitId: 'expense',
      type: 'expense',
      amount: -expense.amount, // Negative for expenses
      description: expense.description,
      date: expense.date,
      status: 'completed',
    })
  }, [addTransaction])

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(e => (e.id === id ? { ...e, ...updates } : e))
    )
  }, [])

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id))
  }, [])

  // Filter operations with advanced search
  const getFilteredTransactions = useCallback((): Transaction[] => {
    let filtered = transactions

    if (filters.dateFrom) {
      filtered = filtered.filter(t => t.date >= filters.dateFrom!)
    }
    if (filters.dateTo) {
      filtered = filtered.filter(t => t.date <= filters.dateTo!)
    }
    if (filters.typeFilter && filters.typeFilter.length > 0) {
      filtered = filtered.filter(t => filters.typeFilter!.includes(t.type))
    }
    if (filters.statusFilter && filters.statusFilter.length > 0) {
      filtered = filtered.filter(t => filters.statusFilter!.includes(t.status))
    }
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(query) ||
        t.referenceNumber?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [transactions, filters])

  // Bulk operations
  const toggleSelectItem = useCallback((id: string) => {
    setBulkState(prev => ({
      ...prev,
      selectedIds: new Set(
        prev.selectedIds.has(id)
          ? Array.from(prev.selectedIds).filter(item => item !== id)
          : [...prev.selectedIds, id]
      ),
    }))
  }, [])

  const toggleSelectAll = useCallback(() => {
    setBulkState(prev => ({
      ...prev,
      isSelectAll: !prev.isSelectAll,
      selectedIds: !prev.isSelectAll
        ? new Set(transactions.map(t => t.id))
        : new Set(),
    }))
  }, [transactions])

  const clearSelection = useCallback(() => {
    setBulkState(prev => ({
      ...prev,
      selectedIds: new Set(),
      isSelectAll: false,
    }))
  }, [])

  const bulkDelete = useCallback(async () => {
    setBulkState(prev => ({ ...prev, actionInProgress: true }))
    try {
      const ids = Array.from(bulkState.selectedIds)
      ids.forEach(id => deleteTransaction(id))
      clearSelection()
    } finally {
      setBulkState(prev => ({ ...prev, actionInProgress: false }))
    }
  }, [bulkState.selectedIds, deleteTransaction, clearSelection])

  const bulkMarkAsPaid = useCallback(async () => {
    setBulkState(prev => ({ ...prev, actionInProgress: true }))
    try {
      const ids = Array.from(bulkState.selectedIds)
      ids.forEach(id => {
        const txn = transactions.find(t => t.id === id)
        if (txn?.type === 'payment') {
          updateTransaction(id, { status: 'completed' })
        }
      })
      clearSelection()
    } finally {
      setBulkState(prev => ({ ...prev, actionInProgress: false }))
    }
  }, [bulkState.selectedIds, transactions, updateTransaction, clearSelection])

  const bulkExport = useCallback(async () => {
    try {
      const ids = Array.from(bulkState.selectedIds)
      const selectedTransactions = transactions.filter(t => ids.includes(t.id))
      
      const csv = [
        ['ID', 'Date', 'Type', 'Amount', 'Description', 'Status'].join(','),
        ...selectedTransactions.map(t =>
          [t.id, t.date.toISOString(), t.type, t.amount, t.description, t.status].join(',')
        ),
      ].join('\n')

      const blob = new Blob([csv], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      clearSelection()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [bulkState.selectedIds, transactions, clearSelection])

  // Filter presets
  const saveFilterPreset = useCallback((name: string, filtersToSave: FilterState) => {
    const newPresets = new Map(filterPresets)
    newPresets.set(name, filtersToSave)
    setFilterPresets(newPresets)
    localStorage.setItem('financial_presets', JSON.stringify(Object.fromEntries(newPresets)))
  }, [filterPresets])

  const loadFilterPreset = useCallback((name: string) => {
    const preset = filterPresets.get(name)
    if (preset) {
      setFilters(preset)
    }
  }, [filterPresets])

  // Calculated values
  const getTotalTransactions = useCallback((societyId: string) => {
    return transactions.filter(t => t.societyId === societyId).length
  }, [transactions])

  const getTotalPayments = useCallback((societyId: string) => {
    return payments
      .filter(p => p.societyId === societyId && p.status === 'completed')
      .reduce((sum, p) => sum + p.amount, 0)
  }, [payments])

  const getTotalExpenses = useCallback((societyId: string) => {
    return expenses
      .filter(e => e.societyId === societyId && e.status === 'approved')
      .reduce((sum, e) => sum + e.amount, 0)
  }, [expenses])

  const getOutstandingBalance = useCallback((societyId: string) => {
    const collected = getTotalPayments(societyId)
    const spent = getTotalExpenses(societyId)
    return collected - spent
  }, [getTotalPayments, getTotalExpenses])

  const getMonthlyCollectionRate = useCallback((societyId: string) => {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthlyPayments = payments.filter(
      p => p.societyId === societyId && p.date >= startOfMonth && p.status === 'completed'
    ).length
    return monthlyPayments
  }, [payments])

  const value: FinancialContextType = {
    transactions,
    payments,
    expenses,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addPayment,
    updatePayment,
    deletePayment,
    addExpense,
    updateExpense,
    deleteExpense,
    filters,
    setFilters,
    getFilteredTransactions,
    saveFilterPreset,
    loadFilterPreset,
    filterPresets,
    bulkState,
    toggleSelectItem,
    toggleSelectAll,
    clearSelection,
    bulkDelete,
    bulkMarkAsPaid,
    bulkExport,
    getTotalTransactions,
    getTotalPayments,
    getTotalExpenses,
    getOutstandingBalance,
    getMonthlyCollectionRate,
  }

  return (
    <FinancialContext.Provider value={value}>
      {children}
    </FinancialContext.Provider>
  )
}

export function useFinancial() {
  const context = useContext(FinancialContext)
  if (context === undefined) {
    throw new Error('useFinancial must be used within a FinancialProvider')
  }
  return context
}
