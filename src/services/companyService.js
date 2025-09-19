// src/services/companyService.js
import supabase from "./supabaseClient";

/**
 * 회사 코드 검증
 * @param {string} code - 검증할 회사 코드
 * @returns {Object} { isValid: boolean, companyId?: string, companyName?: string }
 */
export const verifyCompanyCode = async (code) => {
  try {
    // 빈 코드 체크
    if (!code || code.trim() === "") {
      return { isValid: false };
    }

    const { data, error } = await supabase
      .from("companies")
      .select("id, name")
      .eq("code", code.trim()) // 앞뒤 공백 제거
      .single();

    if (error) {
      // 결과가 없는 경우도 에러로 처리됨
      console.log("Company code verification failed:", error.message);
      return { isValid: false };
    }

    if (!data) {
      return { isValid: false };
    }

    return {
      isValid: true,
      companyId: data.id,
      companyName: data.name,
    };
  } catch (error) {
    console.error("Company verification error:", error);
    return { isValid: false };
  }
};

/**
 * 회사 정보 조회 (company_id로)
 * @param {string} companyId - 회사 ID
 * @returns {Object|null} 회사 정보 또는 null
 */
export const getCompanyById = async (companyId) => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching company:", error);
    return null;
  }
};

/**
 * 사용자의 회사 정보 조회
 * @param {string} userId - 사용자 ID
 * @returns {Object|null} 회사 정보 또는 null
 */
export const getUserCompany = async (userId) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(
        `
        company_id,
        companies (
          id,
          name,
          code
        )
      `
      )
      .eq("id", userId)
      .single();

    if (error) throw error;
    return data?.companies || null;
  } catch (error) {
    console.error("Error fetching user company:", error);
    return null;
  }
};
