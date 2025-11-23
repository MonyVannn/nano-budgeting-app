import { supabase } from "@/lib/supabase";
import { Database } from "@/types/database";
import { create } from "zustand";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

interface CategoryState {
  categories: Category[];
  isLoading: boolean;

  // Actions
  fetchCategories: (userId: string) => Promise<void>;
  addCategory: (category: CategoryInsert) => Promise<void>;
  updateCategory: (id: string, updates: CategoryUpdate) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  resetMonthlyBudgets: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  isLoading: false,

  fetchCategories: async (userId: string) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("name");

      if (error) throw error;

      set({ categories: data || [] });
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  addCategory: async (category: CategoryInsert) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("categories")
        .insert(category)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        categories: [...state.categories, data],
      }));
    } catch (error) {
      console.error("Error adding category:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  updateCategory: async (id: string, updates: CategoryUpdate) => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        categories: state.categories.map((cat) => (cat.id === id ? data : cat)),
      }));
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCategory: async (id: string) => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.from("categories").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        categories: state.categories.filter((cat) => cat.id !== id),
      }));
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  resetMonthlyBudgets: async () => {
    // This would be called at the start of each month
    // Implementation depends on how you track monthly spending
    // For now, this is a placeholder
    console.log("Monthly budget reset triggered");
  },
}));
