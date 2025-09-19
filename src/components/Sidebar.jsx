// src/components/Sidebar.jsx
import { useState, useEffect } from "react";
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

const SIDEBAR_STATE_KEY = "sidebar_state";

export default function Sidebar() {
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const user = useAuthStore((state) => state.user);
  const profile = useAuthStore((state) => state.profile);
  const signOut = useAuthStore((state) => state.signOut);

  // expandedMenus 초기 상태 - sessionStorage에서 복원
  const [expandedMenus, setExpandedMenus] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SIDEBAR_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.expandedMenus || {};
      }
    } catch (error) {
      console.error("Failed to load sidebar state:", error);
    }
    return {};
  });

  // expandedMenus 변경 시 sessionStorage에 저장
  useEffect(() => {
    try {
      sessionStorage.setItem(
        SIDEBAR_STATE_KEY,
        JSON.stringify({
          expandedMenus,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error("Failed to save sidebar state:", error);
    }
  }, [expandedMenus]);

  // 메뉴 아이템 정의
  const getAllMenuItems = () => {
    const baseMenuItems = [
      {
        title: "대시보드",
        icon: LayoutDashboard,
        path: "/",
        roles: ["user", "admin"],
      },
      {
        title: "근태관리",
        icon: Clock,
        path: "/attendance",
        roles: ["user", "admin"],
        subItems: [
          {
            title: "출퇴근 체크",
            path: "/attendance/check",
            icon: Calendar,
            roles: ["user", "admin"],
          },
          {
            title: "근태 현황",
            path: "/attendance/status",
            icon: Users,
            roles: ["user", "admin"],
          },
          {
            title: "휴가 신청",
            path: "/attendance/leave",
            icon: FileText,
            roles: ["user", "admin"],
          },
          {
            title: "근태 리포트",
            path: "/attendance/report",
            icon: BarChart3,
            roles: ["admin"],
          },
        ],
      },
    ];

    const adminOnlyMenuItems = [
      {
        title: "재고관리",
        icon: Package,
        path: "/inventory",
        roles: ["admin"],
        subItems: [
          {
            title: "재고 현황",
            path: "/inventory/status",
            icon: Box,
            roles: ["admin"],
          },
          {
            title: "입출고 관리",
            path: "/inventory/inout",
            icon: ShoppingCart,
            roles: ["admin"],
          },
          {
            title: "발주 관리",
            path: "/inventory/order",
            icon: FileText,
            roles: ["admin"],
          },
          {
            title: "재고 리포트",
            path: "/inventory/report",
            icon: TrendingUp,
            roles: ["admin"],
          },
        ],
      },
      {
        title: "리포트",
        icon: BarChart3,
        path: "/reports",
        roles: ["admin"],
      },
      {
        title: "설정",
        icon: Settings,
        path: "/settings",
        roles: ["admin"],
        subItems: [
          {
            title: "회사 정보",
            path: "/settings/company",
            icon: Building2,
            roles: ["admin"],
          },
          {
            title: "사용자 관리",
            path: "/settings/users",
            icon: Users,
            roles: ["admin"],
          },
          {
            title: "시스템 설정",
            path: "/settings/system",
            icon: Settings,
            roles: ["admin"],
          },
        ],
      },
    ];

    return [...baseMenuItems, ...adminOnlyMenuItems];
  };

  // 현재 사용자 role에 맞는 메뉴만 필터링
  const filterMenuByRole = (items) => {
    const userRole = profile?.role || "user";

    return items
      .filter((item) => item.roles?.includes(userRole))
      .map((item) => {
        if (item.subItems) {
          const filteredSubItems = item.subItems.filter((subItem) =>
            subItem.roles?.includes(userRole)
          );
          return filteredSubItems.length > 0
            ? { ...item, subItems: filteredSubItems }
            : null;
        }
        return item;
      })
      .filter(Boolean);
  };

  const menuItems = filterMenuByRole(getAllMenuItems());

  // 현재 경로 기반 자동 메뉴 확장
  useEffect(() => {
    const currentPath = location.pathname;

    // 현재 경로가 서브메뉴인 경우 부모 메뉴 자동 확장
    menuItems.forEach((item) => {
      if (item.subItems?.some((sub) => sub.path === currentPath)) {
        setExpandedMenus((prev) => {
          // 이미 열려있으면 유지
          if (prev[item.title]) return prev;

          return {
            ...prev,
            [item.title]: true,
          };
        });
      }
    });
  }, [location.pathname]);

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
              className="w-full cursor-pointer flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
              aria-expanded={isExpanded}
              aria-controls={`submenu-${item.title}`}
            >
              <div className="flex items-center">
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.title}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>
            {isExpanded && (
              <div id={`submenu-${item.title}`} className="mt-1 ml-4 space-y-1">
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
          aria-label={isMobileOpen ? "메뉴 닫기" : "메뉴 열기"}
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
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen w-64 bg-white border-r border-gray-200 transition-transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
        role="navigation"
        aria-label="주 메뉴"
      >
        <div className="flex flex-col h-full">
          {/* User info */}
          <div className="px-4 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-9 h-9 text-sm bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {profile?.name?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">
                  {profile?.name || "사용자"}
                </p>
                <p className="text-xs text-gray-500">
                  {profile?.company_name || "회사명"}
                </p>
                {profile?.role === "admin" && (
                  <span className="text-xs text-blue-600 font-medium">
                    관리자
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 overflow-y-auto overscroll-contain">
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
