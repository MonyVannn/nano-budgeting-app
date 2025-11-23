# Database Setup Guide

## Overview
This guide will help you set up the Supabase database for the budgeting app.

## Database Schema

### Tables

#### 1. **categories**
Stores user budget categories with expected monthly amounts.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `name` | TEXT | Category name (unique per user) |
| `expected_amount` | NUMERIC | Monthly budget goal |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### 2. **transactions**
All financial transactions (income and expenses).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `amount` | NUMERIC | Transaction amount (always positive) |
| `date` | DATE | Transaction date |
| `category_id` | UUID | Foreign key to categories (nullable) |
| `description` | TEXT | Transaction description |
| `account` | TEXT | Account name/source |
| `is_expense` | BOOLEAN | True if expense, false if income |
| `recurring_transaction_id` | UUID | Link to recurring transaction if auto-generated |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

#### 3. **recurring_transactions**
Recurring transactions like subscriptions, bills, and paychecks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `user_id` | UUID | Foreign key to auth.users |
| `amount` | NUMERIC | Transaction amount |
| `category_id` | UUID | Foreign key to categories (nullable) |
| `description` | TEXT | Transaction description |
| `account` | TEXT | Account name/source |
| `is_expense` | BOOLEAN | True if expense, false if income |
| `frequency` | TEXT | 'weekly', 'monthly', or 'yearly' |
| `start_date` | DATE | When to start generating transactions |
| `end_date` | DATE | When to stop (nullable for indefinite) |
| `is_active` | BOOLEAN | Whether to continue generating |
| `created_at` | TIMESTAMP | Creation timestamp |
| `updated_at` | TIMESTAMP | Last update timestamp |

## Setup Instructions

### Option 1: Using Supabase Dashboard

1. **Go to your Supabase project dashboard**
   - Navigate to: https://app.supabase.com

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the migration**
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Paste into the SQL editor
   - Click "Run" or press `Ctrl/Cmd + Enter`

4. **Verify tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should see: `categories`, `transactions`, `recurring_transactions`

### Option 2: Using Supabase CLI

1. **Install Supabase CLI** (if not already installed)
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**
   ```bash
   supabase login
   ```

3. **Link your project**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```
   (Find your project ref in your Supabase project settings)

4. **Run migrations**
   ```bash
   supabase db push
   ```

## Key Features

### Row Level Security (RLS)
All tables have RLS enabled with policies ensuring:
- Users can only access their own data
- All CRUD operations are scoped to the authenticated user
- Data isolation between users is guaranteed

### Automatic Features

1. **Auto-updating timestamps**
   - `updated_at` columns automatically update on record changes

2. **Default categories**
   - New users automatically get 10 default categories:
     - Groceries ($200)
     - Eating out ($100)
     - Entertainment ($50)
     - Transportation ($100)
     - Utilities ($150)
     - Rent ($0)
     - Healthcare ($50)
     - Personal Care ($50)
     - Clothing ($50)
     - Other ($0)

3. **Recurring transaction generation**
   - Function `generate_recurring_transactions()` creates transaction entries
   - Supports weekly, monthly, and yearly frequencies
   - Respects start/end dates and active status

## Database Functions

### `generate_recurring_transactions(user_id, start_date, end_date)`
Generates transaction entries from recurring transactions for a date range.

**Parameters:**
- `p_user_id` (UUID) - User ID
- `p_start_date` (DATE) - Start of date range (default: today)
- `p_end_date` (DATE) - End of date range (default: today)

**Returns:** Table of recurring transactions that need to be created

**Example usage:**
```sql
-- Generate transactions for current month
SELECT * FROM generate_recurring_transactions(
  auth.uid(),
  date_trunc('month', CURRENT_DATE)::DATE,
  (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
);
```

## Indexes
Performance indexes are created on:
- All `user_id` columns
- `transactions.date`
- `transactions.category_id`
- `transactions.recurring_transaction_id`
- `recurring_transactions.is_active`

## Testing the Setup

Run these queries to verify everything works:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'transactions', 'recurring_transactions');

-- Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';

-- Check if default categories function exists
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name = 'create_default_categories';
```

## TypeScript Type Generation

After setting up the database, generate TypeScript types:

```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/database.types.ts
```

This will create type-safe database types for your app.

## Troubleshooting

### RLS Blocking Queries?
If queries are blocked, check:
1. User is authenticated: `SELECT auth.uid()` should return a UUID
2. RLS policies are enabled: Check SQL Editor for policy errors
3. User ID matches: Ensure `user_id` in data matches `auth.uid()`

### Default Categories Not Created?
The trigger runs on new user signup. For existing users:
```sql
-- Manually run for existing user
INSERT INTO categories (user_id, name, expected_amount)
SELECT 
  auth.uid(),
  unnest(ARRAY['Groceries', 'Eating out', 'Entertainment', 'Transportation', 'Utilities', 'Rent', 'Healthcare', 'Personal Care', 'Clothing', 'Other']),
  unnest(ARRAY[200, 100, 50, 100, 150, 0, 50, 50, 50, 0]);
```

## Next Steps

1. ✅ Set up database schema (you are here)
2. Generate TypeScript types
3. Test CRUD operations
4. Implement authentication
5. Connect app to database
