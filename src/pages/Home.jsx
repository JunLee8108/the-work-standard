// src/pages/Home.jsx
import { useState, useEffect } from "react";
import {
  Users,
  Clock,
  Package,
  TrendingUp,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowUp,
  ArrowDown,
  Activity,
  Box,
} from "lucide-react";
import useAuthStore from "../stores/authStore";

export default function Home() {
  const user = useAuthStore((state) => state.user);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 더미 데이터
  const stats = {
    attendance: {
      present: 42,
      absent: 3,
      leave: 5,
      total: 50,
      change: 5,
    },
    inventory: {
      totalItems: 324,
      lowStock: 12,
      outOfStock: 3,
      change: -2,
    },
    orders: {
      pending: 8,
      processing: 15,
      completed: 127,
      change: 12,
    },
    revenue: {
      today: 2450000,
      thisMonth: 48500000,
      change: 15,
    },
  };

  const recentActivities = [
    {
      id: 1,
      type: "attendance",
      name: "김철수",
      action: "출근",
      time: "08:45",
      status: "success",
    },
    {
      id: 2,
      type: "inventory",
      name: "A4 용지",
      action: "재고 부족 경고",
      time: "09:30",
      status: "warning",
    },
    {
      id: 3,
      type: "attendance",
      name: "이영희",
      action: "연차 신청",
      time: "10:15",
      status: "info",
    },
    {
      id: 4,
      type: "inventory",
      name: "토너 카트리지",
      action: "입고 완료",
      time: "11:00",
      status: "success",
    },
    {
      id: 5,
      type: "attendance",
      name: "박민수",
      action: "지각",
      time: "09:20",
      status: "error",
    },
  ];

  const upcomingSchedule = [
    { id: 1, title: "월간 재고 실사", date: "2024-01-25", type: "inventory" },
    { id: 2, title: "팀장 회의", date: "2024-01-23", type: "meeting" },
    { id: 3, title: "신입사원 연수", date: "2024-01-26", type: "training" },
    { id: 4, title: "분기 보고서 마감", date: "2024-01-31", type: "report" },
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case "error":
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-medium text-gray-800">
          {user?.user_metadata?.name || "사용자"}님, 안녕하세요
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          {currentTime.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}{" "}
          {currentTime.toLocaleTimeString("ko-KR")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* 출근 현황 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base uppercase tracking-wider text-gray-500 mb-2">
                출근 현황
              </p>
              <p className="text-2xl font-light text-gray-800">
                {stats.attendance.present}
                <span className="text-base text-gray-400">
                  /{stats.attendance.total}
                </span>
              </p>
            </div>
            <span
              className={`text-xs ${
                stats.attendance.change > 0 ? "text-gray-600" : "text-gray-500"
              } flex items-center`}
            >
              {stats.attendance.change > 0 ? (
                <ArrowUp className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(stats.attendance.change)}%
            </span>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>결근 {stats.attendance.absent}</span>
            <span>휴가 {stats.attendance.leave}</span>
          </div>
        </div>

        {/* 재고 현황 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base uppercase tracking-wider text-gray-500 mb-2">
                재고 현황
              </p>
              <p className="text-2xl font-light text-gray-800">
                {stats.inventory.totalItems}
                <span className="text-base text-gray-400"> 품목</span>
              </p>
            </div>
            <span
              className={`text-xs ${
                stats.inventory.change > 0 ? "text-gray-600" : "text-gray-500"
              } flex items-center`}
            >
              {stats.inventory.change > 0 ? (
                <ArrowUp className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(stats.inventory.change)}%
            </span>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>부족 {stats.inventory.lowStock}</span>
            <span>품절 {stats.inventory.outOfStock}</span>
          </div>
        </div>

        {/* 발주 현황 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base uppercase tracking-wider text-gray-500 mb-2">
                발주 현황
              </p>
              <p className="text-2xl font-light text-gray-800">
                {stats.orders.pending + stats.orders.processing}
                <span className="text-base text-gray-400"> 건</span>
              </p>
            </div>
            <span
              className={`text-xs ${
                stats.orders.change > 0 ? "text-gray-600" : "text-gray-500"
              } flex items-center`}
            >
              {stats.orders.change > 0 ? (
                <ArrowUp className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(stats.orders.change)}%
            </span>
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>대기 {stats.orders.pending}</span>
            <span>처리중 {stats.orders.processing}</span>
          </div>
        </div>

        {/* 매출 현황 */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base uppercase tracking-wider text-gray-500 mb-2">
                이번달 매출
              </p>
              <p className="text-2xl font-light text-gray-800">
                {(stats.revenue.thisMonth / 1000000).toFixed(1)}
                <span className="text-base text-gray-400">M</span>
              </p>
            </div>
            <span
              className={`text-xs ${
                stats.revenue.change > 0 ? "text-gray-600" : "text-gray-500"
              } flex items-center`}
            >
              {stats.revenue.change > 0 ? (
                <ArrowUp className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(stats.revenue.change)}%
            </span>
          </div>
          <div className="text-xs text-gray-500">
            오늘 {(stats.revenue.today / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      {/* Recent Activities & Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Activities */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-medium text-gray-700">최근 활동</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  {getStatusIcon(activity.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium text-gray-800">
                        {activity.name}
                      </span>
                      <span className="text-gray-500">
                        {" "}
                        · {activity.action}
                      </span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Schedule */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="text-base font-medium text-gray-700">예정된 일정</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingSchedule.map((schedule) => (
                <div key={schedule.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{schedule.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {schedule.date}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-50 text-gray-600 rounded-md">
                    {schedule.type === "inventory"
                      ? "재고"
                      : schedule.type === "meeting"
                      ? "회의"
                      : schedule.type === "training"
                      ? "연수"
                      : "리포트"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
