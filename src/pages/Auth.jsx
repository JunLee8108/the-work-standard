// src/pages/Auth.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import useAuthStore from "../stores/authStore";

export default function Auth() {
  const navigate = useNavigate();

  // Store
  const { loading, isAuthenticated, signIn, signUp } = useAuthStore();

  // Local State
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    company: "",
  });
  const [errors, setErrors] = useState({});

  // 로그인 상태면 홈으로 이동
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // 입력 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!formData.password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (formData.password.length < 6) {
      newErrors.password = "비밀번호는 최소 6자 이상이어야 합니다";
    }

    if (!isLogin) {
      if (!formData.name) newErrors.name = "이름을 입력해주세요";
      if (!formData.company) newErrors.company = "회사명을 입력해주세요";
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 폼 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isLogin) {
      // 로그인
      const result = await signIn(formData.email, formData.password);
      if (result.success) {
        toast.success("로그인 성공!");
      }
    } else {
      // 회원가입
      const result = await signUp(
        formData.email,
        formData.password,
        formData.name,
        formData.company
      );

      if (result.success) {
        toast.success(
          `회원가입이 완료되었습니다! ${formData.email}로 발송된 인증 이메일을 확인해주세요.`,
          { duration: 7000, icon: "📧" }
        );

        // 로그인 폼으로 전환
        setIsLogin(true);
        setFormData({
          ...formData,
          password: "",
          confirmPassword: "",
          name: "",
          company: "",
        });
        setErrors({});
      }
    }
  };

  // 폼 전환
  const toggleForm = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      company: "",
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">업무의 정석</h1>
          <p className="mt-2 text-sm text-gray-600">The Work Standard</p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 회원가입 추가 필드 */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    이름
                  </label>
                  <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    회사명
                  </label>
                  <input
                    name="company"
                    type="text"
                    value={formData.company}
                    onChange={handleChange}
                    className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.company ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.company && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.company}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                비밀번호
              </label>
              <div className="mt-1 relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  value={formData.password}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            {/* 비밀번호 확인 */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  비밀번호 확인
                </label>
                <input
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : isLogin ? (
                "로그인"
              ) : (
                "회원가입"
              )}
            </button>
          </form>

          {/* 폼 전환 링크 */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={toggleForm}
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                {isLogin ? "회원가입" : "로그인"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
