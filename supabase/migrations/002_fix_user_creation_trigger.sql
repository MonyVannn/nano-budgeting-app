-- Fix the create_default_categories function to run with elevated privileges
-- This allows it to bypass RLS policies when creating default categories for new users

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS create_default_categories() CASCADE;

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

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_categories();

