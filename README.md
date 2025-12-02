# Personal Finance Manager

A clean, focused personal finance web application built on the 80/20 principle - delivering 80% of value with 20% of features.

**Live Demo**: Deployed on Vercel with Upstash Redis database

## Core Features

### Net Worth Dashboard
- Single glance view of your total financial position
- Real-time calculation of Assets vs Liabilities
- Quick monthly income/expense overview

### Transaction Tracking
- Simple income and expense logging
- Category-based organization
- Search and filter transactions
- Chronological history view

### Account Management
- Track multiple accounts (checking, savings, investments, credit cards, loans)
- Real-time balance updates
- Asset vs Liability classification

### Budget Management
- Set spending limits by category
- Visual progress bars showing budget usage
- Monthly tracking with alerts (75% warning, 90% danger)

### Authentication
- PIN-based login system
- Secure password hashing (PBKDF2)
- Session management with 7-day expiry
- Change PIN functionality

## Why These Features?

Following Steve Jobs' philosophy of "focus and simplicity," these features cover the essential needs:

- **Know where you stand** (Net Worth Dashboard)
- **Track your money** (Transactions)
- **Organize your accounts** (Accounts)
- **Control your spending** (Budgets)
- **Secure your data** (Authentication)

Everything else is noise.

## Technical Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Vercel Serverless Functions
- **Database**: Upstash Redis (via @vercel/kv)
- **Authentication**: PBKDF2 hashing with secure sessions
- **Hosting**: Vercel

## Getting Started

### Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up Upstash Redis and add environment variables
4. Run locally with Vercel CLI: `vercel dev`

### Environment Variables

Required for Vercel deployment:
- `KV_REST_API_URL` - Upstash Redis REST URL
- `KV_REST_API_TOKEN` - Upstash Redis REST token

## Design Principles

- **Focus** - Only essential features
- **Simplicity** - Intuitive interface
- **Security** - PIN authentication with hashed storage
- **Speed** - Minimal dependencies, fast load times
- **Professional** - Clean, modern UI design

## API Endpoints

- `POST /api/auth` - Authentication (register, login, logout, verify, changepin)
- `GET/POST /api/accounts` - Account management
- `GET/POST /api/transactions` - Transaction management
- `GET/POST /api/budgets` - Budget management

## Deployment

This app is configured for Vercel deployment:

1. Push to GitHub
2. Connect repository to Vercel
3. Add Upstash Redis integration
4. Deploy automatically on push

## Features NOT Included (By Design)

Following the 80/20 principle, these are intentionally excluded:
- Bank account synchronization
- Investment portfolio tracking
- Bill reminders
- Receipt scanning
- Tax preparation
- Multi-user support
- Mobile apps

These can be added later if the core features prove valuable.

## License

Free to use and modify for personal use.

---

**Remember**: The best financial tool is the one you actually use. Start simple, stay consistent.
