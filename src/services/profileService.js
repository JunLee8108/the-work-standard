// src/services/profileService.js
import supabase from "./supabaseClient";

/**
 * 현재 사용자의 프로필 조회
 */
export const getCurrentUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        companies (
          id,
          name
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) throw error;

    // companies 정보를 profile에 평탄화
    if (data && data.companies) {
      return {
        ...data,
        company_name: data.companies.name,
      };
    }
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
};

/**
 * 프로필 업데이트
 */
export const updateProfile = async (userId, updates) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating profile:", error);
    throw error;
  }
};

/**
 * 모든 프로필 조회 (관리자용)
 */
export const getAllProfiles = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        *,
        companies (
          id,
          name
        )
      `
      )
      .eq("company_id", companyId) // 같은 회사만
      .order("created_at", { ascending: false });

    if (error) throw error;

    // companies 정보 평탄화
    return (
      data?.map((profile) => ({
        ...profile,
        company_name: profile.companies?.name,
      })) || []
    );
  } catch (error) {
    console.error("Error fetching all profiles:", error);
    throw error;
  }
};

/**
 * 프로필 역할 업데이트 (관리자용)
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};
