// src/components/layout/Sidebar.jsx
import { useState } from "react";
import { NavLink, useLocation } from "react-router";
import {
  LayoutDashboard,
  Clock,
  Package,
  FileText,
  Settings,
  Menu,
  X,
  ChevronDown,
  Users,
  Calendar,
  TrendingUp,
  Box,
  ShoppingCart,
  BarChart3,
  Building2,
  LogOut,
} from "lucide-react";
import useAuthStore from "../stores/authStore";

export default function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const menuItems = [
    {
      title: "대시보드",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "근태관리",
      icon: Clock,
      path: "/attendance",
      subItems: [
        { title: "출퇴근 체크", path: "/attendance/check", icon: Calendar },
        { title: "근태 현황", path: "/attendance/status", icon: Users },
        { title: "휴가 관리", path: "/attendance/leave", icon: FileText },
        { title: "근태 리포트", path: "/attendance/report", icon: BarChart3 },
      ],
    },
    {
      title: "재고관리",
      icon: Package,
      path: "/inventory",
      subItems: [
        { title: "재고 현황", path: "/inventory/status", icon: Box },
        { title: "입출고 관리", path: "/inventory/inout", icon: ShoppingCart },
        { title: "발주 관리", path: "/inventory/order", icon: FileText },
        { title: "재고 리포트", path: "/inventory/report", icon: TrendingUp },
      ],
    },
    {
      title: "리포트",
      icon: BarChart3,
      path: "/reports",
    },
    {
      title: "설정",
      icon: Settings,
      path: "/settings",
      subItems: [
        { title: "회사 정보", path: "/settings/company", icon: Building2 },
        { title: "사용자 관리", path: "/settings/users", icon: Users },
        { title: "시스템 설정", path: "/settings/system", icon: Settings },
      ],
    },
  ];

  const toggleExpanded = (title) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isParentActive = (item) => {
    if (location.pathname === item.path) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => location.pathname === sub.path);
    }
    return false;
  };

  const renderMenuItem = (item) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedMenus[item.title];
    const active = isParentActive(item);

    return (
      <div key={item.title}>
        {hasSubItems ? (
          <>
            <button
              onClick={() => toggleExpanded(item.title)}
              className="w-full cursor-pointer hover:bg-gray-100 flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.title}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "transform rotate-180" : ""
                }`}
              />
            </button>
            {isExpanded && (
              <div className="mt-1 ml-4 space-y-1">
                {item.subItems.map((subItem) => (
                  <NavLink
                    key={subItem.path}
                    to={subItem.path}
                    className={`flex items-center px-4 py-2 text-sm rounded-lg transition-colors ${
                      isActive(subItem.path)
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <subItem.icon className="w-4 h-4 mr-3" />
                    <span>{subItem.title}</span>
                  </NavLink>
                ))}
              </div>
            )}
          </>
        ) : (
          <NavLink
            to={item.path}
            className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${
              active
                ? "bg-blue-50 text-blue-600"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <item.icon className="w-5 h-5 mr-3" />
            <span>{item.title}</span>
          </NavLink>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-2 right-3 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow"
        >
          {isMobileOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-9 h-9 text-sm bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.user_metadata?.name?.[0] ||
                  user?.email?.[0]?.toUpperCase() ||
                  "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {user?.user_metadata?.name || "사용자"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.user_metadata?.company || "회사명"}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto">
            <div className="space-y-1">{menuItems.map(renderMenuItem)}</div>
          </nav>

          {/* Logout button */}
          <div className="px-4 py-4 border-t border-gray-200">
            <button
              onClick={signOut}
              className="w-full flex items-center px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>로그아웃</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
