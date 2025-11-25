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
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          expected_amount?: number;
          frequency?: "weekly" | "monthly";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          expected_amount?: number;
          frequency?: "weekly" | "monthly";
          created_at?: string;
          updated_at?: string;
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
  };
}
