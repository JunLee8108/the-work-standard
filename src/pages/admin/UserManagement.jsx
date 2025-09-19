// src/pages/admin/UserManagement.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { RefreshCw, Shield, Search } from "lucide-react";
import useAuthStore, {
  useProfile,
  useProfiles,
  useProfilesLoading,
} from "../../stores/authStore";

export default function UserManagement() {
  const navigate = useNavigate();
  const profile = useProfile();
  const profiles = useProfiles();
  const profilesLoading = useProfilesLoading();

  // 개별적으로 액션 가져오기
  const fetchAllProfiles = useAuthStore((state) => state.fetchAllProfiles);
  const refreshAllProfiles = useAuthStore((state) => state.refreshAllProfiles);
  const updateUserRole = useAuthStore((state) => state.updateUserRole);

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 권한 체크 및 데이터 로드
  useEffect(() => {
    // 프로필이 로드되지 않았으면 대기
    if (!profile) return;

    // 관리자가 아니면 홈으로 리다이렉트
    if (profile.role !== "admin") {
      toast.error("접근 권한이 없습니다");
      navigate("/");
      return;
    }

    // 첫 로드 시 프로필 목록 가져오기
    if (profiles.length === 0 && !profilesLoading) {
      fetchAllProfiles();
    }
  }, [profile, navigate, fetchAllProfiles, profiles.length, profilesLoading]);

  // 새로고침 핸들러
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshAllProfiles();
    setIsRefreshing(false);
  };

  // 권한 변경 핸들러
  const handleRoleChange = async (userId, newRole) => {
    const result = await updateUserRole(userId, newRole);
    if (!result.success) {
      // 에러는 store에서 toast 처리
    }
  };

  // 검색 필터링
  const filteredProfiles = profiles.filter(
    (p) =>
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 관리자가 아닌 경우 빈 화면
  if (!profile || profile.role !== "admin") {
    return null;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">사용자 관리</h1>
            <p className="text-sm text-gray-500 mt-1">
              전체 사용자 {profiles.length}명
            </p>
          </div>

          {/* 새로고침 버튼 */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || profilesLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            <span className="text-sm">새로고침</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 이메일, 회사명으로 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    이름
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    이메일
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    권한
                  </span>
                </th>
                <th className="px-6 py-4 text-left">
                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                    가입일
                  </span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {profilesLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredProfiles.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    사용자가 없습니다
                  </td>
                </tr>
              ) : (
                filteredProfiles.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 text-sm font-medium">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900">
                          {user.name || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {user.email}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.id === profile.id ? (
                        <div className="flex items-center gap-1">
                          <Shield className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-600">
                            관리자 (본인)
                          </span>
                        </div>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user.id, e.target.value)
                          }
                          className={`text-sm px-3 py-1.5 rounded-lg border ${
                            user.role === "admin"
                              ? "bg-blue-50 border-blue-200 text-blue-700"
                              : "bg-gray-50 border-gray-200 text-gray-700"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                          <option value="user">일반 사용자</option>
                          <option value="admin">관리자</option>
                        </select>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
