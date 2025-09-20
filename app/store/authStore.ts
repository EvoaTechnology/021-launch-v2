import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  // De-dupe concurrent checks but allow subsequent checks (e.g., after login)
  let inFlightCheck: Promise<void> | null = null;

  return {
    user: null,
    isLoading: true,
    isAuthenticated: false,

    checkAuth: async () => {
      if (inFlightCheck) {
        await inFlightCheck;
        return;
      }
      inFlightCheck = (async () => {
        try {
          const supabase = createClient();
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();

          if (error || !user) {
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          console.error("❌ Auth check failed:", error);
          set({ user: null, isAuthenticated: false, isLoading: false });
        } finally {
          inFlightCheck = null;
        }
      })();
      await inFlightCheck;
    },

    signOut: async () => {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
        set({ user: null, isAuthenticated: false, isLoading: false });
        inFlightCheck = null;
      } catch (error) {
        console.error("❌ Sign out failed:", error);
      }
    },
  };
});
