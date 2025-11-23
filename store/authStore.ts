import { supabase } from "@/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setSession: (session: Session | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      user: null,
      isLoading: false,
      isInitialized: false,

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Get initial session
          const {
            data: { session },
          } = await supabase.auth.getSession();
          set({
            session,
            user: session?.user ?? null,
            isInitialized: true,
          });

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({
              session,
              user: session?.user ?? null,
            });
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      signIn: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          set({
            session: data.session,
            user: data.user,
          });
        } catch (error) {
          console.error("Sign in error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signUp: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });

          if (error) throw error;

          set({
            session: data.session,
            user: data.user,
          });
        } catch (error) {
          console.error("Sign up error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true });
          await supabase.auth.signOut();
          set({
            session: null,
            user: null,
          });
        } catch (error) {
          console.error("Sign out error:", error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      setSession: (session: Session | null) => {
        set({
          session,
          user: session?.user ?? null,
        });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        session: state.session,
        user: state.user,
      }),
    }
  )
);
