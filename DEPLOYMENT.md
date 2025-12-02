# Deploy to Vercel with Database

This guide will help you deploy your Personal Finance Manager to Vercel with cloud database storage.

## Prerequisites

1. Install [Node.js](https://nodejs.org/) (version 18 or higher)
2. Install [Vercel CLI](https://vercel.com/download)
3. Create a free [Vercel account](https://vercel.com/signup)

## Quick Start

### 1. Install Dependencies

```powershell
cd s:\personalfinance
npm install
```

### 2. Install Vercel CLI (if not already installed)

```powershell
npm install -g vercel
```

### 3. Login to Vercel

```powershell
vercel login
```

Follow the prompts to authenticate.

### 4. Set Up Upstash Redis Database

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **Storage** tab
3. Click **Create Database**
4. Select **Upstash** (Serverless DB - Redis, Vector, Queue, Search)
5. Click **Continue**
6. Choose a name (e.g., "personal-finance-db")
7. Select your preferred region (choose closest to you)
8. Click **Create**

**Why Upstash?** It's a serverless Redis database perfect for our key-value storage needs, with a generous free tier (10,000 commands/day) and ultra-fast performance.

### 5. Deploy to Vercel

```powershell
# Deploy to production
vercel --prod
```

During deployment:
- Confirm project settings (press Enter for defaults)
- Link to the KV database you created

### 6. Connect Database to Project

After deployment, in the Vercel Dashboard:
1. Go to your project
2. Click **Storage** tab
3. Click **Connect Store**
4. Select your Upstash Redis database
5. Click **Connect**

The environment variables will be automatically configured!

## Test Locally (Optional)

To test the app locally with the cloud database:

```powershell
# Start local development server
vercel dev
```

This will run your app at `http://localhost:3000` with access to your Upstash Redis database.

## Access Your App

After deployment, Vercel will provide you with a URL like:
```
https://your-project-name.vercel.app
```

You can access your personal finance manager from anywhere using this URL!

## Configuration Files Created

- **`package.json`** - Node.js dependencies
- **`vercel.json`** - Vercel deployment configuration
- **`api/accounts.js`** - API endpoint for accounts
- **`api/transactions.js`** - API endpoint for transactions
- **`api/budgets.js`** - API endpoint for budgets
- **`.gitignore`** - Files to exclude from version control

## Features

✅ **Cloud Storage** - Your data is stored in Upstash Redis database  
✅ **Access Anywhere** - Use from any device with the URL  
✅ **Automatic Backups** - Vercel handles database backups  
✅ **Local Fallback** - Still works with localStorage if API fails  
✅ **Fast & Free** - Upstash free tier: 10,000 commands/day  
✅ **Ultra-Fast** - Redis performance for instant data access

## Troubleshooting

### "Module not found: @vercel/kv"
Run: `npm install` to install dependencies

### Database not connected
1. Make sure you created an Upstash Redis database in Vercel Dashboard
2. Connect it to your project in the Storage tab
3. Redeploy: `vercel --prod`

### API routes not working
Check that your `vercel.json` file exists and is configured correctly.

## Data Privacy

- Your data is stored in your personal Upstash Redis database
- Only you have access (single-user by default)
- Upstash provides enterprise-grade security
- To add authentication, consider using Vercel's Auth integration

## Updating Your App

To deploy updates:

```powershell
# Make your changes, then deploy
vercel --prod
```

## Custom Domain (Optional)

You can add a custom domain in Vercel Dashboard:
1. Go to your project
2. Click **Settings** > **Domains**
3. Add your domain and follow DNS setup instructions

---

**Need Help?** Check [Vercel Documentation](https://vercel.com/docs), [Vercel Storage Docs](https://vercel.com/docs/storage), or [Upstash Documentation](https://upstash.com/docs)
