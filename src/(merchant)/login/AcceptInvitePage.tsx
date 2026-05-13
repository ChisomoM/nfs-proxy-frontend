import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/context/useAuth";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export const AcceptInvitePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const { acceptInvite, isLoading } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [see, setSee] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing invite token");
      navigate("/merchant/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      await acceptInvite(token, password);
    } catch (err) {
      console.error("Failed to accept invite:", err);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50/50 p-6">
      <div className="absolute inset-0 sidebar-ambient opacity-5" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white rounded-3xl shadow-xl p-8 space-y-8 border border-gray-100">
          <div className="text-center space-y-3">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gp-sky/10 items-center justify-center mb-2">
              <ShieldCheck className="text-gp-sky h-6 w-6" />
            </div>
            <h1 className="text-3xl font-display font-bold text-gray-900 tracking-tight">
              Setup Your Account
            </h1>
            <p className="text-sm text-gray-500 font-sans px-4">
              Welcome to the GeePay Merchant Portal. Create a secure password to activate your account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">
                  Create Password
                </Label>
                <div className="relative group">
                  <Input
                    type={see ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="h-12 rounded-xl border-gray-200 focus:ring-gp-sky/20 focus:border-gp-sky pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setSee(!see)}
                    className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center text-gray-400 hover:text-gp-sky transition-colors"
                  >
                    {see ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-widest ml-1">
                  Confirm Password
                </Label>
                <Input
                  type={see ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 rounded-xl border-gray-200 focus:ring-gp-sky/20 focus:border-gp-sky"
                />
              </div>
            </div>

            <div className="bg-blue-50/50 rounded-2xl p-4 space-y-2">
              <h4 className="text-[10px] font-bold text-gp-cobalt uppercase tracking-widest">Security Requirements</h4>
              <ul className="space-y-1">
                {[
                  "Minimum 8 characters",
                  "At least one uppercase letter",
                  "At least one special character"
                ].map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-[11px] text-gray-600">
                    <CheckCircle2 className="h-3 w-3 text-gp-sky" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              variant="brand"
              className="w-full h-12 font-semibold rounded-xl text-base shadow-lg shadow-gp-sky/20"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Activating...</span>
                </div>
              ) : (
                "Activate Account"
              )}
            </Button>
          </form>

          <div className="pt-4 text-center border-t border-gray-50">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em]">GeePay Security Enforced</p>
          </div>
        </div>
      </motion.div>
    </main>
  );
};
