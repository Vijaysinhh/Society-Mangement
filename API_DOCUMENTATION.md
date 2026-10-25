# API DOCUMENTATION TEMPLATES

Complete API endpoint documentation templates for all major features. Use these as reference when building the backend.

---

## AUTHENTICATION ENDPOINTS

### POST /api/auth/register
**Description:** Register a new user account

**Request:**
```json
{
  "email": "resident@society.com",
  "password": "securepass123",
  "fullName": "John Doe",
  "phone": "9876543210",
  "role": "resident",
  "societyId": "society-123",
  "unitId": "unit-456"
}
```

**Response (201):**
```json
{
  "id": "user-789",
  "email": "resident@society.com",
  "fullName": "John Doe",
  "role": "resident",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "createdAt": "2024-03-29T10:30:00Z"
}
```

**Error (400):**
```json
{
  "error": "Email already exists"
}
```

---

### POST /api/auth/login
**Description:** Login user and get JWT token

**Request:**
```json
{
  "email": "resident@society.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "id": "user-789",
  "email": "resident@society.com",
  "role": "resident",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400
}
```

**Error (401):**
```json
{
  "error": "Invalid credentials"
}
```

---

### POST /api/auth/logout
**Description:** Logout user (invalidate token)

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200):**
```json
{
  "message": "Logged out successfully"
}
```

---

## VISITOR PASSES ENDPOINTS

### GET /api/visitors?residentId=123
**Description:** Get all visitor passes for a resident

**Response (200):**
```json
[
  {
    "id": "visitor-001",
    "visitorName": "John Smith",
    "phone": "9876543210",
    "purpose": "Meeting",
    "visitDate": "2024-03-30",
    "visitTime": "10:00 AM",
    "status": "approved",
    "qrCode": "VISITOR-ABC123",
    "checkInTime": null,
    "checkOutTime": null
  },
  {
    "id": "visitor-002",
    "visitorName": "Jane Doe",
    "status": "checked-in",
    "checkInTime": "2024-03-30T10:15:00Z"
  }
]
```

---

### POST /api/visitors
**Description:** Create new visitor pass request

**Headers:**
```
Authorization: Bearer token
Content-Type: application/json
```

**Request:**
```json
{
  "visitorName": "John Smith",
  "phone": "9876543210",
  "purpose": "Meeting",
  "visitDate": "2024-03-30",
  "visitTime": "10:00 AM",
  "expectedDurationHours": 2,
  "unitNumber": "A-101"
}
```

**Response (201):**
```json
{
  "id": "visitor-001",
  "status": "pending",
  "createdAt": "2024-03-29T11:00:00Z",
  "message": "Visitor request submitted. Awaiting admin approval."
}
```

---

### PATCH /api/visitors/:id/approve
**Description:** Admin approves visitor pass

**Headers:**
```
Authorization: Bearer admin-token
```

**Request:**
```json
{
  "approvedBy": "admin-789"
}
```

**Response (200):**
```json
{
  "id": "visitor-001",
  "status": "approved",
  "qrCode": "VISITOR-ABC123XYZ",
  "approvedAt": "2024-03-29T11:30:00Z"
}
```

---

### POST /api/visitors/:id/check-in
**Description:** Watchman checks visitor in

**Request:**
```json
{
  "qrCode": "VISITOR-ABC123XYZ"
}
```

**Response (200):**
```json
{
  "id": "visitor-001",
  "status": "checked-in",
  "checkInTime": "2024-03-30T10:15:00Z",
  "visitorDetails": {
    "name": "John Smith",
    "unit": "A-101",
    "purpose": "Meeting"
  }
}
```

---

## ISSUES/MAINTENANCE ENDPOINTS

### GET /api/issues?residentId=123
**Description:** Get all issues for a resident

**Response (200):**
```json
[
  {
    "id": "issue-001",
    "title": "Water leak in kitchen",
    "type": "Plumbing",
    "status": "in-progress",
    "priority": "high",
    "createdAt": "2024-03-29T14:30:00Z",
    "assignedTo": "technician-555",
    "estimatedCompletion": "2024-03-31"
  }
]
```

---

### POST /api/issues
**Description:** Create new issue/complaint

**Request:**
```json
{
  "type": "Plumbing",
  "title": "Water leak in kitchen",
  "description": "Tap is leaking continuously",
  "location": "A-101, Kitchen",
  "priority": "high",
  "photos": ["photo-url-1", "photo-url-2"]
}
```

**Response (201):**
```json
{
  "id": "issue-001",
  "status": "submitted",
  "createdAt": "2024-03-29T14:30:00Z"
}
```

---

### PATCH /api/issues/:id/assign
**Description:** Admin assigns issue to technician

**Request:**
```json
{
  "assignedTo": "technician-555",
  "estimatedCompletion": "2024-03-31",
  "priority": "high"
}
```

**Response (200):**
```json
{
  "id": "issue-001",
  "status": "assigned",
  "assignedTo": "technician-555"
}
```

---

### PATCH /api/issues/:id/complete
**Description:** Technician marks issue as completed

**Request:**
```json
{
  "completionNotes": "Replaced tap washer, fixed leak",
  "completionPhotos": ["photo-url-3", "photo-url-4"],
  "workHours": 1.5,
  "partsCost": 250
}
```

**Response (200):**
```json
{
  "id": "issue-001",
  "status": "completed",
  "completedAt": "2024-03-30T11:00:00Z"
}
```

---

### PATCH /api/issues/:id/approve
**Description:** Admin approves completed work

**Response (200):**
```json
{
  "id": "issue-001",
  "status": "resolved",
  "approvedAt": "2024-03-30T16:00:00Z"
}
```

---

## AMENITIES ENDPOINTS

### GET /api/amenities?societyId=123
**Description:** Get all bookable amenities

**Response (200):**
```json
[
  {
    "id": "space-001",
    "name": "Community Hall",
    "description": "100 sq ft, capacity 50 people",
    "cost": 1000,
    "capacity": 50,
    "maxBookingHours": 8,
    "status": "active",
    "availability": {
      "monday": { "start": "10:00", "end": "21:00" },
      "tuesday": { "start": "10:00", "end": "21:00" }
    }
  }
]
```

---

### POST /api/amenities
**Description:** Admin creates new bookable space

**Headers:**
```
Authorization: Bearer admin-token
```

**Request:**
```json
{
  "name": "Community Hall",
  "description": "100 sq ft, capacity 50 people",
  "cost": 1000,
  "capacity": 50,
  "maxBookingHours": 8,
  "availability": {
    "monday": { "start": "10:00", "end": "21:00" },
    "tuesday": { "start": "10:00", "end": "21:00" }
  }
}
```

**Response (201):**
```json
{
  "id": "space-001",
  "status": "active",
  "createdAt": "2024-03-29T10:00:00Z"
}
```

---

## AMENITY BOOKINGS ENDPOINTS

### POST /api/amenity-bookings
**Description:** Resident requests amenity booking

**Request:**
```json
{
  "amenityId": "space-001",
  "bookingDate": "2024-04-15",
  "timeSlot": "10:00 AM - 1:00 PM"
}
```

**Response (201):**
```json
{
  "id": "booking-001",
  "status": "pending",
  "cost": 1000,
  "createdAt": "2024-03-29T11:30:00Z"
}
```

---

### GET /api/amenity-bookings?residentId=123
**Description:** Get resident's bookings

**Response (200):**
```json
[
  {
    "id": "booking-001",
    "amenityName": "Community Hall",
    "bookingDate": "2024-04-15",
    "timeSlot": "10:00 AM - 1:00 PM",
    "status": "confirmed",
    "cost": 1000,
    "paymentStatus": "received"
  }
]
```

---

### PATCH /api/amenity-bookings/:id/approve
**Description:** Admin approves booking

**Response (200):**
```json
{
  "id": "booking-001",
  "status": "approved",
  "qrCode": "SOCIETY-PAY-XYZ789",
  "paymentStatus": "awaiting"
}
```

---

### PATCH /api/amenity-bookings/:id/confirm-payment
**Description:** Admin confirms payment received

**Request:**
```json
{
  "paymentMethod": "UPI",
  "paymentReference": "TXN-20240414-001"
}
```

**Response (200):**
```json
{
  "id": "booking-001",
  "status": "confirmed",
  "paymentStatus": "received",
  "paymentReceivedAt": "2024-04-14T16:00:00Z"
}
```

---

## FINANCIAL ENDPOINTS

### GET /api/bills?residentId=123
**Description:** Get resident's bills

**Response (200):**
```json
[
  {
    "id": "bill-001",
    "month": "March 2024",
    "amount": 2500,
    "dueDate": "2024-03-31",
    "status": "pending",
    "breakdown": {
      "maintenance": 1200,
      "water": 400,
      "electricity": 600,
      "parking": 300
    }
  }
]
```

---

### POST /api/bills/:id/mark-paid
**Description:** Admin marks bill as paid after receiving payment

**Request:**
```json
{
  "paymentMethod": "UPI",
  "paymentReference": "TXN-20240329-001"
}
```

**Response (200):**
```json
{
  "id": "bill-001",
  "status": "paid",
  "paidAt": "2024-03-29T14:30:00Z"
}
```

---

### GET /api/society/financial?societyId=123&year=2024
**Description:** Get society financial overview

**Response (200):**
```json
{
  "totalCollected": 450000,
  "totalOutstanding": 50000,
  "collectionRate": 90,
  "monthlyTrend": [
    { "month": "January", "collected": 50000, "outstanding": 5000 },
    { "month": "February", "collected": 55000, "outstanding": 4500 },
    { "month": "March", "collected": 60000, "outstanding": 5000 }
  ],
  "expenses": {
    "maintenance": 200000,
    "staff": 150000,
    "utilities": 50000,
    "security": 50000
  }
}
```

---

## COMMUNITY ENDPOINTS

### GET /api/community/posts?societyId=123
**Description:** Get community board posts

**Response (200):**
```json
[
  {
    "id": "post-001",
    "author": "Unit A-101",
    "title": "Lost keys",
    "content": "Lost my keys in community hall",
    "image": "photo-url",
    "likes": 3,
    "comments": 2,
    "createdAt": "2024-03-29T15:45:00Z"
  }
]
```

---

### POST /api/community/posts
**Description:** Create community post

**Request:**
```json
{
  "title": "Lost keys",
  "content": "Lost my keys in community hall. If found, please contact me.",
  "image": "photo-url"
}
```

**Response (201):**
```json
{
  "id": "post-001",
  "createdAt": "2024-03-29T15:45:00Z"
}
```

---

### POST /api/community/posts/:id/like
**Description:** Like a post

**Response (200):**
```json
{
  "id": "post-001",
  "likes": 4
}
```

---

### POST /api/community/posts/:id/comment
**Description:** Add comment to post

**Request:**
```json
{
  "content": "Found keys near reception"
}
```

**Response (201):**
```json
{
  "id": "comment-001",
  "postId": "post-001",
  "author": "Unit B-201",
  "content": "Found keys near reception",
  "createdAt": "2024-03-29T16:00:00Z"
}
```

---

## ERROR RESPONSES

All endpoints follow this error format:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": {
    "email": "Invalid email format",
    "password": "Password must be at least 8 characters"
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "Please login first"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied",
  "message": "You don't have permission for this action"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "resource": "Visitor pass"
}
```

### 500 Server Error
```json
{
  "error": "Internal server error",
  "message": "Something went wrong. Please try again later.",
  "requestId": "req-12345"
}
```

---

## RATE LIMITING

All endpoints are rate limited:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

Limits:
- Authenticated users: 1000 requests/hour
- Unauthenticated: 100 requests/hour
- Login endpoint: 5 attempts/15 minutes

---

## PAGINATION

List endpoints support pagination:

**Request:**
```
GET /api/visitors?page=1&limit=20
```

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

## WEBHOOKS (Future)

Webhook events for external integrations:

- `visitor.checked_in` - Visitor checked in
- `issue.resolved` - Issue marked resolved
- `booking.confirmed` - Amenity booking confirmed
- `bill.paid` - Bill payment received
- `post.created` - New community post

---

This API documentation serves as the contract between frontend and backend. Use these templates when implementing the actual API routes.
