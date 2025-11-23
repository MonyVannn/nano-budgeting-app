-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
-- Stores user budget categories with expected amounts
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expected_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT categories_name_unique UNIQUE (user_id, name),
  CONSTRAINT categories_expected_amount_positive CHECK (expected_amount >= 0)
);

-- Transactions Table
-- Stores all financial transactions (income and expenses)
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  account TEXT,
  is_expense BOOLEAN NOT NULL DEFAULT TRUE,
  recurring_transaction_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT transactions_amount_positive CHECK (amount >= 0)
);

-- Recurring Transactions Table
-- Stores recurring transactions (subscriptions, bills, paychecks)
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  account TEXT,
  is_expense BOOLEAN NOT NULL DEFAULT TRUE,
  frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT recurring_amount_positive CHECK (amount >= 0),
  CONSTRAINT recurring_end_after_start CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Add foreign key constraint for recurring_transaction_id
ALTER TABLE transactions
ADD CONSTRAINT fk_recurring_transaction
FOREIGN KEY (recurring_transaction_id)
REFERENCES recurring_transactions(id)
ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_category_id ON transactions(category_id);
CREATE INDEX idx_transactions_recurring_id ON transactions(recurring_transaction_id);
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_active ON recurring_transactions(is_active);

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Categories Policies
CREATE POLICY "Users can view their own categories"
  ON categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own categories"
  ON categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON categories FOR DELETE
  USING (auth.uid() = user_id);

-- Transactions Policies
CREATE POLICY "Users can view their own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions"
  ON transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions"
  ON transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Recurring Transactions Policies
CREATE POLICY "Users can view their own recurring transactions"
  ON recurring_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recurring transactions"
  ON recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transactions"
  ON recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recurring transactions"
  ON recurring_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recurring_updated_at
  BEFORE UPDATE ON recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to generate transactions from recurring entries
CREATE OR REPLACE FUNCTION generate_recurring_transactions(
  p_user_id UUID,
  p_start_date DATE DEFAULT CURRENT_DATE,
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  recurring_id UUID,
  generated_date DATE,
  amount NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH recurring_dates AS (
    SELECT
      rt.id,
      rt.amount,
      rt.category_id,
      rt.description,
      rt.account,
      rt.is_expense,
      rt.frequency,
      rt.start_date,
      rt.end_date,
      generate_series(
        GREATEST(rt.start_date, p_start_date),
        CASE
          WHEN rt.end_date IS NOT NULL THEN LEAST(rt.end_date, p_end_date)
          ELSE p_end_date
        END,
        CASE rt.frequency
          WHEN 'weekly' THEN INTERVAL '7 days'
          WHEN 'monthly' THEN INTERVAL '1 month'
          WHEN 'yearly' THEN INTERVAL '1 year'
        END
      )::DATE AS transaction_date
    FROM recurring_transactions rt
    WHERE rt.user_id = p_user_id
      AND rt.is_active = TRUE
      AND rt.start_date <= p_end_date
      AND (rt.end_date IS NULL OR rt.end_date >= p_start_date)
  )
  SELECT
    rd.id AS recurring_id,
    rd.transaction_date AS generated_date,
    rd.amount
  FROM recurring_dates rd
  LEFT JOIN transactions t ON (
    t.recurring_transaction_id = rd.id
    AND t.date = rd.transaction_date
  )
  WHERE t.id IS NULL -- Only return dates where transaction doesn't exist yet
  ORDER BY rd.transaction_date;
END;
$$ LANGUAGE plpgsql;

-- Insert default categories for new users (optional)
-- This can be triggered when a user signs up
-- SECURITY DEFINER allows the function to run with the privileges of the function creator
-- This bypasses RLS policies, which is necessary when creating data for a new user
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, expected_amount)
  VALUES
    (NEW.id, 'Groceries', 200),
    (NEW.id, 'Eating out', 100),
    (NEW.id, 'Entertainment', 50),
    (NEW.id, 'Transportation', 100),
    (NEW.id, 'Utilities', 150),
    (NEW.id, 'Rent', 0),
    (NEW.id, 'Healthcare', 50),
    (NEW.id, 'Personal Care', 50),
    (NEW.id, 'Clothing', 50),
    (NEW.id, 'Other', 0);
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating default categories for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create default categories for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

-- Comments for documentation
COMMENT ON TABLE categories IS 'User budget categories with expected monthly amounts';
COMMENT ON TABLE transactions IS 'All financial transactions (income and expenses)';
COMMENT ON TABLE recurring_transactions IS 'Recurring transactions like subscriptions and bills';
COMMENT ON FUNCTION generate_recurring_transactions IS 'Generates transaction entries from recurring transactions for a date range';
