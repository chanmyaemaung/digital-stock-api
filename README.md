<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Digital Stock API

## Overview

**Digital Stock API** is a robust subscription management system designed for users to access APIs based on their subscription plans. The system provides features such as user authentication, subscription management, wallet support, real-time notifications, and role-based access control.

## Features

### Authentication & Authorization

- **JWT-based authentication**: Secure API access using JSON Web Tokens.
- **Role-based access control (RBAC)**: Supports User, Admin, and Super Admin roles.
- **Refresh Token mechanism**: Secure, long-term session management.
- **Device and IP tracking**: Logs device info and IP addresses on user login.

### Subscription Plans

- **Basic Plan**: $5/month, 500 requests/day
- **Premium Plan**: $15/month, 1500 requests/day
- **Business Plan**: $25/month, 10,000 requests/day
- **Trial Period**: 3-day free trial for new users.

### Payment System

- **Stripe Integration**: Supports automated payments.
- **Manual Payment**: Admin verifies and processes manual payments.
- **Wallet System**: Users can manage their balance and top-up their wallet.
- **Prorated Payments**: Handles prorated costs when changing subscription plans.

### Request Management

- **Rate Limiting**: Requests are limited based on the user’s subscription tier.
- **Daily Request Tracking**: Tracks user requests and resets limits daily.
- **Automatic Limit Reset**: Resets the daily request limits at the start of each day.

### Real-time Notifications

- **WebSocket Notifications**: Real-time notifications for login events and subscription changes.
- **Subscription Expiration Alerts**: Notify users when their subscription is about to expire.
- **Payment Status Updates**: Notify users of successful/failed payments.

## Quick Start

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/digital-stock.git
cd digital-stock
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start required services**

```bash
docker-compose up -d
```

5. **Run database migrations**

```bash
pnpm migration:run
```

6. **Seed initial data**

```bash
pnpm seed
```

7. **Start the application**

```bash
# Development
pnpm start:dev

# Production
pnpm build
pnpm start:prod
```

## Default Credentials

- **Admin User**
  - Email: admin@example.com
  - Password: admin123

## Available Scripts

- `pnpm start:dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start:prod` - Start production server
- `pnpm test` - Run tests
- `pnpm db:drop` - Drop database
- `pnpm db:reset` - Reset database (drop + migrate + seed)
- `pnpm migration:run` - Run migrations
- `pnpm seed` - Seed initial data

## API Documentation

- Swagger UI: http://localhost:8000/api
- API Endpoints: http://localhost:8000/api-json

## Docker Support

```bash
# Build and start containers
docker-compose up -d

# Stop containers
docker-compose down

# View logs
docker-compose logs -f
```

## Author

**Chan Lay**  
Email: [mr.chenlay@gmail.com](mailto:mr.chenlay@gmail.com)

## Tech Stack

- **NestJS** (Node.js Framework)
- **TypeScript**
- **PostgreSQL** (Database)
- **Redis** (Caching & Rate Limiting)
- **TypeORM** (ORM)
- **Socket.IO** (Real-time Communications)
- **Docker & Docker Compose** (Containerization & Deployment)

## Project Structure

```plaintext
src/
├── core/                       # Core domain logic
│   ├── domain/                 # Domain entities, value objects
│   ├── interfaces/             # Interfaces/ports
│   └── services/               # Domain services
│
├── infrastructure/             # External concerns implementation
│   ├── config/                 # Configuration files (e.g., DB, JWT, etc.)
│   ├── database/               # Database setup & migrations
│   ├── logging/                # Logging setup (e.g., Winston)
│   └── persistence/            # Repository implementations
│
├── modules/                    # Feature modules
│   ├── auth/                   # Authentication module (JWT, login, register)
│   ├── user/                   # User module (profile, settings, etc.)
│   ├── subscription/           # Subscription module (plan management, limits)
│   ├── wallet/                 # Wallet module (balance management)
│   ├── payment/                # Payment module (Stripe, manual payments)
│   └── notification/           # Notification module (real-time events)
│
├── shared/                     # Shared code (cross-cutting concerns)
│   ├── decorators/             # Custom decorators (e.g., @Roles)
│   ├── filters/                # Error filters (e.g., HTTP exceptions)
│   ├── guards/                 # Guards (e.g., AuthGuard, RolesGuard)
│   ├── interceptors/           # Interceptors (e.g., logging, response formatting)
│   └── utils/                  # Utility functions (e.g., helper methods)
│
└── app.module.ts               # Root module
```

## Payment System

The system supports two types of payments:

### Stripe Payments

- Automated payment processing using Stripe
- Secure checkout session
- Instant wallet credit upon successful payment
- Real-time webhooks for payment status updates

### Manual Payments

- Bank transfer or other manual payment methods
- Reference number tracking
- Admin approval workflow
- Notifications for both users and admins

### API Endpoints

#### Create Stripe Payment

```bash
POST /api/payments
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 100,
  "type": "stripe"
}
```

#### Create Manual Payment

```bash
POST /api/payments/manual
Content-Type: application/json
Authorization: Bearer <token>

{
  "amount": 100,
  "reference": "BANK-123",
  "metadata": {
    "bankName": "KBZ",
    "accountNumber": "123456"
  }
}
```

## Subscription System

The system provides comprehensive subscription management with the following features:

### Trial Period

- All new subscriptions start with a 3-day trial period
- Full access to plan features during trial
- Automatic transition to regular subscription after trial

### Plan Management

- Multiple subscription tiers (Basic/Premium/Business)
- Flexible duration (30-365 days)
- Plan upgrade/downgrade with prorated pricing
- Automatic expiration handling

### Request Limits

- Daily request limits based on plan tier
- Automatic limit reset at midnight
- Request tracking and notifications
- Limit exceeded notifications

### API Endpoints

#### Create Subscription

```bash
POST /api/subscriptions
Content-Type: application/json
Authorization: Bearer <token>

{
  "planId": "uuid",
  "duration": 30  // Optional, defaults to 30 days
}
```

#### Get Active Subscription

```bash
GET /api/subscriptions/active
Authorization: Bearer <token>
```

#### Upgrade Plan

```bash
PUT /api/subscriptions/upgrade/:planId
Authorization: Bearer <token>
```

### Cron Jobs

The system includes automated tasks:

- Daily request limit reset at midnight
- Subscription expiration checks
- Expiring subscription notifications (3 days before)

### Request Limit Implementation

```typescript
// Check and increment request count
const canProceed = await subscriptionService.incrementRequestCount(userId);
if (!canProceed) {
  throw new Error('Daily request limit exceeded');
}
```

## Admin Dashboard

The system provides a comprehensive admin dashboard with the following features:

### Dashboard Statistics

```bash
GET /api/admin/dashboard
Authorization: Bearer <token>

Response:
{
  "totalUsers": 100,
  "activeSubscriptions": 80,
  "expiringSubscriptions": 5,
  "pendingPayments": 10,
  "planDistribution": {
    "basic": 30,
    "premium": 40,
    "business": 10
  },
  "revenue": {
    "total": 5000,
    "thisMonth": 1000
  },
  "userGrowth": [
    { "date": "2024-03-01", "count": 10 },
    { "date": "2024-03-02", "count": 15 }
  ],
  "revenueGrowth": [
    { "date": "2024-03-01", "amount": 500 },
    { "date": "2024-03-02", "amount": 700 }
  ]
}
```

### User Management

#### List Users

```bash
GET /api/admin/users?page=1&limit=10
Authorization: Bearer <token>

Response:
{
  "users": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

#### Update User Role

```bash
PUT /api/admin/users/:id/role
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "admin"
}
```

#### Delete User

```bash
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

### Subscription Management

#### Get Expiring Subscriptions

```bash
GET /api/admin/subscriptions/expiring?days=7
Authorization: Bearer <token>
```

#### Update Subscription Limit

```bash
PUT /api/admin/subscriptions/:id/limit
Authorization: Bearer <token>
Content-Type: application/json

{
  "requestLimit": 1000
}
```

### Payment Management

#### Get Pending Payments

```bash
GET /api/admin/payments/pending
Authorization: Bearer <token>
```

#### Approve Manual Payment

```bash
POST /api/admin/payments/:id/approve
Authorization: Bearer <token>
```

### Security Features

- Role-based access control (RBAC)
- Admin-only endpoints
- JWT authentication
- Request validation
- Error handling

### Real-time Notifications

The admin dashboard receives real-time notifications for:

- New manual payment requests
- Subscription expirations
- User role changes
- System events

### Analytics

- User growth tracking
- Revenue analytics
- Plan distribution
- Subscription monitoring
- Payment tracking

### Testing

The admin features include comprehensive tests:

- Unit tests for services
- Integration tests for repositories
- E2E tests for API endpoints
- Mock implementations for external services

### Error Handling

All admin endpoints include proper error handling:

- Input validation
- Role verification
- Resource existence checks
- Proper error responses
