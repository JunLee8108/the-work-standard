// src/stores/attendanceStore.js
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import * as attendanceService from "../services/attendanceService";
import { toast } from "react-hot-toast";

const useAttendanceStore = create(
  devtools(
    (set, get) => ({
      // State
      todayStatus: null,
      loading: false,
      notes: "",

      // 오늘 상태 조회
      fetchTodayStatus: async (userId) => {
        try {
          set({ loading: true });
          const result = await attendanceService.getTodayStatus(userId);

          if (result.success) {
            set({
              todayStatus: result.data,
              notes: result.data?.notes || "",
              loading: false,
            });
          } else {
            set({ loading: false });
          }
        } catch (error) {
          console.error("Error fetching today status:", error);
          set({ loading: false });
        }
      },

      // 출근 체크
      checkIn: async (userId) => {
        try {
          set({ loading: true });
          const result = await attendanceService.checkIn(userId);

          if (result.success) {
            toast.success(result.message);
            await get().fetchTodayStatus(userId);
          } else {
            toast.error(result.message);
          }

          set({ loading: false });
          return result;
        } catch {
          set({ loading: false });
          toast.error("출근 처리 중 오류가 발생했습니다.");
          return { success: false };
        }
      },

      // 퇴근 체크
      checkOut: async (userId) => {
        try {
          set({ loading: true });
          const result = await attendanceService.checkOut(userId);

          if (result.success) {
            toast.success(result.message);
            await get().fetchTodayStatus(userId);
          } else {
            toast.error(result.message);
          }

          set({ loading: false });
          return result;
        } catch {
          set({ loading: false });
          toast.error("퇴근 처리 중 오류가 발생했습니다.");
          return { success: false };
        }
      },

      // 메모 업데이트 - service 호출로 변경
      updateNotes: async (userId, notes) => {
        try {
          const result = await attendanceService.updateNotes(userId, notes);

          if (result.success) {
            set({ notes });
            toast.success(result.message);
            return result;
          } else {
            toast.error(result.message);
            return result;
          }
        } catch {
          toast.error("메모 저장에 실패했습니다.");
          return { success: false };
        }
      },

      // 상태 초기화
      reset: () => {
        set({
          todayStatus: null,
          loading: false,
          notes: "",
        });
      },
    }),
    { name: "attendance-store" }
  )
);

export default useAttendanceStore;
