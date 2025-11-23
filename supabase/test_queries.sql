-- ============================================
-- Database Verification Tests
-- Run these queries to verify your setup
-- ============================================

-- 1. Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('categories', 'transactions', 'recurring_transactions')
ORDER BY table_name;
-- Expected: 3 rows (categories, recurring_transactions, transactions)

-- 2. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('categories', 'transactions', 'recurring_transactions')
ORDER BY tablename;
-- Expected: All should show rowsecurity = true

-- 3. Check RLS policies
SELECT 
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, cmd;
-- Expected: 12 policies (4 per table: SELECT, INSERT, UPDATE, DELETE)

-- 4. Check if functions exist
SELECT 
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_name IN (
    'create_default_categories',
    'generate_recurring_transactions',
    'update_updated_at_column'
  )
ORDER BY routine_name;
-- Expected: 3 functions

-- 5. Check if triggers exist
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
-- Expected: 4 triggers (updated_at for 3 tables + on_auth_user_created)

-- 6. Check indexes
SELECT 
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('categories', 'transactions', 'recurring_transactions')
ORDER BY tablename, indexname;
-- Expected: Multiple indexes for performance

-- ============================================
-- Test with Sample Data (Run After Auth)
-- ============================================

-- First, ensure you're authenticated
SELECT auth.uid() AS my_user_id;
-- Should return your user UUID (not null)

-- 7. Test: View default categories (if user exists)
SELECT 
  id,
  name,
  expected_amount,
  created_at
FROM categories 
WHERE user_id = auth.uid()
ORDER BY name;
-- Expected: 10 default categories if you've signed up

-- 8. Test: Insert a test category
INSERT INTO categories (user_id, name, expected_amount)
VALUES (auth.uid(), 'Test Category', 100.00)
RETURNING *;
-- Should succeed and return the new category

-- 9. Test: Insert a test transaction
INSERT INTO transactions (
  user_id,
  amount,
  date,
  category_id,
  description,
  is_expense
)
VALUES (
  auth.uid(),
  25.50,
  CURRENT_DATE,
  (SELECT id FROM categories WHERE user_id = auth.uid() AND name = 'Test Category'),
  'Test expense',
  true
)
RETURNING *;
-- Should succeed and return the new transaction

-- 10. Test: Insert a recurring transaction
INSERT INTO recurring_transactions (
  user_id,
  amount,
  category_id,
  description,
  is_expense,
  frequency,
  start_date
)
VALUES (
  auth.uid(),
  9.99,
  (SELECT id FROM categories WHERE user_id = auth.uid() AND name = 'Test Category'),
  'Monthly subscription',
  true,
  'monthly',
  CURRENT_DATE
)
RETURNING *;
-- Should succeed and return the new recurring transaction

-- 11. Test: Generate recurring transactions
SELECT * FROM generate_recurring_transactions(
  auth.uid(),
  date_trunc('month', CURRENT_DATE)::DATE,
  (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month' - INTERVAL '1 day')::DATE
);
-- Should return any recurring transactions that need to be generated

-- 12. View all your data
SELECT 'Categories' as type, name as item, expected_amount::text as amount
FROM categories 
WHERE user_id = auth.uid()
UNION ALL
SELECT 'Transactions' as type, description as item, amount::text
FROM transactions 
WHERE user_id = auth.uid()
UNION ALL
SELECT 'Recurring' as type, description as item, amount::text
FROM recurring_transactions 
WHERE user_id = auth.uid()
ORDER BY type, item;

-- ============================================
-- Clean Up Test Data (Optional)
-- ============================================

-- Delete test data (run this if you want to clean up)
DELETE FROM transactions 
WHERE user_id = auth.uid() 
  AND description LIKE '%Test%';

DELETE FROM recurring_transactions 
WHERE user_id = auth.uid() 
  AND description LIKE '%Test%';

DELETE FROM categories 
WHERE user_id = auth.uid() 
  AND name = 'Test Category';

-- ============================================
-- Useful Queries for Development
-- ============================================

-- View transactions with category names
SELECT 
  t.date,
  t.description,
  t.amount,
  t.is_expense,
  c.name as category_name,
  t.account
FROM transactions t
LEFT JOIN categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
ORDER BY t.date DESC
LIMIT 20;

-- Monthly spending by category
SELECT 
  c.name as category,
  COUNT(t.id) as transaction_count,
  SUM(t.amount) as total_spent
FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = auth.uid()
  AND t.is_expense = true
  AND t.date >= date_trunc('month', CURRENT_DATE)
  AND t.date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
GROUP BY c.name
ORDER BY total_spent DESC;

-- Budget vs actual spending
SELECT 
  c.name as category,
  c.expected_amount as budgeted,
  COALESCE(SUM(t.amount), 0) as spent,
  c.expected_amount - COALESCE(SUM(t.amount), 0) as remaining
FROM categories c
LEFT JOIN transactions t ON (
  t.category_id = c.id 
  AND t.is_expense = true
  AND t.date >= date_trunc('month', CURRENT_DATE)
  AND t.date < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month'
)
WHERE c.user_id = auth.uid()
GROUP BY c.id, c.name, c.expected_amount
ORDER BY c.name;
