import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (email, password, rememberMe) => {
        set({ loading: true });

        // Temporary login:
        // Any valid email/password combination is accepted.
        await new Promise((resolve) => setTimeout(resolve, 800));

        const user = {
          id: 1,
          name: "John Doe",
          email: email,
          role: "Underwriter",
        };

        set({
          user,
          token: "temporary-demo-token",
          isAuthenticated: true,
          loading: false,
        });

        return {
          success: true,
          user,
        };
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
        });
      },
    }),
    {
      name: "canopy-auth",
    }
  )
);

export default useAuthStore;