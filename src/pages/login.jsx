import { useState } from "react";
import { useFormik } from "formik";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ShieldCheck,
  BrainCircuit,
  Settings,
  ArrowRight,
} from "lucide-react";

import useAuthStore from "../store/authStore";
import { loginValidationSchema } from "../validations/loginValidations";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      rememberMe: false,
    },

    validationSchema: loginValidationSchema,

    onSubmit: async (values, { setStatus }) => {
      setStatus(null);

      const result = await login(
        values.email,
        values.password,
        values.rememberMe
      );

      if (!result.success) {
        setStatus(result.message);
        return;
      }

      /*
       * Later we will use React Router here.
       *
       * For now:
       */
      window.location.href = "/dashboard";
    },
  });

  return (
    <div className="min-h-screen bg-mint px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-[0_20px_60px_rgba(18,53,43,0.15)] md:grid-cols-2">

          {/* =====================================================
              LEFT BRANDING PANEL
          ====================================================== */}

          <div className="relative hidden min-h-[650px] overflow-hidden bg-forest-dark md:flex">

            {/* Decorative circles */}

            <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-sage/10" />

            <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-sage/10" />

            <div className="absolute right-20 top-32 h-24 w-24 rounded-full bg-mint/5" />

            <div className="relative z-10 flex w-full flex-col justify-between p-10 lg:p-12">

              {/* Logo */}

              <div>
                <div className="flex items-center gap-3">

                  {/* <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                    <Leaf
                      size={27}
                      strokeWidth={2}
                      className="text-sage"
                    />
                  </div> */}

                  <div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">
                      Canopy
                    </h1>

                    <p className="text-sm text-sage">
                      Benefit Intelligence
                    </p>
                  </div>

                </div>
              </div>

              {/* Main branding */}

              <div className="max-w-md">

                <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-sage">
                  Benefit Intelligence
                </p>

                <h2 className="text-4xl font-bold leading-tight text-white lg:text-5xl">
                  Smarter Benefits.
                  <br />
                  Better Health.
                  <br />
                  <span className="text-sage">
                    A healthier tomorrow.
                  </span>
                </h2>

                <p className="mt-6 max-w-sm text-sm leading-7 text-white/65 lg:text-base">
                  AI-powered benefit intelligence designed to simplify
                  insurance schedule processing, validation, underwriting,
                  and configuration.
                </p>

                {/* Feature indicators */}

                <div className="mt-8 flex flex-wrap gap-3">

                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <BrainCircuit
                      size={16}
                      className="text-sage"
                    />

                    <span className="text-xs text-white/75">
                      AI Powered
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <ShieldCheck
                      size={16}
                      className="text-sage"
                    />

                    <span className="text-xs text-white/75">
                      Rule Driven
                    </span>
                  </div>

                  <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
                    <Settings
                      size={16}
                      className="text-sage"
                    />

                    <span className="text-xs text-white/75">
                      ProHealth Ready
                    </span>
                  </div>

                </div>

              </div>

              {/* Bottom text */}

              <div className="flex items-center justify-between border-t border-white/10 pt-5">

                <p className="text-xs text-white/40">
                  Secure Benefit Management
                </p>

                <p className="text-xs text-white/40">
                  © 2026 Canopy
                </p>

              </div>

            </div>
          </div>

          {/* =====================================================
              RIGHT LOGIN PANEL
          ====================================================== */}

          <div className="flex min-h-[650px] items-center justify-center bg-white px-6 py-10 sm:px-10 lg:px-14">

            <div className="w-full max-w-md">

              {/* Mobile logo */}

              <div className="mb-10 flex items-center gap-3 md:hidden">

                {/* <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest-dark">
                  <Leaf
                    size={24}
                    className="text-sage"
                  />
                </div> */}

                <div>
                  <h1 className="text-xl font-bold text-forest-dark">
                    Canopy
                  </h1>

                  <p className="text-xs text-sage">
                    Benefit Intelligence
                  </p>
                </div>

              </div>

              {/* Heading */}

              <div className="mb-8">

                <p className="mb-2 text-sm font-medium text-forest">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-charcoal">
                  Sign in to your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-charcoal/55">
                  Enter your credentials to access the Benefit Intelligence
                  platform.
                </p>

              </div>

              {/* Login error */}

              {formik.status && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-danger/20 bg-danger/10 px-4 py-3">

                  <div className="mt-0.5 h-2 w-2 rounded-full bg-danger" />

                  <p className="text-sm text-danger">
                    {formik.status}
                  </p>

                </div>
              )}

              {/* =================================================
                  FORM
              ================================================== */}

              <form
                onSubmit={formik.handleSubmit}
                className="space-y-5"
              >

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-charcoal"
                  >
                    Email address
                  </label>

                  <div className="relative">

                    <Mail
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-sage"
                    />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      autoComplete="email"
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 text-sm text-charcoal outline-none transition placeholder:text-charcoal/35 ${
                        formik.touched.email &&
                        formik.errors.email
                          ? "border-danger focus:ring-2 focus:ring-danger/10"
                          : "border-sage/30 focus:border-forest focus:ring-2 focus:ring-mint"
                      }`}
                    />

                  </div>

                  {formik.touched.email &&
                    formik.errors.email && (
                      <p className="mt-1.5 text-xs font-medium text-danger">
                        {formik.errors.email}
                      </p>
                    )}

                </div>

                {/* PASSWORD */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-charcoal"
                    >
                      Password
                    </label>

                  </div>

                  <div className="relative">

                    <LockKeyhole
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-sage"
                    />

                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-12 text-sm text-charcoal outline-none transition placeholder:text-charcoal/35 ${
                        formik.touched.password &&
                        formik.errors.password
                          ? "border-danger focus:ring-2 focus:ring-danger/10"
                          : "border-sage/30 focus:border-forest focus:ring-2 focus:ring-mint"
                      }`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((previous) => !previous)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-sage transition hover:bg-mint hover:text-forest"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>

                  </div>

                  {formik.touched.password &&
                    formik.errors.password && (
                      <p className="mt-1.5 text-xs font-medium text-danger">
                        {formik.errors.password}
                      </p>
                    )}

                </div>

                {/* REMEMBER ME / FORGOT PASSWORD */}

                <div className="flex items-center justify-between gap-4">

                  <label className="flex cursor-pointer items-center gap-2 text-sm text-charcoal/65">

                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formik.values.rememberMe}
                      onChange={formik.handleChange}
                      className="h-4 w-4 cursor-pointer rounded border-sage/40 accent-[#1E5A45]"
                    />

                    Remember me

                  </label>

                  <button
                    type="button"
                    className="text-sm font-semibold text-forest transition hover:text-forest-dark hover:underline"
                  >
                    Forgot password?
                  </button>

                </div>

                {/* SIGN IN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-forest/10 transition hover:bg-forest-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In

                      <ArrowRight
                        size={17}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </>
                  )}
                </button>

              </form>

              {/* SECURITY MESSAGE */}

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-charcoal/40">

                <ShieldCheck size={14} />

                <span>
                  Secure access to your benefit management platform
                </span>

              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;