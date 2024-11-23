<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Digital Stock API

A subscription-based API management system built with **NestJS** and **TypeScript**.

## Author

**Chan Lay**  
Email: [mr.chenlay@gmail.com](mailto:mr.chenlay@gmail.com)

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