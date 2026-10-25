/**
 * Typed API client for making requests to backend
 * Automatically includes auth token and handles errors
 */

class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || '') {
    this.baseUrl = baseUrl
    this.loadToken()
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
  }

  private getHeaders(): Record<string, string> {
    this.loadToken()
    return {
      'Content-Type': 'application/json',
      ...(this.token && { 'Authorization': `Bearer ${this.token}` })
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`

    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || `Request failed: ${response.statusText}`)
    }

    return response.json()
  }

  // ============ Auth ============

  async login(email: string, password: string, role: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role })
    })

    if (result.token) {
      localStorage.setItem('auth_token', result.token)
      this.token = result.token
    }

    return result
  }

  async verifyToken() {
    return this.request('/auth/verify')
  }

  // ============ Bills ============

  async getBills(societyId: string, status?: string) {
    let url = `/bills?society_id=${societyId}`
    if (status) url += `&status=${status}`
    return this.request(url)
  }

  async createBill(data: any) {
    return this.request('/bills', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async payBill(bill_id: string, amount: number, payment_method: string) {
    return this.request('/bills/pay', {
      method: 'POST',
      body: JSON.stringify({ bill_id, amount, payment_method })
    })
  }

  async confirmPayment(payment_id: string) {
    return this.request('/bills/confirm-payment', {
      method: 'PATCH',
      body: JSON.stringify({ payment_id, confirmed: true })
    })
  }

  // ============ Properties ============

  async getProperties(societyId: string) {
    return this.request(`/properties?society_id=${societyId}`)
  }

  async createProperty(data: any) {
    return this.request('/properties', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ============ Complaints ============

  async getComplaints(societyId: string, status?: string) {
    let url = `/complaints?society_id=${societyId}`
    if (status) url += `&status=${status}`
    return this.request(url)
  }

  async createComplaint(data: any) {
    return this.request('/complaints', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async respondComplaint(complaint_id: string, response_text: string, status: string) {
    return this.request('/complaints', {
      method: 'PATCH',
      body: JSON.stringify({ complaint_id, response_text, status })
    })
  }

  // ============ Visitors ============

  async getVisitors(societyId: string) {
    return this.request(`/visitors?society_id=${societyId}`)
  }

  async logVisitor(data: any) {
    return this.request('/visitors', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async approveVisitor(visitor_log_id: string, decision: string, reason?: string) {
    return this.request('/visitors', {
      method: 'PATCH',
      body: JSON.stringify({ visitor_log_id, decision, reason })
    })
  }

  // ============ Blacklist ============

  async getBlacklist(societyId: string) {
    return this.request(`/blacklist?society_id=${societyId}`)
  }

  async addToBlacklist(visitor_name: string, reason: string) {
    return this.request('/blacklist', {
      method: 'POST',
      body: JSON.stringify({ visitor_name, reason })
    })
  }

  // ============ Amenities ============

  async getAmenities(societyId: string) {
    return this.request(`/amenities?society_id=${societyId}`)
  }

  async createAmenity(data: any) {
    return this.request('/amenities', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async bookAmenity(data: any) {
    return this.request('/amenities?book=true', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ============ Parcels ============

  async getParcels(societyId: string) {
    return this.request(`/parcels?society_id=${societyId}`)
  }

  async logParcel(data: any) {
    return this.request('/parcels', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async confirmParcelReceipt(parcel_id: string) {
    return this.request('/parcels/confirm-receipt', {
      method: 'PATCH',
      body: JSON.stringify({ parcel_id })
    })
  }

  // ============ Watchman ============

  async checkIn(duty_date: string) {
    return this.request('/watchmen/duty/check-in', {
      method: 'POST',
      body: JSON.stringify({ duty_date })
    })
  }

  async checkOut() {
    return this.request('/watchmen/duty/check-out', {
      method: 'PATCH'
    })
  }

  // ============ Emergency ============

  async triggerEmergency(data: any) {
    return this.request('/emergency', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async getEmergencyAlerts(societyId: string) {
    return this.request(`/emergency?society_id=${societyId}`)
  }

  // ============ Reminders ============

  async getReminders(societyId: string) {
    return this.request(`/reminders?society_id=${societyId}`)
  }

  async sendReminders() {
    return this.request('/reminders', { method: 'POST' })
  }

  // ============ Messages ============

  async getMessages(conversation_id: string) {
    return this.request(`/messages?conversation_id=${conversation_id}`)
  }

  async sendMessage(data: any) {
    return this.request('/messages', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ============ Financial ============

  async getFinancialData(societyId: string) {
    return this.request(`/financial?society_id=${societyId}`)
  }

  async getResidentFinancialData(societyId: string) {
    return this.request(`/financial?society_id=${societyId}&residents=true`)
  }
}

export const apiClient = new ApiClient()
