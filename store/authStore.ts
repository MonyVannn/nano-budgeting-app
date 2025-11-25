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
  explicitlySignedOut: boolean; // Track if user explicitly signed out

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
      explicitlySignedOut: false,

      initialize: async () => {
        try {
          set({ isLoading: true });

          // Check if user explicitly signed out - if so, don't restore session
          const state = get();
          if (state.explicitlySignedOut) {
            console.log(
              "User explicitly signed out, skipping session restoration"
            );
            // Clear Supabase storage to be sure
            await supabase.auth.signOut();
            set({
              session: null,
              user: null,
              isInitialized: true,
              explicitlySignedOut: false, // Reset flag after initialization
            });
            return;
          }

          // Always clear state first to prevent stale data
          set({
            session: null,
            user: null,
          });

          // Get initial session from Supabase (not from storage)
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession();

          if (error) {
            console.error("Error getting session:", error);
            // Clear any stale persisted data
            set({
              session: null,
              user: null,
              isInitialized: true,
            });
          } else {
            // Verify session is actually valid by checking if it has a user
            if (session && session.user) {
              // Check if session is expired - if so, try to refresh it
              const now = Math.floor(Date.now() / 1000);
              if (session.expires_at && session.expires_at < now) {
                // Session expired, try to refresh it
                // Supabase's autoRefreshToken should handle this, but we'll try manually
                const { data: refreshData, error: refreshError } =
                  await supabase.auth.refreshSession();

                if (refreshError || !refreshData.session) {
                  // Refresh failed, clear session
                  console.log("Session refresh failed, clearing session");
                  set({
                    session: null,
                    user: null,
                    isInitialized: true,
                  });
                } else {
                  // Refresh succeeded, use new session
                  set({
                    session: refreshData.session,
                    user: refreshData.session.user,
                    isInitialized: true,
                  });
                }
              } else {
                // Session is still valid
                set({
                  session: session,
                  user: session.user,
                  isInitialized: true,
                });
              }
            } else {
              // No valid session
              set({
                session: null,
                user: null,
                isInitialized: true,
              });
            }
          }

          // Listen for auth changes - but only update if not explicitly signed out
          supabase.auth.onAuthStateChange((_event, session) => {
            const currentState = get();
            // Don't restore session if user explicitly signed out
            if (currentState.explicitlySignedOut && !session) {
              console.log(
                "Auth state changed but user explicitly signed out, ignoring"
              );
              return;
            }

            // Handle token refresh events - update session without resetting explicitlySignedOut
            if (_event === "TOKEN_REFRESHED" && session && session.user) {
              set({
                session: session,
                user: session.user,
              });
              return;
            }

            // Only update if we have a valid session or if it's a sign out event
            if (session && session.user) {
              set({
                session: session,
                user: session.user,
                explicitlySignedOut: false, // Reset flag on successful auth
              });
            } else if (_event === "SIGNED_OUT") {
              set({
                session: null,
                user: null,
                explicitlySignedOut: true,
              });
            }
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          // On error, clear state
          set({
            session: null,
            user: null,
            isInitialized: true,
          });
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
            explicitlySignedOut: false, // Reset flag on successful sign in
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
            explicitlySignedOut: false, // Reset flag on successful sign up
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

          // Mark as explicitly signed out BEFORE clearing
          set({ explicitlySignedOut: true });

          // Sign out from Supabase (this clears Supabase's internal storage)
          const { error } = await supabase.auth.signOut();

          // Clear Supabase storage keys directly to be absolutely sure
          try {
            // Supabase stores auth data in AsyncStorage with specific keys
            // Clear common Supabase auth storage keys
            const commonKeys = ["sb-auth-token", "supabase.auth.token"];

            for (const key of commonKeys) {
              try {
                await AsyncStorage.removeItem(key);
              } catch (e) {
                // Ignore errors for individual keys
              }
            }

            // Also try to get all keys and clear Supabase-related ones
            const allKeys = await AsyncStorage.getAllKeys();
            for (const key of allKeys) {
              if (
                key.includes("supabase") ||
                key.includes("sb-") ||
                key.includes("auth")
              ) {
                try {
                  await AsyncStorage.removeItem(key);
                } catch (e) {
                  // Ignore errors
                }
              }
            }
          } catch (storageError) {
            console.warn("Error clearing Supabase storage:", storageError);
          }

          // Clear state immediately regardless of Supabase response
          set({
            session: null,
            user: null,
            explicitlySignedOut: true,
          });

          if (error) {
            console.error("Sign out error:", error);
            // Don't throw - we've cleared local state anyway
          }

          console.log("Sign out completed - state cleared");
        } catch (error) {
          console.error("Sign out error:", error);
          // Even if signOut fails, clear local state
          set({
            session: null,
            user: null,
            explicitlySignedOut: true,
          });
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
      name: "auth-storage-v2", // Changed name to avoid old persisted data
      storage: createJSONStorage(() => AsyncStorage),
      // Don't persist session/user - they can be stale
      // Persist isInitialized and explicitlySignedOut to track auth state
      partialize: (state) => ({
        isInitialized: state.isInitialized,
        explicitlySignedOut: state.explicitlySignedOut,
      }),
    }
  )
);
