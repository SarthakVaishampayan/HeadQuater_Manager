# Pool & Snooker Zone Booking Management System - Implementation Plan

## Project Overview

This project is a complete MERN stack booking management platform for a Pool & Snooker Parlour Zone.

The software will provide:

- User portal for booking tables
- Admin portal for full parlour management
- Real-time table availability
- Booking overlap prevention
- Dynamic pricing
- Slot management
- Analytics dashboard
- Secure authentication
- Mobile responsive UI
- Dark neon pool/snooker themed interface

The system should be optimized for:
- Easy management by parlour staff/admin
- Smooth booking experience for users
- Fast booking validation
- Scalability for multiple parlour branches

---

# Tech Stack

## Frontend
- React 19
- TypeScript
- Material UI v7
- React Router v7
- Axios
- React Hook Form
- Zod Validation
- Framer Motion
- React Toastify

## Backend
- Node.js
- Express.js
- TypeScript
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Redis
- Helmet.js
- Rate Limiting
- Socket.IO

## Deployment
- Frontend: Vercel
- Backend: Railway / Render
- Database: MongoDB Atlas
- Cache: Redis Cloud

---

# Theme & UI Design

## Theme Direction
The entire UI should revolve around:
- Neon green accents
- Dark matte backgrounds
- Pool/snooker aesthetics
- Glassmorphism cards
- Cue stick inspired separators
- Animated glowing effects

## Color Palette
- Primary: Neon Green (#39FF14)
- Secondary: Deep Black (#0D0D0D)
- Accent: Gold (#D4AF37)
- Background: Dark Gray (#111111)

---

# User Roles

## 1. User
Can:
- Register/Login
- View available tables
- Select date/time
- Book tables
- Cancel bookings
- View booking history
- Make payments

## 2. Admin
Can:
- Add/remove tables
- Configure pricing
- Set operating hours
- View all bookings
- Block maintenance slots
- Manage users
- View analytics
- Configure slot durations

---

# Core Features

# User Portal

## Authentication
- JWT based login/register
- Password hashing
- Refresh token system
- Forgot password flow
- Email verification

## Booking Features
- View all available tables
- Real-time slot availability
- Pre-book tables
- Select duration
- Online payment
- Booking confirmation

## Booking Rules
- User cannot overlap own bookings
- Booking must be within parlour timings
- Booking duration configurable
- Buffer time between bookings optional

---

# Admin Portal

## Table Management
Admin can:
- Add new pool/snooker tables
- Remove tables
- Rename tables
- Mark tables under maintenance
- Change table type:
  - Pool
  - Snooker
  - VIP Table

## Pricing Control
Admin can:
- Set hourly pricing
- Weekend pricing
- Peak hour pricing
- Dynamic pricing rules

## Parlour Timing
Admin can:
- Set opening/closing time
- Configure holidays
- Set maintenance windows

## Booking Management
Admin dashboard includes:
- Live booking board
- Upcoming reservations
- Active sessions
- Completed bookings
- Cancelled bookings

---

# Database Architecture

# User Model

```ts
{
  username: String,
  email: String,
  password: String,
  role: ['user', 'admin'],
  phoneNumber: String,
  createdAt: Date
}
```

# Table Model

```ts
{
  tableName: String,
  tableType: ['pool', 'snooker', 'vip'],
  hourlyRate: Number,
  status: ['available', 'occupied', 'maintenance'],
  isActive: Boolean
}
```

# Booking Model

```ts
{
  user: ObjectId,
  table: ObjectId,
  bookingDate: Date,
  startTime: String,
  endTime: String,
  duration: Number,
  totalPrice: Number,
  bookingStatus: [
    'pending',
    'confirmed',
    'cancelled',
    'completed'
  ],
  paymentStatus: [
    'pending',
    'paid',
    'refunded'
  ]
}
```

---

# Booking Overlap Prevention Protocol

This is one of the MOST IMPORTANT parts.

## Booking Validation Logic

Before creating a booking:

System checks:
- Same table
- Same date
- Existing bookings

Conflict query:

```js
existingBooking = find({
  table,
  bookingDate,
  startTime < requestedEnd,
  endTime > requestedStart,
  status != cancelled
})
```

If booking exists:
- Reject booking
- Return conflict error

---

# Advanced Concurrency Protection

To prevent race conditions:

## Redis Locking Strategy

Before booking:
- Create temporary Redis lock
- Lock table+timeslot combination
- Expire lock after 30 seconds

This prevents:
- Double booking
- Simultaneous payment conflicts

---

# Real-Time Availability System

Using Socket.IO:

Features:
- Live table updates
- Instant booking reflection
- Real-time admin dashboard
- Live occupancy status

---

# Frontend Pages

## Public Pages
- Home
- Login
- Register
- About
- Contact

## User Pages
- Dashboard
- Book Table
- My Bookings
- Payment History
- Profile

## Admin Pages
- Dashboard
- Table Management
- Booking Management
- Analytics
- Pricing Settings
- User Management

---

# Admin Dashboard Features

## Analytics
- Daily revenue
- Peak hours
- Most booked tables
- Occupancy rate
- Monthly earnings

## Charts
- Revenue graph
- Table usage graph
- Booking trends

---

# Security Features

## Backend Security
- Helmet.js
- Rate limiting
- JWT validation
- Password hashing
- Input sanitization
- Mongo injection prevention
- CORS protection

## API Security
- RBAC
- Protected routes
- Admin middleware
- Request validation using Zod

---

# Payment Integration

## Razorpay Integration

Features:
- Online booking payments
- Refund support
- Payment verification
- Booking auto-confirmation

---

# Folder Structure

```bash
pool-snooker-booking/
|
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── sockets/
│   │   └── server.ts
|
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── layouts/
│   │   └── App.tsx
```

---

# Recommended Features for Future

## AI Enhancements
- AI peak hour prediction
- Smart pricing
- AI recommendations

## Extra Features
- QR check-in
- Membership plans
- Tournament hosting
- Food ordering integration

---

# AI Vibe Coding Workflow

## Development Strategy

Build project in phases:

### Phase 1
- Authentication
- Database setup
- Basic CRUD

### Phase 2
- Booking engine
- Conflict prevention

### Phase 3
- Admin dashboard
- Analytics

### Phase 4
- Payments
- Real-time updates

### Phase 5
- UI polish
- Animations
- Optimization

---

# Recommended AI Prompt Style

Example:

"Create a modern React TypeScript admin dashboard page for a pool and snooker booking management system using Material UI and Framer Motion with dark neon green theme."

---

# Deployment Checklist

## Backend
- Configure environment variables
- MongoDB Atlas setup
- Redis setup
- Razorpay keys

## Frontend
- API base URL
- Vercel deployment
- SEO optimization

---

# Final Vision

The software should feel:
- Premium
- Fast
- Minimal
- Modern
- Real-time
- Easy to operate

The booking experience should take less than 30 seconds for a user.

The admin should be able to manage the entire parlour from a single dashboard with minimal effort.
