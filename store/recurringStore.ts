import { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";
import { create } from "zustand";

type RecurringTransaction =
  Database["public"]["Tables"]["recurring_transactions"]["Row"];
type RecurringTransactionInsert =
  Database["public"]["Tables"]["recurring_transactions"]["Insert"];
type RecurringTransactionUpdate =
  Database["public"]["Tables"]["recurring_transactions"]["Update"];

interface RecurringTransactionState {
  recurringTransactions: RecurringTransaction[];
  isLoading: boolean;

  // Actions
  fetchRecurringTransactions: (userId: string) => Promise<void>;
  addRecurringTransaction: (
    transaction: RecurringTransactionInsert
  ) => Promise<void>;
  updateRecurringTransaction: (
    id: string,
    updates: RecurringTransactionUpdate
  ) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  toggleActive: (id: string, isActive: boolean) => Promise<void>;

  // Generate transactions from recurring entries
  generateUpcomingTransactions: (userId: string) => Promise<void>;
  clearRecurringTransactions: () => void;
}

export const useRecurringStore = create<RecurringTransactionState>(
  (set, get) => ({
    recurringTransactions: [],
    isLoading: false,

    fetchRecurringTransactions: async (userId: string) => {
      try {
        set({ isLoading: true });
        const { data, error } = await supabase
          .from("recurring_transactions")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (error) throw error;

        set({ recurringTransactions: data || [] });
      } catch (error) {
        console.error("Error fetching recurring transactions:", error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    addRecurringTransaction: async (
      transaction: RecurringTransactionInsert
    ) => {
      try {
        set({ isLoading: true });
        const { data, error } = await supabase
          .from("recurring_transactions")
          // @ts-ignore - Supabase type inference issue with Database generic
          .insert(transaction)
          .select("*")
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error("No data returned from insert");
        }

        set((state) => ({
          recurringTransactions: [data, ...state.recurringTransactions],
        }));
      } catch (error) {
        console.error("Error adding recurring transaction:", error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    updateRecurringTransaction: async (
      id: string,
      updates: RecurringTransactionUpdate
    ) => {
      try {
        set({ isLoading: true });
        const { data, error } = await supabase
          .from("recurring_transactions")
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
          recurringTransactions: state.recurringTransactions.map((txn) =>
            txn.id === id ? data : txn
          ),
        }));
      } catch (error) {
        console.error("Error updating recurring transaction:", error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    deleteRecurringTransaction: async (id: string) => {
      try {
        set({ isLoading: true });
        const { error } = await supabase
          .from("recurring_transactions")
          .delete()
          .eq("id", id);

        if (error) throw error;

        set((state) => ({
          recurringTransactions: state.recurringTransactions.filter(
            (txn) => txn.id !== id
          ),
        }));
      } catch (error) {
        console.error("Error deleting recurring transaction:", error);
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    toggleActive: async (id: string, isActive: boolean) => {
      try {
        await get().updateRecurringTransaction(id, { is_active: isActive });
      } catch (error) {
        console.error("Error toggling recurring transaction:", error);
        throw error;
      }
    },

    generateUpcomingTransactions: async (userId: string) => {
      // This function would be called periodically (e.g., daily cron job)
      // to generate transactions from active recurring entries
      // Implementation would:
      // 1. Get all active recurring transactions
      // 2. Check which ones need to generate new transactions based on frequency
      // 3. Create transaction entries linked to recurring_transaction_id

      console.log("Generate upcoming transactions for user:", userId);
      // Placeholder for now - implement with actual business logic
    },

    clearRecurringTransactions: () => {
      set({ recurringTransactions: [] });
    },
  })
);
