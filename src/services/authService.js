// src/services/authService.js
import supabase from "./supabaseClient";

// 로그인
export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

// 회원가입
export const signUp = async (email, password, metadata = {}) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
};

// 로그아웃
export const signOut = async () => {
  // 에러 무시하고 항상 성공 처리
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.warn("Sign out error:", error);
  }
  return { success: true };
};

// 세션 가져오기
export const getSession = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
};

// 비밀번호 재설정
export const resetPassword = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  return data;
};
