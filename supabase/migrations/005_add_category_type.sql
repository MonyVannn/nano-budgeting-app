-- Add category_type enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type typ
    JOIN pg_namespace nsp ON nsp.oid = typ.typnamespace
    WHERE typ.typname = 'category_type'
      AND nsp.nspname = 'public'
  ) THEN
    CREATE TYPE category_type AS ENUM ('expense', 'income');
  END IF;
END
$$;

-- Add type column to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS type category_type NOT NULL DEFAULT 'expense';

-- Backfill any existing rows (in case column was nullable temporarily)
UPDATE categories
SET type = 'expense'
WHERE type IS NULL;

-- Ensure budgets only apply to expenses by keeping expected_amount >= 0 (already enforced)

-- Update default categories trigger to set type explicitly
CREATE OR REPLACE FUNCTION create_default_categories()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO categories (user_id, name, expected_amount, type)
  VALUES
    (NEW.id, 'Groceries', 200, 'expense'),
    (NEW.id, 'Eating out', 100, 'expense'),
    (NEW.id, 'Entertainment', 50, 'expense'),
    (NEW.id, 'Transportation', 100, 'expense'),
    (NEW.id, 'Utilities', 150, 'expense'),
    (NEW.id, 'Rent', 0, 'expense'),
    (NEW.id, 'Healthcare', 50, 'expense'),
    (NEW.id, 'Personal Care', 50, 'expense'),
    (NEW.id, 'Clothing', 50, 'expense'),
    (NEW.id, 'Other', 0, 'expense');

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating default categories for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

