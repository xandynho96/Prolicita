"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function GoogleButton() {
  return (
    <Button
      type="button"
      variant="outline"
      className="w-full gap-2.5"
      onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0">
        <path
          fill="#4285F4"
          d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.5-1.13 2.77-2.4 3.62v3h3.88c2.27-2.09 3.54-5.17 3.54-8.86z"
        />
        <path
          fill="#34A853"
          d="M12 24c3.24 0 5.95-1.07 7.93-2.9l-3.88-3c-1.07.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.09C3.26 21.3 7.31 24 12 24z"
        />
        <path
          fill="#FBBC05"
          d="M5.31 14.33A7.2 7.2 0 0 1 4.9 12c0-.81.14-1.6.4-2.33V6.58H1.3A11.98 11.98 0 0 0 0 12c0 1.93.46 3.76 1.3 5.42l4.01-3.09z"
        />
        <path
          fill="#EA4335"
          d="M12 4.75c1.76 0 3.34.6 4.59 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.3 6.58l4.01 3.09C6.25 6.85 8.89 4.75 12 4.75z"
        />
      </svg>
      Entrar com Google
    </Button>
  );
}
