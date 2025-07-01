"use client";

import { ArrowLeft } from "lucide-react";

export function GoBackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-flex items-center justify-center gap-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
    >
      <ArrowLeft size={16} />
      Go Back
    </button>
  );
}
