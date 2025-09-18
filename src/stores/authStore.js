// src/stores/authStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-hot-toast";
import supabase from "../services/supabaseClient";
import * as authService from "../services/authService";

const useAuthStore = create(
  devtools(
    (set) => ({
      // State
      user: null,
      loading: true,
      isAuthenticated: false,

      // 로그인
      signIn: async (email, password) => {
        try {
          set({ loading: true });
          const data = await authService.signIn(email, password);

          set({
            user: data.user,
            isAuthenticated: true,
            loading: false,
          });

          return { success: true };
        } catch (error) {
          const errorMessage =
            error.message === "Invalid login credentials"
              ? "이메일 또는 비밀번호가 올바르지 않습니다."
              : error.message === "Email not confirmed"
              ? "이메일 확인이 필요합니다."
              : error.message;

          toast.error(errorMessage);
          set({ loading: false });
          return { success: false };
        }
      },

      // 회원가입
      signUp: async (email, password, name, company) => {
        try {
          set({ loading: true });
          await authService.signUp(email, password, { name, company });

          set({ loading: false });
          return { success: true };
        } catch (error) {
          const errorMessage =
            error.message === "User already registered"
              ? "이미 등록된 이메일입니다."
              : error.message;

          toast.error(errorMessage);
          set({ loading: false });
          return { success: false };
        }
      },

      // 로그아웃
      signOut: async () => {
        set({ loading: true });
        await authService.signOut();

        set({
          user: null,
          isAuthenticated: false,
          loading: false,
        });

        // 로컬 스토리지 정리
        localStorage.clear();
        sessionStorage.clear();
      },

      // 앱 초기화 시 세션 확인
      initializeAuth: async () => {
        try {
          set({ loading: true });

          const session = await authService.getSession();

          if (session?.user) {
            set({
              user: session.user,
              isAuthenticated: true,
              loading: false,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              loading: false,
            });
          }
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: "auth-store",
    }
  )
);

// Auth 상태 리스너 (최소한의 이벤트만 처리)
export const setupAuthListener = () => {
  const { data: listener } = supabase.auth.onAuthStateChange(
    (event, session) => {
      // 토큰 갱신은 무시
      if (event === "TOKEN_REFRESHED") return;

      // 로그아웃이나 사용자 삭제 시
      if (event === "SIGNED_OUT" || event === "USER_DELETED") {
        useAuthStore.setState({
          user: null,
          isAuthenticated: false,
          loading: false,
        });
        return;
      }

      // 로그인 시
      if (event === "SIGNED_IN" && session?.user) {
        useAuthStore.setState({
          user: session.user,
          isAuthenticated: true,
          loading: false,
        });
      }
    }
  );

  return () => listener.subscription.unsubscribe();
};

export default useAuthStore;
