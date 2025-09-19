// src/pages/Auth.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "react-hot-toast";
import { Eye, EyeOff, Loader2, ArrowRight, Building2 } from "lucide-react";
import useAuthStore from "../stores/authStore";
import * as companyService from "../services/companyService";

export default function Auth() {
  const navigate = useNavigate();

  // Store
  const { loading, isAuthenticated, signIn, signUp } = useAuthStore();

  // Local State
  const [isLogin, setIsLogin] = useState(true);
  const [signupStep, setSignupStep] = useState(1); // 1: 회사코드, 2: 개인정보
  const [verifiedCompany, setVerifiedCompany] = useState(null); // {id, name}
  const [verifying, setVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    companyCode: "",
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
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

  // 회사 코드 검증
  const handleVerifyCompany = async () => {
    const newErrors = {};

    if (!formData.companyCode) {
      newErrors.companyCode = "회사 코드를 입력해주세요";
      setErrors(newErrors);
      return;
    }

    setVerifying(true);

    try {
      const verification = await companyService.verifyCompanyCode(
        formData.companyCode
      );

      if (verification.isValid) {
        setVerifiedCompany({
          id: verification.companyId,
          name: verification.companyName,
        });
        setSignupStep(2);
        setErrors({});
        toast.success(`${verification.companyName} 인증 완료`);
      } else {
        toast.error("유효하지 않은 회사 코드입니다");
      }
    } catch {
      toast.error("회사 코드 확인 중 오류가 발생했습니다");
    } finally {
      setVerifying(false);
    }
  };

  // 유효성 검사
  const validate = () => {
    const newErrors = {};

    if (isLogin) {
      // 로그인 검증
      if (!formData.email) {
        newErrors.email = "이메일을 입력해주세요";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "올바른 이메일 형식이 아닙니다";
      }

      if (!formData.password) {
        newErrors.password = "비밀번호를 입력해주세요";
      }
    } else {
      // 회원가입 검증
      if (signupStep === 1) {
        if (!formData.companyCode) {
          newErrors.companyCode = "회사 코드를 입력해주세요";
        }
      } else {
        // Step 2 검증
        if (!formData.name) newErrors.name = "이름을 입력해주세요";

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

        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
        }
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
      if (signupStep === 1) {
        // Step 1: 회사 코드 검증
        await handleVerifyCompany();
      } else {
        // Step 2: 회원가입 진행
        const result = await signUp(
          formData.email,
          formData.password,
          formData.name,
          verifiedCompany.id
        );

        if (result.success) {
          toast.success(
            `${formData.email}로 발송된 인증 이메일을 확인해주세요.`,
            { duration: 7000 }
          );

          // 로그인 폼으로 전환
          resetForm();
          setIsLogin(true);
        }
      }
    }
  };

  // 폼 리셋
  const resetForm = () => {
    setFormData({
      companyCode: "",
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
    setErrors({});
    setSignupStep(1);
    setVerifiedCompany(null);
  };

  // 폼 전환
  const toggleForm = () => {
    setIsLogin(!isLogin);
    resetForm();
  };

  // Step 뒤로가기
  const handleBackToStep1 = () => {
    setSignupStep(1);
    setVerifiedCompany(null);
    setFormData({
      ...formData,
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
    });
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">업무의 정석</h1>
          <p className="mt-2 text-sm text-gray-600">Restaurant Edition</p>
        </div>

        {/* 폼 카드 */}
        <div className="bg-white py-8 px-4 shadow-lg rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 로그인 폼 */}
            {isLogin && (
              <>
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    비밀번호
                  </label>
                  <div className="mt-1 relative">
                    <input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
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
                    <p className="mt-1 text-xs text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* 회원가입 폼 */}
            {!isLogin && (
              <>
                {signupStep === 1 ? (
                  // Step 1: 회사 코드 입력
                  <>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">
                        회사에서 제공받은 코드를 입력해주세요
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        회사 코드
                      </label>
                      <input
                        name="companyCode"
                        type="text"
                        autocomplete="off"
                        value={formData.companyCode}
                        onChange={handleChange}
                        placeholder="예: COMP2024"
                        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          errors.companyCode
                            ? "border-red-500"
                            : "border-gray-300"
                        }`}
                        autoFocus
                      />
                      {errors.companyCode && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.companyCode}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  // Step 2: 개인정보 입력
                  <>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900">
                          개인정보 입력
                        </h3>
                        <button
                          type="button"
                          onClick={handleBackToStep1}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          뒤로
                        </button>
                      </div>

                      <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-900">
                            {verifiedCompany.name}
                          </p>
                          <p className="text-xs text-blue-600">
                            회사 인증 완료
                          </p>
                        </div>
                      </div>
                    </div>

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
                        autoFocus
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

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
                        <p className="mt-1 text-xs text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        비밀번호
                      </label>
                      <div className="mt-1 relative">
                        <input
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          value={formData.password}
                          onChange={handleChange}
                          className={`block w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.password
                              ? "border-red-500"
                              : "border-gray-300"
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
                        <p className="mt-1 text-xs text-red-500">
                          {errors.password}
                        </p>
                      )}
                    </div>

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
                  </>
                )}
              </>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading || verifying}
              className="w-full cursor-pointer flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading || verifying ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : isLogin ? (
                "로그인"
              ) : signupStep === 1 ? (
                <>
                  다음
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
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
                className="text-sm cursor-pointer text-blue-600 hover:text-blue-500"
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
