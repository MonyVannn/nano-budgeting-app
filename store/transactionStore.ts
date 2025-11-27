import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { create } from "zustand";

type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
type TransactionInsert = Database["public"]["Tables"]["transactions"]["Insert"];
type TransactionUpdate = Database["public"]["Tables"]["transactions"]["Update"];

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;

  // Actions
  fetchTransactions: (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => Promise<Transaction[]>;
  addTransaction: (transaction: TransactionInsert) => Promise<void>;
  updateTransaction: (id: string, updates: TransactionUpdate) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteTransactions: (ids: string[]) => Promise<void>;
  importFromCSV: (transactions: TransactionInsert[]) => Promise<void>;

  // Helpers
  clearTransactions: () => void;

  // Computed values
  getTotalIncome: (startDate?: string, endDate?: string) => number;
  getTotalExpenses: (startDate?: string, endDate?: string) => number;
  getNetAmount: (startDate?: string, endDate?: string) => number;
  getTransactionsByCategory: (categoryId: string) => Transaction[];
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  isLoading: false,

  fetchTransactions: async (
    userId: string,
    startDate?: string,
    endDate?: string
  ) => {
    try {
      set({ isLoading: true });
      let query = supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

      if (startDate) {
        query = query.gte("date", startDate);
      }
      if (endDate) {
        query = query.lte("date", endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      const records = data || [];
      set({ transactions: records });
      return records;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (transaction: TransactionInsert) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("transactions")
        // @ts-ignore - Supabase type inference issue with Database generic
        .insert(transaction)
        .select("*")
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("No data returned from insert");
      }

      set((state) => ({
        transactions: [data, ...state.transactions],
      }));
    } catch (error) {
      console.error("Error adding transaction:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id: string, updates: TransactionUpdate) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("transactions")
        // @ts-ignore - Supabase type inference issue with Database generic
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;

      if (!data) {
        throw new Error("No data returned from update");
      }

      set((state) => ({
        transactions: state.transactions.map((txn) =>
          txn.id === id ? data : txn
        ),
      }));
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter((txn) => txn.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransactions: async (ids: string[]) => {
    if (ids.length === 0) return;
    try {
      set({ isLoading: true });
      const { error } = await supabase
        .from("transactions")
        .delete()
        .in("id", ids);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter((txn) => !ids.includes(txn.id)),
      }));
    } catch (error) {
      console.error("Error deleting transactions:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  importFromCSV: async (transactions: TransactionInsert[]) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("transactions")
        // @ts-ignore - Supabase type inference issue with Database generic
        .insert(transactions)
        .select("*");

      if (error) throw error;

      if (!data) {
        throw new Error("No data returned from insert");
      }

      set((state) => ({
        transactions: [...data, ...state.transactions],
      }));
    } catch (error) {
      console.error("Error importing transactions:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  getTotalIncome: (startDate?: string, endDate?: string) => {
    const { transactions } = get();
    return transactions
      .filter((txn) => {
        const matchesDateRange =
          (!startDate || txn.date >= startDate) &&
          (!endDate || txn.date <= endDate);
        return !txn.is_expense && matchesDateRange;
      })
      .reduce((sum, txn) => sum + txn.amount, 0);
  },

  getTotalExpenses: (startDate?: string, endDate?: string) => {
    const { transactions } = get();
    return transactions
      .filter((txn) => {
        const matchesDateRange =
          (!startDate || txn.date >= startDate) &&
          (!endDate || txn.date <= endDate);
        return txn.is_expense && matchesDateRange;
      })
      .reduce((sum, txn) => sum + txn.amount, 0);
  },

  getNetAmount: (startDate?: string, endDate?: string) => {
    const income = get().getTotalIncome(startDate, endDate);
    const expenses = get().getTotalExpenses(startDate, endDate);
    return income - expenses;
  },

  getTransactionsByCategory: (categoryId: string) => {
    const { transactions } = get();
    return transactions.filter((txn) => txn.category_id === categoryId);
  },

  clearTransactions: () => {
    set({ transactions: [] });
  },
}));
