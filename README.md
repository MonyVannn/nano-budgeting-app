# 💰 Budgeting App

A **cost-free**, minimalist iOS-first budgeting app built with Expo/React Native and Supabase. Features personalized budget tracking, beautiful Catppuccin Mocha design, and zero subscription costs.

## ✨ Features

- 📊 **Dashboard**: Visual summary of budget status and top categories
- 💳 **Transaction Management**: Track income and expenses manually or via CSV import
- 🔄 **Recurring Transactions**: Manage subscriptions and recurring bills
- 📈 **Budget Goals**: Set and track category-specific budget targets
- 📱 **iOS-First Design**: Follows iOS Human Interface Guidelines
- 🎨 **Catppuccin Mocha Theme**: Beautiful, consistent color palette
- 📄 **PDF Export**: Generate account statements for any date range
- 🔐 **Secure Authentication**: User accounts via Supabase Auth

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- iOS Simulator (Xcode on macOS) or Expo Go app
- Supabase account (free tier)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd budgeting-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Supabase credentials:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase database**
   
   Run the following SQL in your Supabase SQL editor:
   
   ```sql
   -- Enable Row Level Security
   ALTER TABLE IF EXISTS categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE IF EXISTS recurring_transactions ENABLE ROW LEVEL SECURITY;

   -- Create tables
   CREATE TABLE categories (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users NOT NULL,
     name TEXT NOT NULL,
     expected_amount NUMERIC NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   CREATE TABLE transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users NOT NULL,
     amount NUMERIC NOT NULL,
     date DATE NOT NULL,
     category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
     description TEXT,
     account TEXT,
     is_expense BOOLEAN NOT NULL DEFAULT TRUE,
     recurring_transaction_id UUID REFERENCES recurring_transactions(id) ON DELETE SET NULL
   );

   CREATE TABLE recurring_transactions (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users NOT NULL,
     amount NUMERIC NOT NULL,
     category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
     description TEXT,
     account TEXT,
     is_expense BOOLEAN NOT NULL DEFAULT TRUE,
     frequency TEXT NOT NULL CHECK (frequency IN ('weekly', 'monthly', 'yearly')),
     start_date DATE NOT NULL,
     end_date DATE,
     is_active BOOLEAN NOT NULL DEFAULT TRUE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- RLS Policies
   CREATE POLICY "Users can view own categories" 
     ON categories FOR SELECT 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own categories" 
     ON categories FOR INSERT 
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own categories" 
     ON categories FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own categories" 
     ON categories FOR DELETE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own transactions" 
     ON transactions FOR SELECT 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own transactions" 
     ON transactions FOR INSERT 
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own transactions" 
     ON transactions FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own transactions" 
     ON transactions FOR DELETE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own recurring transactions" 
     ON recurring_transactions FOR SELECT 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own recurring transactions" 
     ON recurring_transactions FOR INSERT 
     WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own recurring transactions" 
     ON recurring_transactions FOR UPDATE 
     USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own recurring transactions" 
     ON recurring_transactions FOR DELETE 
     USING (auth.uid() = user_id);

   -- Indexes for performance
   CREATE INDEX idx_transactions_user_date ON transactions(user_id, date DESC);
   CREATE INDEX idx_transactions_category ON transactions(category_id);
   CREATE INDEX idx_categories_user ON categories(user_id);
   CREATE INDEX idx_recurring_user_active ON recurring_transactions(user_id, is_active);
   ```

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Run on iOS**
   - Press `i` to open iOS simulator
   - Or scan QR code with Expo Go app

## 📁 Project Structure

```
budgeting-app/
├── app/                    # Expo Router screens (file-based routing)
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main app tabs
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
├── constants/             # Colors (Catppuccin Mocha), config
├── hooks/                 # Custom React hooks
├── lib/                   # Supabase client, utilities
├── store/                 # Zustand stores
│   ├── authStore.ts
│   ├── categoryStore.ts
│   ├── transactionStore.ts
│   └── recurringStore.ts
├── types/                 # TypeScript definitions
└── assets/                # Images, fonts, etc.
```

## 🎨 Design System

This app uses the **Catppuccin Mocha** color palette exclusively. Key color mappings:

- **Budget/Expected amounts**: Green (`#a6e3a1`)
- **Spent amounts**: Peach (`#fab387`)
- **Over budget**: Red (`#f38ba8`)
- **Income**: Teal (`#94e2d5`)
- **Expense**: Maroon (`#eba0ac`)

## 🔧 Tech Stack

- **Framework**: Expo SDK 52 / React Native
- **Routing**: Expo Router (file-based)
- **State Management**: Zustand
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **Animations**: React Native Reanimated
- **TypeScript**: Strict mode enabled

## 📝 Core Business Logic

### Monthly Budget Reset
- **Expected Amount** resets to goal at month start
- **Open Amount** carries over (surplus/deficit) to next month
- Formula: `Current Open = (Monthly Budget + Previous Carry) - Current Expenses`

### CSV Import
- Dynamic header detection
- User-friendly column mapping UI
- Supports various CSV formats

### Recurring Transactions
- Auto-generates transactions based on frequency
- Links generated transactions to parent entry
- Supports weekly, monthly, yearly frequencies

## 🚢 Deployment

### Build for iOS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios
```

## 🤝 Contributing

This is a personal project, but suggestions and feedback are welcome!

## 📄 License

MIT License - feel free to use this as inspiration for your own projects

## 🙏 Acknowledgments

- [Catppuccin](https://github.com/catppuccin/catppuccin) for the beautiful color palette
- [Supabase](https://supabase.com/) for the amazing backend platform
- [Expo](https://expo.dev/) for the excellent React Native framework
