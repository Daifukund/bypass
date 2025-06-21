"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const router = useRouter();
  const [isClosing, setIsClosing] = useState(false);

  const handleCompleteProfile = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      router.push("/profile");
    }, 200);
  };

  const handleStartSearch = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      router.push("/criteria");
    }, 200);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
          isClosing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Bypass{userName ? `, ${userName}` : ""}!
            </h2>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <div className="text-center mb-6">
            <p className="text-lg text-gray-600 mb-4">Here's how it works:</p>

            <div className="space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    Tell us your job preferences
                  </p>
                  <p className="text-gray-600 text-sm">
                    Define your dream role and industry
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    We find companies and real contacts
                  </p>
                  <p className="text-gray-600 text-sm">
                    AI discovers hiring companies + decision makers
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                  <span className="text-green-600 text-sm font-bold">✓</span>
                </div>
                <div>
                  <p className="text-gray-800 font-medium">
                    You send a killer email (we write it for you)
                  </p>
                  <p className="text-gray-600 text-sm">
                    Personalized messages that get responses
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">
              Let's skip the job board ghosting 👻
            </p>
          </div>

          {/* CTA Button */}
          <Button
            onClick={handleCompleteProfile}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
          >
            Complete Profile First
          </Button>

          <Button
            onClick={handleStartSearch}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 text-lg"
          >
            Start Job Search
          </Button>

          {/* Trust signal */}
          <div className="text-center mt-4">
            <p className="text-xs text-gray-500">
              ✨ 5 free email addresses • No credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
