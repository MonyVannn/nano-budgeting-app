-- Disable the auto-category creation trigger
-- This allows the onboarding flow to handle category creation instead
-- Users will go through onboarding to select and set up their categories

-- Drop the trigger (categories will be created through onboarding instead)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Keep the function in case we need it later, but it won't be triggered automatically
-- The function can still be called manually if needed

-- Note: If you want to re-enable auto-category creation later, run:
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION create_default_categories();

