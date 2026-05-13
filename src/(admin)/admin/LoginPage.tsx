import React from "react";
import { LoginForm } from "../../components/auth/loginForm";
import { Building2, ShieldCheck, Zap, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { AuthFeatureItem } from "@/components/shared/AuthFeatureItem";

export const LoginPage: React.FC = () => {
  return (
    <main className="h-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* Left side - Form content */}
      <div className="w-full lg:w-[45%] xl:w-[40%] px-6 py-12 md:px-12 lg:px-16 flex flex-col justify-center h-full relative z-10 bg-white">
        <div className="absolute top-12 left-12 lg:left-16 hidden lg:block">
           <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-2"
          >
            <div className="h-8 w-8 rounded-lg bg-gp-cobalt flex items-center justify-center">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <span className="font-display font-bold text-xl text-gp-cobalt tracking-tight">GeePay <span className="text-gp-sky">Admin</span></span>
          </motion.div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <LoginForm accountType="admin" />
          
          <div className="mt-8 text-center lg:text-left">
            <p className="font-sans text-sm text-gray-400">
              Need assistance? <button className="text-gp-sky font-medium hover:underline">Contact System Support</button>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Brand showcase */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 sidebar-ambient" />
        
        {/* Subtle motion patterns */}
        <div className="absolute inset-0 opacity-20">
          <motion.div 
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-0" 
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '48px 48px'
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white w-full h-full">
          <div className="max-w-xl space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              <h2 className="font-display text-4xl xl:text-5xl font-bold leading-[1.1] tracking-tight text-white">
                The hub for <span className="text-gp-sky">financial precision</span> in Zambia.
              </h2>
              <p className="font-sans text-lg xl:text-xl text-white/70 leading-relaxed max-w-lg">
                Manage the national financial switch proxy with enterprise-grade tools for merchant onboarding, transaction auditing, and settlement reconciliation.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
              className="grid gap-4 mt-8"
            >
              <AuthFeatureItem
                icon={<Building2 className="w-5 h-5 text-gp-sky" />}
                title="Advanced Merchant Onboarding"
                description="Easily register and manage participants across the switch."
              />
              <AuthFeatureItem
                icon={<Zap className="w-5 h-5 text-gp-sky" />}
                title="Real-Time Transaction Control"
                description="Monitor flow across all providers with millisecond latency."
              />
              <AuthFeatureItem
                icon={<CheckCircle2 className="w-5 h-5 text-gp-sky" />}
                title="Settlement Reconciliation"
                description="Automated tools for multi-party financial balancing."
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom decorative bar */}
        <div className="absolute bottom-12 right-12 flex items-center gap-6 text-white/40 font-mono text-xs tracking-widest uppercase">
          <span>GP-ADMIN-V2.0</span>
          <div className="h-4 w-[1px] bg-white/10" />
          <span>System Healthy</span>
        </div>
      </div>
    </main>
  );
};

