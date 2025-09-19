// src/stores/authStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { toast } from "react-hot-toast";
import supabase from "../services/supabaseClient";
import * as authService from "../services/authService";
import * as profileService from "../services/profileService";

const useAuthStore = create(
  devtools(
    (set, get) => ({
      // State
      user: null,
      profile: null,
      profiles: [],
      loading: true,
      profilesLoading: false,
      isAuthenticated: false,
      authListenerUnsubscribe: null, // 리스너 정리를 위한 참조 저장

      // 🔥 통합된 초기화 함수
      initializeAuth: async () => {
        try {
          set({ loading: true });

          // 1. 현재 세션 확인
          const session = await authService.getSession();

          if (session?.user) {
            try {
              const profile = await profileService.getCurrentUserProfile(
                session.user.id
              );

              set({
                user: session.user,
                profile: profile,
                isAuthenticated: true,
                loading: false,
              });
            } catch (profileError) {
              console.error("Profile fetch error:", profileError);
              // 프로필 조회 실패해도 로그인 상태는 유지
              set({
                user: session.user,
                profile: null,
                isAuthenticated: true,
                loading: false,
              });
            }
          } else {
            set({
              user: null,
              profile: null,
              isAuthenticated: false,
              loading: false,
            });
          }

          // 2. Auth 상태 변경 리스너 설정 (초기화와 동시에)
          const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              console.log("Auth event:", event);

              // 토큰 갱신은 무시
              if (event === "TOKEN_REFRESHED") return;

              // 초기 세션은 이미 위에서 처리했으므로 무시
              if (event === "INITIAL_SESSION") return;

              // 로그아웃 처리
              if (event === "SIGNED_OUT" || event === "USER_DELETED") {
                set({
                  user: null,
                  profile: null,
                  profiles: [],
                  isAuthenticated: false,
                  loading: false,
                });

                // 로컬 스토리지 정리
                localStorage.clear();
                sessionStorage.clear();
                return;
              }

              // 로그인 처리 (signIn 함수를 통한 로그인만 처리)
              if (event === "SIGNED_IN" && session?.user) {
                // 이미 로그인된 상태면 무시 (중복 방지)
                const currentUser = get().user;
                if (currentUser?.id === session.user.id) return;

                try {
                  const profile = await profileService.getCurrentUserProfile(
                    session.user.id
                  );

                  set({
                    user: session.user,
                    profile: profile,
                    isAuthenticated: true,
                    loading: false,
                  });
                } catch (error) {
                  console.error("Profile fetch error on sign in:", error);
                  set({
                    user: session.user,
                    profile: null,
                    isAuthenticated: true,
                    loading: false,
                  });
                }
              }

              // 사용자 업데이트 처리
              if (event === "USER_UPDATED" && session?.user) {
                set({ user: session.user });
                // 필요시 프로필도 새로고침
                get().refreshProfile();
              }
            }
          );

          // 리스너 unsubscribe 함수 저장
          set({
            authListenerUnsubscribe: () => listener.subscription.unsubscribe(),
          });
        } catch (error) {
          console.error("Auth initialization error:", error);
          set({
            user: null,
            profile: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },

      // 앱 종료 시 정리 함수
      cleanup: () => {
        const unsubscribe = get().authListenerUnsubscribe;
        if (unsubscribe) {
          unsubscribe();
          set({ authListenerUnsubscribe: null });
        }
      },

      // 로그인
      signIn: async (email, password) => {
        try {
          set({ loading: true });
          const data = await authService.signIn(email, password);

          if (data.user) {
            const profile = await profileService.getCurrentUserProfile(
              data.user.id
            );

            set({
              user: data.user,
              profile: profile,
              isAuthenticated: true,
              loading: false,
            });
          }

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
      signUp: async (email, password, name, companyId) => {
        try {
          set({ loading: true });

          // companyId를 metadata에 포함하여 회원가입
          await authService.signUp(email, password, {
            name,
            company_id: companyId, // 이미 Auth.jsx에서 검증된 ID
            role: "user", // 기본 역할
          });

          set({ loading: false });
          return { success: true };
        } catch (error) {
          let errorMessage = "회원가입 중 오류가 발생했습니다.";

          // 에러 메시지 처리
          if (error.message === "User already registered") {
            errorMessage = "이미 등록된 이메일입니다.";
          } else if (error.message?.includes("email")) {
            errorMessage = "유효하지 않은 이메일 형식입니다.";
          } else if (error.message?.includes("password")) {
            errorMessage = "비밀번호는 최소 6자 이상이어야 합니다.";
          } else if (error.message) {
            errorMessage = error.message;
          }

          toast.error(errorMessage);
          set({ loading: false });
          return { success: false };
        }
      },

      // 로그아웃
      signOut: async () => {
        set({ loading: true });
        await authService.signOut();
        // 상태 업데이트는 onAuthStateChange 리스너에서 처리됨
      },

      // 프로필 업데이트
      updateProfile: async (updates) => {
        try {
          const userId = get().user?.id;
          if (!userId) throw new Error("User not found");

          const updatedProfile = await profileService.updateProfile(
            userId,
            updates
          );

          set({ profile: updatedProfile });
          toast.success("프로필이 업데이트되었습니다.");
          return { success: true };
        } catch {
          toast.error("프로필 업데이트 실패");
          return { success: false };
        }
      },

      // 프로필 새로고침
      refreshProfile: async () => {
        try {
          const userId = get().user?.id;
          if (!userId) return;

          const profile = await profileService.getCurrentUserProfile(userId);
          set({ profile });
        } catch (error) {
          console.error("Error refreshing profile:", error);
        }
      },

      // 전체 프로필 가져오기 (관리자용)
      fetchAllProfiles: async () => {
        try {
          const currentProfile = get().profile;
          if (currentProfile?.role !== "admin") {
            console.error("Unauthorized: Admin only");
            return;
          }

          // company_id가 없으면 리턴
          if (!currentProfile.company_id) {
            console.error("No company_id found");
            return;
          }

          set({ profilesLoading: true });
          const profiles = await profileService.getAllProfiles(
            currentProfile.company_id
          );
          set({ profiles, profilesLoading: false });
        } catch (error) {
          console.error("Error fetching all profiles:", error);
          set({ profilesLoading: false });
          toast.error("사용자 목록을 불러오지 못했습니다.");
        }
      },

      // 전체 프로필 새로고침 (관리자용)
      refreshAllProfiles: async () => {
        const currentProfile = get().profile;
        if (currentProfile?.role !== "admin") {
          console.error("Unauthorized: Admin only");
          return;
        }

        await get().fetchAllProfiles();
        toast.success("사용자 목록을 새로고침했습니다.");
      },

      // 사용자 권한 변경 (관리자용)
      updateUserRole: async (userId, newRole) => {
        try {
          const currentProfile = get().profile;
          if (currentProfile?.role !== "admin") {
            toast.error("권한이 없습니다.");
            return { success: false };
          }

          if (userId === get().user?.id) {
            toast.error("자신의 권한은 변경할 수 없습니다.");
            return { success: false };
          }

          const updatedProfile = await profileService.updateUserRole(
            userId,
            newRole
          );

          set((state) => ({
            profiles: state.profiles.map((p) =>
              p.id === userId ? updatedProfile : p
            ),
          }));

          toast.success("권한이 변경되었습니다.");
          return { success: true };
        } catch (error) {
          console.error("Error updating user role:", error);
          toast.error("권한 변경에 실패했습니다.");
          return { success: false };
        }
      },
    }),
    {
      name: "auth-store",
    }
  )
);

// Selector hooks
export const useProfile = () => useAuthStore((state) => state.profile);
export const useRole = () => useAuthStore((state) => state.profile?.role);
export const useProfiles = () => useAuthStore((state) => state.profiles);
export const useProfilesLoading = () =>
  useAuthStore((state) => state.profilesLoading);

export const useIsAdmin = () => {
  const profile = useAuthStore((state) => state.profile);
  return profile?.role === "admin";
};

// Action hooks
export const useAuthActions = () => {
  return useAuthStore((state) => ({
    fetchAllProfiles: state.fetchAllProfiles,
    refreshAllProfiles: state.refreshAllProfiles,
    updateUserRole: state.updateUserRole,
    updateProfile: state.updateProfile,
    refreshProfile: state.refreshProfile,
  }));
};

export default useAuthStore;
