"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CircleCheck, Eye, EyeClosed } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  children: React.ReactNode;
  error?: string;
  className?: string;
  isLoading?: boolean;
  disabled?: boolean;
  validate?: boolean;
  t?: any;
}

export function Input({
  children,
  disabled,
  isLoading,
  className,
  error,
  ...props
}: InputProps) {
  return (
    <div className={cn("relative group w-full", className)}>
      <input
        {...props}
        placeholder=" "
        disabled={isLoading ?? disabled ?? false}
        className={`peer transition-all duration-300 delay-200 bg-[#F8F8F8] w-full rounded-[5px] px-3.5 p-8 text-[1.4rem] leading-5 placeholder:text-neutral-600 text-[#333333] outline-none border border-transparent focus:border focus:border-[#9FE870] focus:outline-none focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:border-none disabled:cursor-not-allowed ${
          isLoading ? "animate-pulse" : null
        }`}
      />
      <label className="absolute left-4 top-2 text-[1.2rem] text-neutral-600 transition-all duration-200 ease-in-out peer-placeholder-shown:top-8 peer-placeholder-shown:text-[1.5rem] peer-placeholder-shown:text-gray-400 cursor-text pointer-events-none ">
        {children}
      </label>
      <span className={"text-[1.2rem] px-8 py-2 text-failure"}>{error}</span>
    </div>
  );
}

export function PasswordInput({
  children,
  isLoading,
  error,
  validate = false,
  t,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");

  const passwordChecks = {
    minLength: password.length >= 8,
    hasCapital: /[A-Z]/.test(password),
    hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div>
      <div className="relative group">
        <input
          {...props}
          onChange={handleChange}
          disabled={isLoading}
          type={showPassword ? "text" : "password"}
          placeholder=" "
          className={`peer transition-all duration-300 delay-200 bg-[#F8F8F8] w-full rounded-[5px] px-3.5 p-8 text-[1.4rem] leading-5 placeholder:text-neutral-600 text-[#333333] outline-none border border-transparent focus:border focus:border-[#9FE870] focus:outline-none             focus-visible:border-primary-base focus-visible:ring-2 focus-visible:ring-[#9FE870] disabled:text-neutral-700 disabled:border-none disabled:cursor-not-allowed ${
            isLoading ? "animate-pulse" : null
          }`}
        />
        <label
          htmlFor="password"
          className="absolute left-4 top-2 text-[1.2rem] text-neutral-600 transition-all duration-200 ease-in-out peer-placeholder-shown:top-8 peer-placeholder-shown:text-[1.5rem] peer-placeholder-shown:text-gray-400 cursor-text pointer-events-none "
        >
          {children}
        </label>

        <span className={"text-[1.2rem] px-8 py-2 text-failure"}>{error}</span>

        <div className="absolute right-6 top-[50%] -translate-y-[50%]">
          {showPassword ? (
            <EyeClosed
              onClick={() => setShowPassword(false)}
              className={"cursor-pointer"}
              size="16"
              color="#333333"
            />
          ) : (
            <Eye
              onClick={() => setShowPassword(true)}
              className={"cursor-pointer"}
              size="16"
              color="#333333"
            />
          )}
        </div>
      </div>
      {password && validate && (
        <div className="px-8 py-4 space-y-2">
          <div className="flex items-center gap-3">
            {passwordChecks.minLength ? (
              <CircleCheck size="16" color="#349C2E" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-neutral-400" />
            )}
            <span
              className={`text-[1.2rem] ${
                passwordChecks.minLength ? "text-success" : "text-neutral-600"
              }`}
            >
              {t("errors.characters")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {passwordChecks.hasCapital ? (
              <CircleCheck size="16" color="#349C2E" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-neutral-400" />
            )}
            <span
              className={`text-[1.2rem] ${
                passwordChecks.hasCapital ? "text-success" : "text-neutral-600"
              }`}
            >
              {t("errors.capital")}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {passwordChecks.hasSpecial ? (
              <CircleCheck size="16" color="#349C2E" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-neutral-400" />
            )}
            <span
              className={`text-[1.2rem] ${
                passwordChecks.hasSpecial ? "text-success" : "text-neutral-600"
              }`}
            >
              {t("errors.special")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
