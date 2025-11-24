-- Add frequency field to categories table
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS frequency TEXT NOT NULL DEFAULT 'monthly' 
CHECK (frequency IN ('weekly', 'monthly'));

-- Update existing categories to monthly by default
UPDATE categories SET frequency = 'monthly' WHERE frequency IS NULL;

