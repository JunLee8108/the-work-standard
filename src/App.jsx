// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { Toaster } from "react-hot-toast";
import useAuthStore from "./stores/authStore";
import Sidebar from "./components/Sidebar";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import UserManagement from "./pages/admin/UserManagement";

// Layout 컴포넌트
function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  );
}

// AdminRoute 컴포넌트
function AdminRoute({ children }) {
  const profile = useAuthStore((state) => state.profile);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

// Protected Route 컴포넌트
function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/auth" replace />;
}

// Auth 페이지 래퍼 - 이미 로그인된 사용자는 홈으로 리다이렉트
function AuthRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/" replace /> : <Auth />;
}

export default function App() {
  const loading = useAuthStore((state) => state.loading);
  const { initializeAuth, cleanup } = useAuthStore();

  // 앱 시작시 인증 상태 확인
  useEffect(() => {
    // 초기화 (세션 확인 + 리스너 설정을 한번에)
    initializeAuth();

    // 클린업
    return () => {
      cleanup();
    };
  }, []); // 한 번만 실행

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Toaster position="top-center" />
      <Routes>
        <Route path="/auth" element={<AuthRoute />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* 추가 라우트들 */}
        <Route
          path="/attendance/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="p-6">근태관리 페이지</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventory/*"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="p-6">재고관리 페이지</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <div className="p-6">리포트 페이지</div>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/users"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminRoute>
                  <UserManagement />
                </AdminRoute>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/company"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminRoute>
                  <div className="p-6">회사 정보 페이지</div>
                </AdminRoute>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/system"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <AdminRoute>
                  <div className="p-6">시스템 설정 페이지</div>
                </AdminRoute>
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
