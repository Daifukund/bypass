"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface AnimatedCtaButtonProps {
  href: string;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary";
  showSparkles?: boolean;
}

export function AnimatedCtaButton({
  href,
  onClick,
  children,
  className = "",
  variant = "primary",
  showSparkles = true,
}: AnimatedCtaButtonProps) {
  const [isHovered, setIsHovered] = useState(false);

  const baseClasses = `
    relative overflow-hidden group
    px-6 py-3 rounded-xl font-medium
    transition-all duration-300 ease-out
    transform hover:scale-105 active:scale-95
    min-h-[44px] flex items-center justify-center gap-2
    text-sm sm:text-base
  `;

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-black via-gray-800 to-black
      bg-size-200 hover:bg-pos-100
      text-white shadow-lg hover:shadow-xl
      border border-transparent
    `,
    secondary: `
      bg-white border-2 border-black
      text-black hover:bg-black hover:text-white
      shadow-md hover:shadow-lg
    `,
  };

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient */}
      {variant === "primary" && (
        <div className="absolute inset-0 bg-gradient-to-r from-gray-600 via-black to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}

      {/* Sparkles effect */}
      {showSparkles && variant === "primary" && (
        <>
          <Sparkles
            className={`absolute top-1 left-2 w-3 h-3 text-yellow-300 transition-all duration-500 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />
          <Sparkles
            className={`absolute bottom-1 right-2 w-2 h-2 text-blue-300 transition-all duration-700 delay-200 ${
              isHovered ? "opacity-100 scale-100" : "opacity-0 scale-50"
            }`}
          />
        </>
      )}

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
        <ArrowRight
          className={`w-4 h-4 transition-transform duration-300 ${
            isHovered ? "translate-x-1" : "translate-x-0"
          }`}
        />
      </span>

      {/* Shine effect */}
      <div className="absolute inset-0 -skew-x-12 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 group-hover:animate-shine" />
    </Link>
  );
}
