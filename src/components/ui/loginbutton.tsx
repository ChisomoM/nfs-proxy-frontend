"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useState } from "react";
import { useUser } from "@/lib/context/user";
import { useToast } from "@/hooks/use-toast";


export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { oAuthLogin } = useUser();
  const { toast } = useToast();

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      
      // Step 1: Authenticate with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Prepare user data for backend login
      const userData = {
        id: user.uid,
        provider: "google",
        displayName: user.displayName || "Google User",
        email: user.email || "",
        photo: user.photoURL || "",
      };

      // Step 2: Authenticate with our backend
      await oAuthLogin(userData);

      // Since oAuthLogin doesn't return a value, we continue if no error was thrown
      // If there was an error, it will be caught in the catch block

      // Success case
      toast({
        title: "Login Successful",
        description: "You have been logged in successfully.",
        variant: "default",
      });

    } catch (error: any) {
      console.error("Login error:", error);
      
      // Differentiate between different error types
      let errorMessage = "An unexpected error occurred during login.";
      
      if (error.code) {
        // Firebase errors
        switch (error.code) {
          case "auth/popup-closed-by-user":
            errorMessage = "Login popup was closed before completing.";
            break;
          case "auth/cancelled-popup-request":
            errorMessage = "Login process was cancelled.";
            break;
          case "auth/account-exists-with-different-credential":
            errorMessage = "An account already exists with this email.";
            break;
          default:
            errorMessage = "Authentication failed. Please try again.";
        }
      } else if (error.message) {
        // Backend or other errors
        errorMessage = error.message;
      }

      // Error case
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive",
      });

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className={`flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-2 ${
        isLoading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
        <path
          d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0353 3.12C17.9503 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
          fill="#EA4335"
        />
        <path
          d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.08L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
          fill="#4285F4"
        />
        <path
          d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
          fill="#FBBC05"
        />
        <path
          d="M12.0004 24C15.2404 24 17.9654 22.935 19.9454 21.095L16.0804 18.075C15.0054 18.785 13.6204 19.25 12.0004 19.25C8.8704 19.25 6.21537 17.14 5.2654 14.295L1.27539 17.39C3.25539 21.31 7.3104 24 12.0004 24Z"
          fill="#34A853"
        />
      </svg>
      {isLoading ? "Processing..." : "Sign in with Google"}
    </button>
  );
}
