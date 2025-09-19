// src/pages/attendance/AttendanceCheck.jsx
import { useState, useEffect } from "react";
import { User, Building2, Mail, Clock } from "lucide-react";
import useAuthStore from "../../stores/authStore";
import useAttendanceStore from "../../stores/attendanceStore";

export default function AttendanceCheck() {
  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);

  const todayStatus = useAttendanceStore((state) => state.todayStatus);
  const loading = useAttendanceStore((state) => state.loading);
  const notes = useAttendanceStore((state) => state.notes);
  const fetchTodayStatus = useAttendanceStore(
    (state) => state.fetchTodayStatus
  );
  const checkIn = useAttendanceStore((state) => state.checkIn);
  const checkOut = useAttendanceStore((state) => state.checkOut);
  const updateNotes = useAttendanceStore((state) => state.updateNotes);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [workingDuration, setWorkingDuration] = useState(null);
  const [localNotes, setLocalNotes] = useState("");
  const [workProgress, setWorkProgress] = useState(0);
  const [remainingTime, setRemainingTime] = useState("8시간 0분");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchTodayStatus(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    setLocalNotes(notes || "");
  }, [notes]);

  useEffect(() => {
    if (!todayStatus?.check_in_time || todayStatus?.check_out_time) {
      setWorkingDuration(null);
      setWorkProgress(0);
      setRemainingTime("8시간 0분");
      return;
    }

    const calculateDuration = () => {
      const checkIn = new Date(todayStatus.check_in_time);
      const now = new Date();
      const diff = now - checkIn;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setWorkingDuration({ hours, minutes });

      // 8시간 기준 진행률 계산
      const totalMinutes = hours * 60 + minutes;
      const targetMinutes = 8 * 60; // 8시간
      const progress = Math.min(totalMinutes / targetMinutes, 1);
      setWorkProgress(progress);

      // 남은 시간 계산
      const remaining = Math.max(targetMinutes - totalMinutes, 0);
      const remainHours = Math.floor(remaining / 60);
      const remainMinutes = remaining % 60;
      setRemainingTime(`${remainHours}시간 ${remainMinutes}분`);
    };

    calculateDuration();
    const interval = setInterval(calculateDuration, 1000);
    return () => clearInterval(interval);
  }, [todayStatus?.check_in_time, todayStatus?.check_out_time]);

  const handleCheckIn = async () => {
    if (!user?.id) return;
    await checkIn(user.id);
  };

  const handleCheckOut = async () => {
    if (!user?.id) return;
    await checkOut(user.id);
  };

  const handleSaveNotes = async () => {
    if (!user?.id) return;
    await updateNotes(user.id, localNotes);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "--:--";
    return new Date(timestamp).toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const hasCheckedIn = !!todayStatus?.check_in_time;
  const hasCheckedOut = !!todayStatus?.check_out_time;

  // 원형 진행률을 위한 값 계산
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - workProgress * circumference;

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-xl sm:text-2xl font-medium text-gray-900">
          출퇴근 체크
        </h1>
      </div>

      {/* Current Time - 모바일에서 중앙 정렬 */}
      <div className="mb-6 text-center sm:text-left">
        <div>
          <p className="text-xs sm:text-sm text-gray-400 mb-1">
            {currentTime.toLocaleDateString("ko-KR", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>

          <p className="text-2xl sm:text-lg font-normal text-gray-900 tabular-nums">
            {currentTime.toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </p>
        </div>
      </div>

      {/* Mobile First Layout */}
      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6">
        {/* 모바일: 상단, 데스크톱: 왼쪽 - Profile & Action */}
        <div className="lg:col-span-3">
          {/* Updated Profile Card - Daily Progress와 동일한 스타일 */}
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-100">
            <h3 className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 sm:mb-6">
              Profile
            </h3>

            {/* 프로필 아이콘 및 정보 */}
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center mb-3 border border-gray-200">
                <User className="w-6 h-6 sm:w-7 sm:h-7 text-blue-500" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1">
                {profile?.name || "사용자"}
              </h3>
            </div>

            {/* 회사 정보 */}
            <div className="space-y-2 py-3 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] sm:text-xs text-gray-600">
                  {profile?.company_name || "회사명"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] sm:text-xs text-gray-600 truncate">
                  {profile?.email || "email@company.com"}
                </span>
              </div>
            </div>

            {/* 근무 상태 정보 */}
            <div className="space-y-3 py-3 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      !hasCheckedIn
                        ? "bg-gray-400"
                        : hasCheckedOut
                        ? "bg-gray-600"
                        : "bg-blue-500 animate-pulse"
                    }`}
                  ></div>
                  <span className="text-[10px] sm:text-xs text-gray-400">
                    상태
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {!hasCheckedIn
                    ? "출근 전"
                    : hasCheckedOut
                    ? "업무 완료"
                    : "근무 중"}
                </span>
              </div>

              {hasCheckedIn && !hasCheckedOut && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <span className="text-[10px] sm:text-xs text-gray-400">
                      근무시간
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm font-medium text-blue-500">
                    {workingDuration
                      ? `${workingDuration.hours}시간 ${workingDuration.minutes}분`
                      : "0시간 0분"}
                  </span>
                </div>
              )}
            </div>

            {/* Action Button - 카드 내부로 이동 */}
            <div className="mt-4">
              {!hasCheckedIn ? (
                <button
                  onClick={handleCheckIn}
                  disabled={loading}
                  className="cursor-pointer w-full py-3 bg-blue-500 text-white text-sm font-medium rounded-xl hover:bg-blue-600 transition-all"
                >
                  출근하기
                </button>
              ) : !hasCheckedOut ? (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="cursor-pointer w-full py-3 bg-gray-600 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition-all"
                >
                  퇴근하기
                </button>
              ) : (
                <div className="w-full py-3 bg-gray-50 text-gray-400 rounded-xl text-center text-sm font-medium">
                  오늘 업무 완료
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 모바일: 중간, 데스크톱: 중앙 - 원형 진행률 */}
        <div className="lg:col-span-3">
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-4 sm:p-6 border border-gray-100">
            <h3 className="text-[10px] sm:text-xs font-medium text-gray-400 uppercase tracking-wider mb-4 sm:mb-6 text-center lg:text-left">
              Daily Progress
            </h3>

            {/* 원형 진행률 표시 */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="relative">
                <svg className="w-28 h-28 sm:w-32 sm:h-32 transform -rotate-90">
                  {/* 배경 원 */}
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="#f3f4f6"
                    strokeWidth="6"
                    fill="none"
                    className="sm:hidden"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#f3f4f6"
                    strokeWidth="8"
                    fill="none"
                    className="hidden sm:block"
                  />
                  {/* 진행률 원 - 모바일 */}
                  <circle
                    cx="56"
                    cy="56"
                    r="50"
                    stroke="#3b82f6"
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 50}
                    strokeDashoffset={2 * Math.PI * 50 * (1 - workProgress)}
                    className="transition-all duration-1000 ease-out sm:hidden"
                  />
                  {/* 진행률 원 - 데스크톱 */}
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out hidden sm:block"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl sm:text-3xl font-light text-gray-900">
                    {Math.round(workProgress * 100)}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 font-medium">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* 시간 정보 - 모바일에서 컴팩트하게 */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                  <span className="text-[10px] sm:text-sm text-gray-400">
                    목표
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  8시간
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-gray-100">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span className="text-[10px] sm:text-sm text-gray-400">
                    현재
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900">
                  {workingDuration
                    ? `${workingDuration.hours}시간 ${workingDuration.minutes}분`
                    : "0시간 0분"}
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 sm:py-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse"></div>
                  <span className="text-[10px] sm:text-sm text-gray-400">
                    남은 시간
                  </span>
                </div>
                <span className="text-xs sm:text-sm font-medium text-blue-500">
                  {remainingTime}
                </span>
              </div>
            </div>

            {/* 추가 상태 표시 */}
            {hasCheckedIn && !hasCheckedOut && workProgress >= 1 && (
              <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-[10px] sm:text-xs text-blue-600 font-medium text-center">
                  ✨ 목표 시간 달성! 수고하셨습니다
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 모바일: 하단, 데스크톱: 오른쪽 - Time Info & Notes */}
        <div className="lg:col-span-6 space-y-4 sm:space-y-6">
          {/* Time Grid - 모바일에서 2x2 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                근무 시작
              </p>
              <p className="text-base sm:text-lg lg:text-xl font-light text-gray-900">
                {hasCheckedIn ? formatTime(todayStatus.check_in_time) : "--:--"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                근무 종료
              </p>
              <p className="text-base sm:text-lg lg:text-xl font-light text-gray-900">
                {hasCheckedOut
                  ? formatTime(todayStatus.check_out_time)
                  : "--:--"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                총 근무 시간
              </p>
              <p className="text-base sm:text-lg lg:text-xl font-light text-gray-900">
                {workingDuration
                  ? `${workingDuration.hours}h ${workingDuration.minutes}m`
                  : "--:--"}
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-3 sm:p-4 lg:p-5 border border-gray-100">
              <p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                근무 상태
              </p>
              <div className="flex items-center gap-1.5 sm:gap-2">
                {todayStatus?.status === "late" && (
                  <>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-600 rounded-full"></div>
                    <p className="text-sm sm:text-base font-medium text-gray-600">
                      지각
                    </p>
                  </>
                )}
                {todayStatus?.status === "early_leave" && (
                  <>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full"></div>
                    <p className="text-sm sm:text-base font-medium text-gray-600">
                      조퇴
                    </p>
                  </>
                )}
                {todayStatus?.status === "present" && (
                  <>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>
                    <p className="text-sm sm:text-base font-medium text-blue-500">
                      정상
                    </p>
                  </>
                )}
                {!todayStatus?.status && (
                  <p className="text-sm sm:text-base text-gray-400">-</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div>
            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                업무 메모
              </h3>
              {localNotes && localNotes !== notes && (
                <span className="text-[9px] sm:text-[10px] text-blue-500 font-medium">
                  저장 중...
                </span>
              )}
            </div>
            <textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              onBlur={handleSaveNotes}
              placeholder="오늘의 업무 내용을 기록하세요..."
              className="w-full h-28 sm:h-32 lg:h-42 p-3 sm:p-4 bg-gray-50 border border-gray-100 rounded-xl text-xs sm:text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={!hasCheckedIn}
            />
            {hasCheckedIn && (
              <p className="text-[9px] sm:text-[10px] text-gray-400 mt-1.5 sm:mt-2">
                자동 저장됩니다
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
