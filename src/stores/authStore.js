// src/stores/authStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-hot-toast"; // toast import 추가
import supabase from "../services/supabaseClient";
import * as authService from "../services/authService";

const useAuthStore = create(
  devtools(
    (set) => ({
      // State
      user: null,
      loading: true,
      error: null,
      isAuthenticated: false,

      // Actions
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setLoading: (loading) => set({ loading }),

      setError: (error) => set({ error }),

      // 로그인
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const data = await authService.signIn(email, password);

          if (data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              loading: false,
            });
          }

          return { success: true, data };
        } catch (error) {
          const errorMessage =
            error.message === "Invalid login credentials"
              ? "이메일 또는 비밀번호가 올바르지 않습니다."
              : error.message;

          // 여기서 직접 toast 표시
          toast.error(errorMessage);

          set({ loading: false });
          throw error;
        }
      },

      // 회원가입
      signUp: async (email, password, name, company) => {
        try {
          set({ loading: true, error: null });
          const data = await authService.signUp(email, password, {
            name,
            company,
          });

          if (data.user) {
            set({
              user: data.user,
              isAuthenticated: true,
              loading: false,
            });
          }

          return { success: true, data };
        } catch (error) {
          const errorMessage =
            error.message === "User already registered"
              ? "이미 등록된 이메일입니다."
              : error.message;

          // 여기서 직접 toast 표시
          toast.error(errorMessage);

          set({ loading: false });
          throw error;
        }
      },

      // 로그아웃
      signOut: async () => {
        try {
          set({ loading: true, error: null });
          await authService.signOut();
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        } catch (error) {
          toast.error("로그아웃 중 오류가 발생했습니다.");
          set({ loading: false });
          throw error;
        }
      },

      // 사용자 초기화 (앱 시작시)
      initializeAuth: async () => {
        try {
          set({ loading: true, error: null });

          // 세션 체크
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (session?.user) {
            set({
              user: session.user,
              isAuthenticated: true,
              loading: false,
            });
            return session.user;
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
            });
            return null;
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
          return null;
        }
      },

      // 에러 클리어
      clearError: () => set({ error: null }),
    }),
    {
      name: "auth-store",
    }
  )
);

// Supabase Auth 리스너 설정
export const setupAuthListener = () => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      const user = session?.user ?? null;

      if (event === "TOKEN_REFRESHED") {
        return;
      }

      useAuthStore.getState().setUser(user);
      useAuthStore.getState().setLoading(false);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
};

export default useAuthStore;
