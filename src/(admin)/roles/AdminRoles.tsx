import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Sparkles, Rocket } from 'lucide-react';
import { PageTransition } from '@/components/shared/PageTransition';

export const AdminRoles: React.FC = () => {
  return (
    <PageTransition className="min-h-[70vh] flex items-center justify-center p-8">
      <div className="max-w-xl w-full text-center space-y-8">
        <div className="relative inline-block">
          <motion.div
            animate={{
              rotate: [0, 5, -5, 0],
              y: [0, -4, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="h-24 w-24 rounded-[32px] bg-gradient-to-br from-gp-cobalt to-gp-sky flex items-center justify-center text-white shadow-glow-cobalt relative z-10"
          >
            <Rocket size={40} />
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -inset-4 bg-gp-sky/20 blur-2xl rounded-full z-0"
          />
        </div>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display font-bold text-display-md text-gray-900 tracking-tight"
          >
            Roles & Permissions — <span className="gradient-gp-text">Coming Soon</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-sans text-text-lg text-gray-500 max-w-md mx-auto leading-relaxed"
          >
            We're putting the finishing touches on the Roles & Permissions area. Check back soon for role management and permission controls.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 pt-4"
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-100 rounded-2xl shadow-sm">
            <Construction size={16} className="text-warning" />
            <span className="font-sans text-text-xs font-semibold text-gray-600 uppercase tracking-widest">Under Construction</span>
          </div>
        </motion.div>

        <div className="pt-8 flex items-center justify-center gap-4 text-gray-200">
          <Sparkles size={20} />
          <div className="h-px w-12 bg-gray-100" />
          <Sparkles size={20} />
        </div>
      </div>
    </PageTransition>
  );
};

export default AdminRoles;
