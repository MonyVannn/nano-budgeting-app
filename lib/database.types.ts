/**
 * Database Types
 *
 * These types represent the database schema.
 *
 * To regenerate these types after database changes:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_REF > lib/database.types.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          expected_amount: number;
          frequency: "weekly" | "monthly";
          created_at: string;
          updated_at: string;
          type: Database["public"]["Enums"]["category_type"];
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          expected_amount?: number;
          frequency?: "weekly" | "monthly";
          created_at?: string;
          updated_at?: string;
          type?: Database["public"]["Enums"]["category_type"];
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          expected_amount?: number;
          frequency?: "weekly" | "monthly";
          created_at?: string;
          updated_at?: string;
          type?: Database["public"]["Enums"]["category_type"];
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          date: string;
          category_id: string | null;
          description: string | null;
          account: string | null;
          is_expense: boolean;
          recurring_transaction_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          date?: string;
          category_id?: string | null;
          description?: string | null;
          account?: string | null;
          is_expense?: boolean;
          recurring_transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          date?: string;
          category_id?: string | null;
          description?: string | null;
          account?: string | null;
          is_expense?: boolean;
          recurring_transaction_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      recurring_transactions: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          category_id: string | null;
          description: string | null;
          account: string | null;
          is_expense: boolean;
          frequency: "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          category_id?: string | null;
          description?: string | null;
          account?: string | null;
          is_expense?: boolean;
          frequency: "weekly" | "monthly" | "yearly";
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          category_id?: string | null;
          description?: string | null;
          account?: string | null;
          is_expense?: boolean;
          frequency?: "weekly" | "monthly" | "yearly";
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      generate_recurring_transactions: {
        Args: {
          p_user_id: string;
          p_start_date?: string;
          p_end_date?: string;
        };
        Returns: {
          recurring_id: string;
          generated_date: string;
          amount: number;
        }[];
      };
    };
    Enums: {
      category_type: "expense" | "income";
    };
  };
}

// Helper types for easier usage
export type Category = Database["public"]["Tables"]["categories"]["Row"];
export type CategoryInsert =
  Database["public"]["Tables"]["categories"]["Insert"];
export type CategoryUpdate =
  Database["public"]["Tables"]["categories"]["Update"];

export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type TransactionInsert =
  Database["public"]["Tables"]["transactions"]["Insert"];
export type TransactionUpdate =
  Database["public"]["Tables"]["transactions"]["Update"];

export type RecurringTransaction =
  Database["public"]["Tables"]["recurring_transactions"]["Row"];
export type RecurringTransactionInsert =
  Database["public"]["Tables"]["recurring_transactions"]["Insert"];
export type RecurringTransactionUpdate =
  Database["public"]["Tables"]["recurring_transactions"]["Update"];

export type TransactionFrequency = "weekly" | "monthly" | "yearly";
export type CategoryFrequency = "weekly" | "monthly";
