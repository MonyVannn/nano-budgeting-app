# Budgeting App - AI Coding Instructions

## Project Overview

A **cost-free**, minimalist iOS-first budgeting app built with Expo/React Native and Supabase. Emphasizes personalization, clean UX aligned with iOS design principles, and zero subscription costs.

## Architecture

### Tech Stack

- **Frontend:** Expo/React Native (iOS-first, use native modules/conventions)
- **Backend & Database:** Supabase (Auth, Realtime DB, Storage)
- **Styling:** Catppuccin Mocha palette (strict adherence)
- **Animations:** React Native Reanimated for "Apple-made" micro-interactions

### Data Model (Supabase)

**Three primary tables:**

1. **`categories`** - User budget goals

   - `id` (UUID, PK), `user_id` (UUID, FK to auth), `name` (text), `expected_amount` (numeric), `created_at` (timestamp)

2. **`transactions`** - Financial entries

   - `id` (UUID, PK), `user_id` (UUID, FK), `amount` (numeric), `date` (date), `category_id` (UUID, FK), `description` (text), `account` (text), `is_expense` (boolean), `recurring_transaction_id` (UUID, FK, nullable)

3. **`recurring_transactions`** - Subscription/recurring entries
   - `id` (UUID, PK), `user_id` (UUID, FK), `amount` (numeric), `category_id` (UUID, FK), `description` (text), `account` (text), `is_expense` (boolean), `frequency` (text: 'weekly'|'monthly'|'yearly'), `start_date` (date), `end_date` (date, nullable), `is_active` (boolean), `created_at` (timestamp)

**RLS (Row Level Security):** All tables must enforce user-scoped access via `user_id`.

## Core Business Logic

### Monthly Budget Reset Rules

1. **Expected Amount resets** to defined goal at month start for all categories
2. **Open Amount carry-over:** Previous month's surplus/deficit adds to current month's _overall_ remaining budget
3. Calculate: `Current Open = (Monthly Budget + Previous Carry) - Current Expenses`

### CSV Import Flow

- **Dynamic mapping:** Read CSV headers, let users map columns to app fields (`amount`, `date`, `category`, etc.)
- Support flexible header names (e.g., "Payee" → `description`)
- Priority feature - implement early

### Recurring Transactions (Subscriptions)

- Users can define recurring transactions (subscriptions, bills, paychecks)
- System auto-generates transactions based on frequency (weekly, monthly, yearly)
- Track active/inactive status and optional end dates
- Link generated transactions to parent recurring entry via `recurring_transaction_id`

## Development Workflow

### Setup

```bash
# Install dependencies
npm install

# Start Expo dev server
npx expo start --ios
```

### Supabase Configuration

- Store credentials in `.env` (never commit)
- Use `@supabase/supabase-js` for client
- Initialize with `SUPABASE_URL` and `SUPABASE_ANON_KEY`

### Running

- Test on iOS Simulator or physical device via Expo Go
- Use `eas build` for production builds

## Design System & UX Conventions

### Color Coding (Catppuccin Mocha)

- **Expected/Budget amounts:** Green shades from palette
- **Current/Spent amounts:** Accent color indicating spending (e.g., Peach or Red from Mocha)
- **Never deviate** from Catppuccin Mocha palette

### Animation Standards

Implement subtle animations using Reanimated for:

- Screen transitions (fade, slide)
- Input focus states (scale, border glow)
- Progress bar updates (spring animation)
- Button press feedback + haptics (`Haptics.impactAsync()`)

**Philosophy:** Aim for "Apple-made" quality - understated, smooth, purposeful.

### Component Patterns

- Use Expo's native components first (`expo-haptics`, `expo-document-picker`)
- Prefer functional components with hooks
- Keep components focused and single-responsibility

## Key Features & Implementation Notes

### Dashboard (Home Screen)

Display these metrics with visual progress indicators:

- Overall Remaining Budget (Open Amount)
- Overall Saved (cumulative)
- Total Amount (Net Income - Expenses)
- Top 3 categories with progress bars
- Total Income vs Total Expenses

### PDF Export

- Use `expo-print` or `react-native-pdf` for Account Statement generation
- Include: date range summary + detailed transaction list
- High-quality formatting matching app aesthetic

## Code Conventions

### File Structure (Expo Router)

```
/app              - Expo Router screens (file-based routing)
  /(tabs)/        - Tab-based navigation screens
  /(auth)/        - Authentication flow screens
  _layout.tsx     - Root layout
/components       - Reusable UI components
/lib              - Supabase client, utilities
/hooks            - Custom React hooks
/store            - Zustand stores (auth, transactions, categories)
/types            - TypeScript definitions
/constants        - Colors (Mocha palette), config
```

### TypeScript Usage

- Strict mode enabled
- Define types for all Supabase tables
- Use `Database` type from Supabase CLI codegen

### State Management (Zustand)

- **Zustand stores** for global state management
- Separate stores: `useAuthStore`, `useTransactionStore`, `useCategoryStore`, `useRecurringStore`
- Persist auth state with `zustand/middleware`
- Keep stores focused and avoid cross-store dependencies where possible

### CI/CD Pipeline

- **GitHub Actions** for automated workflows
- Build iOS app with EAS on push to `main`
- Run TypeScript checks and linting before build
- Consider automated deployment to TestFlight

## Testing Strategy

Testing is **not implemented** in initial phases. Focus on rapid iteration and core feature development first.

## Important Reminders for AI Agents

1. **iOS-first mindset:** Follow iOS HIG principles, use native patterns
2. **Zero cost imperative:** Avoid suggesting paid services or dependencies
3. **Catppuccin Mocha only:** Never suggest colors outside this palette
4. **Budget reset logic:** Month-start reset for categories, carry-over for overall amount
5. **Supabase RLS:** Always implement user-scoped queries with `user_id` filters
6. **Animation quality:** Prioritize smoothness and subtlety over flashiness
7. **CSV import priority:** This is a high-value feature - implement early and robustly
8. **Zustand stores:** Use Zustand for state, keep stores focused and modular
9. **Recurring transactions:** Auto-generate transactions from recurring entries, maintain link via FK
10. **No testing:** Skip test setup/implementation - focus on features and UX quality
