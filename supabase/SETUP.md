# Database Setup - Quick Start

## 🚀 Quick Setup (Recommended)

### 1. Open Supabase Dashboard
1. Go to https://app.supabase.com
2. Select your project
3. Click **"SQL Editor"** in the left sidebar

### 2. Run the Migration
1. Click **"New Query"**
2. Open the file: `supabase/migrations/001_initial_schema.sql`
3. Copy ALL the contents
4. Paste into the SQL Editor
5. Click **"Run"** (or press Ctrl/Cmd + Enter)

### 3. Verify Setup
Go to **"Table Editor"** - you should see 3 new tables:
- ✅ categories
- ✅ transactions  
- ✅ recurring_transactions

### 4. Test with Sample Data (Optional)
Run this in SQL Editor to add test data:

```sql
-- Add a test category
INSERT INTO categories (user_id, name, expected_amount)
VALUES (auth.uid(), 'Test Category', 100);

-- Add a test transaction
INSERT INTO transactions (user_id, amount, date, category_id, description, is_expense)
VALUES (
  auth.uid(),
  50.00,
  CURRENT_DATE,
  (SELECT id FROM categories WHERE user_id = auth.uid() LIMIT 1),
  'Test transaction',
  true
);

-- View your data
SELECT * FROM categories WHERE user_id = auth.uid();
SELECT * FROM transactions WHERE user_id = auth.uid();
```

## 📋 What Was Created?

### Tables
1. **categories** - Budget categories with monthly goals
2. **transactions** - All income and expenses
3. **recurring_transactions** - Subscriptions and recurring bills

### Security
- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only see their own data
- ✅ Automatic user ID validation

### Automatic Features
- ✅ New users get 10 default categories
- ✅ Timestamps auto-update on changes
- ✅ Function to generate recurring transactions

## 🔧 Environment Variables

Make sure your `.env` file has:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these in: **Supabase Dashboard → Settings → API**

## ✅ Verification Checklist

- [ ] Migration ran successfully (no errors in SQL Editor)
- [ ] 3 tables visible in Table Editor
- [ ] RLS policies enabled (check Database → Policies)
- [ ] Environment variables set in `.env`
- [ ] App can connect to Supabase (test with auth)

## 🐛 Troubleshooting

### "relation already exists" error?
Tables already exist - skip migration or drop them first:
```sql
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
```

### Can't see data?
1. Check if you're authenticated: `SELECT auth.uid()` should return a UUID
2. Verify RLS policies are enabled
3. Check user_id matches auth.uid()

### Need to reset everything?
```sql
-- ⚠️ WARNING: This deletes ALL data!
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS recurring_transactions CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP FUNCTION IF EXISTS create_default_categories CASCADE;
DROP FUNCTION IF EXISTS generate_recurring_transactions CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Then re-run the migration
```

## 📚 Next Steps

1. ✅ Database setup (you are here!)
2. Test authentication
3. Connect stores to database
4. Implement CRUD operations
5. Build UI features

## 💡 Useful SQL Queries

```sql
-- View all your categories
SELECT * FROM categories WHERE user_id = auth.uid();

-- View transactions for current month
SELECT * FROM transactions 
WHERE user_id = auth.uid() 
  AND date >= date_trunc('month', CURRENT_DATE)
  AND date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';

-- View active recurring transactions
SELECT * FROM recurring_transactions 
WHERE user_id = auth.uid() 
  AND is_active = true;

-- Generate recurring transactions for this month
SELECT * FROM generate_recurring_transactions(
  auth.uid(),
  date_trunc('month', CURRENT_DATE)::DATE,
  (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
);
```

---

Need help? Check `supabase/README.md` for detailed documentation!
