// src/services/attendanceService.js
import supabase from "./supabaseClient";

/**
 * 출근 체크
 * - 단순히 출근 시간만 기록
 * - 상태 판단은 나중에 트리거가 처리
 */
export const checkIn = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // 오늘 이미 출근했는지 확인 (maybeSingle 사용)
    const { data: existing, error: checkError } = await supabase
      .from("attendance_records")
      .select("id, check_in_time")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (checkError) throw checkError;

    if (existing?.check_in_time) {
      return {
        success: false,
        message: "이미 출근 처리되었습니다.",
      };
    }

    // 출근 기록 생성 또는 업데이트 (data 제거)
    const { error } = await supabase.from("attendance_records").upsert(
      {
        user_id: userId,
        date: today,
        check_in_time: now,
      },
      {
        onConflict: "user_id,date",
      }
    );

    if (error) throw error;

    return {
      success: true,
      message: "출근이 기록되었습니다.",
      time: now,
    };
  } catch (error) {
    console.error("Check-in error:", error);
    return {
      success: false,
      message: "출근 처리 중 오류가 발생했습니다.",
      error,
    };
  }
};

/**
 * 퇴근 체크
 * - 단순히 퇴근 시간만 기록
 * - 근무시간 계산은 나중에 트리거가 처리
 */
export const checkOut = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    // 오늘 출근 기록 확인 (maybeSingle 사용)
    const { data: todayRecord, error: checkError } = await supabase
      .from("attendance_records")
      .select("id, check_in_time, check_out_time")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!todayRecord) {
      return {
        success: false,
        message: "출근 기록이 없습니다. 먼저 출근 체크를 해주세요.",
      };
    }

    if (!todayRecord.check_in_time) {
      return {
        success: false,
        message: "출근 시간이 기록되지 않았습니다.",
      };
    }

    if (todayRecord.check_out_time) {
      return {
        success: false,
        message: "이미 퇴근 처리되었습니다.",
      };
    }

    // 퇴근 시간 업데이트 (data 제거)
    const { error } = await supabase
      .from("attendance_records")
      .update({
        check_out_time: now,
      })
      .eq("id", todayRecord.id);

    if (error) throw error;

    return {
      success: true,
      message: "퇴근이 기록되었습니다.",
      time: now,
    };
  } catch (error) {
    console.error("Check-out error:", error);
    return {
      success: false,
      message: "퇴근 처리 중 오류가 발생했습니다.",
      error,
    };
  }
};

export const updateNotes = async (userId, notes) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // 오늘 기록이 있는지 확인
    const { data: existing, error: checkError } = await supabase
      .from("attendance_records")
      .select("id")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (checkError) throw checkError;

    if (!existing) {
      return {
        success: false,
        message: "오늘 출근 기록이 없습니다.",
      };
    }

    // 메모 업데이트
    const { error } = await supabase
      .from("attendance_records")
      .update({
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);

    if (error) throw error;

    return {
      success: true,
      message: "메모가 저장되었습니다.",
    };
  } catch (error) {
    console.error("Update notes error:", error);
    return {
      success: false,
      message: "메모 저장에 실패했습니다.",
      error,
    };
  }
};

/**
 * 오늘 근태 상태 조회 (UI 표시용)
 */
export const getTodayStatus = async (userId) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    // maybeSingle 사용 - 데이터가 없어도 에러 발생하지 않음
    const { data, error } = await supabase
      .from("attendance_records")
      .select("check_in_time, check_out_time, status, work_duration, notes")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (error) throw error;

    return {
      success: true,
      data: data || null,
      hasCheckedIn: !!data?.check_in_time,
      hasCheckedOut: !!data?.check_out_time,
    };
  } catch (error) {
    console.error("Get today status error:", error);
    return {
      success: false,
      error,
    };
  }
};
